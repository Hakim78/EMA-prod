"""Tool : HTTP GET générique."""
from __future__ import annotations

import httpx


async def httpx_get(url: str) -> dict:
    if not url.startswith(("http://", "https://")):
        return {"error": "URL invalide"}
    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as c:
        r = await c.get(url)
        preview = r.text[:2000] if "text" in r.headers.get("content-type", "") or "json" in r.headers.get("content-type", "") else f"<{len(r.content)} bytes binaire>"
        return {"status": r.status_code, "content_type": r.headers.get("content-type", ""), "body_preview": preview}
