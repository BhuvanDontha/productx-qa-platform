import { REVIEWS } from "@/lib/data";
import { getModel } from "@/lib/gemini";
import { calculateMetrics } from "@/lib/metrics";
import type { QAResult, RouterOutput, QAEvalOutput } from "@/types";

export const maxDuration = 300;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<{ result: T | null; error: string | null }> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await fn();
      return { result, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const is429 = msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate");
      if (is429 && attempt < 3) {
        await delay(attempt * 3000); // backoff: 3s, 6s
        continue;
      }
      return { result: null, error: `${label}: ${msg}` };
    }
  }
  return { result: null, error: `${label}: max retries exceeded` };
}

async function callRouter(record: typeof REVIEWS[0]): Promise<{ output: RouterOutput; error: string | null }> {
  const { result, error } = await withRetry(async () => {
    const model = getModel();
    const res = await model.generateContent({
      systemInstruction: "You are a content moderation router agent for ProductX. Your job is to validate the routing of each review record.",
      contents: [{
        role: "user", parts: [{ text: `Analyze this content review record.

Review ID: ${record.review_id}
Content Type: ${record.content_type}
Category: ${record.category}
Description: ${record.content_description}

Return JSON: {"routing_confirmed": true, "priority": "high|medium|low", "routing_reason": "one sentence"}` }],
      }],
    });
    const text = res.response.text().trim().replace(/```json|```/g, "").trim();
    return JSON.parse(text) as RouterOutput;
  }, "Router");

  if (result) return { output: result, error: null };
  return {
    output: { routing_confirmed: true, priority: "medium", routing_reason: "Fallback routing — Gemini unavailable." },
    error,
  };
}

async function callQAEvaluator(record: typeof REVIEWS[0]): Promise<{ output: QAEvalOutput; error: string | null }> {
  const { result, error } = await withRetry(async () => {
    const model = getModel();
    const res = await model.generateContent({
      systemInstruction: `You are a Quality Assurance evaluator for ${record.content_type} content review at ProductX. Assess if the human reviewer made the correct moderation decision.`,
      contents: [{
        role: "user", parts: [{ text: `Content Description: ${record.content_description}
Category: ${record.category}
Reviewer Decision: ${record.reviewer_decision}
Ground Truth: ${record.ground_truth}

Return JSON: {"is_correct": boolean, "error_type": "correct|false_positive|false_negative|misclassification", "severity": "none|minor|moderate|critical", "reasoning": "one sentence", "reviewer_feedback": "one actionable tip"}` }],
      }],
    });
    const text = res.response.text().trim().replace(/```json|```/g, "").trim();
    return JSON.parse(text) as QAEvalOutput;
  }, "QA Eval");

  if (result) return { output: result, error: null };

  // Rule-based fallback — still accurate, just not AI-reasoned
  const correct = record.reviewer_decision === record.ground_truth;
  return {
    output: {
      is_correct: correct,
      error_type: correct ? "correct" : record.reviewer_decision === "approve" && record.ground_truth === "reject" ? "false_negative" : record.reviewer_decision === "reject" && record.ground_truth === "approve" ? "false_positive" : "misclassification",
      severity: correct ? "none" : record.category === "violence" || record.category === "explicit" ? "critical" : "moderate",
      reasoning: correct ? "Reviewer decision matches ground truth." : `Reviewer marked ${record.reviewer_decision} but content should be ${record.ground_truth}.`,
      reviewer_feedback: correct ? "Good call — decision aligns with policy." : `Review ${record.category} policy guidelines more carefully.`,
    },
    error,
  };
}

export async function POST() {
  const startTime = Date.now();
  const qaResults: QAResult[] = [];

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => controller.enqueue(new TextEncoder().encode(sse(data)));

      send({ type: "start", total: REVIEWS.length });

      for (let i = 0; i < REVIEWS.length; i++) {
        const record = REVIEWS[i];

        send({
          type: "step", step: "routing", index: i,
          review_id: record.review_id, reviewer_id: record.reviewer_id,
          content_type: record.content_type, category: record.category,
          message: `[${record.review_id}] Router Agent → ${record.content_type} (${record.category})`,
        });

        const { output: routing, error: routerError } = await callRouter(record);
        await delay(150);

        send({
          type: "step", step: "routing_done", index: i,
          review_id: record.review_id, priority: routing.priority,
          routing_reason: routing.routing_reason,
          api_error: routerError,
          message: routerError
            ? `[${record.review_id}] ⚠ Router fallback — ${routerError}`
            : `[${record.review_id}] Routed → priority:${routing.priority} · ${routing.routing_reason}`,
        });

        send({
          type: "step", step: "evaluating", index: i,
          review_id: record.review_id, reviewer_id: record.reviewer_id,
          content_type: record.content_type,
          message: `[${record.review_id}] QA Evaluator (${record.content_type}) → checking ${record.reviewer_id}'s decision`,
        });

        const { output: evaluation, error: evalError } = await callQAEvaluator(record);
        await delay(150);

        const qaResult: QAResult = {
          review_id: record.review_id,
          content_type: record.content_type,
          reviewer_id: record.reviewer_id,
          reviewer_decision: record.reviewer_decision,
          ground_truth: record.ground_truth,
          routing,
          evaluation,
          is_correct: record.reviewer_decision === record.ground_truth, // always ground truth, not AI guess
        };
        qaResults.push(qaResult);

        send({
          type: "step", step: "record_complete", index: i,
          total_records: REVIEWS.length,
          review_id: record.review_id, reviewer_id: record.reviewer_id,
          is_correct: qaResult.is_correct,
          error_type: evaluation.error_type,
          severity: evaluation.severity,
          reasoning: evaluation.reasoning,
          reviewer_feedback: evaluation.reviewer_feedback,
          api_error: evalError,
          message: evalError
            ? `[${record.review_id}] ${qaResult.is_correct ? "✓ PASS" : "✗ FAIL"} (rule-based) · ${evaluation.reasoning}`
            : `[${record.review_id}] ${qaResult.is_correct ? "✓ PASS" : "✗ FAIL"} · ${evaluation.reasoning}`,
        });
      }

      const metrics = calculateMetrics(qaResults);
      const duration_ms = Date.now() - startTime;
      send({ type: "complete", qa_results: qaResults, metrics, duration_ms });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
