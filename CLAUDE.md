# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation has real authentication, document persistence, and an AI chat interface supporting all 11 document types. The user chats with an AI that detects the desired document type, gathers required fields conversationally, and populates a live document preview. Documents can be saved and revisited.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use OpenRouter to the free model. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
Consider statically building the frontend and serving it via FastAPI, if that will work.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation Status

### Completed (PL-3)
- Mutual NDA creator prototype (manual form + live preview + browser-print PDF)

### Completed (PL-4)
- Docker multi-stage build (Node builds frontend, Python/FastAPI serves it)
- FastAPI backend with SQLite (fresh DB each container start, stored in `/data/`)
- Next.js static export served by FastAPI at `localhost:8000`
- Fake login screen (`/login`) — no real auth, localStorage flag routes user into app
- Sign-out button clears flag and returns to `/login`
- Start/stop scripts for Mac, Linux, and Windows

### Completed (PL-5)
- Manual NDA form replaced entirely by AI chat panel (left column)
- Two OpenRouter calls per message: call 1 = conversational reply, call 2 = structured JSON field extraction
- NDA preview updates live as AI extracts fields; completion banner when all required fields gathered
- Role field validated as `Literal["user","assistant"]` to block prompt injection
- `httpx` added to backend dependencies

### Completed (PL-6)
- Model switched to `openai/gpt-oss-120b:free` (rate-limit workaround)
- AI detects document type in initial flow, then routes to per-document system prompts
- Per-document field extraction schemas for all 12 doc types (Mutual NDA, NDA Cover Page, CSA, Design Partner, SLA, PSA, DPA, Partnership, Software License, Pilot, BAA, AI Addendum)
- `FOLLOW_ON_RULE` in all system prompts ensures AI always asks a follow-up question
- `GenericPreview` component: field table with human-readable labels, ISO date formatting, iframe-based PDF download
- Mutual NDA uses rich `NDAPreview`; all other types use `GenericPreview`
- Fields reset cleanly when user switches document type mid-conversation
- Initial greeting stripped from messages sent to backend once doc type is known
- Chat input auto-focuses after every AI response
- `documentType` validated against `SUPPORTED_DOCS` on backend to prevent hallucinated names
- Numeric field values coerced to strings before filtering

### Completed (PL-7)
- Real authentication: bcrypt password hashing + JWT (7-day tokens); register and login endpoints with email uniqueness and minimum password length validation
- Document persistence: documents table in SQLite; users can save drafts via a "Save Document" button, browse saved docs at `/documents`, open them (restores fields in preview), and delete them
- Disclaimer footer on all document previews noting documents are AI-generated drafts subject to legal review
- Polish: user email shown in app header, My Documents nav link, sign-in/sign-up toggle on login page with real error messages, consistent brand-color Download PDF button
- 11 backend integration tests covering auth and document CRUD

### Current API Endpoints
- `GET /api/health` - Health check
- `GET /api/chat/greeting` - Returns AI greeting listing all supported document types
- `POST /api/chat/message` - Accepts `{messages, document_type}`, returns `{message, fields}`
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login, returns JWT token
- `GET /api/documents` - List saved documents for authenticated user
- `POST /api/documents` - Save a document
- `GET /api/documents/{id}` - Get a saved document
- `DELETE /api/documents/{id}` - Delete a saved document

### Pending
- No pending items