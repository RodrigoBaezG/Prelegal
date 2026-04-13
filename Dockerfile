# Stage 1: Build Next.js static export
FROM node:20-slim AS frontend-builder

WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python/FastAPI backend serving static frontend
FROM python:3.12-slim AS backend

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy backend source and install dependencies
COPY backend/pyproject.toml ./
RUN uv pip install --system fastapi "uvicorn[standard]" python-multipart httpx "bcrypt>=4.0.0" "python-jose[cryptography]"

COPY backend/app ./app

# Copy built frontend
COPY --from=frontend-builder /build/frontend/out ./frontend/out

ENV STATIC_DIR=/app/frontend/out
ENV DB_PATH=/data/prelegal.db

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
