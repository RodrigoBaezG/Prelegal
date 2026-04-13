import os
import warnings
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import init_db
from .routers.chat import router as chat_router
from .routers.auth import router as auth_router
from .routers.documents import router as documents_router

STATIC_DIR = os.getenv("STATIC_DIR", "/app/frontend/out")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not os.getenv("JWT_SECRET"):
        warnings.warn(
            "JWT_SECRET is not set — using insecure default. Never deploy this to production.",
            stacklevel=1,
        )
    init_db()
    yield


app = FastAPI(title="Prelegal API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth")
app.include_router(chat_router, prefix="/api/chat")
app.include_router(documents_router, prefix="/api/documents")


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Serve Next.js static export — must be last so API routes take priority
if os.path.isdir(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
