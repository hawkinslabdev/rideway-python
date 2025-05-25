# backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import logging
from contextlib import asynccontextmanager
import os
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, create_tables
from app.api.v1.api import api_router

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    
    # Create directories if they don't exist
    os.makedirs("data", exist_ok=True)
    os.makedirs("static/uploads", exist_ok=True)
    
    # Create database tables
    create_tables()
    logger.info("Database tables created")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="Motorcycle Maintenance Tracker API",
    description="API for tracking motorcycle maintenance, parts, and service records",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS middleware - Configure properly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"{request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"Response: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request failed: {str(e)}")
        raise

# Mount static files for uploads
try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
except Exception as e:
    logger.warning(f"Could not mount static files: {e}")

# Include API router
print(f"API_V1_STR setting: {settings.API_V1_STR}")
app.include_router(api_router, prefix=settings.API_V1_STR)

# Debug: Print all registered routes
print("All registered routes:")
for route in app.routes:
    if hasattr(route, 'methods') and hasattr(route, 'path'):
        print(f"  {route.methods} {route.path}")
    else:
        print(f"  {type(route)} {getattr(route, 'path', 'no path')}")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Motorcycle Maintenance Tracker API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Health check endpoint (root level)
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

# 404 handler
@app.exception_handler(404)
async def not_found_handler(request, exc):
    logger.warning(f"404 Not Found: {request.url}")
    return JSONResponse(
        status_code=404,
        content={"detail": f"Not found: {request.url.path}"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8060,
        reload=True,
        log_level="info"
    )