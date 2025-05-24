# backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import logging
from contextlib import asynccontextmanager

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

# CORS middleware - Allow all for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"{request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response

# Static files for uploads (receipts, photos)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return {"message": "Motorcycle Maintenance Tracker API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    logger.info("Health check called")
    return {"status": "healthy", "message": "API is running"}

# Add a test endpoint to debug
@app.get("/api/v1/test")
async def test_endpoint():
    logger.info("Test endpoint called")
    return {"message": "Test successful", "status": "ok"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8060,
        reload=True,
        log_level="info"
    )