import AgentFlowDiagram from "@/components/AgentFlowDiagram";

export default function WorkflowPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100">Agent Workflow</h1>
        <p className="text-slate-400 mt-1">
          End-to-end pipeline: from content intake to executive insight. Click any node to expand its prompt.
        </p>
      </div>
      <AgentFlowDiagram />
    </div>
  );
}
