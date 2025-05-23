# backend/app/schemas/maintenance.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.maintenance import ServiceType


class MaintenanceBase(BaseModel):
    motorcycle_id: int
    service_type: ServiceType
    service_name: str
    description: Optional[str] = None
    mileage_at_service: float
    service_interval_km: Optional[float] = None
    service_interval_months: Optional[int] = None
    labor_cost: float = 0.0
    parts_cost: float = 0.0
    total_cost: float = 0.0
    currency: str = "EUR"
    service_provider: Optional[str] = None
    technician: Optional[str] = None
    receipt_path: Optional[str] = None
    photos: Optional[str] = None  # JSON string of photo paths
    installation_notes: Optional[str] = None


class MaintenanceCreate(MaintenanceBase):
    performed_at: datetime
    is_completed: bool = True
    is_scheduled: bool = False


class MaintenanceUpdate(BaseModel):
    service_name: Optional[str] = None
    description: Optional[str] = None
    performed_at: Optional[datetime] = None
    mileage_at_service: Optional[float] = None
    service_interval_km: Optional[float] = None
    service_interval_months: Optional[int] = None
    labor_cost: Optional[float] = None
    parts_cost: Optional[float] = None
    total_cost: Optional[float] = None
    service_provider: Optional[str] = None
    technician: Optional[str] = None
    receipt_path: Optional[str] = None
    photos: Optional[str] = None
    installation_notes: Optional[str] = None
    is_completed: Optional[bool] = None
    is_scheduled: Optional[bool] = None


class MaintenanceResponse(MaintenanceBase):
    id: int
    performed_at: datetime
    next_service_mileage: Optional[float] = None
    next_service_date: Optional[datetime] = None
    is_completed: bool
    is_scheduled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MaintenanceBulkComplete(BaseModel):
    maintenance_ids: List[int]


class UpcomingMaintenanceItem(BaseModel):
    id: int
    motorcycle_id: int
    motorcycle_name: str
    service_name: str
    service_type: ServiceType
    due_date: Optional[datetime] = None
    due_mileage: Optional[float] = None
    current_mileage: float
    is_overdue: bool
    days_overdue: Optional[int] = None
    mileage_overdue: Optional[float] = None
    priority: str  # 'low', 'medium', 'high'


class MaintenanceCostSummary(BaseModel):
    total_cost: float
    labor_cost: float
    parts_cost: float
    record_count: int
    average_cost: float