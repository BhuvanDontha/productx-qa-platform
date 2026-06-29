"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RouteIcon, FileText, ImageIcon, Headphones, Lightbulb,
  Play, ArrowRight, CheckCircle, XCircle, Loader2, Terminal, RotateCcw,
} from "lucide-react";
import AgentStatusCard from "@/components/AgentStatusCard";
import MetricsTable from "@/components/MetricsTable";
import ReviewerScorecard from "@/components/ReviewerScorecard";
import type { AgentStatus, MetricsSummary, QAResult } from "@/types";

const STORAGE_KEY = "productx_qa_run";

interface AgentState {
  router: AgentStatus;
  textQA: AgentStatus;
  imageQA: AgentStatus;
  avQA: AgentStatus;
  insight: AgentStatus;
}

interface LogLine {
  id: number;
  type: "routing" | "routing_done" | "evaluating" | "record_complete" | "info" | "api_error";
  message: string;
  is_correct?: boolean;
  content_type?: string;
  step?: string;
}

interface PersistedRun {
  qaResults: QAResult[];
  metrics: MetricsSummary;
  duration: number;
  completedAt: string;
}

const completeAgentState: AgentState = {
  router: "complete", textQA: "complete", imageQA: "complete", avQA: "complete", insight: "complete",
};
const initialAgentState: AgentState = {
  router: "idle", textQA: "idle", imageQA: "idle", avQA: "idle", insight: "idle",
};

const stepColor: Record<string, string> = {
  routing: "text-cyan-400",
  routing_done: "text-cyan-300",
  evaluating: "text-purple-400",
  record_complete: "",
  info: "text-slate-400",
  api_error: "text-amber-400",
};

const contentTypeIcon: Record<string, React.ReactNode> = {
  text: <FileText className="h-3 w-3" />,
  image: <ImageIcon className="h-3 w-3" />,
  audio: <Headphones className="h-3 w-3" />,
  video: <Headphones className="h-3 w-3" />,
};

