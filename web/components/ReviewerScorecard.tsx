"use client";
import type { ReviewerMetrics } from "@/types";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export default function ReviewerScorecard({ data }: { data: ReviewerMetrics }) {
  const pct = (data.accuracy * 100).toFixed(1);
  const color = data.needs_flag ? "border-red-500/50 bg-red-950/20" : data.accuracy >= 0.8 ? "border-emerald-500/30" : "border-slate-700";

  return (
    <div className={`rounded-xl border ${color} bg-slate-800 p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-slate-100">{data.reviewer_id}</span>
        {data.needs_flag ? (
          <span className="flex items-center gap-1 rounded-full bg-red-900 px-3 py-1 text-xs font-bold text-red-400">
            <AlertTriangle className="h-3 w-3" /> Needs Retraining
          </span>
        ) : data.accuracy >= 0.85 ? (
          <span className="rounded-full bg-emerald-900/50 px-3 py-1 text-xs font-medium text-emerald-400">Top Performer</span>
        ) : null}
      </div>

      <div className="flex items-end gap-2">
        <span className={`text-4xl font-extrabold ${data.needs_flag ? "text-red-400" : data.accuracy >= 0.8 ? "text-emerald-400" : "text-amber-400"}`}>
          {pct}%
        </span>
        <span className="text-slate-400 text-sm mb-1">accuracy</span>
      </div>

      <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${data.needs_flag ? "bg-red-500" : data.accuracy >= 0.8 ? "bg-emerald-500" : "bg-amber-500"}`}
          style={{ width: `${data.accuracy * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-emerald-400" />
          <span>Best: <span className="capitalize text-slate-200">{data.best_modality}</span></span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-3 w-3 text-red-400" />
          <span>Worst: <span className="capitalize text-slate-200">{data.worst_modality}</span></span>
        </div>
        <div className="text-slate-500">Reviews: <span className="text-slate-300">{data.total}</span></div>
        <div className="text-slate-500">Correct: <span className="text-slate-300">{data.correct}</span></div>
      </div>
    </div>
  );
}
