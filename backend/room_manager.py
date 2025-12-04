import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class RoomManager:
    """
    Manages active coding rooms and connected clients.
    """
    def __init__(self):
        # room_id -> set of WebSockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # room_id -> current code content (simple in-memory state)
        self.room_state: Dict[str, str] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        """
        Accepts a WebSocket connection and adds it to the room.
        """
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = set()
            self.room_state[room_id] = ""  # Initialize empty code
        
        self.active_connections[room_id].add(websocket)
        logger.info(f"Client connected to room {room_id}. Total clients: {len(self.active_connections[room_id])}")

        # Send current state to the new client
        await websocket.send_json({
            "type": "init",
            "content": self.room_state[room_id]
        })

    def disconnect(self, websocket: WebSocket, room_id: str):
        """
        Removes a WebSocket connection from the room.
        """
        if room_id in self.active_connections:
            self.active_connections[room_id].discard(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
                # Optional: Clear room state when empty or keep it? 
                # Keeping it for now so state persists if everyone leaves and comes back briefly.
                # del self.room_state[room_id] 
            logger.info(f"Client disconnected from room {room_id}")

    async def broadcast(self, message: dict, room_id: str, sender: WebSocket):
        """
        Broadcasts a message to all clients in the room except the sender.
        """
        if room_id not in self.active_connections:
            return

        # Update server-side state if it's a code update
        if message.get("type") == "update":
            self.room_state[room_id] = message.get("content", "")

        for connection in self.active_connections[room_id]:
            if connection != sender:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to client: {e}")

manager = RoomManager()
