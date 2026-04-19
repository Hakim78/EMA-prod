"""Codegen pipeline — l'agent lead-data-engineer génère le .py fetcher à partir d'un spec YAML.

Flow :
1. Lire spec YAML
2. Préparer prompt (spec + exemple bodacc.py + instructions strictes)
3. Appeler Ollama Cloud (agent lead-data-engineer)
4. Extraire le code Python de la réponse (fences ```python ... ```)
5. Valider avec ast.parse
6. Écrire dans sources/{source_id}.py
7. Hot-reload dynamique (importlib) + register dans engine.SOURCES

⚠️ Code généré jamais exécuté arbitrairement — whitelist strict :
- Path écriture = sources/*.py uniquement
- Syntaxe Python validée
- Imports whitelist (httpx, psycopg, datetime, json, logging, etc.)
"""
from __future__ import annotations

import ast
import importlib
import importlib.util
import json
import logging
import re
from datetime import timedelta
from pathlib import Path
from typing import Any

import yaml
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from config import settings
from loader import get_agent
from ollama_client import OllamaClient

log = logging.getLogger("demoema.codegen")

SPECS_DIR = Path(__file__).parent / "specs"
SOURCES_DIR = Path(__file__).parent / "sources"
REFERENCE_FETCHER = SOURCES_DIR / "bodacc.py"

ALLOWED_IMPORTS = {
    "__future__",
    "asyncio", "datetime", "json", "logging", "re", "os", "typing", "time", "hashlib", "collections",
    "httpx", "psycopg", "lxml", "feedparser", "yaml",
    "config", "psycopg.types.json", "psycopg.types",
}


def load_spec(source_id: str) -> dict | None:
    path = SPECS_DIR / f"{source_id}.yaml"
    if not path.exists():
        return None
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def list_specs() -> list[dict]:
    specs = []
    for p in sorted(SPECS_DIR.glob("*.yaml")):
        try:
            s = yaml.safe_load(p.read_text(encoding="utf-8"))
            specs.append({
                "source_id": s.get("source_id"),
                "name": s.get("name"),
                "layer": s.get("layer"),
                "pattern": s.get("pattern"),
                "has_fetcher": (SOURCES_DIR / f"{s.get('source_id')}.py").exists(),
            })
        except Exception:
            log.exception("Spec invalide : %s", p.name)
    return specs


def _build_prompt(spec: dict) -> str:
    ref_code = REFERENCE_FETCHER.read_text(encoding="utf-8") if REFERENCE_FETCHER.exists() else ""
    return f"""Tu es lead-data-engineer DEMOEMA. Ta mission : GÉNÉRER le code Python complet d'un fetcher pour une source data publique, à partir de la spec YAML fournie.

## SPEC YAML de la source à implémenter
```yaml
{yaml.safe_dump(spec, allow_unicode=True, sort_keys=False)}
```

## CODE DE RÉFÉRENCE (bodacc.py, pattern REST JSON) — copier la structure, adapter à la spec
```python
{ref_code}
```

## EXIGENCES NON NÉGOCIABLES
1. **Une seule fonction async exposée** : `async def fetch_{spec['source_id']}_delta() -> dict` retournant `{{source, rows, fetched, ...}}`
2. **Pas d'imports hors whitelist** : httpx, psycopg, datetime, json, logging, re, lxml, feedparser, yaml, config (from)
3. **Pas de subprocess, os.system, eval, exec, open() en écriture**
4. **Conversion str() obligatoire** avant slicing (cf. bug bodacc int: `_s = lambda v: str(v) if v is not None else ''`)
5. **ON CONFLICT conforme à la spec** (voir champ `conflict_strategy`)
6. **Backfill first-run** : si bronze.TABLE empty → élargir la fenêtre (cf. spec `backfill_days_first_run`)
7. **Retry simple** : httpx timeout 30s, pas de retry complexe Y1 (laisser le scheduler gérer)
8. **Retourner `{{source: '...', rows: N, fetched: N, ...}}`** en sortie
9. **Commentaire docstring** en FR expliquant endpoint + licence + RGPD notes
10. **Pas de scoring / parsing métier** ici — JUST fetch + parse JSON + insert bronze

## AUTH SELON spec.auth
- `none` : pas d'auth
- `oauth2_client_credentials` : POST au token_url avec client_id/client_secret depuis env, cache token 50min
- `api_key` : header `Authorization: Bearer ${{{{spec.auth_env_vars.api_key}}}}` from env

## SORTIE ATTENDUE
**UNIQUEMENT du code Python** entre balises ```python ... ``` . **Aucun texte avant ou après**. Pas d'explication, pas de markdown, juste le fichier .py complet prêt à être écrit.
"""


