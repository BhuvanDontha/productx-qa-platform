"use client";
import { motion } from "framer-motion";
import type { AgentStatus } from "@/types";
import type { LucideIcon } from "lucide-react";

interface Props {
  name: string;
  icon: LucideIcon;
  status: AgentStatus;
}

const statusConfig = {
  idle: { label: "Idle", className: "bg-slate-700 text-slate-400" },
  running: { label: "Running", className: "bg-cyan-900 text-cyan-400" },
  complete: { label: "Complete", className: "bg-emerald-900 text-emerald-400" },
  error: { label: "Error", className: "bg-red-900 text-red-400" },
};

export default function AgentStatusCard({ name, icon: Icon, status }: Props) {
  const cfg = statusConfig[status];

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 p-5 min-w-[140px]">
      <div className={`rounded-full p-3 ${status === "complete" ? "bg-emerald-900/40" : status === "running" ? "bg-cyan-900/40" : "bg-slate-700/40"}`}>
        <Icon className={`h-6 w-6 ${status === "complete" ? "text-emerald-400" : status === "running" ? "text-cyan-400" : "text-slate-400"}`} />
      </div>
      <span className="text-xs font-semibold text-slate-200 text-center">{name}</span>
      <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.className}`}>
        {status === "running" && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400"
          />
        )}
        {cfg.label}
      </div>
    </div>
  );
}
