"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AgentFlowDiagram from "@/components/AgentFlowDiagram";

export default function WorkflowHome() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">Agent Workflow</h1>
          <p className="text-[#6b7280] mt-1 text-sm sm:text-base">
            End-to-end pipeline: from content intake to executive insight. Tap any node to expand its prompt.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all whitespace-nowrap"
        >
          Go to Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <AgentFlowDiagram />
    </div>
  );
}
