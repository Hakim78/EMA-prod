"""Chargement des prompts markdown → objets Agent."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import frontmatter
from pydantic import BaseModel, Field

from config import settings

log = logging.getLogger(__name__)


class AgentSpec(BaseModel):
    name: str
    model: str
    temperature: float = Field(default=0.2, ge=0.0, le=2.0)
    num_ctx: int = Field(default=8192, ge=512, le=262144)
    description: str = ""
    tools: list[str] = Field(default_factory=list)
    system_prompt: str

    def to_ollama_options(self) -> dict[str, Any]:
        return {
            "temperature": self.temperature,
            "num_ctx": self.num_ctx,
        }


_registry: dict[str, AgentSpec] = {}


def load_agents() -> dict[str, AgentSpec]:
    """Charge tous les prompts depuis PROMPTS_DIR."""
    _registry.clear()
    prompts_dir = settings.prompts_dir
    if not prompts_dir.exists():
        log.warning("Prompts dir introuvable : %s", prompts_dir)
        return {}

    for md_file in sorted(prompts_dir.glob("*.md")):
        try:
            post = frontmatter.load(md_file)
            meta = post.metadata
            required = {"name", "model"}
            missing = required - meta.keys()
            if missing:
                log.error("Prompt %s : champs manquants %s", md_file.name, missing)
                continue

            spec = AgentSpec(
                name=meta["name"],
                model=meta["model"],
                temperature=float(meta.get("temperature", 0.2)),
                num_ctx=int(meta.get("num_ctx", 8192)),
                description=meta.get("description", ""),
                tools=list(meta.get("tools", [])),
                system_prompt=post.content.strip(),
            )
            _registry[spec.name] = spec
            log.info("Agent chargé : %s (model=%s, tools=%d)", spec.name, spec.model, len(spec.tools))
        except Exception:
            log.exception("Échec chargement prompt %s", md_file.name)

    log.info("Total %d agents chargés", len(_registry))
    return dict(_registry)


def get_agent(name: str) -> AgentSpec | None:
    return _registry.get(name)


def list_agents() -> list[AgentSpec]:
    return list(_registry.values())
