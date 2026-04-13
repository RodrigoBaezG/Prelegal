import json
import os
from typing import Any, Literal

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "openai/gpt-oss-120b:free"

# ---------------------------------------------------------------------------
# Supported document types (matches catalog.json names)
# ---------------------------------------------------------------------------

SUPPORTED_DOCS = [
    "Mutual NDA",
    "Mutual NDA Cover Page",
    "Cloud Service Agreement (CSA)",
    "Design Partner Agreement",
    "Service Level Agreement (SLA)",
    "Professional Services Agreement (PSA)",
    "Data Processing Agreement (DPA)",
    "Partnership Agreement",
    "Software License Agreement",
    "Pilot Agreement",
    "Business Associate Agreement (BAA)",
    "AI Addendum",
]

FOLLOW_ON_RULE = (
    "IMPORTANT: Always end your response with a question if you need more information. "
    "Never give a response without a follow-up question unless you have explicitly confirmed "
    "that all required fields are complete."
)

# ---------------------------------------------------------------------------
# Initial flow: detect what document the user wants
# ---------------------------------------------------------------------------

INITIAL_GREETING = (
    "Hi! I'm your legal document assistant. I can help you create any of the following: "
    "Mutual NDA, Cloud Service Agreement, Design Partner Agreement, Service Level Agreement, "
    "Professional Services Agreement, Data Processing Agreement, Partnership Agreement, "
    "Software License Agreement, Pilot Agreement, Business Associate Agreement, or AI Addendum. "
    "What document would you like to create today?"
)

INITIAL_SYSTEM_PROMPT = f"""You are a helpful legal assistant at Prelegal. Your first task is to understand what legal document the user needs.

Supported document types (use these exact names):
{chr(10).join(f"- {d}" for d in SUPPORTED_DOCS)}

Rules:
- If the user asks for a document we support, confirm it and start gathering information.
- If the user asks for something we don't support, politely explain that and suggest the closest document from the list above.
- Once you've identified the document type, start asking the first relevant question.
- {FOLLOW_ON_RULE}
- Keep responses concise (2–4 sentences).
"""

INITIAL_EXTRACTION = f"""
From the conversation, detect which legal document the user wants to create.

Return a JSON object with a single key:
- documentType: one of {json.dumps(SUPPORTED_DOCS)} — only include this if you are confident the user has chosen a document type. Return an empty object {{}} if the type is still unclear.

Return only valid JSON. No markdown, no explanation.
""".strip()

# ---------------------------------------------------------------------------
# Per-document configurations
# ---------------------------------------------------------------------------

def _base_system(doc_name: str, fields: str) -> str:
    return f"""You are a helpful legal assistant at Prelegal helping the user create a {doc_name}.

Ask questions conversationally to gather the required information. Ask one or two questions at a time — don't overwhelm the user.
Be warm, concise (2–4 sentences), and professional.
Confirm details when given.
When all fields are collected, tell the user the document is ready.
{FOLLOW_ON_RULE}

Required fields to collect:
{fields}
"""

def _base_extraction(doc_name: str, fields: str) -> str:
    return f"""Extract values for the following {doc_name} fields from the conversation.
Return a JSON object. Only include fields you have clear information for — use empty string "" for unknown fields.
Also always include the key "documentType" with value "{doc_name}".

Fields:
{fields}

Return only valid JSON. No markdown, no explanation."""

# ── Mutual NDA ──────────────────────────────────────────────────────────────
_NDA_FIELDS = """
- purpose: How confidential information may be used
- effectiveDate: ISO date (YYYY-MM-DD); use today if user says "today"
- mndaTermType: "expires" or "continues"
- mndaTermYears: number of years as string (only if mndaTermType is "expires")
- confidentialityTermType: "years" or "perpetuity"
- confidentialityTermYears: number of years as string (only if type is "years")
- governingLaw: US state (e.g. "Delaware")
- jurisdiction: City and state for courts (e.g. "Wilmington, Delaware")
- modifications: Any modifications to standard terms (optional)
- party1Name: Full name of Party 1 signatory
- party1Title: Job title of Party 1
- party1Company: Company name of Party 1
- party1NoticeAddress: Email or postal address for Party 1
- party1Date: ISO date Party 1 signs (YYYY-MM-DD)
- party2Name: Full name of Party 2 signatory
- party2Title: Job title of Party 2
- party2Company: Company name of Party 2
- party2NoticeAddress: Email or postal address for Party 2
- party2Date: ISO date Party 2 signs (YYYY-MM-DD)
""".strip()

