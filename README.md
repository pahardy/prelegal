# Prelegal

Work in progress. This project is under active development and is expected to be complete in a few days.

## Run

Requires Docker and an `OPENROUTER_API_KEY` in `.env`.

```bash
scripts/start-mac.sh   # build and start at http://localhost:8000
scripts/stop-mac.sh    # stop
```

## Layout

- `frontend/` - Next.js, statically exported and served by FastAPI
- `backend/` - FastAPI uv project; SQLite database recreated on every start
- `templates/` - legal document templates
