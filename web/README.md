# 🌐 Web App

Browser interface for the ProductX QA Platform. Next.js 14, deployed on Vercel.

**Live → [productx-qa.vercel.app](https://productx-qa.vercel.app)**

---

## Pages

| Page | What you see |
|------|-------------|
| `/` | Dashboard — run the pipeline, watch it live, read results |
| `/workflow` | Visual diagram of the agent pipeline — click any node to see its exact Gemini prompt |
| `/insights` | Generate and export the executive brief |

---

## Running locally

You need Node.js 18+ and a Gemini API key ([get one free](https://aistudio.google.com/app/apikey)).

```bash
npm install
cp .env.example .env.local
# open .env.local and paste your key
npm run dev
# → http://localhost:3000
```

The API key lives only on the server — it never reaches the browser.

---

## How the streaming works

When you click **Run Full QA Analysis**, the browser opens a persistent connection to `/api/run-qa`. The server processes records one by one and pushes live updates as [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events). Each event becomes one line in the scrolling log.

Four events per record:
1. `routing` — Router Agent has started
2. `routing_done` — priority confirmed, Gemini reasoning returned
3. `evaluating` — QA Evaluator is checking the decision
4. `record_complete` — PASS or FAIL, with one-sentence explanation

---

## Key files

```
app/api/run-qa/route.ts            ← Streaming pipeline (SSE, maxDuration 300s)
app/api/generate-insights/route.ts ← Executive brief endpoint
lib/gemini.ts                      ← getModel() for JSON · getTextModel() for prose
lib/metrics.ts                     ← 3-class macro F1 computation
lib/data.ts                        ← 60 review records
```

---

## Deploying

```bash
npx vercel --prod --yes
```

Set `GEMINI_API_KEY` in Vercel → Project → Settings → Environment Variables.
The `vercel.json` in this folder sets a 300-second function timeout so the full 60-record run can complete.
