from fastapi.testclient import TestClient
from main import app
import sys

def run_test():
    client = TestClient(app)
    print("Connecting to WebSocket...")
    try:
        with client.websocket_connect("/ws/test-room/client1") as websocket:
            print("Connected!")
            data = websocket.receive_json()
            print(f"Received: {data}")
            
            websocket.send_json({"type": "update", "content": "test"})
            print("Sent update")
            
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_test()
