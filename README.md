# 🚀 VenturePilot AI

**Validate, Improve & Pitch Your Startup with AI.**

VenturePilot is a stateless AI co-pilot for founders. Describe your startup once, and five
focused AI modules — Idea Validator, VC Pitch Critic, Business Model Canvas, Pitch Deck
Generator, and Startup Mentor — all reuse that same context. No generic chatbot, no database,
no persisted user data: everything lives in memory for the length of a session.

---

## Features

- **Idea Validator** — scores your concept 0–100 with a validation report, strengths,
  weaknesses, recommendations, and an opportunity rating.
- **VC Pitch Critic** — a deliberately blunt AI investor persona: tough questions, a
  category scorecard, and a Reject / Needs Improvement / Invest verdict.
- **Business Model Canvas** — all nine blocks generated from your idea and rendered as a
  real canvas layout.
- **Pitch Deck Generator** — eleven investor-ready slides, copyable as markdown or
  exportable as a print-ready PDF.
- **Startup Mentor** — a supportive chat mentor for pricing, growth, hiring, and roadmap
  questions, with conversation memory for the current session.
- Real-time **streaming** output (Server-Sent Events) for every generative module.
- Fully **stateless** backend — no PostgreSQL, MongoDB, Firebase, or Supabase.

---

## Tech Stack

| Layer      | Choice                                              |
|------------|------------------------------------------------------|
| Frontend   | React + Vite, custom CSS, Framer Motion, Lucide icons |
| Backend    | FastAPI (Python)                                     |
| AI         | Google Gemini API (`GEMINI_MODEL` env-configurable)   |
| Streaming  | Server-Sent Events via `StreamingResponse`           |
| Container  | Docker (backend)                                      |
| Deployment | Frontend → Vercel · Backend → Render / Railway        |

---

## Architecture

```
Browser (React SPA)
   │  fetch (SSE stream) ──────────────┐
   ▼                                   ▼
FastAPI backend  ──────────►  Anthropic Claude API
   │
   └── serves the built React app as static files
       when client/dist exists (single-container mode)
```

The frontend holds one piece of shared state — the startup's name, description, industry,
audience, and problem — in a React context (`StartupContext`). Every module page reads from
it and posts it to the corresponding backend route. Nothing is written to disk or a database;
if the browser tab is closed, the session is gone.

---

## Prompting Strategy

Each module has its own system prompt (see `server/main.py → SYSTEM_PROMPTS`) that:
1. Assigns a distinct persona (analyst, VC, canvas generator, deck writer, mentor).
2. Fixes the exact output structure (markdown headings or strict JSON) so the frontend can
   parse and render it reliably — e.g. the Idea Validator always opens with `## Idea Score`
   so the UI can extract the number for the instrument dial.
3. Explicitly instructs the model to stay specific to the given startup rather than
   producing generic advice.

Example prompt fragment (VC Critic):
> "You are a blunt, experienced Silicon Valley venture capitalist reviewing a pitch. Do not
> be agreeable — challenge weak assumptions directly, the way a real VC would in a partner
> meeting."

The startup's five fields (name, description, industry, audience, problem) are interpolated
into a single user-turn message per request — this keeps each module a clean, independent
REST call while still sharing context, rather than maintaining one long multi-module thread.

---

## API Documentation

| Method | Route         | Body                                              | Response                  |
|--------|---------------|----------------------------------------------------|----------------------------|
| GET    | `/health`     | —                                                  | `{ status, provider, model }` |
| POST   | `/validate`   | `{ startup }`                                      | SSE stream of markdown     |
| POST   | `/critic`     | `{ startup }`                                      | SSE stream of markdown     |
| POST   | `/canvas`     | `{ startup }`                                      | JSON, 9 canvas fields      |
| POST   | `/pitchdeck`  | `{ startup }`                                      | SSE stream of markdown     |
| POST   | `/mentor`     | `{ startup, message, history[] }`                  | SSE stream of markdown     |

`startup` shape: `{ name, description, industry, audience, problem }`.

