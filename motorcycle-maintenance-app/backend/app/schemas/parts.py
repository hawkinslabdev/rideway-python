# backend/app/schemas/parts.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PartBase(BaseModel):
    motorcycle_id: int
    name: str
    part_number: Optional[str] = None
    manufacturer: Optional[str] = None
    category: Optional[str] = None
    quantity_in_stock: int = 0
    quantity_used: int = 0
    unit_price: Optional[float] = None
    total_cost: Optional[float] = None
    currency: str = "EUR"
    vendor: Optional[str] = None
    replacement_interval_km: Optional[float] = None
    replacement_interval_months: Optional[int] = None
    receipt_path: Optional[str] = None
    installation_notes: Optional[str] = None
    is_installed: bool = False
    is_consumable: bool = False


class PartCreate(PartBase):
    purchase_date: Optional[datetime] = None
    installed_date: Optional[datetime] = None
    installed_mileage: Optional[float] = None


class PartUpdate(BaseModel):
    name: Optional[str] = None
    part_number: Optional[str] = None
    manufacturer: Optional[str] = None
    category: Optional[str] = None
    quantity_in_stock: Optional[int] = None
    quantity_used: Optional[int] = None
    unit_price: Optional[float] = None
    total_cost: Optional[float] = None
    vendor: Optional[str] = None
    purchase_date: Optional[datetime] = None
    installed_date: Optional[datetime] = None
    installed_mileage: Optional[float] = None
    replacement_interval_km: Optional[float] = None
    replacement_interval_months: Optional[int] = None
    receipt_path: Optional[str] = None
    installation_notes: Optional[str] = None
    is_installed: Optional[bool] = None
    is_consumable: Optional[bool] = None


class PartResponse(PartBase):
    id: int
    purchase_date: Optional[datetime] = None
    installed_date: Optional[datetime] = None
    installed_mileage: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PartUse(BaseModel):
    quantity: int


class PartRestock(BaseModel):
    quantity: int
    unit_price: Optional[float] = None


class PartExpenseSummary(BaseModel):
    total_cost: float
    total_parts: int
    total_stock_value: float
    average_part_cost: float
    category_breakdown: dict