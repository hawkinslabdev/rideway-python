# backend/app/api/v1/api.py
from fastapi import APIRouter
from app.api.v1.endpoints import motorcycles, maintenance, parts, logs, webhooks, dashboard

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(motorcycles.router, prefix="/motorcycles", tags=["motorcycles"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["maintenance"])
api_router.include_router(parts.router, prefix="/parts", tags=["parts"])
api_router.include_router(logs.router, prefix="/logs", tags=["logs"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

# Add health check at API level
@api_router.get("/health")
async def api_health_check():
    return {"status": "healthy", "message": "API v1 is running"}

# Add test endpoint
@api_router.get("/test")
async def test_endpoint():
    return {"message": "API test successful", "status": "ok"}

# Debug: Print all routes
print("API Router Routes:")
for route in api_router.routes:
    print(f"  {route.methods} {route.path}")