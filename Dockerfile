FROM node:22-slim AS frontend
WORKDIR /build
COPY frontend ./frontend
WORKDIR /build/frontend
RUN npm ci && npm run build

FROM python:3.14-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app/backend
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev
COPY backend/app ./app
COPY templates /app/templates
COPY catalog.json /app/catalog.json
COPY --from=frontend /build/frontend/out /app/frontend/out
ENV FRONTEND_DIR=/app/frontend/out DB_PATH=/app/prelegal.db
EXPOSE 8000
CMD ["uv", "run", "--no-dev", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