def _extract_code_from_response(response_text: str) -> str | None:
    """Extrait le code Python des balises markdown."""
    m = re.search(r"```python\s*\n(.*?)\n```", response_text, re.DOTALL)
    if m:
        return m.group(1).strip()
    # Fallback : si tout est du code
    stripped = response_text.strip()
    if stripped.startswith(("from ", "import ", '"""', "'''")):
        return stripped
    return None


def _validate_code(code: str) -> tuple[bool, str]:
    """Parse Python AST + vérifie whitelist imports + pas d'appels dangereux."""
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return False, f"SyntaxError: {e}"

    # Imports whitelist
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                root = alias.name.split(".")[0]
                if root not in ALLOWED_IMPORTS:
                    return False, f"Import interdit : {alias.name}"
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                root = node.module.split(".")[0]
                if root not in ALLOWED_IMPORTS:
                    return False, f"Import from interdit : {node.module}"
        # Interdits : exec, eval, open() write, subprocess
        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id in {"exec", "eval", "compile", "__import__"}:
                return False, f"Appel interdit : {node.func.id}"
            if isinstance(node.func, ast.Attribute) and node.func.attr in {"system", "popen", "Popen"}:
                return False, f"Appel subprocess interdit"

    return True, "OK"


async def generate_fetcher(source_id: str) -> dict:
    """Pipeline génération : spec → prompt → LLM → validate → write → register."""
    spec = load_spec(source_id)
    if not spec:
        return {"error": f"Spec introuvable : specs/{source_id}.yaml"}

    agent = get_agent("lead-data-engineer")
    if not agent:
        return {"error": "Agent lead-data-engineer non chargé"}

    prompt = _build_prompt(spec)

    # Appel Ollama Cloud (stream=False pour avoir la réponse complète)
    client = OllamaClient()
    try:
        response = await client.chat(
            model=agent.model,
            messages=[
                {"role": "system", "content": agent.system_prompt},
                {"role": "user", "content": prompt},
            ],
            options=agent.to_ollama_options(),
            stream=False,
        )
    finally:
        await client.close()

    content = response.get("message", {}).get("content", "") if isinstance(response, dict) else ""
    if not content:
        return {"error": "LLM response vide", "raw": str(response)[:500]}

    code = _extract_code_from_response(content)
    if not code:
        return {"error": "Pas de code Python extractible", "raw": content[:1000]}

    ok, msg = _validate_code(code)
    if not ok:
        return {"error": f"Validation failed: {msg}", "code_preview": code[:500]}

    # Write
    target = SOURCES_DIR / f"{source_id}.py"
    target.write_text(code, encoding="utf-8")

    # Hot reload : import + register dans engine
    result = {"source_id": source_id, "file": str(target.name), "bytes": len(code)}
    try:
        from ingestion import engine
        importlib.invalidate_caches()
        module_path = f"ingestion.sources.{source_id}"
        if module_path in list(importlib.sys.modules):
            importlib.reload(importlib.sys.modules[module_path])
        else:
            importlib.import_module(module_path)
        mod = importlib.import_module(module_path)
        fetcher_name = f"fetch_{source_id}_delta"
        fetcher = getattr(mod, fetcher_name, None) or getattr(mod, f"fetch_{source_id}_full", None)
        if fetcher is None:
            return {**result, "error": f"Fonction fetch_{source_id}_delta/full non trouvée dans le module"}

        trigger_str = spec.get("refresh_trigger", "interval_hours=24")
        trigger = _build_trigger(trigger_str)
        engine.SOURCES[source_id] = {
            "fetcher": fetcher,
            "trigger": trigger,
            "sla_minutes": spec.get("sla_minutes", 1440),
            "description": spec.get("name", source_id),
        }
        if engine.scheduler:
            engine.scheduler.add_job(
                engine.run_source,
                trigger=trigger,
                args=[source_id],
                id=f"ingest_{source_id}",
                name=f"Ingestion {source_id}",
                max_instances=1,
                coalesce=True,
                replace_existing=True,
            )
        result["registered"] = True
        result["trigger"] = str(trigger)
    except Exception as e:
        result["error_register"] = str(e)

    return result


def _build_trigger(s: str):
    s = s.strip()
    if s.startswith("interval_hours="):
        return IntervalTrigger(hours=int(s.split("=")[1]))
    if s.startswith("interval_minutes="):
        return IntervalTrigger(minutes=int(s.split("=")[1]))
    if s.startswith("cron:"):
        # ex: "cron:hour=3 minute=30 tz=Europe/Paris"
        parts = dict(p.split("=") for p in s[5:].split())
        tz = parts.pop("tz", "Europe/Paris")
        return CronTrigger(timezone=tz, **{k: int(v) for k, v in parts.items()})
    if s.strip() == "on_demand":
        return IntervalTrigger(days=365)  # effectivement jamais auto
    return IntervalTrigger(hours=24)  # default
