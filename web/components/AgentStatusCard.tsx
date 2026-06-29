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
  idle:     { label: "Idle",     className: "bg-[#f1f3f4] text-[#5f6368]" },
  running:  { label: "Running",  className: "bg-[#e8f0fe] text-[#1a73e8]" },
  complete: { label: "Complete", className: "bg-[#e6f4ea] text-[#188038]" },
  error:    { label: "Error",    className: "bg-[#fce8e6] text-[#c5221f]" },
};

const iconWrap = {
  idle:     "bg-[#f1f3f4]",
  running:  "bg-[#e8f0fe]",
  complete: "bg-[#e6f4ea]",
  error:    "bg-[#fce8e6]",
};

const iconColor = {
  idle:     "text-[#5f6368]",
  running:  "text-[#4285F4]",
  complete: "text-[#34A853]",
  error:    "text-[#EA4335]",
};

export default function AgentStatusCard({ name, icon: Icon, status }: Props) {
  const cfg = statusConfig[status];

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-[#dadce0] bg-white p-5 min-w-[140px] shadow-sm">
      <div className={`rounded-full p-3 ${iconWrap[status]}`}>
        <Icon className={`h-6 w-6 ${iconColor[status]}`} />
      </div>
      <span className="text-xs font-semibold text-[#202124] text-center">{name}</span>
      <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.className}`}>
        {status === "running" && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#4285F4]"
          />
        )}
        {cfg.label}
      </div>
    </div>
  );
}
