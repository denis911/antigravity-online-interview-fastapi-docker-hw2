import logging
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

from room_manager import manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Coding Interview Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount static files
# We assume the frontend folder is at the same level as backend
# Adjust path if running from root or backend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), "frontend")
STATIC_DIR = os.path.join(FRONTEND_DIR, "static")
TEMPLATES_DIR = os.path.join(FRONTEND_DIR, "templates")

# Ensure directories exist (they will be created by the agent next, but good for safety)
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=TEMPLATES_DIR)

@app.get("/", response_class=HTMLResponse)
async def get_home(request: Request):
    """
    Renders the homepage.

    Returns:
        TemplateResponse: The index.html template.
    """
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/room/{room_id}", response_class=HTMLResponse)
async def get_room(request: Request, room_id: str):
    """
    Renders the collaborative coding room.

    Args:
        room_id (str): The unique identifier for the room.

    Returns:
        TemplateResponse: The index.html template with room_id context.
    """
    return templates.TemplateResponse("index.html", {"request": request, "room_id": room_id})

@app.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    """
    WebSocket endpoint for real-time collaboration.
    
    Handles:
    - Connection establishment
    - Message broadcasting
    - Disconnection cleanup

    Args:
        websocket (WebSocket): The active WebSocket connection.
        room_id (str): The room identifier.
        client_id (str): Unique client identifier.
    """
    logger.info(f"WebSocket connection attempt: Room={room_id}, Client={client_id}")
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Broadcast the received data to other clients in the room
            await manager.broadcast(data, room_id, websocket)
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: Room={room_id}, Client={client_id}")
        manager.disconnect(websocket, room_id)
        await manager.broadcast({"type": "user_left", "client_id": client_id}, room_id, websocket)
