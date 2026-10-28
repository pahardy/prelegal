"""FastAPI application: API routes plus the statically exported frontend."""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from app.chat import ChatRequest, ChatResponse, chat
from app import templates
from app.db import init_db

FRONTEND_DIR = Path(os.environ.get("FRONTEND_DIR", "../frontend/out"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Prelegal", lifespan=lifespan)


@app.get("/api/health")
def health() -> dict[str, str]:
    """Report that the service is up."""
    return {"status": "ok"}


@app.post("/api/chat")
def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """Return the AI reply and the updated NDA values."""
    return chat(request)


@app.get("/api/templates")
def list_templates() -> list[dict]:
    """List the supported documents."""
    return [{"id": i, "name": d["name"], "description": d["description"]} for i, d in templates.catalog().items()]


@app.get("/api/templates/{document_id}")
def get_template(document_id: str) -> dict:
    """Return a document's template markdown files and key terms."""
    if document_id not in templates.catalog():
        raise HTTPException(status_code=404, detail="Unknown document")
    return templates.load(document_id)


if FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
