"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AgentFlowDiagram from "@/components/AgentFlowDiagram";

export default function WorkflowHome() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#202124]">Agent Workflow</h1>
          <p className="text-[#5f6368] mt-1">
            End-to-end pipeline: from content intake to executive insight. Click any node to expand its prompt.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-[#4285F4] hover:bg-[#1a73e8] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all whitespace-nowrap"
        >
          Go to Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <AgentFlowDiagram />
    </div>
  );
}
