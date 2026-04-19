"""Tools : lecture docs projet + recherche codebase."""
from __future__ import annotations

import re
from pathlib import Path

from config import settings


async def read_docs(filename: str) -> str:
    """Lit un fichier markdown depuis DOCS_DIR."""
    safe = Path(filename).name  # pas de traversal
    path = settings.docs_dir / safe
    if not path.exists():
        return f"Fichier introuvable : {safe}"
    if path.stat().st_size > 1_000_000:
        return f"Fichier trop gros (>1 MB) : {safe}"
    return path.read_text(encoding="utf-8")


async def search_codebase(pattern: str, glob: str = "") -> list[dict]:
    """Recherche regex dans docs + infrastructure, max 50 lignes."""
    results: list[dict] = []
    roots = [settings.docs_dir, settings.docs_dir.parent / "infrastructure"]
    regex = re.compile(pattern, re.IGNORECASE)

    for root in roots:
        if not root.exists():
            continue
        iterator = root.rglob(glob) if glob else root.rglob("*")
        for p in iterator:
            if len(results) >= 50:
                return results
            if not p.is_file():
                continue
            if p.suffix not in {".md", ".yml", ".yaml", ".py", ".ts", ".tsx", ".json", ".sql", ".sh", ".conf", ".toml"}:
                continue
            try:
                for i, line in enumerate(p.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
                    if regex.search(line):
                        results.append({"file": str(p.relative_to(root.parent)), "line": i, "text": line[:300]})
                        if len(results) >= 50:
                            return results
            except Exception:
                continue
    return results
