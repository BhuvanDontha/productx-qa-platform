"""
Vercel Client — Remote Mode
----------------------------
Streams the QA pipeline from the live Vercel deployment
(productx-qa.vercel.app) and renders it in the terminal with Rich.

Flow:
  1. POST /api/run-qa          → consume SSE stream, render live log
  2. POST /api/generate-insights → render executive brief
"""

import json
import sys
import time
import urllib.request
import urllib.error
from rich.console import Console
from rich.table import Table
from rich import box
from rich.progress import Progress, SpinnerColumn, BarColumn, TaskProgressColumn, TextColumn

from agents import metrics_engine
from types_def import QAResult, RouterOutput, QAEvalOutput

VERCEL_BASE = "https://productx-qa.vercel.app"

console = Console()


def _post_stream(url: str, body: dict):
    """Generator that yields parsed SSE event dicts from a streaming POST."""
    data = json.dumps(body).encode()
    req  = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "Accept": "text/event-stream"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=360) as resp:
        buffer = ""
        while True:
            chunk = resp.read(512)
            if not chunk:
                break
            buffer += chunk.decode("utf-8", errors="replace")
            while "\n\n" in buffer:
                event_str, buffer = buffer.split("\n\n", 1)
                for line in event_str.splitlines():
                    if line.startswith("data: "):
                        try:
                            yield json.loads(line[6:])
                        except json.JSONDecodeError:
                            pass


def _post_json(url: str, body: dict) -> dict:
    data = json.dumps(body).encode()
    req  = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode())


def run(max_records: int | None = None) -> None:
    console.rule("[bold cyan]ProductX Multi-Agent QA Pipeline — Vercel Mode[/]")
    console.print(f"[dim]Backend : {VERCEL_BASE}[/]")
    console.print(f"[dim]Agents  : Router → QA Evaluator → Metrics Engine → Insight Agent[/]")
    console.print(f"[dim]Model   : gemini-2.5-flash  (called server-side on Vercel)[/]\n")

    start         = time.time()
    total         = max_records or 60
    completed     = 0
    metrics       = None
    qa_results_raw: list[dict] = []   # raw dicts from stream, used if we stop early

    # track current record's routing so we can reconstruct QAResult on record_complete
    _current_routing: dict = {}

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TaskProgressColumn(),
        console=console,
        transient=False,
    ) as progress:
        task = progress.add_task("[cyan]Streaming from Vercel…", total=total)

        try:
            for event in _post_stream(f"{VERCEL_BASE}/api/run-qa", {}):
                etype = event.get("type")

                if etype == "start":
                    actual_total = event.get("total", total)
                    if not max_records:
                        progress.update(task, total=actual_total)
                    progress.console.print(
                        f"  [dim]▸ Pipeline started — {actual_total} records via Gemini 2.5 Flash[/]"
                    )

                elif etype == "step":
                    step    = event.get("step", "")
                    msg     = event.get("message", "")
                    api_err = event.get("api_error")

                    if step == "routing":
                        _current_routing = event
                        progress.console.print(f"  [cyan]→ Router[/]   {msg}")

                    elif step == "routing_done":
                        _current_routing.update(event)
                        if api_err:
                            progress.console.print(f"  [yellow]⚠ Router[/]   {msg}")
                        else:
                            progress.console.print(f"  [cyan]   ✓[/]       {msg}")

                    elif step == "evaluating":
                        progress.console.print(f"  [purple]→ QA Eval[/]  {msg}")

                    elif step == "record_complete":
                        is_correct = event.get("is_correct", False)
                        icon   = "[bold green]✓ PASS[/]" if is_correct else "[bold red]✗ FAIL[/]"
                        suffix = " [dim yellow](rule-based)[/]" if api_err else ""
                        progress.console.print(f"  {icon}  {msg}{suffix}")
                        qa_results_raw.append(event)
                        completed += 1
                        progress.advance(task)
                        if max_records and completed >= max_records:
                            break

                elif etype == "complete":
                    metrics = event.get("metrics")
                    duration_ms = event.get("duration_ms", 0)
                    count = len(event.get("qa_results", []))
                    progress.console.print(
                        f"  [dim]▸ Complete — {count} records in {duration_ms/1000:.1f}s[/]"
                    )

        except urllib.error.HTTPError as e:
            console.print(f"[bold red]HTTP {e.code}: {e.reason}[/]")
            sys.exit(1)
        except urllib.error.URLError as e:
            console.print(f"[bold red]Connection error: {e.reason}[/]")
            sys.exit(1)

    duration = time.time() - start

    # If we stopped early (max_records), compute metrics locally from collected records
    if not metrics and qa_results_raw:
        qa_objs = [
            QAResult(
                review_id=r.get("review_id", ""),
                content_type=r.get("content_type", "text"),
                reviewer_id=r.get("reviewer_id", ""),
                reviewer_decision="approve",   # not in stream — use is_correct for metrics
                ground_truth="approve",
                routing=RouterOutput(True, "medium", "", False),
                evaluation=QAEvalOutput(
                    r.get("is_correct", False),
                    r.get("error_type", "correct"),
                    r.get("severity", "none"), "", "", False,
                ),
                is_correct=r.get("is_correct", False),
            )
            for r in qa_results_raw
        ]
        m_obj = metrics_engine.run(qa_objs)
        # convert dataclass → dict for _print_metrics
        import dataclasses
        metrics = dataclasses.asdict(m_obj)

    if not metrics:
        console.print("[red]No metrics received — pipeline may not have completed.[/]")
        return

    # ── Metrics display ───────────────────────────────────────────────────────
    console.rule("[bold green]Metrics Engine[/]")
    _print_metrics(metrics)

    # ── Insight Agent via Vercel ──────────────────────────────────────────────
    console.rule("[bold yellow]Insight Agent — Executive Brief[/]")
    console.print("[dim]Calling /api/generate-insights on Vercel…[/]\n")
    try:
        result = _post_json(f"{VERCEL_BASE}/api/generate-insights", {"metrics": metrics})
        if "error" in result:
            console.print(f"[red]Insight error: {result['error']}[/]")
        else:
            console.print(f"[italic]{result.get('insight', '')}[/]\n")
    except Exception as e:
        console.print(f"[red]Insight request failed: {e}[/]")

    console.rule()
    overall = metrics.get("overall_accuracy", 0)
    console.print(
        f"[bold green]Pipeline complete[/] — "
        f"{completed} records in [bold]{duration:.1f}s[/]  |  "
        f"Overall accuracy [bold cyan]{overall*100:.1f}%[/]"
    )


