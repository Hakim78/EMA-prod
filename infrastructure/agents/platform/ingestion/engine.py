"""Ingestion engine — orchestrateur APScheduler + audit.

- Chaque source définit son schedule + fetcher
- Résultats loggés dans audit.agent_actions + audit.source_freshness
- Anomalies → audit.alerts (future hook Slack via agent Superviseur)
"""
from __future__ import annotations

import asyncio
import logging
import time
import uuid
from datetime import datetime, timezone

import psycopg
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from config import settings
from ingestion.sources.bodacc import fetch_bodacc_delta
from ingestion.sources.opensanctions import fetch_opensanctions_delta
from ingestion.sources.gels_avoirs import fetch_gels_avoirs_full

log = logging.getLogger("demoema.ingestion")

scheduler: AsyncIOScheduler | None = None

# Registry des sources
SOURCES: dict[str, dict] = {
    "bodacc": {
        "fetcher": fetch_bodacc_delta,
        "trigger": IntervalTrigger(hours=1),
        "sla_minutes": 90,
        "description": "BODACC — 48M annonces, delta horaire",
    },
    "opensanctions": {
        "fetcher": fetch_opensanctions_delta,
        "trigger": IntervalTrigger(hours=6),
        "sla_minutes": 720,
        "description": "OpenSanctions — 200k entities, delta 6h",
    },
    "gels_avoirs": {
        "fetcher": fetch_gels_avoirs_full,
        "trigger": CronTrigger(hour=3, minute=30, timezone="Europe/Paris"),
        "sla_minutes": 1500,
        "description": "DGTrésor gels — full refresh nuit 03:30 Paris",
    },
}


