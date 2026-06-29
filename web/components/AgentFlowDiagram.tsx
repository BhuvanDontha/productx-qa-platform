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
    accent: "#5f6368",
    bg: "#f1f3f4",
    border: "#dadce0",
    description: "Receives raw review records from human content moderators across all modalities.",
    systemPrompt: "Input layer: 60 ReviewRecord objects are loaded from the dataset and queued for processing.",
  },
  {
    id: "router",
    label: "Router Agent",
    accent: "#4285F4",
    bg: "#e8f0fe",
    border: "#aecbfa",
    description: "Validates routing of each review record and assigns priority (high/medium/low) based on content type and category.",
    systemPrompt: 'System: "You are a content moderation router agent for ProductX. Your job is to validate the routing of each review record."\n\nUser: "Analyze this content review record. [review_id, content_type, category, description] Respond ONLY with JSON: {routing_confirmed, priority, routing_reason}"',
  },
  {
    id: "text-qa",
    label: "Text QA Agent",
    accent: "#EA4335",
    bg: "#fce8e6",
    border: "#f6aea9",
    description: "Evaluates human reviewer decisions specifically for text-based content including posts, comments, and messages.",
    systemPrompt: 'System: "You are a Quality Assurance evaluator for text content review at ProductX."\n\nUser: "[content_description, category, reviewer_decision, ground_truth] Respond ONLY with JSON: {is_correct, error_type, severity, reasoning, reviewer_feedback}"',
  },
  {
    id: "image-qa",
    label: "Image QA Agent",
    accent: "#F9AB00",
    bg: "#fef7e0",
    border: "#fde293",
    description: "Evaluates human reviewer decisions for image content including photos, screenshots, and infographics.",
    systemPrompt: 'System: "You are a Quality Assurance evaluator for image content review at ProductX."\n\nUser: "[content_description, category, reviewer_decision, ground_truth] Respond ONLY with JSON: {is_correct, error_type, severity, reasoning, reviewer_feedback}"',
  },
  {
    id: "av-qa",
    label: "Audio/Video QA Agent",
    accent: "#34A853",
    bg: "#e6f4ea",
    border: "#a8dab5",
    description: "Evaluates human reviewer decisions for audio and video content, including voice messages, clips, and streams.",
    systemPrompt: 'System: "You are a Quality Assurance evaluator for audio/video content review at ProductX."\n\nUser: "[content_description, category, reviewer_decision, ground_truth] Respond ONLY with JSON: {is_correct, error_type, severity, reasoning, reviewer_feedback}"',
  },
  {
    id: "metrics",
    label: "Metrics Engine",
    accent: "#4285F4",
    bg: "#e8f0fe",
    border: "#aecbfa",
    description: "Aggregates all QA results to compute macro-averaged precision, recall, and F1 scores per modality and per reviewer.",
    systemPrompt: "Pure computation layer: calculates P/R/F1 using standard confusion matrix approach across 3 decision classes (approve/reject/escalate). Flags any reviewer with accuracy < 60%.",
  },
  {
    id: "insights",
    label: "Insight Agent",
    accent: "#EA4335",
    bg: "#fce8e6",
    border: "#f6aea9",
    description: "Synthesizes all metrics into a C-suite executive brief using Gemini, highlighting risks and strategic recommendations.",
    systemPrompt: 'System: "You are a senior analytics advisor writing an executive report for the VP of Operations at ProductX."\n\nUser: "[MetricsSummary JSON] Write a 150-200 word executive brief covering QA health, modality performance, reviewer flags, AI recommendations, and estimated efficiency gains."',
  },
];

const Arrow = () => (
  <div className="flex justify-center my-1">
    <div className="flex flex-col items-center">
      <div className="w-0.5 h-4 bg-[#dadce0]" />
      <div
        className="w-0 h-0 border-l-4 border-r-4 border-l-transparent border-r-transparent"
        style={{ borderTopWidth: 6, borderTopColor: "#bdc1c6" }}
      />
    </div>
  </div>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
    <span className="text-xs text-[#5f6368]">{label}</span>
  </div>
);

export default function AgentFlowDiagram() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 rounded-xl border border-[#dadce0] bg-white p-4 shadow-sm">
        <LegendItem color="#5f6368" label="Intake / System" />
        <LegendItem color="#4285F4" label="Router / Metrics" />
        <LegendItem color="#EA4335" label="Text QA / Insight" />
        <LegendItem color="#F9AB00" label="Image QA" />
        <LegendItem color="#34A853" label="Audio/Video QA" />
      </div>

      <div className="max-w-xl mx-auto">
        {nodes.map((node, i) => (
          <div key={node.id}>
            <div
              className="rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md"
              style={{ backgroundColor: node.bg, borderColor: node.border }}
              onClick={() => setExpanded(expanded === node.id ? null : node.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold" style={{ color: node.accent }}>{node.label}</span>
                {expanded === node.id ? (
                  <ChevronUp className="h-4 w-4 text-[#5f6368]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#5f6368]" />
                )}
              </div>
              <p className="text-xs text-[#5f6368] mt-1">{node.description}</p>

              {expanded === node.id && (
                <div className="mt-3 rounded-lg bg-white p-3 border border-[#dadce0]">
                  <p className="text-xs text-[#80868b] mb-1 font-mono uppercase tracking-wider">Agent Prompt</p>
                  <pre className="text-xs text-[#3c4043] whitespace-pre-wrap font-mono leading-relaxed">{node.systemPrompt}</pre>
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
