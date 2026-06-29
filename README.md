# 🛡️ ProductX QA Platform

> **What if you could watch AI grade your content moderators in real time — and get a leadership-ready report at the end?**
>
> That's exactly what this is.

---

## The 30-second version

ProductX employs human reviewers to moderate content — deciding whether a post should be **approved**, **rejected**, or **escalated**. But who checks the reviewers?

This platform does. It runs every reviewer decision through a chain of four AI agents, catches mistakes, computes accuracy metrics, flags anyone who needs retraining, and writes an executive summary — all in under two minutes.

**Live → [productx-qa.vercel.app](https://productx-qa.vercel.app)**

---

## What's in this repo

```
productx-qa-platform/
│
├── 📁 web/      → The browser app (Next.js · runs on Vercel)
│
└── 📁 python/   → The same agents as a Python CLI
```

Two ways to run the same system. Pick whichever feels natural.

---

## What does it actually do?

Imagine you manage a team of five content reviewers — call them R01 through R05. Every day they look at videos, images, audio clips, and text posts and decide: *approve it, reject it, or escalate it for a second look.*

You have a secret answer key — the "ground truth" — the correct call for each piece of content. This platform:

1. **Router Agent** — reads each content record and confirms the priority level (high / medium / low).
2. **QA Evaluator** — compares the reviewer's decision to the answer key, then explains the reasoning in plain language.
3. **Metrics Engine** — computes how often each reviewer was right, broken down by content type.
4. **Insight Agent** — writes a short executive report summarising the findings. No editing required.

The whole thing runs in about 90 seconds for 60 content decisions. You watch it happen line by line.

---

## The four agents

| Agent | What it does | Powered by |
|-------|-------------|------------|
| 🗺️ **Router Agent** | Reads the content, assigns priority | Gemini 2.5 Flash |
| 🔍 **QA Evaluator** | Compares reviewer decision vs. ground truth | Gemini 2.5 Flash |
| 📊 **Metrics Engine** | Computes Precision, Recall, F1 per content type | Pure Python |
| ✍️ **Insight Agent** | Writes an executive brief for leadership | Gemini 2.5 Flash |

> **Gemini 2.5 Flash** is Google's AI model. Every time an agent needs to reason about a decision, it sends a structured prompt to Gemini and parses the response. There are 120 of these calls per full run — two per record.

---

## The results

**Overall accuracy** — what percentage of reviewer decisions were correct across all 60 records.

**Per-modality metrics** — broken down by text, image, audio, and video. Precision, Recall, and F1 are three different numbers. They each measure a different type of mistake:
- **Precision** — when the reviewer said "reject", how often were they right?
- **Recall** — of all the content that *should* have been rejected, how much did they catch?
- **F1** — the balance between the two.

**Reviewer scorecards** — accuracy per person, best and worst content type, and a ⚠️ flag if anyone drops below 60%.

**Executive brief** — 150–200 words, written by the Insight Agent, ready to forward.

---

## Quick start

### Use the browser (zero setup)
Go to **[productx-qa.vercel.app](https://productx-qa.vercel.app)** and click **Run Full QA Analysis**.

### Run the web app locally
```bash
cd web
npm install
cp .env.example .env.local   # add your Gemini API key
npm run dev                  # → http://localhost:3000
```

### Run the Python CLI
```bash
cd python
pip install -r requirements.txt
python main.py --mode vercel   # streams from the live app — no API key needed
python main.py --mode local    # calls Gemini directly — needs GEMINI_API_KEY
```

---

## Tech stack

| | What it is |
|---|---|
| **Next.js** | Framework powering the browser app |
| **TypeScript** | Typed JavaScript — catches bugs at write time, not runtime |
| **Tailwind CSS** | Utility CSS — no custom stylesheets |
| **Gemini 2.5 Flash** | Google's AI model — all agent reasoning goes through here |
| **Vercel** | Hosts the app, handles scaling, zero config |
| **Python + Rich** | Terminal client — Rich renders the live output beautifully |
| **Server-Sent Events** | How the browser receives live updates as the pipeline runs |

---

## Project structure

```
web/                            ← Next.js application
├── app/
│   ├── page.tsx                ← Dashboard
│   ├── workflow/page.tsx       ← Visual pipeline diagram
│   ├── insights/page.tsx       ← Executive brief + export
│   └── api/
│       ├── run-qa/             ← Streaming pipeline endpoint (SSE)
│       └── generate-insights/  ← Insight Agent endpoint
├── components/                 ← UI components
├── lib/
│   ├── data.ts                 ← 60 review records
│   ├── gemini.ts               ← Gemini client (JSON model + text model)
│   └── metrics.ts              ← 3-class macro F1
└── types/                      ← Shared TypeScript types

python/                         ← Python CLI
├── main.py                     ← Entry point (--mode local | vercel)
├── pipeline.py                 ← Local mode: direct Gemini calls + retry
├── vercel_client.py            ← Vercel mode: SSE stream consumer
├── data.py                     ← Same 60 records
├── types_def.py                ← Python dataclasses
└── agents/
    ├── router_agent.py         ← Gemini: routing + priority
    ├── qa_evaluator.py         ← Gemini: decision evaluation
    ├── metrics_engine.py       ← Pure Python: 3-class macro F1
    └── insight_agent.py        ← Gemini: executive prose
```

---

## The dataset

60 hand-curated review records across five reviewers and four content types:

| Reviewer | Accuracy | Story |
|----------|----------|-------|
| R01 | ~90% | Consistently strong across all content types |
| R02 | ~75% | Reliable on text, weaker on image content |
| R03 | ~83% | Strong overall, best on image moderation |
| R04 | ~50% | **Auto-flagged ⚠️** — misses violence and explicit content regularly |
| R05 | ~70% | Accurate some days, inconsistent on others |

Each record has a content type, a category (hate speech / violence / spam / explicit / safe), the reviewer's decision, and the correct answer. R04's mistakes are genuine mistakes built into the dataset — the system surfaces them automatically, not because of a hardcoded rule.

---

## What happens when things go wrong

The pipeline is built to keep running no matter what:

- **Gemini rate-limited** → retries automatically, three times, with 3s → 6s → 12s gaps
- **All retries fail** → rule-based fallback: routes by content category, evaluates by direct comparison
- **Browser tab closed mid-run** → full results are saved to localStorage, restored on your next visit
- **Python stream interrupted** → `vercel_client.py` computes metrics from whatever records arrived

---

## By

**Bhuvan Dontha** · [productx-qa.vercel.app](https://productx-qa.vercel.app)

---

## License

MIT — use it, fork it, build on it.
