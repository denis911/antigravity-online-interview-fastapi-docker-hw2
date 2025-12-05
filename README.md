# Coding Interview Platform

An end-to-end real-time collaborative coding interview platform built with FastAPI, HTMX, TailwindCSS, and CodeMirror.

## Features

- **Real-time Collaboration**: Multiple users can edit code simultaneously in the same room.
- **Multi-language Support**:
    - **Python**: Executed via Pyodide (WASM) in the browser.
    - **JavaScript**: Executed via the browser's native engine.
- **Secure Code Execution**: Code runs entirely in the browser. No user code is ever executed on the server.
- **Modern UI**: Clean, dark-themed interface using TailwindCSS.
- **Simplified Architecture**: No Node.js required. The FastAPI backend serves the frontend directly. No build steps, no complex toolchains—just run and go.
- **No Node.js**: Frontend dependencies are loaded via CDNs.

## Project Structure

```
.
├── backend/
│   ├── tests/            # Integration tests
│   │   ├── conftest.py
│   │   └── test_integration.py
│   ├── export_openapi.py # Script to generate OpenAPI JSON
│   ├── main.py           # FastAPI application entry point
│   ├── room_manager.py   # WebSocket connection manager
│   └── pyproject.toml    # Python dependencies
├── frontend/
│   ├── static/
│   │   └── js/
│   │       └── app.js    # Frontend logic (CodeMirror, WS, Pyodide)
│   └── templates/
│       └── index.html    # Main HTML template
├── AGENTS.md             # Agent rules
├── openapi.json          # Static OpenAPI specification
├── .dockerignore         # Docker build exclusions
├── PROJECT-FLOW.md       # Project flow and prompt
└── README.md             # This file
```

## Installation

This project uses `uv` for dependency management.

1.  **Install `uv`** (if not already installed):
    ```bash
    pip install uv
    ```

2.  **Sync Dependencies**:
    Navigate to the `backend` directory and run:
    ```bash
    cd backend
    uv sync
    ```

## Testing

To run the integration tests:

1.  **Install Test Dependencies**:
    ```bash
    cd backend
    uv add pytest httpx
    ```

2.  **Run Tests**:
    ```bash
    uv run pytest
    ```
    Or if you encounter issues with output capture:
    ```bash
    uv run python manual_test.py
    ```

## API Documentation

The backend provides automatic interactive API documentation.

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

A static copy of the OpenAPI specification is available in the root directory: `openapi.json`.
You can regenerate it by running:
```bash
cd backend
uv run python export_openapi.py
```

## Running with Docker

1.  **Build and Start**:
    ```bash
    docker compose up --build
    ```
    *Note: The project includes a `.dockerignore` file to prevent local files (like your local `.venv` or `__pycache__`) from interfering with the container build. This ensures the container always builds in a clean environment.*

2.  **Access the App**:
    Open [http://localhost:8000](http://localhost:8000) in your browser.

## Running Locally (without Docker)

1.  **Start the Backend**:
    From the `backend` directory:
    ```bash
    uv run uvicorn main:app --reload
    ```

2.  **Access the App**:
    Open your browser and navigate to:
    [http://localhost:8000](http://localhost:8000)

3.  **Select Language**:
    Use the dropdown in the header to switch between **Python** and **JavaScript**.
    - **Python**: Standard Python 3.11 environment via Pyodide.
    - **JavaScript**: Browser-based JavaScript execution. `console.log` output is captured and displayed in the output panel.

4.  **Collaborate**:
    - You will be redirected to a room (e.g., `/room/default-room`).
    - Open the same URL in another tab or window to see real-time updates.

5.  **Run Code**:
    - Type Python code in the editor.
    - Click the **Run Code** button.
    - Output will appear in the right-hand panel.

## Verification

Once running, you should see:
- **Server**: FastAPI backend running on `http://localhost:8000`.
- **Frontend**: Dark-themed UI with "Antigravity Code Interview" header.
- **Editor**: CodeMirror editor loaded with Python syntax highlighting.
- **Execution**: "Run Code" button active (Pyodide loads in background).

## Notes

- **Pyodide Loading**: The first time you load the page, Pyodide may take a few seconds to download the Python environment.
- **Persistence**: Room state is currently stored in-memory on the server. Restarting the server will clear all code.
