# 🐍 ProductX QA — Python CLI

The terminal interface for the ProductX QA Platform. Same four agents, same dataset, two ways to run.

---

## Two modes

### Vercel mode (no API key needed)
Streams results from the live deployed app. The AI runs on Vercel's servers.

```bash
python main.py --mode vercel
```

### Local mode (needs a Gemini API key)
Calls Gemini directly from your machine. Every agent call goes straight to Google's API.

```bash
export GEMINI_API_KEY=your_key_here
python main.py --mode local

# Quick test with 10 records:
python main.py --mode local --records 10
```

---

## Setup

```bash
pip install -r requirements.txt

# Optional: put your API key in a .env file
echo "GEMINI_API_KEY=your_key_here" > .env
```

---

## What you'll see

```
────────── ProductX Multi-Agent QA Pipeline — Vercel Mode ──────────
Backend : https://productx-qa.vercel.app
Agents  : Router → QA Evaluator → Metrics Engine → Insight Agent

  ▸ Pipeline started — 60 records via Gemini 2.5 Flash
  → Router   [REV-001] HIGH · hate speech with racial slurs
     ✓       Routed → priority:high · requires immediate moderation
  → QA Eval  [REV-001] ✓ PASS · Reviewer correctly rejected
  → QA Eval  [REV-009] ✗ FAIL · escalate vs reject (misclassification)

  ┌──────────────────── Modality Metrics ────────────────────────┐
  │ Modality │ Precision │ Recall │   F1  │ Accuracy │ Records  │
  │ text     │   0.847   │ 0.831  │ 0.839 │   83.3%  │   15     │
  ...

  ┌──────────────────── Reviewer Scorecards ─────────────────────┐
  │ R04  │  50.0%  │  6  │  12  │ image  │ violence  │ ⚠ RETRAIN│
  ...

────── Insight Agent ──────
The ProductX content moderation QA pipeline demonstrates moderate
overall health at 76.7% accuracy...
```

---

## How the agents work

Each agent is a single Python function that makes one Gemini call:

```python
# agents/router_agent.py
def run(record: ReviewRecord, client: genai.Client) -> RouterOutput:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=GenerateContentConfig(
            system_instruction=_SYSTEM,
            response_mime_type="application/json",
        ),
    )
    return RouterOutput(**json.loads(response.text))
```

The agent **raises on failure** — no silent fallback. The pipeline catches the exception, retries up to 3 times with backoff (3s → 6s → 12s), and only then falls back to rule-based logic as a last resort.

---

## Files

| File | What it does |
|------|-------------|
| `main.py` | Entry point — parses `--mode` and `--records` |
| `pipeline.py` | Local mode: manages Gemini client, retry logic, Rich output |
| `vercel_client.py` | Vercel mode: reads SSE stream, renders in terminal |
| `data.py` | 60 review records (same dataset as the web app) |
| `types_def.py` | Dataclasses: `ReviewRecord`, `QAResult`, `MetricsSummary`, etc. |
| `agents/router_agent.py` | Router Agent — priority + routing reason |
| `agents/qa_evaluator.py` | QA Evaluator — decision vs ground truth |
| `agents/metrics_engine.py` | Metrics Engine — 3-class macro F1 (no API call) |
| `agents/insight_agent.py` | Insight Agent — executive brief prose |
