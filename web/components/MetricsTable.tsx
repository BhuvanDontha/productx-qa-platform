"use client";
import type { ModalityMetrics } from "@/types";

const f1Color = (f1: number) => {
  if (f1 >= 0.8) return "text-[#047857]";
  if (f1 >= 0.65) return "text-[#b45309]";
  return "text-[#be123c]";
};

const f1Badge = (f1: number) => {
  if (f1 >= 0.8) return "bg-[#ecfdf5] text-[#047857]";
  if (f1 >= 0.65) return "bg-[#fffbeb] text-[#b45309]";
  return "bg-[#fff1f2] text-[#be123c]";
};

const statusLabel = (f1: number) => (f1 >= 0.8 ? "Healthy" : f1 >= 0.65 ? "Warning" : "Critical");

export default function MetricsTable({ data }: { data: ModalityMetrics[] }) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden shadow-sm">
      <div className="px-4 sm:px-6 py-4 border-b border-[#e5e7eb]">
        <h2 className="text-base sm:text-lg font-semibold text-[#111827]">Modality Performance Metrics</h2>
        <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5">Macro-averaged precision / recall / F1 across all reviewers</p>
      </div>

      {/* Desktop / tablet: table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              {["Modality", "Precision", "Recall", "F1 Score", "Reviews", "Correct", "Status"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f3f5]">
            {data.map((row) => (
              <tr key={row.modality} className="hover:bg-[#f9fafb] transition-colors">
                <td className="px-6 py-4 font-medium text-[#111827] capitalize">{row.modality}</td>
                <td className="px-6 py-4 text-[#374151]">{(row.precision * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-[#374151]">{(row.recall * 100).toFixed(1)}%</td>
                <td className={`px-6 py-4 font-bold ${f1Color(row.f1)}`}>{(row.f1 * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-[#374151]">{row.total_reviews}</td>
                <td className="px-6 py-4 text-[#374151]">{row.correct}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${f1Badge(row.f1)}`}>
                    {statusLabel(row.f1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden divide-y divide-[#f1f3f5]">
        {data.map((row) => (
          <div key={row.modality} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#111827] capitalize">{row.modality}</span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${f1Badge(row.f1)}`}>
                {statusLabel(row.f1)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#9ca3af]">Precision</p>
                <p className="text-sm font-medium text-[#374151]">{(row.precision * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#9ca3af]">Recall</p>
                <p className="text-sm font-medium text-[#374151]">{(row.recall * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#9ca3af]">F1</p>
                <p className={`text-sm font-bold ${f1Color(row.f1)}`}>{(row.f1 * 100).toFixed(1)}%</p>
              </div>
            </div>
            <div className="flex justify-between text-xs text-[#6b7280]">
              <span>Reviews: <span className="text-[#374151] font-medium">{row.total_reviews}</span></span>
              <span>Correct: <span className="text-[#374151] font-medium">{row.correct}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
