# Use Python 3.12 slim image
FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set working directory
# Set working directory
WORKDIR /app

# Configure uv to use a specific environment location invisible to volume mounts
ENV UV_PROJECT_ENVIRONMENT="/app/.venv"

# Copy dependency files first to leverage cache
COPY backend/pyproject.toml backend/uv.lock /app/backend/

# Install dependencies
WORKDIR /app/backend
RUN uv sync --frozen --no-install-project

# Copy the rest of the application
COPY backend /app/backend
COPY frontend /app/frontend

# Add virtual environment to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Expose port
EXPOSE 8000

# Run the application
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
