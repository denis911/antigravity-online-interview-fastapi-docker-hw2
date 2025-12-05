# Initial Prompt

> [!IMPORTANT]
> Before doing anything, read and load all rules from `AGENTS.md`. Treat `AGENTS.md` as the primary instruction source for this project. You must follow it throughout the entire session.

---

I am starting a new project. Your task is to implement an end-to-end coding interview platform as required in the homework spec below. You must generate a full working solution (frontend + backend), with clean directory structure, and follow `AGENTS.md`.

## Project Requirements

Build an application for online coding interviews with:
- Ability to generate a shareable link for candidates
- Anyone with the link can collaboratively edit code in a shared editor
- Real-time synchronization between all connected users
- Syntax highlighting for multiple languages
- Safe code execution inside the browser (e.g., WebContainers or Pyodide sandbox)
- Frontend + Backend working together

Produce the full implementation in one run (“initial implementation prompt”)

## Technology Stack I Want

I do **NOT** want React or Node.js.
Use this stack instead:

---

### Backend
- Python 3.12+
- FastAPI
- WebSockets for real-time code sync
- Uvicorn as ASGI server
- A simple in-memory room/session manager
- Provide OpenAPI docs

---

### Frontend
- HTMX for dynamic UI without React
- TailwindCSS for styling

**A collaborative code editor:**
- Use CodeMirror 6 (works with HTMX fine)
- Real-time sync via HTMX WebSocket extension or vanilla WebSocket
- Support code execution using either:
  - Pyodide, or
  - a small sandboxed WebContainer alternative (JS-based execution is acceptable)

---

## Deliverables

You must output:
- Full project folder structure
- Complete backend code (FastAPI + websocket logic)
- Complete frontend (HTMX templates, Tailwind config, CodeMirror setup)
- Code execution sandbox implementation

---

## Instructions

Instructions should be inside the `README.md` file:
- How to install dependencies
- How to run backend
- How to serve frontend
- Any build scripts needed
- Additional improvements if needed

---

## Your Tasks
- Read and apply the rules from `AGENTS.md`.
- Create the complete project skeleton.
- Implement backend + frontend in full.
- Use clean, production-ready organization.
- Write all code in a single response.
- Do NOT omit any file that is required to run the system.

---

Begin the initial implementation now.

# TESTS:

- [x] Integration tests created (`backend/tests/test_integration.py`)
- [x] WebSocket connection verified (Fixed `app.js` imports and added CORS)
- [x] Manual test script provided (`backend/manual_test.py`)

# OpenAPI:

- [x] OpenAPI specification generated (`openapi.json` in root)
- [x] Export script created (`backend/export_openapi.py`)
- [x] Documentation updated in README

