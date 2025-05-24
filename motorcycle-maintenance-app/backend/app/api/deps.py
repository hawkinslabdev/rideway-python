# backend/app/api/deps.py
from app.core.database import get_db

# Re-export for convenience
__all__ = ["get_db"]