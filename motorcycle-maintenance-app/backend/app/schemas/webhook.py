# backend/app/schemas/webhook.py
from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime


class WebhookBase(BaseModel):
    name: str
    url: HttpUrl
    secret: Optional[str] = None
    is_active: bool = True
    event_types: Optional[List[str]] = None
    service_type: str = "generic"
    max_retries: int = 3
    retry_delay: int = 60


class WebhookCreate(WebhookBase):
    pass


class WebhookUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[HttpUrl] = None
    secret: Optional[str] = None
    is_active: Optional[bool] = None
    event_types: Optional[List[str]] = None
    service_type: Optional[str] = None
    max_retries: Optional[int] = None
    retry_delay: Optional[int] = None


class WebhookResponse(WebhookBase):
    id: int
    created_at: datetime
    updated_at: datetime
    last_triggered: Optional[datetime] = None
    total_calls: int
    successful_calls: int
    failed_calls: int

    class Config:
        from_attributes = True


class WebhookStats(BaseModel):
    total_calls: int
    successful_calls: int
    failed_calls: int
    success_rate: float
    last_triggered: Optional[datetime] = None