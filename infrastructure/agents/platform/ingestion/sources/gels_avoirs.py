"""Gels des Avoirs DGTrésor — source #77.

Format XML : https://gels-avoirs.dgtresor.gouv.fr/Gels/GelsWebSrv/GelsWebSrvStd
Mais endpoint public simple pour download full list :
https://gels-avoirs.dgtresor.gouv.fr/ApiPublic/api/v1/publication/derniere-publication-fr/xml
Full refresh (liste entière) toutes les nuits.
"""
from __future__ import annotations

import logging
from datetime import datetime

import httpx
import psycopg
from lxml import etree
from psycopg.types.json import Jsonb

from config import settings

log = logging.getLogger(__name__)

GELS_URL = "https://gels-avoirs.dgtresor.gouv.fr/ApiPublic/api/v1/publication/derniere-publication-fr/xml"


async def fetch_gels_avoirs_full() -> dict:
    """Full refresh liste gels FR. Insert bronze dedup (identifiant_un, nom)."""
    if not settings.database_url:
        return {"error": "DATABASE_URL non configuré", "rows": 0}

    async with httpx.AsyncClient(timeout=60, headers={"User-Agent": "DEMOEMA-Agents/0.1"}) as client:
        r = await client.get(GELS_URL)
        if r.status_code != 200:
            return {"error": f"HTTP {r.status_code}", "rows": 0}
        content = r.content

    try:
        root = etree.fromstring(content)
    except Exception as e:
        return {"error": f"XML parse failed: {e}", "rows": 0}

    # La structure XML DGTrésor : /Sanctions/Publication/...
    # On parse tous les "personne" et "entite"
    items: list[tuple] = []
    for node in root.iter():
        tag = etree.QName(node).localname
        if tag not in ("personne", "entite"):
            continue
        nom = _text(node, "nom") or _text(node, "designation")
        identifiant_un = _text(node, "identifiantUN") or _text(node, "idRegistre")
        qualite = tag
        programme = _text(node, "programme") or _text(node, "sanction")
        date_inscr = _text(node, "dateInscription") or _text(node, "date")
        payload = {child.tag: child.text for child in node}
        items.append(
            (
                (identifiant_un or "")[:128],
                (nom or "")[:512],
                qualite[:64],
                (programme or "")[:128],
                _parse_date(date_inscr),
                Jsonb(payload),
            )
        )

    if not items:
        return {"source": "gels_avoirs", "rows": 0, "note": "aucune entité extraite du XML"}

    inserted = 0
    async with await psycopg.AsyncConnection.connect(settings.database_url) as conn:
        async with conn.cursor() as cur:
            await cur.executemany(
                """
                INSERT INTO bronze.gels_avoirs_raw
                  (identifiant_un, nom, qualite, programme, date_inscription, payload)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (identifiant_un, nom) DO UPDATE SET
                  payload = EXCLUDED.payload,
                  ingested_at = now()
                """,
                items,
            )
            inserted = cur.rowcount or 0
            await conn.commit()

    return {"source": "gels_avoirs", "rows": inserted, "processed": len(items)}


def _text(node, tag):
    child = node.find(tag)
    return child.text.strip() if child is not None and child.text else None


def _parse_date(s):
    if not s:
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(s[:19], fmt).date()
        except Exception:
            continue
    return None
