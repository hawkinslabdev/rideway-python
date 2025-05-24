# backend/app/schemas/logs.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LogBase(BaseModel):
    motorcycle_id: int
    start_date: datetime
    start_mileage: float
    end_date: Optional[datetime] = None
    end_mileage: Optional[float] = None
    fuel_consumed: Optional[float] = None
    fuel_cost: Optional[float] = None
    start_location: Optional[str] = None
    end_location: Optional[str] = None
    route_description: Optional[str] = None
    weather_conditions: Optional[str] = None
    road_conditions: Optional[str] = None
    trip_type: Optional[str] = None
    notes: Optional[str] = None


class LogCreate(LogBase):
    pass


class LogUpdate(BaseModel):
    end_date: Optional[datetime] = None
    end_mileage: Optional[float] = None
    fuel_consumed: Optional[float] = None
    fuel_cost: Optional[float] = None
    end_location: Optional[str] = None
    route_description: Optional[str] = None
    weather_conditions: Optional[str] = None
    road_conditions: Optional[str] = None
    trip_type: Optional[str] = None
    notes: Optional[str] = None


class LogResponse(LogBase):
    id: int
    distance: Optional[float] = None
    fuel_efficiency: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LogSummary(BaseModel):
    total_rides: int
    total_distance: float
    total_fuel: float
    total_fuel_cost: float
    average_efficiency: float
    most_common_trip_type: Optional[str] = None


class FuelStatistics(BaseModel):
    total_fuel_consumed: float
    total_fuel_cost: float
    average_price_per_liter: float
    best_efficiency: Optional[dict] = None
    worst_efficiency: Optional[dict] = None
    average_efficiency: float