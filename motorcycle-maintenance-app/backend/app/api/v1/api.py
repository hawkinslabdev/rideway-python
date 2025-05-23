from fastapi import APIRouter

from app.api.v1.endpoints import motorcycles, maintenance, parts, webhooks, dashboard

api_router = APIRouter()

api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["dashboard"]
)

api_router.include_router(
    motorcycles.router,
    prefix="/motorcycles",
    tags=["motorcycles"]
)

api_router.include_router(
    maintenance.router,
    prefix="/maintenance", 
    tags=["maintenance"]
)

api_router.include_router(
    parts.router,
    prefix="/parts",
    tags=["parts"]
)

api_router.include_router(
    webhooks.router,
    prefix="/webhooks",
    tags=["webhooks"]
)