SSE frames look like `data: {"text": "..."}\n\n`, terminated by `data: {"done": true}\n\n`
or `data: {"error": "..."}\n\n`.

---

## Local Development

**Backend**
```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env   # fill in GEMINI_API_KEY
uvicorn main:app --reload --port 8080
```

**Frontend**
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Visit `http://localhost:5173`.

---

## Environment Variables

Root `.env` (backend):

| Variable            | Description                                        |
|---------------------|-----------------------------------------------------|
| `GEMINI_API_KEY`    | Your Gemini API key — **never commit this**. Free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL`      | Model name, default `gemini-2.5-flash`               |
| `ALLOWED_ORIGINS`   | Comma-separated list of allowed frontend origins (add your Vercel URL once deployed) |
| `PORT`              | Backend port (default `8080`)                        |

`client/.env` (frontend, dev only): `VITE_API_BASE_URL` — points at the standalone backend
during local development, e.g. `http://localhost:8080`.

---

## Docker (backend)

```bash
docker build -t venturepilot-ai-server .
docker run -p 8080:8080 --env-file .env venturepilot-ai-server
```

Or with Compose:
```bash
docker compose up --build
```

---

## Deployment Guide (Vercel + Render)

This project deploys as two pieces: a static frontend on **Vercel**, and the FastAPI
backend on a service that can run a long-lived Python process with streaming responses.
Vercel's own serverless functions aren't a good fit for SSE streaming, so the backend goes
on **Render** or **Railway** instead — both have free tiers.

### 1. Deploy the backend (Render)
1. Push this repo to GitHub (`.env` is already excluded via `.gitignore` — don't force-add it).
2. In Render, create a **New Web Service** from your repo, root directory `server/`.
3. Runtime: Python 3. Build command: `pip install -r requirements.txt`. Start command:
   `uvicorn main:app --host 0.0.0.0 --port $PORT`.
   (Alternatively, use the repo's root `Dockerfile` directly — Render supports Docker services too.)
4. Add environment variables: `GEMINI_API_KEY`, `GEMINI_MODEL`. Leave `ALLOWED_ORIGINS` as
   localhost for now — you'll update it in step 3.
5. Deploy. Note the public URL Render gives you, e.g. `https://venturepilot-api.onrender.com`.

### 2. Deploy the frontend (Vercel)
1. In Vercel, **Import Project** from the same GitHub repo.
2. Set **Root Directory** to `client/`. Framework preset: Vite (auto-detected).
3. Add environment variable: `VITE_API_BASE_URL` = your Render backend URL from step 1.
4. Deploy. Vercel gives you a public HTTPS URL, e.g. `https://venturepilot-ai.vercel.app`.

### 3. Close the loop
Go back to Render and set `ALLOWED_ORIGINS` to your Vercel URL (so CORS allows the browser
to call the API), then redeploy the backend. Your app is now live end-to-end.

---

## Challenges & Resolutions

- **Streaming through a POST endpoint**: native `EventSource` only supports GET, so the
  frontend reads the `fetch` response body as a stream and manually parses `data:` frames
  instead.
- **Reliably extracting a numeric score from free-form model output**: solved by fixing the
  exact markdown heading (`## Idea Score`) in the system prompt and matching it with a
  narrow regex on the frontend, rather than asking the model for JSON (which is harder to
  stream token-by-token).
- **Single container vs. two services**: FastAPI conditionally mounts a built React
  `dist/` folder only if it exists, so the same backend code still works if you ever choose
  to bundle frontend and backend into one container instead of the Vercel + Render split.

## Key Learnings

- Designing the system prompt's *output contract* (fixed headings / strict JSON) matters as
  much as the persona instructions — it's what makes a streamed LLM response usable in a
  real UI.
- Keeping the app genuinely stateless simplified both the backend (no models, no
  migrations) and the deployment story (no managed database to provision or secure).

---

## Future Improvements

- Persist sessions optionally (auth + database) for founders who want to return to past
  reports — currently out of scope by design.
- Add a "compare two ideas" mode across the Validator and Critic modules.
- Voice input for the Mentor chat.
