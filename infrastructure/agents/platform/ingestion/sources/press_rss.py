"""Press RSS feeds — titre + URL + date only (droits voisins art. L211-3 CPI).

Sources #119-123 ARCHITECTURE_DATA_V2. Agent lead-data-engineer : JAMAIS stocker le corps d'article
(licence ADPI/CFC requise pour corps). On stocke juste title + URL + pubDate.
Un fetcher générique pour tous les flux RSS presse.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

import feedparser
import httpx
import psycopg
from psycopg.types.json import Jsonb

from config import settings

log = logging.getLogger(__name__)


async def _fetch_rss_generic(source_id: str, feed_url: str, bronze_table: str) -> dict:
    if not settings.database_url:
        return {"error": "DATABASE_URL non configuré", "rows": 0}

    async with httpx.AsyncClient(timeout=30, headers={"User-Agent": "DEMOEMA-Agents/0.1"}) as client:
        r = await client.get(feed_url)
        if r.status_code != 200:
            return {"error": f"HTTP {r.status_code}", "rows": 0, "source": source_id}
        content = r.content

    feed = feedparser.parse(content)
    entries = feed.entries or []
    if not entries:
        return {"source": source_id, "rows": 0, "note": "feed vide"}

    inserted = 0
    async with await psycopg.AsyncConnection.connect(settings.database_url) as conn:
        async with conn.cursor() as cur:
            for e in entries:
                url = e.get("link", "")
                title = e.get("title", "")[:512]
                pub_parsed = e.get("published_parsed") or e.get("updated_parsed")
                pub_dt = None
                if pub_parsed:
                    try:
                        pub_dt = datetime(*pub_parsed[:6], tzinfo=timezone.utc)
                    except Exception:
                        pass
                if not url:
                    continue
                meta = {"title": title, "url": url, "source": source_id, "feed_id": e.get("id", "")}
                try:
                    await cur.execute(
                        f"""
                        INSERT INTO {bronze_table} (url, title, published_at, payload)
                        VALUES (%s, %s, %s, %s)
                        ON CONFLICT (url) DO NOTHING
                        """,
                        (url[:1024], title, pub_dt, Jsonb(meta)),
                    )
                    if cur.rowcount > 0:
                        inserted += 1
                except Exception as ex:
                    log.warning("RSS %s skip entry: %s", source_id, ex)
            await conn.commit()

    return {"source": source_id, "rows": inserted, "entries": len(entries), "mode": "rss_light"}


async def fetch_les_echos_rss_delta() -> dict:
    return await _fetch_rss_generic("les_echos_rss", "https://syndication.lesechos.fr/rss/rss_une.xml", "bronze.les_echos_raw")


async def fetch_la_tribune_rss_delta() -> dict:
    return await _fetch_rss_generic("la_tribune_rss", "https://www.latribune.fr/feed/articles/rss-articles.xml", "bronze.la_tribune_raw")


async def fetch_usine_nouvelle_rss_delta() -> dict:
    return await _fetch_rss_generic("usine_nouvelle_rss", "https://www.usinenouvelle.com/rss/", "bronze.usine_nouvelle_raw")


async def fetch_cfnews_rss_delta() -> dict:
    return await _fetch_rss_generic("cfnews_rss", "https://www.cfnews.net/rss", "bronze.cfnews_raw")


async def fetch_google_news_rss_delta() -> dict:
    return await _fetch_rss_generic("google_news_rss", "https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr", "bronze.google_news_raw")
