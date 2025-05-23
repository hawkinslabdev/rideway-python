from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from app.core.database import Base


class WebhookConfig(Base):
    __tablename__ = "webhook_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Webhook details
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    secret = Column(String)  # For webhook signature verification
    
    # Configuration
    is_active = Column(Boolean, default=True)
    event_types = Column(Text)  # JSON array of event types
    
    # Service type (Discord, Slack, Generic, etc.)
    service_type = Column(String, default="generic")
    
    # Retry settings
    max_retries = Column(Integer, default=3)
    retry_delay = Column(Integer, default=60)  # seconds
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    last_triggered = Column(DateTime)
    
    # Statistics
    total_calls = Column(Integer, default=0)
    successful_calls = Column(Integer, default=0)
    failed_calls = Column(Integer, default=0)