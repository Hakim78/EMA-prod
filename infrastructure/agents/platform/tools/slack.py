"""Tool : notification Slack via webhook."""
from __future__ import annotations

import httpx

from config import settings


async def slack_notify(level: str, message: str) -> dict:
    if not settings.slack_webhook_url:
        return {"error": "SLACK_WEBHOOK_URL non configuré", "dry_run": True, "would_send": f"[{level}] {message}"}
    emoji = {"info": "ℹ️", "warning": "⚠️", "critical": "🚨"}.get(level, "")
    payload = {"text": f"{emoji} [{level.upper()}] {message}"}
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.post(settings.slack_webhook_url, json=payload)
        return {"status": r.status_code, "sent": r.is_success}
