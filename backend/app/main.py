"""FastAPI application: API routes plus the statically exported frontend."""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

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


if FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
