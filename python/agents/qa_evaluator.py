"""
QA Evaluator Agent
------------------
Assesses whether a human reviewer made the correct moderation decision.
Raises on failure — the pipeline orchestrator handles retry and fallback.
"""

import json
from google import genai
from google.genai import types as gtypes
from types_def import ReviewRecord, QAEvalOutput

_SYSTEM_TMPL = (
    "You are a Quality Assurance evaluator for {ctype} content review at ProductX. "
    "Determine whether the human reviewer made the correct moderation decision. "
    "Respond with valid JSON only — no markdown, no extra text."
)

_HIGH_SEVERITY_CATS = {"violence", "explicit", "hate_speech"}


def rule_based_fallback(record: ReviewRecord) -> QAEvalOutput:
    """Last-resort fallback used by the pipeline after all retries are exhausted."""
    correct = record.reviewer_decision == record.ground_truth
    if correct:
        error_type, severity = "correct", "none"
        reasoning = "Reviewer decision matches ground truth."
        feedback = "Good call — decision aligns with policy."
    else:
        rd, gt = record.reviewer_decision, record.ground_truth
        if rd == "approve" and gt == "reject":
            error_type = "false_negative"
        elif rd == "reject" and gt == "approve":
            error_type = "false_positive"
        else:
            error_type = "misclassification"
        severity = "critical" if record.category in _HIGH_SEVERITY_CATS else "moderate"
        reasoning = f"Reviewer marked '{rd}' but content should be '{gt}'."
        feedback = f"Review {record.category} policy guidelines more carefully."

    return QAEvalOutput(
        is_correct=correct,
        error_type=error_type,
        severity=severity,
        reasoning=reasoning,
        reviewer_feedback=feedback,
        fallback=True,
    )


def run(record: ReviewRecord, client: genai.Client) -> QAEvalOutput:
    """Call Gemini to evaluate the reviewer's decision. Raises on any failure."""
    prompt = f"""Content Description : {record.content_description}
Category           : {record.category}
Reviewer Decision  : {record.reviewer_decision}
Ground Truth       : {record.ground_truth}

Return JSON with exactly these keys:
{{
  "is_correct": true|false,
  "error_type": "correct|false_positive|false_negative|misclassification",
  "severity": "none|minor|moderate|critical",
  "reasoning": "<one sentence>",
  "reviewer_feedback": "<one actionable tip>"
}}"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=gtypes.GenerateContentConfig(
            system_instruction=_SYSTEM_TMPL.format(ctype=record.content_type),
            response_mime_type="application/json",
        ),
    )
    raw = response.text.strip().removeprefix("```json").removesuffix("```").strip()
    data = json.loads(raw)
    return QAEvalOutput(
        is_correct=bool(data.get("is_correct", False)),
        error_type=data.get("error_type", "correct"),
        severity=data.get("severity", "none"),
        reasoning=data.get("reasoning", ""),
        reviewer_feedback=data.get("reviewer_feedback", ""),
        fallback=False,
    )
