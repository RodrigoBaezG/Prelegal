# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation has the V1 foundation in place: Docker-containerised FastAPI backend, statically-served Next.js frontend, SQLite database, and a fake login screen. The Mutual NDA creator prototype (from PL-3) is included in the frontend.

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

### Current API Endpoints
- `GET /api/health` - Health check

### Pending
- PL-5: AI chat interface for document creation
- PL-6: Support for all 11 document types
- PL-7: Real user authentication and document persistence