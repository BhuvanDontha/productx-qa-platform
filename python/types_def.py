from dataclasses import dataclass, field
from typing import Literal, Optional

Decision  = Literal["approve", "reject", "escalate"]
Priority  = Literal["high", "medium", "low"]
ErrorType = Literal["correct", "false_positive", "false_negative", "misclassification"]
Severity  = Literal["none", "minor", "moderate", "critical"]
ContentType = Literal["text", "image", "audio", "video"]


@dataclass
class ReviewRecord:
    review_id: str
    content_type: ContentType
    category: str
    content_description: str
    reviewer_id: str
    reviewer_decision: Decision
    ground_truth: Decision


@dataclass
class RouterOutput:
    routing_confirmed: bool
    priority: Priority
    routing_reason: str
    fallback: bool = False


@dataclass
class QAEvalOutput:
    is_correct: bool
    error_type: ErrorType
    severity: Severity
    reasoning: str
    reviewer_feedback: str
    fallback: bool = False


@dataclass
class QAResult:
    review_id: str
    content_type: ContentType
    reviewer_id: str
    reviewer_decision: Decision
    ground_truth: Decision
    routing: RouterOutput
    evaluation: QAEvalOutput
    is_correct: bool


@dataclass
class ModalityMetrics:
    content_type: str
    precision: float
    recall: float
    f1: float
    accuracy: float
    total: int


@dataclass
class ReviewerMetrics:
    reviewer_id: str
    accuracy: float
    total: int
    correct: int
    needs_flag: bool
    best_modality: str
    worst_modality: str


@dataclass
class MetricsSummary:
    overall_accuracy: float
    total_reviews: int
    total_correct: int
    by_modality: list[ModalityMetrics] = field(default_factory=list)
    by_reviewer: list[ReviewerMetrics] = field(default_factory=list)
