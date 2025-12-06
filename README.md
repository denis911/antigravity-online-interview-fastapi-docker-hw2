# Antigravity Coding Interview Platform

An end-to-end, real-time collaborative coding interview platform designed for simplicity, privacy, and ease of deployment.

## Why use this?

*   **Privacy Focused**: The application is stateless. Once the server stops or restarts, all code and session data is wiped. No databases, no persistent logs.
*   **Instant Deployment**: Deploys to Render (and other Docker-compatible platforms) in minutes. Spin it up for an interview, shut it down afterwards.
*   **Zero Client Setup**: Candidates only need a web browser. No plugins, no account creation.
*   **Full Power**: Supports both Python (via WASM) and JavaScript execution directly in the browser.

## Technology Stack

We deliberately chose a stack that avoids the complexity of modern frontend build chains while delivering a rigorous, production-grade experience.

### Backend: Python & FastAPI
*   **FastAPI**: Chosen for its speed, automatic OpenAPI documentation, and native WebSocket support.
*   **Uvicorn**: A lightning-fast ASGI server.
*   **Python 3.12+**: Leveraging modern Python features.
*   **No Database**: We use an in-memory `RoomManager` to handle synchronization. This ensures privacy and simplifies operations.

### Frontend: No-Build Architecture
*   **HTMX**: Handles dynamic interactions without the overhead of React/Vue/Angular.
*   **TailwindCSS (CDN)**: styling without complex PostCSS build steps.
*   **CodeMirror 6**: A professional-grade code editor component.
*   **Pyodide**: Runs a full Python interpreter inside the browser via WebAssembly (WASM). This means users can execute arbitrary Python code **safely** without risking your server security.

## Live Demo

**Deployed for testing purposes at:**
[https://coding-interview-platform-q4y5.onrender.com/room/default-room](https://coding-interview-platform-q4y5.onrender.com/room/default-room)
*(Note: This link may go offline as the service is stateless and ephemeral)*

## Project Structure

```
.
├── backend/
│   ├── main.py           # FastAPI app & endpoints
│   ├── room_manager.py   # WebSocket logic & state management
│   ├── export_openapi.py # Helper to generate openapi.json
│   ├── tests/            # Integration tests
│   ├── pyproject.toml    # Dependencies (uv)
│   └── uv.lock
├── frontend/
│   ├── static/           # JS & CSS assets
│   │   └── js/
│   │       └── app.js    # Client-side logic (Editor, WS, Pyodide)
│   └── templates/        # Jinja2 HTML templates
├── render.yaml           # Render deployment blueprint
├── Dockerfile            # Container definition
├── AGENTS.md             # AI Agent Context
└── README.md             # This file
```

## Installation & Local Development

This project uses `uv` for lightning-fast Python package management.

1.  **Install uv**:
    ```bash
    pip install uv
    ```

2.  **Run Locally**:
    ```bash
    cd backend
    uv sync
    uv run uvicorn main:app --reload
    ```
    Open [http://localhost:8000](http://localhost:8000).

3.  **Run with Docker**:
    ```bash
    docker compose up --build
    ```

## Deployment on Render

This project is configured for one-click deployment on Render.

1.  **Fork this repo**.
2.  **Create Blueprint** on Render dashboard.
3.  **Connect Repo**: Render detects `render.yaml` and auto-configures the service.
4.  **Done**: The `PORT` variable is handled automatically.

**To stop the service:**
simply suspend or delete the Web Service in the Render dashboard. No data is left behind.

## API Documentation

*   **Swagger UI**: `/docs`
*   **OpenAPI JSON**: `/openapi.json`
