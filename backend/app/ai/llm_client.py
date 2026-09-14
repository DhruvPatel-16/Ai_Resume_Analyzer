import json
import logging
from typing import Dict, Any, Optional
import httpx
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

async def call_llm(prompt: str, system_message: str = "You are an expert ATS resume analyst.") -> Optional[str]:
    """
    Calls an external LLM API if configured.
    Handles timeouts, rate limits, network errors, and unexpected responses gracefully.
    """
    if not settings.LLM_API_KEY:
        return None

    headers = {
        "Authorization": f"Bearer {settings.LLM_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": settings.LLM_MODEL,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
    }

    url = f"{settings.LLM_BASE_URL.rstrip('/')}/chat/completions"

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                return content
            else:
                logger.warning(f"LLM API returned status {response.status_code}: {response.text}")
                return None
    except httpx.TimeoutException:
        logger.warning("LLM request timed out, falling back to deterministic NLP engine.")
        return None
    except Exception as e:
        logger.warning(f"LLM request error: {str(e)}, falling back to deterministic NLP engine.")
        return None

async def parse_llm_json(prompt: str, system_message: str) -> Optional[Dict[str, Any]]:
    """Attempts to get and validate structured JSON from the LLM."""
    content = await call_llm(prompt, system_message)
    if not content:
        return None

    # Strip markdown code fences if LLM wrapped in ```json ... ```
    cleaned = content.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
    if cleaned.endswith("```"):
        cleaned = cleaned.rsplit("\n", 1)[0]
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("LLM returned invalid JSON, falling back.")
        return None
