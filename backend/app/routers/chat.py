import json
import os
from typing import Any, Literal

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "meta-llama/llama-3.3-70b-instruct:free"

GREETING = (
    "Hi! I'm here to help you draft a Mutual Non-Disclosure Agreement. "
    "Let's start with the basics — what's the purpose of this NDA? "
    "For example, are the two parties evaluating a potential business partnership, "
    "sharing technical information for a project, or something else?"
)

# ---------------------------------------------------------------------------
# NDA field schema used in the extraction system prompt
# ---------------------------------------------------------------------------
NDA_FIELDS_DESCRIPTION = """
Extract values for these NDA fields from the conversation. Return a JSON object.
Only include fields you have clear information for. Use empty string "" for unknown fields.

Fields:
- purpose: string — How confidential information may be used
- effectiveDate: string — ISO date (YYYY-MM-DD). Use today's date if the user says "today" or "now".
- mndaTermType: "expires" or "continues" — whether the MNDA expires after N years or continues until terminated
- mndaTermYears: string — number of years (only if mndaTermType is "expires"), e.g. "2"
- confidentialityTermType: "years" or "perpetuity"
- confidentialityTermYears: string — number of years (only if confidentialityTermType is "years"), e.g. "3"
- governingLaw: string — US state governing this agreement, e.g. "Delaware"
- jurisdiction: string — City/county and state for legal proceedings, e.g. "Wilmington, Delaware"
- modifications: string — Any modifications to standard terms (optional, can be "")
- party1Name: string — Full name of Party 1 signatory
- party1Title: string — Job title of Party 1 signatory
- party1Company: string — Company name of Party 1
- party1NoticeAddress: string — Email or postal address for Party 1 notices
- party1Date: string — ISO date Party 1 signs (YYYY-MM-DD)
- party2Name: string — Full name of Party 2 signatory
- party2Title: string — Job title of Party 2 signatory
- party2Company: string — Company name of Party 2
- party2NoticeAddress: string — Email or postal address for Party 2 notices
- party2Date: string — ISO date Party 2 signs (YYYY-MM-DD)

Return only valid JSON. No markdown, no explanation.
""".strip()

CHAT_SYSTEM_PROMPT = """
You are a helpful legal assistant at Prelegal, guiding users through creating a Mutual Non-Disclosure Agreement (NDA).

Your job is to have a friendly, conversational chat to gather all the information needed to fill in the NDA.
Ask one or two questions at a time — don't overwhelm the user with a long list.
Be concise. Confirm details when given. Once you have all the information, tell the user the document is ready.

Required fields to collect:
1. Purpose of the NDA
2. Effective date
3. MNDA term (expires after N years, or continues until terminated)
4. Term of confidentiality (N years, or perpetuity)
5. Governing law (US state)
6. Jurisdiction (city and state)
7. Party 1: full name, job title, company, notice address (email or postal), signing date
8. Party 2: full name, job title, company, notice address (email or postal), signing date

Keep responses short (2-4 sentences). Be warm but professional.
""".strip()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://prelegal.app",
        "X-Title": "Prelegal",
    }


async def _openrouter_chat(messages: list[dict[str, str]], client: httpx.AsyncClient) -> str:
    """Call OpenRouter for a conversational reply."""
    resp = await client.post(
        OPENROUTER_URL,
        headers=_headers(),
        json={"model": MODEL, "messages": messages},
        timeout=30,
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"OpenRouter error: {resp.text}")
    data = resp.json()
    return data["choices"][0]["message"]["content"].strip()


async def _openrouter_extract(messages: list[dict[str, str]], client: httpx.AsyncClient) -> dict[str, Any]:
    """Call OpenRouter with a strict extraction prompt to get NDA field JSON."""
    extraction_messages = [
        {"role": "system", "content": NDA_FIELDS_DESCRIPTION},
        {
            "role": "user",
            "content": (
                "Here is the conversation so far:\n\n"
                + "\n".join(f"{m['role'].upper()}: {m['content']}" for m in messages)
                + "\n\nExtract the NDA fields from this conversation and return them as JSON."
            ),
        },
    ]
    resp = await client.post(
        OPENROUTER_URL,
        headers=_headers(),
        json={
            "model": MODEL,
            "messages": extraction_messages,
            "response_format": {"type": "json_object"},
        },
        timeout=30,
    )
    if resp.status_code != 200:
        # Extraction failure is non-fatal — return empty dict
        return {}
    data = resp.json()
    raw = data["choices"][0]["message"]["content"].strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    message: str
    fields: dict[str, Any]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/greeting")
def greeting():
    return {"message": GREETING}


@router.post("/message", response_model=ChatResponse)
async def message(body: ChatRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")

    conversation = [{"role": m.role, "content": m.content} for m in body.messages]
    full_messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}] + conversation

    async with httpx.AsyncClient() as client:
        # Call 1: get the AI's conversational reply
        ai_reply = await _openrouter_chat(full_messages, client)

        # Call 2: extract NDA fields — non-fatal if it fails
        try:
            extraction_input = conversation + [{"role": "assistant", "content": ai_reply}]
            raw_fields = await _openrouter_extract(extraction_input, client)
        except Exception:
            raw_fields = {}

    # Only merge fields that have a non-empty value to avoid overwriting good data
    fields = {k: v for k, v in raw_fields.items() if isinstance(v, str) and v.strip()}

    return ChatResponse(message=ai_reply, fields=fields)
