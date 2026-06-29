"""
Pipeline Orchestrator — Local Mode
------------------------------------
Calls Gemini directly for every record.
3× exponential-backoff retry before rule-based fallback.
"""

import time
import os
import sys
from google import genai
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, BarColumn, TaskProgressColumn, TextColumn
from rich.table import Table
from rich import box

from data import REVIEWS
from types_def import QAResult
from agents import router_agent, qa_evaluator, metrics_engine, insight_agent

console = Console()

_RETRY_DELAYS = [3, 6, 12]


def _retry(fn, label: str):
    """Try fn up to 3 times with backoff; raise on all failures."""
    last_err = None
    for attempt, delay in enumerate(_RETRY_DELAYS, 1):
        try:
            return fn()
        except Exception as e:
            last_err = e
            msg = str(e)
            is_rate = "429" in msg or "quota" in msg.lower() or "rate" in msg.lower()
            if is_rate and attempt < len(_RETRY_DELAYS):
                console.print(f"    [yellow]⚠ {label} rate-limited — retry {attempt}/3 in {delay}s[/]")
                time.sleep(delay)
            elif attempt < len(_RETRY_DELAYS):
                console.print(f"    [yellow]⚠ {label} error ({type(e).__name__}) — retry {attempt}/3[/]")
                time.sleep(1)
            else:
                raise last_err
    raise last_err


def run(api_key: str | None = None, max_records: int | None = None) -> None:
    key = api_key or os.environ.get("GEMINI_API_KEY", "")
    if not key:
        console.print("[bold red]ERROR: GEMINI_API_KEY not set.[/]")
        sys.exit(1)

    client = genai.Client(api_key=key)
    records = REVIEWS[:max_records] if max_records else REVIEWS

    console.rule("[bold cyan]ProductX Multi-Agent QA Pipeline — Local Mode[/]")
    console.print(f"[dim]Agents  : Router → QA Evaluator → Metrics Engine → Insight Agent[/]")
    console.print(f"[dim]Model   : gemini-2.5-flash  (direct API)[/]")
    console.print(f"[dim]Records : {len(records)}  |  Retry: 3× backoff before rule-based fallback[/]\n")

    qa_results: list[QAResult] = []
    start = time.time()

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TaskProgressColumn(),
        console=console,
        transient=False,
    ) as progress:
        task = progress.add_task("[cyan]Processing records…", total=len(records))

        for record in records:
            # ── Agent 1: Router ────────────────────────────────────────────────
            routing_fallback = False
            try:
                routing = _retry(
                    lambda r=record: router_agent.run(r, client),
                    f"Router/{record.review_id}",
                )
            except Exception:
                routing = router_agent.rule_based_fallback(record)
                routing_fallback = True

            tag = " [dim yellow](rule-based fallback)[/]" if routing_fallback else ""
            progress.console.print(
                f"  [cyan]→ Router[/]   [{record.review_id}] "
                f"[bold]{routing.priority.upper()}[/]  {routing.routing_reason[:60]}{tag}"
            )
            time.sleep(0.15)

            # ── Agent 2: QA Evaluator ──────────────────────────────────────────
            eval_fallback = False
            try:
                evaluation = _retry(
                    lambda r=record: qa_evaluator.run(r, client),
                    f"QAEval/{record.review_id}",
                )
            except Exception:
                evaluation = qa_evaluator.rule_based_fallback(record)
                eval_fallback = True

            is_correct = record.reviewer_decision == record.ground_truth
            icon  = "[bold green]✓ PASS[/]" if is_correct else "[bold red]✗ FAIL[/]"
            etag  = " [dim yellow](rule-based fallback)[/]" if eval_fallback else ""
            progress.console.print(
                f"  [purple]→ QA Eval[/]  [{record.review_id}] {icon}  "
                f"{evaluation.error_type}  ·  {evaluation.reasoning[:60]}{etag}"
            )

            qa_results.append(QAResult(
                review_id=record.review_id,
                content_type=record.content_type,
                reviewer_id=record.reviewer_id,
                reviewer_decision=record.reviewer_decision,
                ground_truth=record.ground_truth,
                routing=routing,
                evaluation=evaluation,
                is_correct=is_correct,
            ))

            time.sleep(0.15)
            progress.advance(task)

    duration = time.time() - start

    # ── Agent 3: Metrics Engine ───────────────────────────────────────────────
    console.rule("[bold green]Metrics Engine[/]")
    metrics = metrics_engine.run(qa_results)
    _print_metrics(metrics)

    # ── Agent 4: Insight Agent ────────────────────────────────────────────────
    console.rule("[bold yellow]Insight Agent — Executive Brief[/]")
    console.print("[dim]Generating executive brief via Gemini…[/]\n")
    brief = insight_agent.run(metrics, client)
    console.print(f"[italic]{brief}[/]\n")

    console.rule()
    console.print(
        f"[bold green]Pipeline complete[/] — "
        f"{len(qa_results)} records in [bold]{duration:.1f}s[/]  |  "
        f"Overall accuracy [bold cyan]{metrics.overall_accuracy*100:.1f}%[/]"
    )


def _print_metrics(metrics) -> None:
    mt = Table(title="Modality Metrics (Macro-Averaged)", box=box.ROUNDED, show_lines=True)
    mt.add_column("Modality", style="cyan bold")
    mt.add_column("Precision", justify="right")
    mt.add_column("Recall",    justify="right")
    mt.add_column("F1",        justify="right")
    mt.add_column("Accuracy",  justify="right")
    mt.add_column("Records",   justify="right")
    for m in metrics.by_modality:
        mt.add_row(m.content_type, f"{m.precision:.3f}", f"{m.recall:.3f}",
                   f"{m.f1:.3f}", f"{m.accuracy*100:.1f}%", str(m.total))
    console.print(mt)

    rt = Table(title="Reviewer Scorecards", box=box.ROUNDED, show_lines=True)
    rt.add_column("Reviewer", style="bold")
    rt.add_column("Accuracy", justify="right")
    rt.add_column("Correct",  justify="right")
    rt.add_column("Total",    justify="right")
    rt.add_column("Best Modality")
    rt.add_column("Worst Modality")
    rt.add_column("Flag", justify="center")
    for r in metrics.by_reviewer:
        flag    = "[bold red]⚠ RETRAIN[/]" if r.needs_flag else "[green]OK[/]"
        acc_str = f"[red]{r.accuracy*100:.1f}%[/]" if r.needs_flag else f"[green]{r.accuracy*100:.1f}%[/]"
        rt.add_row(r.reviewer_id, acc_str, str(r.correct), str(r.total),
                   r.best_modality, r.worst_modality, flag)
    console.print(rt)
