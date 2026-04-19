"""Tool : requête SELECT read-only Postgres."""
from __future__ import annotations

import re

import psycopg

from config import settings

_FORBIDDEN = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE|COPY|EXECUTE)\b",
    re.IGNORECASE,
)


async def postgres_query_ro(sql: str) -> dict:
    if not settings.database_url:
        return {"error": "DATABASE_URL non configuré"}
    if not sql.strip().lower().startswith("select"):
        return {"error": "seul SELECT autorisé"}
    if _FORBIDDEN.search(sql):
        return {"error": "mot-clé interdit détecté"}
    if "--" in sql or ";" in sql.rstrip(";"):
        return {"error": "commentaire / multi-statement interdit"}

    async with await psycopg.AsyncConnection.connect(settings.database_url) as conn:
        async with conn.cursor() as cur:
            await cur.execute("SET statement_timeout = '10s'")
            await cur.execute(sql)
            rows = await cur.fetchmany(1000)
            cols = [d.name for d in cur.description] if cur.description else []
            return {
                "columns": cols,
                "rows": [list(r) for r in rows],
                "row_count": len(rows),
                "truncated": len(rows) == 1000,
            }
