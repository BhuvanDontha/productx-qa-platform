"""
Insight Agent
-------------
Receives the full MetricsSummary and generates an executive brief
intended for the VP of Operations — written as flowing prose.
"""

from google import genai
from google.genai import types as gtypes
from types_def import MetricsSummary

_SYSTEM = (
    "You are a senior analytics advisor writing an executive report for the "
    "VP of Operations at ProductX. Return plain text only — no JSON, no markdown, "
    "no bullet points. Write as flowing paragraphs."
)


def _build_prompt(metrics: MetricsSummary) -> str:
    reviewer_flags = [
        f"  {r.reviewer_id}: {r.accuracy*100:.1f}% accuracy (NEEDS RETRAINING)"
        if r.needs_flag
        else f"  {r.reviewer_id}: {r.accuracy*100:.1f}% accuracy"
        for r in metrics.by_reviewer
    ]

    modality_lines = [
        f"  {m.content_type}: P={m.precision:.2f}  R={m.recall:.2f}  F1={m.f1:.2f}  Acc={m.accuracy*100:.1f}%"
        for m in metrics.by_modality
    ]

    return f"""QA Pipeline Results:

Overall Accuracy : {metrics.overall_accuracy*100:.1f}%
Total Reviews    : {metrics.total_reviews}
Correct Decisions: {metrics.total_correct}

Modality Breakdown:
{chr(10).join(modality_lines)}

Reviewer Performance:
{chr(10).join(reviewer_flags)}

Write a 150-200 word executive brief covering:
1. Overall QA health verdict (one clear opening statement)
2. Best-performing modality and why it matters
3. Worst-performing modality and the risk it poses
4. Any reviewer requiring immediate retraining (flag if accuracy < 60%)
5. One specific AI recommendation to improve metrics
6. Estimated efficiency gain if this system runs permanently

Tone: Direct, data-driven, executive-level."""


def run(metrics: MetricsSummary, client: genai.Client) -> str:
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=_build_prompt(metrics),
            config=gtypes.GenerateContentConfig(system_instruction=_SYSTEM),
        )
        return response.text.strip()
    except Exception as e:
        return f"[Insight generation failed: {e}]"
