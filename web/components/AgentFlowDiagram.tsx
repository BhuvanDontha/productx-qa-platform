"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AgentNode {
  id: string;
  label: string;
  accent: string;   // hex for text + accent
  bg: string;       // light tinted background
  border: string;   // border color
  description: string;
  systemPrompt: string;
}

const nodes: AgentNode[] = [
  {
    id: "intake",
    label: "Content Intake",
    accent: "#64748b",
    bg: "#f1f5f9",
    border: "#e2e8f0",
    description: "Receives raw review records from human content moderators across all modalities.",
    systemPrompt: "Input layer: 60 ReviewRecord objects are loaded from the dataset and queued for processing.",
  },
  {
    id: "router",
    label: "Router Agent",
    accent: "#4f46e5",
    bg: "#eef2ff",
    border: "#c7d2fe",
    description: "Validates routing of each review record and assigns priority (high/medium/low) based on content type and category.",
    systemPrompt: 'System: "You are a content moderation router agent for ProductX. Your job is to validate the routing of each review record."\n\nUser: "Analyze this content review record. [review_id, content_type, category, description] Respond ONLY with JSON: {routing_confirmed, priority, routing_reason}"',
  },
  {
    id: "text-qa",
    label: "Text QA Agent",
    accent: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    description: "Evaluates human reviewer decisions specifically for text-based content including posts, comments, and messages.",
    systemPrompt: 'System: "You are a Quality Assurance evaluator for text content review at ProductX."\n\nUser: "[content_description, category, reviewer_decision, ground_truth] Respond ONLY with JSON: {is_correct, error_type, severity, reasoning, reviewer_feedback}"',
  },
  {
    id: "image-qa",
    label: "Image QA Agent",
    accent: "#0d9488",
    bg: "#f0fdfa",
    border: "#99f6e4",
    description: "Evaluates human reviewer decisions for image content including photos, screenshots, and infographics.",
    systemPrompt: 'System: "You are a Quality Assurance evaluator for image content review at ProductX."\n\nUser: "[content_description, category, reviewer_decision, ground_truth] Respond ONLY with JSON: {is_correct, error_type, severity, reasoning, reviewer_feedback}"',
  },
  {
    id: "av-qa",
    label: "Audio/Video QA Agent",
    accent: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    description: "Evaluates human reviewer decisions for audio and video content, including voice messages, clips, and streams.",
    systemPrompt: 'System: "You are a Quality Assurance evaluator for audio/video content review at ProductX."\n\nUser: "[content_description, category, reviewer_decision, ground_truth] Respond ONLY with JSON: {is_correct, error_type, severity, reasoning, reviewer_feedback}"',
  },
  {
    id: "metrics",
    label: "Metrics Engine",
    accent: "#0284c7",
    bg: "#f0f9ff",
    border: "#bae6fd",
    description: "Aggregates all QA results to compute macro-averaged precision, recall, and F1 scores per modality and per reviewer.",
    systemPrompt: "Pure computation layer: calculates P/R/F1 using standard confusion matrix approach across 3 decision classes (approve/reject/escalate). Flags any reviewer with accuracy < 60%.",
  },
  {
    id: "insights",
    label: "Insight Agent",
    accent: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    description: "Synthesizes all metrics into a C-suite executive brief using Gemini, highlighting risks and strategic recommendations.",
    systemPrompt: 'System: "You are a senior analytics advisor writing an executive report for the VP of Operations at ProductX."\n\nUser: "[MetricsSummary JSON] Write a 150-200 word executive brief covering QA health, modality performance, reviewer flags, AI recommendations, and estimated efficiency gains."',
  },
];

const Arrow = () => (
  <div className="flex justify-center my-1">
    <div className="flex flex-col items-center">
      <div className="w-0.5 h-4 bg-[#e5e7eb]" />
      <div
        className="w-0 h-0 border-l-4 border-r-4 border-l-transparent border-r-transparent"
        style={{ borderTopWidth: 6, borderTopColor: "#cbd5e1" }}
      />
    </div>
  </div>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
    <span className="text-xs text-[#6b7280]">{label}</span>
  </div>
);

export default function AgentFlowDiagram() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
        <LegendItem color="#64748b" label="Intake / System" />
        <LegendItem color="#4f46e5" label="Router Agent" />
        <LegendItem color="#7c3aed" label="Text QA" />
        <LegendItem color="#0d9488" label="Image QA" />
        <LegendItem color="#059669" label="Audio/Video QA" />
        <LegendItem color="#0284c7" label="Metrics Engine" />
        <LegendItem color="#d97706" label="Insight Agent" />
      </div>

      <div className="max-w-xl mx-auto">
        {nodes.map((node, i) => (
          <div key={node.id}>
            <div
              className="rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md"
              style={{ backgroundColor: node.bg, borderColor: node.border }}
              onClick={() => setExpanded(expanded === node.id ? null : node.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm sm:text-base" style={{ color: node.accent }}>{node.label}</span>
                {expanded === node.id ? (
                  <ChevronUp className="h-4 w-4 text-[#9ca3af] flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#9ca3af] flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-[#6b7280] mt-1">{node.description}</p>

              {expanded === node.id && (
                <div className="mt-3 rounded-lg bg-white p-3 border border-[#e5e7eb]">
                  <p className="text-xs text-[#9ca3af] mb-1 font-mono uppercase tracking-wider">Agent Prompt</p>
                  <pre className="text-xs text-[#374151] whitespace-pre-wrap break-words font-mono leading-relaxed">{node.systemPrompt}</pre>
                </div>
              )}
            </div>
            {i < nodes.length - 1 && <Arrow />}
          </div>
        ))}
      </div>
    </div>
  );
}
