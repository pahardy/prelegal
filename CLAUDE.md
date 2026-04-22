# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory. The user can carry out an AI chat in order to establish what document they want and how to fill in the fields. The available documents are covered in the 'catalog.json' file in the project root, included here:

@catalog.json

The Mutual NDA is the only document currently implemented, with a full AI chat interface.

## Development process

When instructed to build a feature: 1. Use your GitHub tools to read the feature instructions. 2. Develop the feature - do not skip any step from the feature-dev 7 step process. 3. Thoroughly test the feature with unit tests and integration tests and fix any issues. 4. Submit a PR using your GitHub tools.

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OpenRouter API key in the `.env` file in the project root.

## Technical design

The entire project should be packaged into a Docker container.
The backend should be in `backend/` and be a `uv` project, using FastAPI. The frontend should be in `frontend/`.
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a `users` table with sign up and sign in.
The frontend is statically built (`next build` with `output: "export"`) and served by FastAPI via `StaticFiles`. Scripts exist in `scripts/` for:

```
# Mac
scripts/start-mac.sh  # Start
scripts/stop-mac.sh.  # Stop

# Linux
scripts/start-linux.sh.    # Start
scripts/stop-linux.sh.     # Stop

# Windows
scripts/start-windows.ps1   # Start
scripts/stop-windows.ps1    # Stop
```

## What has been implemented

- **Login page** (`/login`): fake auth — any non-empty email/password stores the user in localStorage and redirects to the dashboard. No backend call.
- **Dashboard** (`/`): shows all 12 document types as cards. Mutual NDA is active; all others show "Coming Soon".
- **Mutual NDA AI chat** (`/nda`): split-panel layout — AI chat on the left gathers NDA fields conversationally, live document preview on the right updates in real time. Download (.md / PDF) available once all fields are complete.
- **Navbar**: shared component with the PreLegal brand and a sign-out button.
- **Backend** (`backend/`): FastAPI uv project. Starts an SQLite DB at `$DB_PATH` (default `/data/prelegal.db`) with a `users` table. Serves the static frontend. Health check at `/health`. `/api/chat` endpoint drives AI chat using LiteLLM + OpenRouter (Cerebras) with structured outputs.
- **Docker**: multi-stage `Dockerfile` builds the frontend then runs the backend. `docker-compose.yml` mounts a named volume for the DB and passes `OPENROUTER_API_KEY` from `.env`. **Always rebuild with `--no-cache`** when frontend source changes to avoid stale layer cache: `docker compose build --no-cache && docker compose up -d`.
- **Scripts**: all six start/stop scripts are in place and working.

# Color scheme

-Accent Yellow: `#ecad0a`  
-Blue Primary: `#209dd7`  
-Purple Secondary: `#753991` (submit buttons)  
-Dark Navy: `#032147` (headings)  
-Gray Text: `#888888`
