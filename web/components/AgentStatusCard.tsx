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
  idle:     { label: "Idle",     className: "bg-[#f1f5f9] text-[#64748b]" },
  running:  { label: "Running",  className: "bg-[#eef2ff] text-[#4338ca]" },
  complete: { label: "Complete", className: "bg-[#ecfdf5] text-[#047857]" },
  error:    { label: "Error",    className: "bg-[#fef2f2] text-[#b91c1c]" },
};

const iconWrap = {
  idle:     "bg-[#f1f5f9]",
  running:  "bg-[#eef2ff]",
  complete: "bg-[#ecfdf5]",
  error:    "bg-[#fef2f2]",
};

const iconColor = {
  idle:     "text-[#64748b]",
  running:  "text-[#4f46e5]",
  complete: "text-[#059669]",
  error:    "text-[#dc2626]",
};

export default function AgentStatusCard({ name, icon: Icon, status }: Props) {
  const cfg = statusConfig[status];

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3 rounded-xl border border-[#e5e7eb] bg-white p-3 sm:p-5 w-full sm:min-w-[140px] sm:w-auto shadow-sm">
      <div className={`rounded-full p-2.5 sm:p-3 ${iconWrap[status]}`}>
        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor[status]}`} />
      </div>
      <span className="text-[11px] sm:text-xs font-semibold text-[#111827] text-center leading-tight">{name}</span>
      <div className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium ${cfg.className}`}>
        {status === "running" && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#4f46e5]"
          />
        )}
        {cfg.label}
      </div>
    </div>
  );
}
