import type { QAResult, ModalityMetrics, ReviewerMetrics, MetricsSummary, ContentType, Decision } from "@/types";

const MODALITIES: ContentType[] = ["text", "image", "audio", "video"];
const DECISIONS: Decision[] = ["approve", "reject", "escalate"];
const REVIEWERS = ["R01", "R02", "R03", "R04", "R05"];

function classMetrics(records: QAResult[], cls: Decision) {
  const tp = records.filter(r => r.reviewer_decision === cls && r.ground_truth === cls).length;
  const fp = records.filter(r => r.reviewer_decision === cls && r.ground_truth !== cls).length;
  const fn = records.filter(r => r.reviewer_decision !== cls && r.ground_truth === cls).length;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const support = records.filter(r => r.ground_truth === cls).length;
  return { precision, recall, f1, support };
}

function macroF1(records: QAResult[]) {
  const perClass = DECISIONS.map(cls => classMetrics(records, cls)).filter(m => m.support > 0);
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  return {
    precision: parseFloat(avg(perClass.map(m => m.precision)).toFixed(3)),
    recall: parseFloat(avg(perClass.map(m => m.recall)).toFixed(3)),
    f1: parseFloat(avg(perClass.map(m => m.f1)).toFixed(3)),
  };
}

export function calculateMetrics(qaResults: QAResult[]): MetricsSummary {
  const by_modality: ModalityMetrics[] = MODALITIES.map(modality => {
    const records = qaResults.filter(r => r.content_type === modality);
    const { precision, recall, f1 } = macroF1(records);
    const correct = records.filter(r => r.reviewer_decision === r.ground_truth).length;
    return {
      modality,
      precision,
      recall,
      f1,
      total_reviews: records.length,
      correct,
    };
  });

  const by_reviewer: ReviewerMetrics[] = REVIEWERS.map(reviewer_id => {
    const records = qaResults.filter(r => r.reviewer_id === reviewer_id);
    const total = records.length;
    const correct = records.filter(r => r.reviewer_decision === r.ground_truth).length;
    const accuracy = total > 0 ? parseFloat((correct / total).toFixed(3)) : 0;

    let bestModality: ContentType = "text";
    let worstModality: ContentType = "text";
    let bestAcc = -1;
    let worstAcc = 2;

    for (const modality of MODALITIES) {
      const sub = records.filter(r => r.content_type === modality);
      if (sub.length === 0) continue;
      const acc = sub.filter(r => r.reviewer_decision === r.ground_truth).length / sub.length;
      if (acc > bestAcc) { bestAcc = acc; bestModality = modality; }
      if (acc < worstAcc) { worstAcc = acc; worstModality = modality; }
    }

    return {
      reviewer_id,
      accuracy,
      total,
      correct,
      best_modality: bestModality,
      worst_modality: worstModality,
      needs_flag: accuracy < 0.60,
    };
  });

  const total_reviews = qaResults.length;
  const overall_correct = qaResults.filter(r => r.reviewer_decision === r.ground_truth).length;

  return {
    by_modality,
    by_reviewer,
    overall_accuracy: parseFloat((overall_correct / total_reviews).toFixed(3)),
    total_reviews,
  };
}