def _print_metrics(metrics: dict) -> None:
    mt = Table(title="Modality Metrics (Macro-Averaged)", box=box.ROUNDED, show_lines=True)
    mt.add_column("Modality", style="cyan bold")
    mt.add_column("Precision", justify="right")
    mt.add_column("Recall",    justify="right")
    mt.add_column("F1",        justify="right")
    mt.add_column("Accuracy",  justify="right")
    mt.add_column("Records",   justify="right")
    for m in metrics.get("by_modality", []):
        mt.add_row(
            m["content_type"],
            f"{m['precision']:.3f}",
            f"{m['recall']:.3f}",
            f"{m['f1']:.3f}",
            f"{m['accuracy']*100:.1f}%",
            str(m["total"]),
        )
    console.print(mt)

    rt = Table(title="Reviewer Scorecards", box=box.ROUNDED, show_lines=True)
    rt.add_column("Reviewer", style="bold")
    rt.add_column("Accuracy", justify="right")
    rt.add_column("Correct",  justify="right")
    rt.add_column("Total",    justify="right")
    rt.add_column("Best Modality")
    rt.add_column("Worst Modality")
    rt.add_column("Flag", justify="center")
    for r in metrics.get("by_reviewer", []):
        flag    = "[bold red]⚠ RETRAIN[/]" if r["needs_flag"] else "[green]OK[/]"
        acc_pct = r["accuracy"] * 100
        acc_str = f"[red]{acc_pct:.1f}%[/]" if r["needs_flag"] else f"[green]{acc_pct:.1f}%[/]"
        rt.add_row(r["reviewer_id"], acc_str, str(r["correct"]), str(r["total"]),
                   r["best_modality"], r["worst_modality"], flag)
    console.print(rt)
