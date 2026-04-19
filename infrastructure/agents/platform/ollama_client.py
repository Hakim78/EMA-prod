"""Client HTTP Ollama — streaming + tool-calling."""
from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from typing import Any

import httpx

from config import settings

log = logging.getLogger(__name__)


class OllamaClient:
    def __init__(self) -> None:
        headers: dict[str, str] = {}
        if settings.ollama_api_key:
            headers["Authorization"] = f"Bearer {settings.ollama_api_key}"
        self._client = httpx.AsyncClient(
            base_url=settings.ollama_base_url,
            timeout=httpx.Timeout(settings.ollama_timeout_s),
            headers=headers,
        )
        self._is_cloud = settings.ollama_base_url.startswith("https://ollama.com")

    async def close(self) -> None:
        await self._client.aclose()

    async def list_models(self) -> list[dict[str, Any]]:
        r = await self._client.get("/api/tags")
        r.raise_for_status()
        return r.json().get("models", [])

    async def pull_model(self, name: str) -> AsyncIterator[dict[str, Any]]:
        """Streaming pull progress."""
        async with self._client.stream("POST", "/api/pull", json={"name": name}) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.strip():
                    yield json.loads(line)

    async def chat(
        self,
        model: str,
        messages: list[dict[str, str]],
        tools: list[dict] | None = None,
        options: dict | None = None,
        stream: bool = False,
    ) -> dict[str, Any] | AsyncIterator[dict[str, Any]]:
        payload: dict[str, Any] = {
            "model": model,
            "messages": messages,
            "stream": stream,
        }
        if not self._is_cloud:
            payload["keep_alive"] = settings.ollama_keep_alive
        if tools:
            payload["tools"] = tools
        if options:
            payload["options"] = options

        if stream:
            return self._chat_stream(payload)
        r = await self._client.post("/api/chat", json=payload)
        r.raise_for_status()
        return r.json()

    async def _chat_stream(self, payload: dict) -> AsyncIterator[dict[str, Any]]:
        async with self._client.stream("POST", "/api/chat", json=payload) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.strip():
                    yield json.loads(line)

    async def embed(self, model: str, input_text: str) -> list[float]:
        r = await self._client.post("/api/embed", json={"model": model, "input": input_text})
        r.raise_for_status()
        data = r.json()
        embeddings = data.get("embeddings", [])
        return embeddings[0] if embeddings else []
