from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Motorcycle Maintenance Tracker"
    
    # Database
    DATABASE_URL: str = "sqlite:///./data/motorcycle_maintenance.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # File upload settings
    UPLOAD_DIR: str = "static/uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Locale settings (Europe/GMT+1 default)
    DEFAULT_TIMEZONE: str = "Europe/Amsterdam"
    DEFAULT_CURRENCY: str = "EUR"
    DEFAULT_DISTANCE_UNIT: str = "km"
    DEFAULT_VOLUME_UNIT: str = "L"
    DECIMAL_SEPARATOR: str = ","
    THOUSAND_SEPARATOR: str = "."

    class Config:
        case_sensitive = True

settings = Settings()
