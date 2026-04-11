import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .database import init_db
from .routers.chat import router as chat_router

STATIC_DIR = os.getenv("STATIC_DIR", "/app/frontend/out")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Prelegal API", lifespan=lifespan)

app.include_router(chat_router, prefix="/api/chat")


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Serve Next.js static export — must be last so API routes take priority
if os.path.isdir(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
