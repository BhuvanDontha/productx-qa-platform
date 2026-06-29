"""
Metrics Engine
--------------
Computes 3-class macro-averaged Precision, Recall, and F1 from QA results.
Pure Python — no Gemini call needed.
"""

from types_def import QAResult, MetricsSummary, ModalityMetrics, ReviewerMetrics

_CLASSES = ("approve", "reject", "escalate")


def _class_metrics(results: list[QAResult], cls: str) -> dict:
    tp = sum(1 for r in results if r.reviewer_decision == cls and r.ground_truth == cls)
    fp = sum(1 for r in results if r.reviewer_decision == cls and r.ground_truth != cls)
    fn = sum(1 for r in results if r.reviewer_decision != cls and r.ground_truth == cls)

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall    = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

    return {"precision": precision, "recall": recall, "f1": f1,
            "support": sum(1 for r in results if r.ground_truth == cls)}


def _modality_metrics(results: list[QAResult], ctype: str) -> ModalityMetrics:
    sub = [r for r in results if r.content_type == ctype]
    if not sub:
        return ModalityMetrics(ctype, 0, 0, 0, 0, 0)

    macro_p = sum(_class_metrics(sub, c)["precision"] for c in _CLASSES) / 3
    macro_r = sum(_class_metrics(sub, c)["recall"]    for c in _CLASSES) / 3
    macro_f = sum(_class_metrics(sub, c)["f1"]        for c in _CLASSES) / 3
    acc = sum(1 for r in sub if r.is_correct) / len(sub)

    return ModalityMetrics(ctype, round(macro_p, 4), round(macro_r, 4),
                           round(macro_f, 4), round(acc, 4), len(sub))


def _reviewer_metrics(results: list[QAResult], rev_id: str) -> ReviewerMetrics:
    sub = [r for r in results if r.reviewer_id == rev_id]
    correct = sum(1 for r in sub if r.is_correct)
    acc = correct / len(sub) if sub else 0.0

    modality_acc = {}
    for ct in ("text", "image", "audio", "video"):
        m = [r for r in sub if r.content_type == ct]
        modality_acc[ct] = (sum(1 for r in m if r.is_correct) / len(m)) if m else 0.0

    best  = max(modality_acc, key=modality_acc.get)
    worst = min(modality_acc, key=modality_acc.get)

    return ReviewerMetrics(
        reviewer_id=rev_id,
        accuracy=round(acc, 4),
        total=len(sub),
        correct=correct,
        needs_flag=acc < 0.60,
        best_modality=best,
        worst_modality=worst,
    )


def run(results: list[QAResult]) -> MetricsSummary:
    total   = len(results)
    correct = sum(1 for r in results if r.is_correct)

    by_modality = [_modality_metrics(results, ct) for ct in ("text", "image", "audio", "video")]
    reviewer_ids = sorted({r.reviewer_id for r in results})
    by_reviewer  = [_reviewer_metrics(results, rid) for rid in reviewer_ids]

    return MetricsSummary(
        overall_accuracy=round(correct / total, 4) if total else 0,
        total_reviews=total,
        total_correct=correct,
        by_modality=by_modality,
        by_reviewer=by_reviewer,
    )