async def _audit_log(
    source_id: str,
    action: str,
    status: str,
    duration_ms: int,
    payload_out: dict,
) -> None:
    if not settings.database_url:
        log.warning("DATABASE_URL non configuré, skip audit log")
        return
    try:
        async with await psycopg.AsyncConnection.connect(settings.database_url) as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO audit.agent_actions
                      (agent_role, task_id, source_id, action, status, duration_ms, payload_out)
                    VALUES ('worker', %s, %s, %s, %s, %s, %s)
                    """,
                    (str(uuid.uuid4()), source_id, action, status, duration_ms, psycopg.types.json.Jsonb(payload_out)),
                )
                # Update freshness
                if status == "success":
                    await cur.execute(
                        """
                        INSERT INTO audit.source_freshness (source_id, last_success_at, rows_last_run, total_rows, sla_minutes, status)
                        VALUES (%s, now(), %s, %s, %s, 'ok')
                        ON CONFLICT (source_id) DO UPDATE SET
                          last_success_at = EXCLUDED.last_success_at,
                          rows_last_run   = EXCLUDED.rows_last_run,
                          total_rows      = audit.source_freshness.total_rows + EXCLUDED.rows_last_run,
                          status          = 'ok'
                        """,
                        (source_id, payload_out.get("rows", 0), payload_out.get("rows", 0), SOURCES[source_id]["sla_minutes"]),
                    )
                else:
                    await cur.execute(
                        """
                        INSERT INTO audit.source_freshness (source_id, last_failure_at, sla_minutes, status)
                        VALUES (%s, now(), %s, 'failed')
                        ON CONFLICT (source_id) DO UPDATE SET
                          last_failure_at = EXCLUDED.last_failure_at,
                          status          = 'failed'
                        """,
                        (source_id, SOURCES[source_id]["sla_minutes"]),
                    )
    except Exception:
        log.exception("Audit log failure (non-fatal)")


async def run_source(source_id: str) -> dict:
    """Execute l'ingestion d'une source + log audit. Appelable via endpoint manuel ou cron."""
    if source_id not in SOURCES:
        return {"error": f"source inconnue : {source_id}"}

    fetcher = SOURCES[source_id]["fetcher"]
    log.info("Ingestion start : %s", source_id)
    t0 = time.time()
    try:
        result = await fetcher()
        duration_ms = int((time.time() - t0) * 1000)
        result["duration_ms"] = duration_ms
        result["started_at"] = datetime.fromtimestamp(t0, tz=timezone.utc).isoformat()
        log.info("Ingestion done : %s rows=%d in %dms", source_id, result.get("rows", 0), duration_ms)
        await _audit_log(source_id, "fetch+insert", "success", duration_ms, result)
        return result
    except Exception as e:
        duration_ms = int((time.time() - t0) * 1000)
        log.exception("Ingestion failed : %s", source_id)
        err = {"error": str(e), "type": type(e).__name__, "duration_ms": duration_ms}
        await _audit_log(source_id, "fetch+insert", "failed", duration_ms, err)
        return err


def _discover_agent_generated_sources() -> None:
    """Auto-discovery : scan specs/*.yaml + import sources/*.py au boot pour populer SOURCES.
    Permet aux fetchers générés par agent de survivre aux restarts container."""
    import importlib
    import yaml
    from pathlib import Path
    specs_dir = Path(__file__).parent / "specs"
    sources_dir = Path(__file__).parent / "sources"
    if not specs_dir.exists():
        return
    for spec_path in specs_dir.glob("*.yaml"):
        try:
            spec = yaml.safe_load(spec_path.read_text(encoding="utf-8"))
            sid = spec.get("source_id")
            if not sid or sid in SOURCES:
                continue  # déjà hardcoded
            if not (sources_dir / f"{sid}.py").exists():
                continue
            mod = importlib.import_module(f"ingestion.sources.{sid}")
            fetcher = getattr(mod, f"fetch_{sid}_delta", None) or getattr(mod, f"fetch_{sid}_full", None)
            if not fetcher:
                log.warning("Auto-discovery : fetch_%s_delta/full introuvable dans %s.py", sid, sid)
                continue
            from ingestion.codegen import _build_trigger
            SOURCES[sid] = {
                "fetcher": fetcher,
                "trigger": _build_trigger(spec.get("refresh_trigger", "interval_hours=24")),
                "sla_minutes": spec.get("sla_minutes", 1440),
                "description": spec.get("name", sid),
            }
            log.info("Auto-discovered source : %s", sid)
        except Exception as e:
            log.warning("Discovery fail %s: %s", spec_path.name, e)


def start_scheduler() -> None:
    global scheduler
    if scheduler is not None:
        return
    _discover_agent_generated_sources()
    scheduler = AsyncIOScheduler(timezone="Europe/Paris")
    for source_id, cfg in SOURCES.items():
        scheduler.add_job(
            run_source,
            trigger=cfg["trigger"],
            args=[source_id],
            id=f"ingest_{source_id}",
            name=f"Ingestion {source_id}",
            max_instances=1,
            coalesce=True,
            replace_existing=True,
        )
    # Supervisor daily report 08:00 Paris
    scheduler.add_job(
        run_daily_supervisor_report,
        trigger=CronTrigger(hour=8, minute=0, timezone="Europe/Paris"),
        id="supervisor_daily",
        name="Supervisor daily report 08:00 Paris",
        max_instances=1,
        coalesce=True,
        replace_existing=True,
    )
    # Maintainer : regenerate failed fetchers every 6h
    scheduler.add_job(
        run_maintainer_check,
        trigger=IntervalTrigger(hours=6),
        id="maintainer_6h",
        name="Maintainer regenerate failed sources",
        max_instances=1,
        coalesce=True,
        replace_existing=True,
    )

    scheduler.start()
    log.info("Scheduler démarré — %d sources + 2 managers (supervisor+maintainer)", len(SOURCES))


def stop_scheduler() -> None:
    global scheduler
    if scheduler is not None:
        scheduler.shutdown(wait=False)
        scheduler = None


def list_jobs() -> list[dict]:
    if scheduler is None:
        return []
    return [
        {
            "id": j.id,
            "name": j.name,
            "next_run": j.next_run_time.isoformat() if j.next_run_time else None,
            "trigger": str(j.trigger),
        }
        for j in scheduler.get_jobs()
    ]


async def run_daily_supervisor_report() -> dict:
    """Rapport quotidien — synthèse freshness de toutes les sources + Slack."""
    if not settings.database_url:
        return {"error": "no DB"}
    report = await freshness_report()
    now = datetime.now(tz=timezone.utc)
    ok = [r for r in report if r.get("status") == "ok"]
    failed = [r for r in report if r.get("status") == "failed"]
    total_rows = sum(r.get("total_rows") or 0 for r in report)

    lines = [
        f"# 📊 DEMOEMA — Rapport ingestion {now.strftime('%Y-%m-%d')}",
        f"_généré à {now.strftime('%H:%M UTC')}_",
        "",
        f"**Total**: {len(report)} sources tracked · **{total_rows:,} rows** bronze cumulés",
        f"**Santé**: ✅ {len(ok)} OK · ❌ {len(failed)} en échec",
        "",
    ]
    if failed:
        lines.append("## ❌ Sources en échec")
        for r in failed:
            lines.append(f"- `{r['source_id']}` — last failure {r.get('last_failure_at','?')}")
        lines.append("")
    if ok:
        lines.append("## ✅ Sources OK (top 10 par volume)")
        for r in sorted(ok, key=lambda x: -(x.get("total_rows") or 0))[:10]:
            lines.append(f"- `{r['source_id']}` — {(r.get('total_rows') or 0):,} rows · last {r.get('last_success_at','?')}")
    md = "\n".join(lines)
    log.info("[Supervisor] %d OK, %d failed, %d total rows", len(ok), len(failed), total_rows)

    # Slack notif (si webhook configuré)
    if settings.slack_webhook_url:
        try:
            import httpx
            async with httpx.AsyncClient(timeout=10) as c:
                await c.post(settings.slack_webhook_url, json={"text": md})
        except Exception:
            log.exception("Slack supervisor notif failed")

    return {"ok": len(ok), "failed": len(failed), "total_rows": total_rows, "report": md}


async def run_maintainer_check() -> dict:
    """Toutes les 6h — régénère automatiquement les fetchers en échec via agent codegen."""
    if not settings.database_url:
        return {"error": "no DB"}
    try:
        import psycopg as _pg
        from ingestion.codegen import generate_fetcher
    except ImportError:
        return {"error": "codegen unavailable"}

    async with await _pg.AsyncConnection.connect(settings.database_url) as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                SELECT source_id FROM audit.source_freshness
                WHERE status='failed' AND (last_failure_at > now() - interval '24 hours')
                LIMIT 5
                """
            )
            rows = await cur.fetchall()

    regen_results = []
    for (sid,) in rows:
        log.info("[Maintainer] regenerating failed source : %s", sid)
        try:
            r = await generate_fetcher(sid)
            regen_results.append({"source": sid, "status": "regen_success" if "file" in r else "regen_failed", "details": r})
        except Exception as e:
            regen_results.append({"source": sid, "status": "regen_exception", "error": str(e)})

    log.info("[Maintainer] regenerated %d sources", len(regen_results))
    if regen_results and settings.slack_webhook_url:
        try:
            import httpx
            msg = f"🔧 Maintainer regenerated {len(regen_results)} fetchers: " + ", ".join(r["source"] for r in regen_results)
            async with httpx.AsyncClient(timeout=10) as c:
                await c.post(settings.slack_webhook_url, json={"text": msg})
        except Exception:
            pass

    return {"regenerated_count": len(regen_results), "details": regen_results}


async def freshness_report() -> list[dict]:
    if not settings.database_url:
        return []
    async with await psycopg.AsyncConnection.connect(settings.database_url) as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                """
                SELECT source_id, last_success_at, last_failure_at, rows_last_run, total_rows, sla_minutes, status
                FROM audit.source_freshness ORDER BY source_id
                """
            )
            rows = await cur.fetchall()
            cols = [d.name for d in cur.description]
            return [dict(zip(cols, r)) for r in rows]
