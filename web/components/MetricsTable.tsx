"use client";
import type { ModalityMetrics } from "@/types";

const f1Color = (f1: number) => {
  if (f1 >= 0.8) return "text-emerald-400";
  if (f1 >= 0.65) return "text-amber-400";
  return "text-red-400";
};

const f1Badge = (f1: number) => {
  if (f1 >= 0.8) return "bg-emerald-900/50 text-emerald-400";
  if (f1 >= 0.65) return "bg-amber-900/50 text-amber-400";
  return "bg-red-900/50 text-red-400";
};

export default function MetricsTable({ data }: { data: ModalityMetrics[] }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-100">Modality Performance Metrics</h2>
        <p className="text-sm text-slate-400 mt-0.5">Macro-averaged precision / recall / F1 across all reviewers</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              {["Modality", "Precision", "Recall", "F1 Score", "Reviews", "Correct", "Status"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {data.map((row) => (
              <tr key={row.modality} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-100 capitalize">{row.modality}</td>
                <td className="px-6 py-4 text-slate-300">{(row.precision * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-slate-300">{(row.recall * 100).toFixed(1)}%</td>
                <td className={`px-6 py-4 font-bold ${f1Color(row.f1)}`}>{(row.f1 * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-slate-300">{row.total_reviews}</td>
                <td className="px-6 py-4 text-slate-300">{row.correct}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${f1Badge(row.f1)}`}>
                    {row.f1 >= 0.8 ? "Healthy" : row.f1 >= 0.65 ? "Warning" : "Critical"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
