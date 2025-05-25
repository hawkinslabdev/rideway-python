# backend/debug_routes.py
# Run this to debug route registration issues

from fastapi import FastAPI
from app.core.config import settings

# Try to import each router individually to see where the problem is
try:
    from app.api.v1.endpoints import motorcycles
    print("✓ motorcycles router imported successfully")
except Exception as e:
    print(f"✗ motorcycles router import failed: {e}")

try:
    from app.api.v1.endpoints import maintenance
    print("✓ maintenance router imported successfully")
except Exception as e:
    print(f"✗ maintenance router import failed: {e}")

try:
    from app.api.v1.endpoints import parts
    print("✓ parts router imported successfully")
except Exception as e:
    print(f"✗ parts router import failed: {e}")

try:
    from app.api.v1.endpoints import logs
    print("✓ logs router imported successfully")
except Exception as e:
    print(f"✗ logs router import failed: {e}")

try:
    from app.api.v1.endpoints import webhooks
    print("✓ webhooks router imported successfully")
except Exception as e:
    print(f"✗ webhooks router import failed: {e}")

try:
    from app.api.v1.endpoints import dashboard
    print("✓ dashboard router imported successfully")
except Exception as e:
    print(f"✗ dashboard router import failed: {e}")

# Try to import the main API router
try:
    from app.api.v1.api import api_router
    print("✓ API router imported successfully")
    
    # Print all registered routes
    print("\nRegistered routes:")
    for route in api_router.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            print(f"  {list(route.methods)} {route.path}")
            
except Exception as e:
    print(f"✗ API router import failed: {e}")

if __name__ == "__main__":
    print("Route debugging complete")