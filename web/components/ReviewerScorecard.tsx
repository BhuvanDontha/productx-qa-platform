"use client";
import type { ReviewerMetrics } from "@/types";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export default function ReviewerScorecard({ data }: { data: ReviewerMetrics }) {
  const pct = (data.accuracy * 100).toFixed(1);
  const cardBorder = data.needs_flag
    ? "border-[#f6aea9] bg-[#fef6f5]"
    : data.accuracy >= 0.8
      ? "border-[#a8dab5] bg-white"
      : "border-[#dadce0] bg-white";

  const numberColor = data.needs_flag
    ? "text-[#c5221f]"
    : data.accuracy >= 0.8
      ? "text-[#188038]"
      : "text-[#b06000]";

  const barColor = data.needs_flag
    ? "bg-[#EA4335]"
    : data.accuracy >= 0.8
      ? "bg-[#34A853]"
      : "bg-[#F9AB00]";

  return (
    <div className={`rounded-xl border ${cardBorder} p-5 flex flex-col gap-3 shadow-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-[#202124]">{data.reviewer_id}</span>
        {data.needs_flag ? (
          <span className="flex items-center gap-1 rounded-full bg-[#fce8e6] px-3 py-1 text-xs font-bold text-[#c5221f]">
            <AlertTriangle className="h-3 w-3" /> Needs Retraining
          </span>
        ) : data.accuracy >= 0.85 ? (
          <span className="rounded-full bg-[#e6f4ea] px-3 py-1 text-xs font-medium text-[#188038]">Top Performer</span>
        ) : null}
      </div>

      <div className="flex items-end gap-2">
        <span className={`text-4xl font-extrabold ${numberColor}`}>{pct}%</span>
        <span className="text-[#5f6368] text-sm mb-1">accuracy</span>
      </div>

      <div className="h-2 w-full rounded-full bg-[#e8eaed] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${data.accuracy * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-[#5f6368]">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-[#34A853]" />
          <span>Best: <span className="capitalize text-[#202124]">{data.best_modality}</span></span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-3 w-3 text-[#EA4335]" />
          <span>Worst: <span className="capitalize text-[#202124]">{data.worst_modality}</span></span>
        </div>
        <div className="text-[#80868b]">Reviews: <span className="text-[#3c4043]">{data.total}</span></div>
        <div className="text-[#80868b]">Correct: <span className="text-[#3c4043]">{data.correct}</span></div>
      </div>
    </div>
  );
}
