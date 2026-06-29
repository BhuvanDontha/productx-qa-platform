# 🛡️ ProductX QA Platform

> **What if you could watch AI grade your content moderators in real time — and get a VP-ready report at the end?**
>
> That's exactly what this is.

---

## The 30-second version

ProductX employs human reviewers to moderate content — deciding whether a post should be **approved**, **rejected**, or **escalated**. But who checks the reviewers?

This platform does. It runs every reviewer decision through a chain of four AI agents, catches mistakes, computes accuracy metrics, flags anyone who needs retraining, and writes an executive summary — all in under two minutes.

**Live demo → [productx-qa.vercel.app](https://productx-qa.vercel.app)**

---

## What's in this repo

```
productx-qa-platform/
│
├── 📁 web/          → The browser app (Next.js · runs on Vercel)
│                      Open this in any browser. Click a button. Watch it run.
│
└── 📁 python/       → The Python version of the same AI agents
                       Run from your terminal. Same results, different interface.
```

Two ways to experience the same system. Pick whichever feels natural.

---

## For non-technical readers: what does it actually do?

Imagine you manage a team of five content reviewers — call them R01 through R05. Every day they look at videos, images, audio clips, and text posts and decide: *approve it, reject it, or escalate it for a second look.*

Now imagine you have a secret answer key — the "ground truth" — the correct call for each piece of content. This platform:

1. **Sends every reviewer decision to an AI agent** (the Router Agent) that reads the content and confirms the priority level.
2. **Passes it to a second AI agent** (the QA Evaluator) that compares the reviewer's call to the answer key and says — right call, wrong call, and *why*.
3. **Runs the numbers** (the Metrics Engine) — how often was each reviewer right? Which content type do they struggle with most?
4. **Writes a report** (the Insight Agent) — a paragraph you'd forward to your VP of Operations, no editing required.

The whole thing runs in about 90 seconds for 60 content decisions. You watch it happen line by line.

---

## The four agents

| Agent | What it does | How |
|-------|-------------|-----|
| 🗺️ **Router Agent** | Reads the content, confirms priority (high / medium / low) | Gemini 2.5 Flash |
| 🔍 **QA Evaluator** | Compares reviewer decision vs. ground truth, explains why | Gemini 2.5 Flash |
| 📊 **Metrics Engine** | Computes Precision, Recall, F1 for each content type | Pure Python (no AI needed) |
| ✍️ **Insight Agent** | Writes an executive brief for leadership | Gemini 2.5 Flash |

> **What's Gemini 2.5 Flash?** It's Google's AI model — similar to ChatGPT but accessed through an API (a programmatic connection). Every time an agent needs to "think", it sends a question to Gemini and reads the answer. There are 120 of these calls per full run.

---

## The results you get

**Overall accuracy** — what percentage of reviewer decisions were correct across all 60 records.

**Per-modality metrics** — broken down by text, image, audio, and video content. Precision, Recall, and F1 are three different numbers (not the same thing renamed). They each measure a different type of mistake.

**Reviewer scorecards** — accuracy per person, best and worst content type, and a red ⚠️ flag if anyone drops below 60%.

**Executive brief** — 150–200 words written by the Insight Agent, suitable for forwarding to leadership.

---

## Quick start

### Option A — just use the browser (no setup)
Go to **[productx-qa.vercel.app](https://productx-qa.vercel.app)** and click **Run Full QA Analysis**. That's it.

### Option B — run the web app locally
```bash
cd web
npm install
# add your Gemini API key to .env.local (see web/README.md)
npm run dev
# open http://localhost:3000
```

### Option C — run the Python CLI
```bash
cd python
pip install -r requirements.txt
python main.py --mode vercel        # stream from the live app (no API key needed)
python main.py --mode local         # call Gemini directly (needs API key)
```

---

## Tech stack (plain English)

| Thing | What it is |
|-------|-----------|
| **Next.js** | The framework that powers the browser app |
| **TypeScript** | JavaScript with stricter rules — catches bugs before they happen |
| **Tailwind CSS** | Makes the app look good without writing custom CSS |
| **Gemini 2.5 Flash** | Google's AI model — does the actual thinking |
| **Vercel** | Hosts the app online, free, with zero server management |
| **Python + Rich** | The terminal version — Rich makes terminal output look beautiful |
| **Server-Sent Events (SSE)** | How the browser receives live updates — like a live sports ticker, but for AI agent steps |

---

## Project structure (for developers)

```
web/                          ← Next.js application
├── app/
│   ├── page.tsx              ← Dashboard (the main page)
│   ├── workflow/page.tsx     ← Visual pipeline diagram
│   ├── insights/page.tsx     ← Executive brief + export
│   └── api/
│       ├── run-qa/           ← Streams pipeline results (SSE)
│       └── generate-insights/← Calls Insight Agent
├── components/               ← Reusable UI pieces
├── lib/
│   ├── data.ts               ← 60 review records
│   ├── gemini.ts             ← Gemini client setup
│   └── metrics.ts            ← 3-class macro F1
└── types/                    ← TypeScript type definitions

python/                       ← Python CLI package
├── main.py                   ← Entry point (--mode local | vercel)
├── pipeline.py               ← Local mode: direct Gemini calls
├── vercel_client.py          ← Vercel mode: SSE stream consumer
├── data.py                   ← Same 60 records, Python format
├── types_def.py              ← Dataclasses for all types
└── agents/
    ├── router_agent.py       ← Gemini call: routing + priority
    ├── qa_evaluator.py       ← Gemini call: decision evaluation
    ├── metrics_engine.py     ← Pure Python: no API call
    └── insight_agent.py      ← Gemini call: executive prose
```

---

## The dataset

60 hand-curated content review records across five reviewers:

| Reviewer | Accuracy | Note |
|----------|----------|------|
| R01 | ~90% | Top performer |
| R02 | ~75% | Struggles with image content |
| R03 | ~83% | Strong, especially on images |
| R04 | ~50% | **Auto-flagged for retraining** |
| R05 | ~70% | Inconsistent by category |

Each record has a content type (text / image / audio / video), a category (hate speech / violence / spam / explicit / safe), the reviewer's decision, and the ground truth answer. The accuracy profiles are baked into the ground truth — R04's mistakes are real mistakes, not a coincidence.

---

## Error handling (what happens when things go wrong)

The system is built to never crash mid-run:

- **Rate limits** (Gemini throttling requests) → automatic retry, 3 times, with 3s → 6s → 12s pauses between attempts
- **API failure after all retries** → rule-based fallback kicks in: routes by category, evaluates by comparing decision to ground truth directly
- **Navigation away mid-run** → results are saved in the browser's localStorage. Come back. Everything's still there.
- **Python stream cut** → `vercel_client.py` reconstructs metrics locally from whatever records arrived

---

## Built for

**Cognizant — Transformation & GenAI Specialist** take-home assignment

Submitted by **Bhuvan Dontha**

---

## License

MIT — use it, fork it, build on it.
