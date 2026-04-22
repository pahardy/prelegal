import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .database import init_db

app = FastAPI(title="PreLegal API")

STATIC_DIR = Path(__file__).parent.parent / "frontend" / "out"


@app.on_event("startup")
def startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


# Serve static frontend — must come after API routes
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
else:
    @app.get("/")
    def root():
        return {"message": "Frontend not built. Run `npm run build` in frontend/."}
