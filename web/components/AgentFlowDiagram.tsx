"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AgentNode {
  id: string;
  label: string;
  color: string;
  bg: string;
  border: string;
  description: string;
  systemPrompt: string;
}

const nodes: AgentNode[] = [
  {
    id: "intake",
    label: "Content Intake",
    color: "text-slate-200",
    bg: "bg-slate-700",
    border: "border-slate-500",
    description: "Receives raw review records from human content moderators across all modalities.",
    systemPrompt: "Input layer: 100 ReviewRecord objects are loaded from the dataset and queued for processing.",
  },
  {
    id: "router",
    label: "Router Agent",
    color: "text-cyan-300",
    bg: "bg-cyan-950",
    border: "border-cyan-600",
    description: "Validates routing of each review record and assigns priority (high/medium/low) based on content type and category.",
    systemPrompt: 'System: "You are a content moderation router agent for ProductX. Your job is to validate the routing of each review record."\n\nUser: "Analyze this content review record. [review_id, content_type, category, description] Respond ONLY with JSON: {routing_confirmed, priority, routing_reason}"',
  },
  {
    id: "text-qa",
    label: "Text QA Agent",
    color: "text-blue-300",
    bg: "bg-blue-950",
    border: "border-blue-600",
    description: "Evaluates human reviewer decisions specifically for text-based content including posts, comments, and messages.",
    systemPrompt: 'System: "You are a Quality Assurance evaluator for text content review at ProductX."\n\nUser: "[content_description, category, reviewer_decision, ground_truth] Respond ONLY with JSON: {is_correct, error_type, severity, reasoning, reviewer_feedback}"',
  },
  {
    id: "image-qa",
    label: "Image QA Agent",
    color: "text-purple-300",
    bg: "bg-purple-950",
    border: "border-purple-600",
    description: "Evaluates human reviewer decisions for image content including photos, screenshots, and infographics.",
    systemPrompt: 'System: "You are a Quality Assurance evaluator for image content review at ProductX."\n\nUser: "[content_description, category, reviewer_decision, ground_truth] Respond ONLY with JSON: {is_correct, error_type, severity, reasoning, reviewer_feedback}"',
  },
  {
    id: "av-qa",
    label: "Audio/Video QA Agent",
    color: "text-green-300",
    bg: "bg-green-950",
    border: "border-green-600",
    description: "Evaluates human reviewer decisions for audio and video content, including voice messages, clips, and streams.",
    systemPrompt: 'System: "You are a Quality Assurance evaluator for audio/video content review at ProductX."\n\nUser: "[content_description, category, reviewer_decision, ground_truth] Respond ONLY with JSON: {is_correct, error_type, severity, reasoning, reviewer_feedback}"',
  },
  {
    id: "metrics",
    label: "Metrics Engine",
    color: "text-teal-300",
    bg: "bg-teal-950",
    border: "border-teal-600",
    description: "Aggregates all QA results to compute macro-averaged precision, recall, and F1 scores per modality and per reviewer.",
    systemPrompt: "Pure computation layer: calculates P/R/F1 using standard confusion matrix approach across 3 decision classes (approve/reject/escalate). Flags any reviewer with accuracy < 60%.",
  },
  {
    id: "insights",
    label: "Insight Agent",
    color: "text-amber-300",
    bg: "bg-amber-950",
    border: "border-amber-600",
    description: "Synthesizes all metrics into a C-suite executive brief using Gemini, highlighting risks and strategic recommendations.",
    systemPrompt: 'System: "You are a senior analytics advisor writing an executive report for the VP of Operations at ProductX."\n\nUser: "[MetricsSummary JSON] Write a 150-200 word executive brief covering QA health, modality performance, reviewer flags, AI recommendations, and estimated efficiency gains."',
  },
];

const Arrow = () => (
  <div className="flex justify-center my-1">
    <div className="flex flex-col items-center">
      <div className="w-0.5 h-4 bg-slate-600" />
      <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-slate-500" style={{ borderTopWidth: 6 }} />
    </div>
  </div>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded ${color}`} />
    <span className="text-xs text-slate-400">{label}</span>
  </div>
);

export default function AgentFlowDiagram() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
        <LegendItem color="bg-slate-600" label="Intake / System" />
        <LegendItem color="bg-cyan-800" label="Router Agent" />
        <LegendItem color="bg-blue-800" label="Text QA" />
        <LegendItem color="bg-purple-800" label="Image QA" />
        <LegendItem color="bg-green-800" label="Audio/Video QA" />
        <LegendItem color="bg-teal-800" label="Metrics Engine" />
        <LegendItem color="bg-amber-800" label="Insight Agent" />
      </div>

      <div className="max-w-xl mx-auto">
        {nodes.map((node, i) => (
          <div key={node.id}>
            <div
              className={`rounded-xl border ${node.border} ${node.bg} p-4 cursor-pointer transition-all hover:opacity-90`}
              onClick={() => setExpanded(expanded === node.id ? null : node.id)}
            >
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${node.color}`}>{node.label}</span>
                {expanded === node.id ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{node.description}</p>

              {expanded === node.id && (
                <div className="mt-3 rounded-lg bg-black/40 p-3 border border-slate-600">
                  <p className="text-xs text-slate-500 mb-1 font-mono uppercase tracking-wider">Agent Prompt</p>
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{node.systemPrompt}</pre>
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
