"""
Router Agent
------------
Receives a raw review record and determines its routing priority.
Raises on failure — the pipeline orchestrator handles retry and fallback.
"""

import json
from google import genai
from google.genai import types as gtypes
from types_def import ReviewRecord, RouterOutput

_SYSTEM = (
    "You are a content moderation router agent for ProductX. "
    "Your job is to validate and prioritise each incoming review record. "
    "Respond with valid JSON only — no markdown, no extra text."
)

_PRIORITY_RULES = {
    "hate_speech": "high",
    "violence": "high",
    "explicit": "high",
    "spam": "medium",
    "safe": "low",
}


def rule_based_fallback(record: ReviewRecord) -> RouterOutput:
    """Last-resort fallback used by the pipeline after all retries are exhausted."""
    return RouterOutput(
        routing_confirmed=True,
        priority=_PRIORITY_RULES.get(record.category, "medium"),
        routing_reason=f"Rule-based routing for {record.category} content.",
        fallback=True,
    )


def run(record: ReviewRecord, client: genai.Client) -> RouterOutput:
    """Call Gemini to route the record. Raises on any failure."""
    prompt = f"""Analyse this content moderation review record.

Review ID      : {record.review_id}
Content Type   : {record.content_type}
Category       : {record.category}
Description    : {record.content_description}

Return JSON with exactly these keys:
{{
  "routing_confirmed": true,
  "priority": "high|medium|low",
  "routing_reason": "<one sentence>"
}}"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=gtypes.GenerateContentConfig(
            system_instruction=_SYSTEM,
            response_mime_type="application/json",
        ),
    )
    raw = response.text.strip().removeprefix("```json").removesuffix("```").strip()
    data = json.loads(raw)
    return RouterOutput(
        routing_confirmed=bool(data.get("routing_confirmed", True)),
        priority=data.get("priority", "medium"),
        routing_reason=data.get("routing_reason", ""),
        fallback=False,
    )