_NDA_REQUIRED = (
    "Purpose, effective date, governing law, jurisdiction, "
    "and full details (name, title, company, notice address, signing date) for both parties."
)

# ── Cloud Service Agreement ─────────────────────────────────────────────────
_CSA_FIELDS = """
- provider: Vendor/provider company name
- customer: Buyer/customer company name
- effectiveDate: ISO date (YYYY-MM-DD)
- governingLaw: US state
- chosenCourts: City and state for legal proceedings
- generalCapAmount: Liability cap amount or formula (e.g. "fees paid in last 12 months")
- subscriptionPeriod: Duration of subscription (e.g. "1 year")
- nonRenewalNoticeDate: Notice deadline to avoid auto-renewal
- technicalSupport: Support tier or description
- useLimitations: Usage restrictions (seat count, geography, etc.)
- fees: Pricing/fees
- paymentProcess: Billing mechanism (e.g. "annual invoice")
- prohibitedData: Data types not permitted in the product
- noticeAddress: Contact address for legal notices
""".strip()

# ── Design Partner Agreement ────────────────────────────────────────────────
_DESIGN_PARTNER_FIELDS = """
- provider: Company providing the product
- partner: Design partner company
- effectiveDate: ISO date (YYYY-MM-DD)
- term: Duration of the design partner program (e.g. "6 months")
- program: Description of the design partner program
- fees: Fees owed by Partner (if any; use "None" if free)
- governingLaw: US state
- chosenCourts: City and state for courts
- noticeAddress: Contact address for notices
""".strip()

# ── Service Level Agreement ─────────────────────────────────────────────────
_SLA_FIELDS = """
- targetUptime: Uptime commitment (e.g. "99.9%")
- targetResponseTime: Response time commitment (e.g. "4 business hours")
- supportChannel: How to submit support requests (e.g. "email: support@company.com")
- uptimeCredit: Credit formula for uptime failures
- responseTimeCredit: Credit formula for response time failures
- scheduledDowntime: Planned maintenance windows
""".strip()

# ── Professional Services Agreement ─────────────────────────────────────────
_PSA_FIELDS = """
- provider: Services company name
- customer: Client company name
- effectiveDate: ISO date (YYYY-MM-DD)
- governingLaw: US state
- chosenCourts: City and state for courts
- generalCapAmount: General liability cap
- deliverables: What is being produced/delivered
- fees: Project fees
- paymentPeriod: Net payment terms (e.g. "Net 30")
- sowTerm: Duration of the statement of work
- customerObligations: Customer's responsibilities on the project
""".strip()

# ── Data Processing Agreement ────────────────────────────────────────────────
_DPA_FIELDS = """
- provider: Data processor (vendor)
- customer: Data controller (customer)
- categoriesOfPersonalData: Types of personal data being processed
- categoriesOfDataSubjects: Who the data subjects are
- natureAndPurposeOfProcessing: Why and how data is processed
- durationOfProcessing: How long processing continues
- approvedSubprocessors: List of approved sub-processors
- governingMemberState: EU member state governing SCCs (for GDPR)
- securityPolicy: Link to Provider's security documentation
- agreement: Reference to parent agreement (e.g. "Cloud Service Agreement dated X")
""".strip()

# ── Partnership Agreement ────────────────────────────────────────────────────
_PARTNERSHIP_FIELDS = """
- company: One party (typically the vendor/licensor)
- partner: The other party
- effectiveDate: ISO date (YYYY-MM-DD)
- endDate: When the agreement expires (ISO date YYYY-MM-DD)
- obligations: What each party is required to do (core commercial terms)
- territory: Geographic scope (e.g. "Worldwide" or "United States")
- governingLaw: US state
- chosenCourts: City and state for courts
- fees: Fees or revenue share arrangement
- paymentProcess: Billing mechanism
- paymentSchedule: When payments are due
""".strip()

