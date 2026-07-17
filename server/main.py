"""
VenturePilot AI — FastAPI backend
Stateless (in-memory only), streams Gemini responses via SSE.
"""
import os
import json
import asyncio
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai as google_genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

gemini_client = google_genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

app = FastAPI(title="VenturePilot AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Schemas ----------

class StartupContext(BaseModel):
    name: str
    description: str
    industry: str
    audience: str
    problem: str


class ValidateRequest(BaseModel):
    startup: StartupContext


class CriticRequest(BaseModel):
    startup: StartupContext


class CanvasRequest(BaseModel):
    startup: StartupContext


class PitchDeckRequest(BaseModel):
    startup: StartupContext


class MentorRequest(BaseModel):
    startup: StartupContext
    message: str
    history: Optional[list] = []


# ---------- Prompt builders ----------

def startup_block(s: StartupContext) -> str:
    return (
        f"Startup name: {s.name}\n"
        f"Description: {s.description}\n"
        f"Industry: {s.industry}\n"
        f"Target audience: {s.audience}\n"
        f"Problem solved: {s.problem}\n"
    )


SYSTEM_PROMPTS = {
    "validate": (
        "You are a rigorous startup analyst. Evaluate the startup idea the user gives you across: "
        "problem clarity, target audience definition, market need, existing competitors, unique value "
        "proposition, business potential, strengths, weaknesses. "
        "Respond in clean markdown with these sections, in this order: "
        "## Idea Score\\n(a single number 0-100 on its own line, then one sentence justifying it) "
        "## Validation Report\\n## Strengths\\n## Weaknesses\\n## Recommendations\\n## Opportunity Rating "
        "(Low / Medium / High, with one sentence why). Be specific to the idea given, not generic."
    ),
    "critic": (
        "You are a blunt, experienced Silicon Valley venture capitalist reviewing a pitch. Do not be "
        "agreeable — challenge weak assumptions directly, the way a real VC would in a partner meeting. "
        "Respond in markdown with sections: "
        "## Tough Questions (3-5 pointed questions an investor would actually ask) "
        "## Missing Assumptions "
        "## Funding Readiness "
        "## Scalability Review "
        "## Market Analysis "
        "## Business Model Review "
        "## Scorecard (list Originality, Market, Revenue Model, Scalability, Competition, Execution, "
        "each as a /10 score, then an Overall Score /100) "
        "## Verdict (exactly one of: ❌ Reject / ⚠️ Needs Improvement / ✅ Invest, followed by a short "
        "explanation)."
    ),
    "canvas": (
        "You produce a Business Model Canvas for the given startup. Respond ONLY with strict JSON, no "
        "markdown fences, no commentary, matching this shape exactly: "
        '{"customer_segments": "...", "value_proposition": "...", "revenue_streams": "...", '
        '"channels": "...", "customer_relationships": "...", "key_activities": "...", '
        '"key_resources": "...", "key_partners": "...", "cost_structure": "..."}. '
        "Each value should be 2-4 concise bullet-style sentences (use \\n between points), specific to "
        "the startup described, not generic filler."
    ),
    "pitchdeck": (
        "You write investor pitch deck content for the given startup. Respond in markdown. For each of "
        "these eleven slides, use a level-2 heading with the slide name followed by concise, punchy "
        "slide content (bullet points, no long paragraphs): Problem, Solution, Product, Market, "
        "Business Model, Competition, Go-To-Market, Traction, Financial Projection, Funding Ask, "
        "Future Vision. Be specific to the startup, invent plausible illustrative numbers where useful "
        "and label them as illustrative."
    ),
    "mentor": (
        "You are a warm, experienced startup founder acting as a mentor. You are supportive and "
        "educational, unlike a VC — help with product improvement, feature suggestions, pricing "
        "strategy, marketing, fundraising advice, roadmap, growth, scaling, hiring, and customer "
        "acquisition. Keep responses focused and actionable, grounded in the specific startup context "
        "given. Use markdown formatting where it helps readability."
    ),
}


async def stream_ai(system: str, user_content: str):
    if gemini_client is None:
        yield f"data: {json.dumps({'error': 'GEMINI_API_KEY not configured on server'})}\n\n"
        return
    try:
        response = gemini_client.models.generate_content_stream(
            model=GEMINI_MODEL,
            contents=user_content,
            config={"system_instruction": system, "max_output_tokens": 4000},
        )
        for chunk in response:
            if chunk.text:
                yield f"data: {json.dumps({'text': chunk.text})}\n\n"
            await asyncio.sleep(0)
        yield f"data: {json.dumps({'done': True})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


async def generate_text(system: str, user_content: str) -> str:
    """Non-streamed single-shot generation, used where a full JSON blob is needed at once."""
    if gemini_client is None:
        raise RuntimeError("GEMINI_API_KEY not configured on server")
    resp = gemini_client.models.generate_content(
        model=GEMINI_MODEL,
        contents=user_content,
        config={"system_instruction": system, "max_output_tokens": 1500},
    )
    return resp.text


def sse_response(system: str, user_content: str):
    return StreamingResponse(
        stream_ai(system, user_content),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ---------- Routes ----------

@app.get("/health")
async def health():
    return {"status": "ok", "provider": "gemini", "model": GEMINI_MODEL, "api_key_configured": bool(gemini_client)}


@app.post("/validate")
async def validate(req: ValidateRequest):
    return sse_response(SYSTEM_PROMPTS["validate"], startup_block(req.startup))


@app.post("/critic")
async def critic(req: CriticRequest):
    return sse_response(SYSTEM_PROMPTS["critic"], startup_block(req.startup))


@app.post("/canvas")
async def canvas(req: CanvasRequest):
    try:
        raw = await generate_text(SYSTEM_PROMPTS["canvas"], startup_block(req.startup))
        raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)
        return JSONResponse(data)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/pitchdeck")
async def pitchdeck(req: PitchDeckRequest):
    return sse_response(SYSTEM_PROMPTS["pitchdeck"], startup_block(req.startup))


@app.post("/mentor")
async def mentor(req: MentorRequest):
    history_text = ""
    for turn in (req.history or [])[-10:]:
        role = turn.get("role", "user")
        content = turn.get("content", "")
        history_text += f"\n{role.upper()}: {content}"
    user_content = (
        f"{startup_block(req.startup)}\n"
        f"Conversation so far:{history_text if history_text else ' (none yet)'}\n\n"
        f"Founder's new message: {req.message}"
    )
    return sse_response(SYSTEM_PROMPTS["mentor"], user_content)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8080)), reload=True)


# ---------- Serve built frontend (optional single-container mode) ----------
# If client/dist exists (produced by `npm run build`), serve it and fall back to
# index.html for client-side routing. In the Vercel split-deploy path (frontend on
# Vercel, backend on Render/Railway) this directory won't exist and only the API
# routes above are active — that's the expected setup for this deployment.
_CLIENT_DIST = os.path.join(os.path.dirname(__file__), "..", "client", "dist")
if os.path.isdir(_CLIENT_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(_CLIENT_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        index_path = os.path.join(_CLIENT_DIST, "index.html")
        return FileResponse(index_path)
