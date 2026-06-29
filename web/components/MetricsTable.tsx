"use client";
import type { ModalityMetrics } from "@/types";

const f1Color = (f1: number) => {
  if (f1 >= 0.8) return "text-[#188038]";
  if (f1 >= 0.65) return "text-[#b06000]";
  return "text-[#c5221f]";
};

const f1Badge = (f1: number) => {
  if (f1 >= 0.8) return "bg-[#e6f4ea] text-[#188038]";
  if (f1 >= 0.65) return "bg-[#fef7e0] text-[#b06000]";
  return "bg-[#fce8e6] text-[#c5221f]";
};

export default function MetricsTable({ data }: { data: ModalityMetrics[] }) {
  return (
    <div className="rounded-xl border border-[#dadce0] bg-white overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-[#dadce0]">
        <h2 className="text-lg font-semibold text-[#202124]">Modality Performance Metrics</h2>
        <p className="text-sm text-[#5f6368] mt-0.5">Macro-averaged precision / recall / F1 across all reviewers</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#dadce0] bg-[#f8f9fa]">
              {["Modality", "Precision", "Recall", "F1 Score", "Reviews", "Correct", "Status"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-[#5f6368] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8eaed]">
            {data.map((row) => (
              <tr key={row.modality} className="hover:bg-[#f8f9fa] transition-colors">
                <td className="px-6 py-4 font-medium text-[#202124] capitalize">{row.modality}</td>
                <td className="px-6 py-4 text-[#3c4043]">{(row.precision * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-[#3c4043]">{(row.recall * 100).toFixed(1)}%</td>
                <td className={`px-6 py-4 font-bold ${f1Color(row.f1)}`}>{(row.f1 * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-[#3c4043]">{row.total_reviews}</td>
                <td className="px-6 py-4 text-[#3c4043]">{row.correct}</td>
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
