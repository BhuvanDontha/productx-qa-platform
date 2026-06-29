"use client";
import type { ReviewerMetrics } from "@/types";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export default function ReviewerScorecard({ data }: { data: ReviewerMetrics }) {
  const pct = (data.accuracy * 100).toFixed(1);
  const cardBorder = data.needs_flag
    ? "border-[#fecdd3] bg-[#fff5f6]"
    : data.accuracy >= 0.8
      ? "border-[#a7f3d0] bg-white"
      : "border-[#e5e7eb] bg-white";

  const numberColor = data.needs_flag
    ? "text-[#be123c]"
    : data.accuracy >= 0.8
      ? "text-[#047857]"
      : "text-[#b45309]";

  const barColor = data.needs_flag
    ? "bg-[#e11d48]"
    : data.accuracy >= 0.8
      ? "bg-[#059669]"
      : "bg-[#d97706]";

  return (
    <div className={`rounded-xl border ${cardBorder} p-5 flex flex-col gap-3 shadow-sm`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-lg font-bold text-[#111827]">{data.reviewer_id}</span>
        {data.needs_flag ? (
          <span className="flex items-center gap-1 rounded-full bg-[#fef2f2] px-3 py-1 text-xs font-bold text-[#be123c]">
            <AlertTriangle className="h-3 w-3" /> Needs Retraining
          </span>
        ) : data.accuracy >= 0.85 ? (
          <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-medium text-[#047857]">Top Performer</span>
        ) : null}
      </div>

      <div className="flex items-end gap-2">
        <span className={`text-4xl font-extrabold ${numberColor}`}>{pct}%</span>
        <span className="text-[#6b7280] text-sm mb-1">accuracy</span>
      </div>

      <div className="h-2 w-full rounded-full bg-[#eef0f3] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${data.accuracy * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-[#6b7280]">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-[#059669]" />
          <span>Best: <span className="capitalize text-[#111827]">{data.best_modality}</span></span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-3 w-3 text-[#e11d48]" />
          <span>Worst: <span className="capitalize text-[#111827]">{data.worst_modality}</span></span>
        </div>
        <div className="text-[#9ca3af]">Reviews: <span className="text-[#374151]">{data.total}</span></div>
        <div className="text-[#9ca3af]">Correct: <span className="text-[#374151]">{data.correct}</span></div>
      </div>
    </div>
  );
}