export default function Home() {
  const router = useRouter();
  const [agentStatuses, setAgentStatuses] = useState<AgentState>(initialAgentState);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [qaResults, setQaResults] = useState<QAResult[] | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [progress, setProgress] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);
  const logCounter = useRef(0);

  // Restore persisted run on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const run: PersistedRun = JSON.parse(stored);
        setQaResults(run.qaResults);
        setMetrics(run.metrics);
        setDuration(run.duration);
        setCompletedAt(run.completedAt);
        setAgentStatuses(completeAgentState);
        setProgress(100);
      }
    } catch {
      // corrupted storage — ignore
    }
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const addLog = (line: Omit<LogLine, "id">) => {
    const id = ++logCounter.current;
    setLogs(prev => [...prev.slice(-300), { id, ...line }]);
  };

  const setStatus = (key: keyof AgentState, status: AgentStatus) =>
    setAgentStatuses(prev => ({ ...prev, [key]: status }));

  function clearRun() {
    localStorage.removeItem(STORAGE_KEY);
    setQaResults(null);
    setMetrics(null);
    setDuration(null);
    setCompletedAt(null);
    setLogs([]);
    setProgress(0);
    setAgentStatuses(initialAgentState);
  }

  async function runQA() {
    setLoading(true);
    setLogs([]);
    setMetrics(null);
    setQaResults(null);
    setProgress(0);
    setCompletedAt(null);
    setAgentStatuses(initialAgentState);

    setStatus("router", "running");
    addLog({ type: "info", message: "Initializing QA pipeline — 60 reviews queued" });

    try {
      const res = await fetch("/api/run-qa", { method: "POST" });
      if (!res.body) throw new Error("No stream body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "start") {
              addLog({ type: "info", message: `Pipeline started — processing ${event.total} records via Gemini 2.5 Flash` });
            }

            if (event.type === "step") {
              const ct = event.content_type as string | undefined;

              if (event.step === "routing") setStatus("router", "running");
              if (event.step === "evaluating") {
                if (ct === "text") setStatus("textQA", "running");
                else if (ct === "image") setStatus("imageQA", "running");
                else setStatus("avQA", "running");
              }
              if (event.step === "record_complete") {
                const total = (event.total_records as number) || 60;
                setProgress(Math.round(((event.index + 1) / total) * 100));
              }

              addLog({
                type: event.api_error ? "api_error" : (event.step as LogLine["type"]),
                is_correct: event.is_correct,
                content_type: ct,
                message: event.message,
                step: event.step,
              });
            }

            if (event.type === "complete") {
              setStatus("router", "complete");
              setStatus("textQA", "complete");
              setStatus("imageQA", "complete");
              setStatus("avQA", "complete");
              setStatus("insight", "complete");
              setProgress(100);

              const now = new Date().toISOString();
              setQaResults(event.qa_results);
              setMetrics(event.metrics);
              setDuration(event.duration_ms);
              setCompletedAt(now);

              addLog({ type: "info", message: `Pipeline complete — ${event.qa_results.length} records in ${(event.duration_ms / 1000).toFixed(1)}s` });

              // Persist everything so navigation doesn't wipe state
              const run: PersistedRun = {
                qaResults: event.qa_results,
                metrics: event.metrics,
                duration: event.duration_ms,
                completedAt: now,
              };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(run));
              localStorage.setItem("qa_metrics", JSON.stringify(event.metrics));
            }
          } catch {
            // malformed SSE event
          }
        }
      }
    } catch (err) {
      console.error(err);
      setAgentStatuses({ router: "error", textQA: "error", imageQA: "error", avQA: "error", insight: "error" });
      addLog({ type: "api_error", message: `Fatal error: ${err instanceof Error ? err.message : "Unknown"}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">ProductX QA Command Center</h1>
          <p className="text-slate-400 mt-1">Multi-agent quality assurance pipeline for content moderation teams.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-700 bg-cyan-950/50 px-4 py-2 text-sm font-medium text-cyan-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          Powered by Gemini 2.5 Flash
        </span>
      </div>

      {/* Agent Status Row */}
      <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
        <AgentStatusCard name="Router Agent" icon={RouteIcon} status={agentStatuses.router} />
        <AgentStatusCard name="Text QA" icon={FileText} status={agentStatuses.textQA} />
        <AgentStatusCard name="Image QA" icon={ImageIcon} status={agentStatuses.imageQA} />
        <AgentStatusCard name="Audio/Video QA" icon={Headphones} status={agentStatuses.avQA} />
        <AgentStatusCard name="Insight Agent" icon={Lightbulb} status={agentStatuses.insight} />
      </div>

      {/* Run Button + Progress */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={runQA}
            disabled={loading}
            className="flex items-center gap-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed px-8 py-4 text-lg font-bold text-white shadow-lg shadow-cyan-900/30 transition-all"
          >
            {loading
              ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
              : <><Play className="h-5 w-5" /> Run Full QA Analysis</>
            }
          </button>
          {metrics && !loading && (
            <button
              onClick={clearRun}
              title="Clear results"
              className="flex items-center gap-2 rounded-xl border border-slate-600 px-4 py-4 text-slate-400 hover:text-slate-200 hover:border-slate-400 transition-all"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
        </div>

        {loading && (
          <div className="w-full max-w-md space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-cyan-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {completedAt && !loading && (
          <p className="text-xs text-slate-500">
            Last run: {new Date(completedAt).toLocaleString()}
            {duration && ` · completed in ${(duration / 1000).toFixed(1)}s`}
          </p>
        )}
      </div>

      {/* Live Agent Log (shown during run only) */}
      <AnimatePresence>
        {logs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700 bg-slate-800">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-semibold text-slate-200">Agent Activity Log</span>
              {loading && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-cyan-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" /> Live
                </span>
              )}
            </div>
            <div ref={logRef} className="h-72 overflow-y-auto p-4 space-y-1 font-mono text-xs">
              {logs.map(line => (
                <div key={line.id} className="flex items-start gap-2 leading-relaxed">
                  {line.type === "record_complete"
                    ? line.is_correct
                      ? <CheckCircle className="h-3 w-3 mt-0.5 text-emerald-400 flex-shrink-0" />
                      : <XCircle className="h-3 w-3 mt-0.5 text-red-400 flex-shrink-0" />
                    : line.type === "routing"
                      ? <RouteIcon className="h-3 w-3 mt-0.5 text-cyan-400 flex-shrink-0" />
                      : line.type === "evaluating"
                        ? <span className="flex-shrink-0 mt-0.5">{contentTypeIcon[line.content_type ?? "text"]}</span>
                        : <span className="h-3 w-3 flex-shrink-0" />
                  }
                  <span className={
                    line.type === "record_complete"
                      ? line.is_correct ? "text-emerald-400" : "text-red-400"
                      : stepColor[line.type] || "text-slate-400"
                  }>
                    {line.message}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results — persisted across navigation */}
      {metrics && qaResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Overall Accuracy</p>
              <p className="text-4xl font-extrabold text-cyan-400">{(metrics.overall_accuracy * 100).toFixed(1)}%</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Reviews</p>
              <p className="text-4xl font-extrabold text-slate-100">{metrics.total_reviews}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Flagged Reviewers</p>
              <p className="text-4xl font-extrabold text-red-400">
                {metrics.by_reviewer.filter(r => r.needs_flag).length}
              </p>
            </div>
          </div>

          <MetricsTable data={metrics.by_modality} />

          <div>
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Reviewer Scorecards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.by_reviewer.map(r => (
                <ReviewerScorecard key={r.reviewer_id} data={r} />
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={() => router.push("/insights")}
              className="flex items-center gap-2 rounded-xl border border-cyan-600 bg-cyan-950/30 hover:bg-cyan-900/40 px-6 py-3 text-cyan-400 font-semibold transition-all"
            >
              Generate Leadership Brief <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
