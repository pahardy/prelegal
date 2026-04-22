# Stage 1: build static frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: run FastAPI backend serving static files
FROM python:3.11-slim
WORKDIR /app

# Install uv
RUN pip install uv

# Copy backend project files
COPY backend/pyproject.toml backend/uv.lock* ./
RUN uv sync --no-dev

# Copy backend source
COPY backend/ .

# Copy built frontend into expected location
COPY --from=frontend-builder /app/frontend/out ./frontend/out

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
