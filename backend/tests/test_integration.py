import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert "Antigravity Code Interview" in response.text

def test_websocket_connection():
    with client.websocket_connect("/ws/test-room/client1") as websocket:
        data = websocket.receive_json()
        assert data["type"] == "init"
        assert data["content"] == ""

        # Send an update
        websocket.send_json({"type": "update", "content": "print('Hello')"})
        
        # We don't receive our own broadcast in the current implementation
        # So we connect a second client to verify broadcast
        
        with client.websocket_connect("/ws/test-room/client2") as websocket2:
            # Client 2 should receive init with current state
            data2 = websocket2.receive_json()
            assert data2["type"] == "init"
            assert data2["content"] == "print('Hello')"
            
            # Client 1 sends another update
            websocket.send_json({"type": "update", "content": "print('Hello World')"})
            
            # Client 2 should receive the update
            data2_update = websocket2.receive_json()
            assert data2_update["type"] == "update"
            assert data2_update["content"] == "print('Hello World')"