# ── Software License Agreement ───────────────────────────────────────────────
_SLA_SW_FIELDS = """
- provider: Software vendor name
- customer: Licensee company name
- effectiveDate: ISO date (YYYY-MM-DD)
- governingLaw: US state
- chosenCourts: City and state for courts
- subscriptionPeriod: License term duration
- licenseLimits: License restrictions (seat count, named users, etc.)
- fees: License fees
- paymentProcess: Billing mechanism
- warrantyPeriod: How long the software warranty lasts
- noticeAddress: Contact address for notices
""".strip()

# ── Pilot Agreement ──────────────────────────────────────────────────────────
_PILOT_FIELDS = """
- provider: Company offering the product/service
- customer: Evaluating company
- effectiveDate: ISO date (YYYY-MM-DD)
- pilotPeriod: Duration of the pilot (e.g. "30 days", "90 days")
- fees: Pilot fees (use "None" or "$0" if free)
- generalCapAmount: Liability cap
- governingLaw: US state
- chosenCourts: City and state for courts
- noticeAddress: Contact address for notices
""".strip()

# ── Business Associate Agreement ─────────────────────────────────────────────
_BAA_FIELDS = """
- provider: Business associate (vendor handling PHI)
- company: Covered entity (HIPAA-regulated organization)
- baaEffectiveDate: ISO date (YYYY-MM-DD)
- agreement: Reference to parent agreement (e.g. "Cloud Service Agreement dated X")
- breachNotificationPeriod: How quickly Provider must report breaches (e.g. "72 hours")
- limitations: Any restrictions on offshoring PHI or de-identification (optional)
""".strip()

# ── AI Addendum ──────────────────────────────────────────────────────────────
_AI_ADDENDUM_FIELDS = """
- provider: AI product vendor name
- customer: Customer using AI features
- agreement: Reference to base agreement (e.g. "Cloud Service Agreement dated X")
- trainingData: Data Customer permits Provider to use for model training (or "None" to prohibit)
- trainingPurposes: Permitted training use cases
- trainingRestrictions: Constraints on training data use
- improvementRestrictions: Constraints on non-training product improvement use
""".strip()

# ---------------------------------------------------------------------------
# Master config map
# ---------------------------------------------------------------------------

DOC_CONFIGS: dict[str, dict[str, str]] = {
    "Mutual NDA": {
        "system_prompt": _base_system("Mutual Non-Disclosure Agreement", _NDA_REQUIRED),
        "fields_description": _base_extraction("Mutual NDA", _NDA_FIELDS),
    },
    "Mutual NDA Cover Page": {
        "system_prompt": _base_system("Mutual NDA Cover Page", _NDA_REQUIRED),
        "fields_description": _base_extraction("Mutual NDA Cover Page", _NDA_FIELDS),
    },
    "Cloud Service Agreement (CSA)": {
        "system_prompt": _base_system("Cloud Service Agreement", _CSA_FIELDS),
        "fields_description": _base_extraction("Cloud Service Agreement (CSA)", _CSA_FIELDS),
    },
    "Design Partner Agreement": {
        "system_prompt": _base_system("Design Partner Agreement", _DESIGN_PARTNER_FIELDS),
        "fields_description": _base_extraction("Design Partner Agreement", _DESIGN_PARTNER_FIELDS),
    },
    "Service Level Agreement (SLA)": {
        "system_prompt": _base_system("Service Level Agreement", _SLA_FIELDS),
        "fields_description": _base_extraction("Service Level Agreement (SLA)", _SLA_FIELDS),
    },
    "Professional Services Agreement (PSA)": {
        "system_prompt": _base_system("Professional Services Agreement", _PSA_FIELDS),
        "fields_description": _base_extraction("Professional Services Agreement (PSA)", _PSA_FIELDS),
    },
    "Data Processing Agreement (DPA)": {
        "system_prompt": _base_system("Data Processing Agreement", _DPA_FIELDS),
        "fields_description": _base_extraction("Data Processing Agreement (DPA)", _DPA_FIELDS),
    },
    "Partnership Agreement": {
        "system_prompt": _base_system("Partnership Agreement", _PARTNERSHIP_FIELDS),
        "fields_description": _base_extraction("Partnership Agreement", _PARTNERSHIP_FIELDS),
    },
    "Software License Agreement": {
        "system_prompt": _base_system("Software License Agreement", _SLA_SW_FIELDS),
        "fields_description": _base_extraction("Software License Agreement", _SLA_SW_FIELDS),
    },
    "Pilot Agreement": {
        "system_prompt": _base_system("Pilot Agreement", _PILOT_FIELDS),
        "fields_description": _base_extraction("Pilot Agreement", _PILOT_FIELDS),
    },
    "Business Associate Agreement (BAA)": {
        "system_prompt": _base_system("Business Associate Agreement", _BAA_FIELDS),
        "fields_description": _base_extraction("Business Associate Agreement (BAA)", _BAA_FIELDS),
    },
    "AI Addendum": {
        "system_prompt": _base_system("AI Addendum", _AI_ADDENDUM_FIELDS),
        "fields_description": _base_extraction("AI Addendum", _AI_ADDENDUM_FIELDS),
    },
}

# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://prelegal.app",
        "X-Title": "Prelegal",
    }


async def _chat(messages: list[dict], client: httpx.AsyncClient) -> str:
    resp = await client.post(
        OPENROUTER_URL,
        headers=_headers(),
        json={"model": MODEL, "messages": messages},
        timeout=30,
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"OpenRouter error: {resp.text}")
    return resp.json()["choices"][0]["message"]["content"].strip()


async def _extract(extraction_prompt: str, conversation: list[dict], ai_reply: str, client: httpx.AsyncClient) -> dict[str, Any]:
    extract_messages = [
        {"role": "system", "content": extraction_prompt},
        {
            "role": "user",
            "content": (
                "Conversation so far:\n\n"
                + "\n".join(f"{m['role'].upper()}: {m['content']}" for m in conversation)
                + f"\nASSISTANT: {ai_reply}"
                + "\n\nExtract the fields now."
            ),
        },
    ]
    resp = await client.post(
        OPENROUTER_URL,
        headers=_headers(),
        json={"model": MODEL, "messages": extract_messages, "response_format": {"type": "json_object"}},
        timeout=30,
    )
    if resp.status_code != 200:
        return {}
    try:
        return json.loads(resp.json()["choices"][0]["message"]["content"].strip())
    except (json.JSONDecodeError, KeyError):
        return {}

# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    document_type: str | None = None


class ChatResponse(BaseModel):
    message: str
    fields: dict[str, Any]

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/greeting")
def greeting():
    return {"message": INITIAL_GREETING}


@router.post("/message", response_model=ChatResponse)
async def message(body: ChatRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")

    doc_type = body.document_type
    config = DOC_CONFIGS.get(doc_type or "") if doc_type else None

    system_prompt = config["system_prompt"] if config else INITIAL_SYSTEM_PROMPT
    extraction_prompt = config["fields_description"] if config else INITIAL_EXTRACTION

    conversation = [{"role": m.role, "content": m.content} for m in body.messages]
    full_messages = [{"role": "system", "content": system_prompt}] + conversation

    async with httpx.AsyncClient() as client:
        # Call 1: conversational reply
        ai_reply = await _chat(full_messages, client)

        # Call 2: field extraction (non-fatal)
        try:
            raw_fields = await _extract(extraction_prompt, conversation, ai_reply, client)
        except Exception:
            raw_fields = {}

    # Coerce numeric values to strings (LLMs sometimes return integers for year/count fields)
    normalized = {k: str(v) if isinstance(v, (int, float)) else v for k, v in raw_fields.items()}
    # Strip empty strings so we never overwrite good data with blanks
    # Also validate documentType against the supported list to prevent hallucinated names
    fields: dict[str, Any] = {}
    for k, v in normalized.items():
        if not (isinstance(v, str) and v.strip()):
            continue
        if k == "documentType" and v not in SUPPORTED_DOCS:
            continue
        fields[k] = v

    return ChatResponse(message=ai_reply, fields=fields)
