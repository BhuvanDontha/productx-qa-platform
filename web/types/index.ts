export type ContentType = "text" | "image" | "audio" | "video";
export type Decision = "approve" | "reject" | "escalate";
export type Category = "hate_speech" | "violence" | "spam" | "explicit" | "safe";
export type AgentStatus = "idle" | "running" | "complete" | "error";

export interface ReviewRecord {
  review_id: string;
  content_type: ContentType;
  reviewer_id: string;
  reviewer_decision: Decision;
  ground_truth: Decision;
  content_description: string;
  category: Category;
  timestamp: string;
}

export interface RouterOutput {
  routing_confirmed: boolean;
  priority: "high" | "medium" | "low";
  routing_reason: string;
}

export interface QAEvalOutput {
  is_correct: boolean;
  error_type: "correct" | "false_positive" | "false_negative" | "misclassification";
  severity: "none" | "minor" | "moderate" | "critical";
  reasoning: string;
  reviewer_feedback: string;
}

export interface QAResult {
  review_id: string;
  content_type: ContentType;
  reviewer_id: string;
  reviewer_decision: Decision;
  ground_truth: Decision;
  routing: RouterOutput;
  evaluation: QAEvalOutput;
  is_correct: boolean;
}

export interface ModalityMetrics {
  modality: ContentType;
  precision: number;
  recall: number;
  f1: number;
  total_reviews: number;
  correct: number;
}

export interface ReviewerMetrics {
  reviewer_id: string;
  accuracy: number;
  total: number;
  correct: number;
  best_modality: ContentType;
  worst_modality: ContentType;
  needs_flag: boolean;
}

export interface MetricsSummary {
  by_modality: ModalityMetrics[];
  by_reviewer: ReviewerMetrics[];
  overall_accuracy: number;
  total_reviews: number;
}
