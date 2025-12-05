import json
import argparse
from main import app

def export_openapi(output_path: str):
    openapi_data = app.openapi()
    with open(output_path, "w") as f:
        json.dump(openapi_data, f, indent=2)
    print(f"OpenAPI specification exported to {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export OpenAPI specification")
    parser.add_argument("--output", default="../openapi.json", help="Output file path")
    args = parser.parse_args()
    
    export_openapi(args.output)
