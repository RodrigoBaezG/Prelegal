# Prelegal

Prelegal is a SaaS web application that lets users draft professional legal agreements through a conversational AI interface. Instead of filling in complex forms, users chat with an AI assistant that gathers the necessary information and populates a live document preview. Completed drafts can be saved, browsed, and revisited at any time.

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [Supported Documents](#supported-documents)
3. [Architecture Overview](#architecture-overview)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [How the AI Works](#how-the-ai-works)
7. [Authentication & Security](#authentication--security)
8. [Database](#database)
9. [API Reference](#api-reference)
10. [Running the App](#running-the-app)
11. [Development Workflow](#development-workflow)
12. [Color Scheme](#color-scheme)

---

## What It Does

1. A user registers or signs in.
2. They start a chat with the AI assistant, which asks what document they need.
3. The AI detects the document type and begins gathering required fields through natural conversation.
4. As fields are collected, a live document preview updates in real time on the right side of the screen.
5. When all required fields are gathered, the user can download a PDF or save the document to their account.
6. Saved documents are listed on the My Documents page and can be reopened to restore the full preview.

All generated documents include a disclaimer that they are AI-assisted drafts subject to legal review.

---

## Supported Documents

| Document | Description |
|---|---|
| Mutual NDA | Mutual non-disclosure agreement for two parties exchanging confidential information |
| Mutual NDA Cover Page | Cover page specifying business-specific terms for the Mutual NDA standard terms |
| Cloud Service Agreement (CSA) | Standard agreement for selling/buying cloud software and SaaS products |
| Design Partner Agreement | Early-stage collaboration agreement for product co-development or feedback |
| Service Level Agreement (SLA) | Uptime commitments and remedies; used alongside the CSA |
| Professional Services Agreement (PSA) | Consulting and implementation engagements with statements of work |
| Data Processing Agreement (DPA) | GDPR/CCPA-compliant agreement for vendors processing personal data |
| Partnership Agreement | Reseller, referral, and co-sell arrangements between companies |
| Software License Agreement | On-premise or downloadable software license with order form terms |
| Pilot Agreement | Short-term trial agreement for product evaluation before full commitment |
| Business Associate Agreement (BAA) | HIPAA-required agreement for vendors handling protected health information |
| AI Addendum | Addendum addressing AI-specific terms; attaches to a base agreement |

Document templates live in the `templates/` directory as Markdown files and are catalogued in `catalog.json`.

---

## Architecture Overview

```
Browser (Next.js static export)
        │
        │  HTTP (port 8000)
        ▼
FastAPI (Python)
  ├── Serves Next.js static files
  ├── /api/auth   — register / login
  ├── /api/chat   — AI conversation + field extraction
  └── /api/documents — CRUD for saved documents
        │
        ├── SQLite (via Python sqlite3)
        │     ├── users (email, hashed password)
        │     └── documents (user_id, type, fields JSON)
        │
        └── OpenRouter API (LLM calls)
              └── openai/gpt-oss-120b:free
```

Everything is packaged in a single Docker container. The Node.js build stage compiles the Next.js frontend into a static export; the Python stage installs the backend and bundles the compiled frontend, which FastAPI serves directly. No separate frontend server is needed.

---

## Technology Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.12** | Runtime |
| **FastAPI** | REST API framework |
| **uvicorn** | ASGI server |
| **uv** | Fast Python package installer (used in Docker) |
| **SQLite** (stdlib `sqlite3`) | Database — reset on each container start |
| **bcrypt** | Password hashing |
| **python-jose** | JWT creation and verification |
| **pydantic** (v2) | Request/response validation and structured outputs |
| **httpx** | Async HTTP client for OpenRouter calls |
| **email-validator** | Email address validation for Pydantic's `EmailStr` |

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 14** (App Router) | React framework |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first styling |
| **Static export** (`next export`) | Pre-built HTML/JS/CSS served by FastAPI |

### AI
| Technology | Purpose |
|---|---|
| **OpenRouter** | LLM API proxy |
| **openai/gpt-oss-120b:free** | Model used for chat and field extraction |
| **JSON mode** (`response_format: json_object`) | Structured field extraction output |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker** | Single-container packaging |
| **Docker Compose** | Local orchestration with a named volume for the DB |
| **GitHub** | Source control and pull requests |
| **Jira (Atlassian)** | Issue and feature tracking |

---

## Project Structure

```
prelegal/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, middleware, lifespan, static file mount
│   │   ├── auth.py          # bcrypt hashing, JWT creation/verification, bearer dependency
│   │   ├── database.py      # SQLite connection, init_db (creates tables on startup)
│   │   └── routers/
│   │       ├── auth.py      # POST /api/auth/register and /api/auth/login
│   │       ├── chat.py      # GET /api/chat/greeting, POST /api/chat/message
│   │       └── documents.py # CRUD endpoints for saved documents
│   ├── tests/
│   │   └── test_auth_and_documents.py  # 11 integration tests
│   └── pyproject.toml       # Python project metadata and dependencies
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx         # Home page (chat + live preview)
│       │   ├── login/page.tsx   # Sign-in / sign-up page
│       │   └── documents/page.tsx  # My Documents list
│       └── components/
│           ├── HomeInner.tsx    # Chat panel + preview layout (client component)
│           ├── DocChat.tsx      # Chat message list and input
│           ├── NDAPreview.tsx   # Rich preview for Mutual NDA
│           ├── GenericPreview.tsx  # Field table preview for all other document types
│           └── SaveButton.tsx   # Reusable save button used in both preview components
├── templates/              # Markdown templates for all 12 document types
├── scripts/
│   ├── start-mac.sh / stop-mac.sh
│   ├── start-linux.sh / stop-linux.sh
│   └── start-windows.ps1 / stop-windows.ps1
├── catalog.json            # Registry of document names, descriptions, and template paths
├── Dockerfile              # Multi-stage build: Node (frontend) → Python (backend + frontend)
├── docker-compose.yml      # Compose config with named volume for SQLite persistence
├── CLAUDE.md               # AI coding assistant instructions and project status
└── PRELEGAL.md             # This file
```

---

## How the AI Works

Every user message triggers **two sequential LLM calls** to OpenRouter:

### Call 1 — Conversational Reply
The AI receives a system prompt tailored to the current document type (or a general routing prompt if no type has been detected yet) plus the full conversation history. It responds naturally, asking follow-up questions to gather missing information.

### Call 2 — Structured Field Extraction
A second call runs against the same conversation using a separate system prompt that instructs the model to return only a JSON object containing the document fields it has confidently extracted so far. The `response_format: json_object` parameter enforces valid JSON output.

The extracted fields are merged into the frontend state, updating the live preview in real time. Fields are never overwritten with empty values — only non-blank extracted values are applied.

### Document Type Detection
When no document type is selected yet, a special initial extraction prompt looks for a `documentType` key in the returned JSON. Once detected, the frontend switches to that document's per-type system prompt and extraction schema for all subsequent messages.

### Safety Rules
- The `role` field in chat messages is typed as `Literal["user", "assistant"]` — the backend rejects any other value, blocking prompt injection via fake roles.
- `documentType` is validated against the `SUPPORTED_DOCS` list on the backend — hallucinated type names are silently discarded.

---

## Authentication & Security

- **Registration**: email (lowercased) + password (minimum 8 characters). Password is hashed with `bcrypt` before storage.
- **Login**: email/password verified against stored hash. Returns a signed JWT.
- **JWT**: HS256, 7-day expiry. Signed with `JWT_SECRET` from environment. A warning is logged at startup if the secret is not set.
- **Protected endpoints**: `/api/documents` uses a `Bearer` token dependency (`HTTPBearer`) that decodes the JWT and looks up the user in the database on every request.
- **Frontend**: token and email are stored in `localStorage`. All document API calls include the token in the `Authorization: Bearer` header. Missing or invalid tokens result in a redirect to `/login`.

---

## Database

SQLite, stored at `/data/prelegal.db` inside the container (mounted via a Docker named volume). Created fresh from the schema on every container start via `init_db()`.

### Schema

```sql
CREATE TABLE users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    title         TEXT NOT NULL,
    fields_json   TEXT NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

> Note: because the database is reset on container restart (via `docker compose down -v`), it is not suitable for production use without replacing SQLite with a persistent database service.

---

## API Reference

### Health
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | None | Returns `{"status": "ok"}` |

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Register a new user. Body: `{email, password}`. Returns `{token, email}`. |
| `POST` | `/api/auth/login` | None | Sign in. Body: `{email, password}`. Returns `{token, email}`. |

### Chat
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/chat/greeting` | None | Returns the initial AI greeting message. |
| `POST` | `/api/chat/message` | None | Send a message. Body: `{messages, document_type?}`. Returns `{message, fields}`. |

### Documents
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/documents` | Bearer | List all saved documents for the authenticated user. |
| `POST` | `/api/documents` | Bearer | Save a document. Body: `{document_type, title, fields}`. |
| `GET` | `/api/documents/{id}` | Bearer | Get a single saved document (must belong to the user). |
| `DELETE` | `/api/documents/{id}` | Bearer | Delete a saved document (must belong to the user). |

---

## Running the App

### Prerequisites
- Docker Desktop installed and running

### Start

**Windows (PowerShell):**
```powershell
scripts/start-windows.ps1
```

**Mac:**
```bash
scripts/start-mac.sh
```

**Linux:**
```bash
scripts/start-linux.sh
```

Or directly with Docker Compose:
```bash
docker compose up -d --build
```

The app is available at **http://localhost:8000**.

### Stop

```bash
docker compose down
```

To also wipe the database (reset all users and documents):
```bash
docker compose down -v
```

### Environment Variables

Create a `.env` file in the project root (already present locally):

```env
OPENROUTER_API_KEY=your_openrouter_key_here
JWT_SECRET=your_secure_random_secret
```

---

## Development Workflow

Features are tracked as Jira issues in the **PL** project. The process for each feature:

1. Read the Jira ticket for requirements.
2. Explore the codebase to understand the affected areas.
3. Design the implementation (API changes, DB schema, frontend components).
4. Implement backend changes with tests in `backend/tests/`.
5. Implement frontend changes.
6. Build and test the Docker container locally.
7. Submit a pull request on GitHub referencing the Jira ticket.

### Running Backend Tests

From the project root (requires Python and dependencies installed locally, or run inside the container):

```bash
cd backend
pytest tests/
```

---

## Color Scheme

| Role | Hex |
|---|---|
| Accent Yellow | `#ecad0a` |
| Blue Primary | `#209dd7` |
| Purple Secondary (buttons) | `#753991` |
| Dark Navy (headings) | `#032147` |
| Gray Text | `#888888` |
