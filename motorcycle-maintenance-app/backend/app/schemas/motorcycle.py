# Copy this EXACTLY into: backend/app/schemas/motorcycle.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MotorcycleBase(BaseModel):
    name: str
    make: str
    model: str
    year: int
    engine_size: Optional[int] = None
    license_plate: Optional[str] = None
    vin: Optional[str] = None
    current_mileage: float = 0.0
    purchase_date: Optional[datetime] = None
    purchase_price: Optional[float] = None
    notes: Optional[str] = None


class MotorcycleCreate(MotorcycleBase):
    pass


class MotorcycleUpdate(BaseModel):
    name: Optional[str] = None
    current_mileage: Optional[float] = None
    is_active: Optional[bool] = None
    is_archived: Optional[bool] = None
    notes: Optional[str] = None


class MotorcycleResponse(MotorcycleBase):
    id: int
    is_active: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True