"""Tool : API Confluence/Jira via Basic auth."""
from __future__ import annotations

import base64

import httpx

from config import settings


async def atlassian_api(method: str, path: str, body: dict | None = None) -> dict:
    if not settings.atlassian_api_token:
        return {"error": "ATLASSIAN_API_TOKEN non configuré"}
    if method not in {"GET", "POST", "PUT", "DELETE"}:
        return {"error": f"méthode non autorisée : {method}"}

    auth = base64.b64encode(
        f"{settings.atlassian_email}:{settings.atlassian_api_token}".encode()
    ).decode()
    headers = {"Authorization": f"Basic {auth}", "Accept": "application/json"}
    if body:
        headers["Content-Type"] = "application/json"

    url = settings.atlassian_base_url.rstrip("/") + "/" + path.lstrip("/")

    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.request(method, url, headers=headers, json=body if body else None)
        try:
            data = r.json()
        except Exception:
            data = {"text": r.text[:500]}
        return {"status": r.status_code, "body": data}
