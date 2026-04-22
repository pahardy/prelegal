from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .chat import router as chat_router
from .database import init_db

load_dotenv()

app = FastAPI(title="PreLegal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)

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
