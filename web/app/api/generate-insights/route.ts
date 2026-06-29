import { NextRequest, NextResponse } from "next/server";
import { getTextModel } from "@/lib/gemini";
import type { MetricsSummary } from "@/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { metrics }: { metrics: MetricsSummary } = await req.json();

    const model = getTextModel();

    const prompt = `QA Metrics Summary:
${JSON.stringify(metrics, null, 2)}

Write a 150-200 word executive brief covering:
1. Overall QA health verdict (one clear statement)
2. Best performing modality and why it matters
3. Worst performing modality and the risk it poses
4. Any reviewer requiring immediate retraining (flag if accuracy < 60%)
5. One specific AI recommendation to improve these metrics
6. Estimated efficiency gain if this system runs permanently

Tone: Direct, data-driven, executive-level. No headers or bullets. Write as flowing paragraphs.`;

    const result = await model.generateContent({
      systemInstruction: "You are a senior analytics advisor writing an executive report for the VP of Operations at ProductX. Return plain text only — no JSON, no markdown.",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const insight = result.response.text();
    return NextResponse.json({ insight, generated_at: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Insight generation error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
