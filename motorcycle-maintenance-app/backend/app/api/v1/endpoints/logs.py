# backend/app/api/v1/endpoints/logs.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.logs import RideLog
from app.models.motorcycle import Motorcycle
from app.schemas.logs import LogCreate, LogUpdate, LogResponse

router = APIRouter()

@router.get("/", response_model=List[LogResponse])
async def get_ride_logs(
    skip: int = 0,
    limit: int = 100,
    motorcycle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get ride logs with optional filtering"""
    query = db.query(RideLog)
    if motorcycle_id:
        query = query.filter(RideLog.motorcycle_id == motorcycle_id)
    
    logs = query.offset(skip).limit(limit).all()
    return logs

@router.post("/", response_model=LogResponse)
async def create_ride_log(
    log_data: LogCreate,
    db: Session = Depends(get_db)
):
    """Create a new ride log"""
    # Verify motorcycle exists
    motorcycle = db.query(Motorcycle).filter(Motorcycle.id == log_data.motorcycle_id).first()
    if not motorcycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Motorcycle not found"
        )
    
    # Calculate distance if end mileage provided
    distance = None
    if log_data.end_mileage and log_data.start_mileage:
        distance = log_data.end_mileage - log_data.start_mileage
    
    # Calculate fuel efficiency if fuel consumed provided
    fuel_efficiency = None
    if distance and log_data.fuel_consumed and log_data.fuel_consumed > 0:
        fuel_efficiency = distance / log_data.fuel_consumed  # km/L
    
    db_log = RideLog(
        **log_data.dict(),
        distance=distance,
        fuel_efficiency=fuel_efficiency
    )
    
    # Update motorcycle mileage if end mileage is provided
    if log_data.end_mileage and log_data.end_mileage > motorcycle.current_mileage:
        motorcycle.current_mileage = log_data.end_mileage
    
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/summary/{motorcycle_id}")
async def get_ride_summary(
    motorcycle_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get ride summary statistics for a motorcycle"""
    query = db.query(RideLog).filter(RideLog.motorcycle_id == motorcycle_id)
    
    if start_date:
        query = query.filter(RideLog.start_date >= start_date)
    if end_date:
        query = query.filter(RideLog.start_date <= end_date)
    
    logs = query.all()
    
    if not logs:
        return {
            "total_rides": 0,
            "total_distance": 0,
            "total_fuel": 0,
            "total_fuel_cost": 0,
            "average_efficiency": 0,
            "most_common_trip_type": None
        }
    
    total_distance = sum(log.distance or 0 for log in logs)
    total_fuel = sum(log.fuel_consumed or 0 for log in logs)
    total_fuel_cost = sum(log.fuel_cost or 0 for log in logs)
    
    # Calculate average fuel efficiency
    efficiency_logs = [log for log in logs if log.fuel_efficiency]
    average_efficiency = sum(log.fuel_efficiency for log in efficiency_logs) / len(efficiency_logs) if efficiency_logs else 0
    
    # Find most common trip type
    trip_types = {}
    for log in logs:
        if log.trip_type:
            trip_types[log.trip_type] = trip_types.get(log.trip_type, 0) + 1
    
    most_common_trip = max(trip_types, key=trip_types.get) if trip_types else None
    
    return {
        "total_rides": len(logs),
        "total_distance": total_distance,
        "total_fuel": total_fuel,
        "total_fuel_cost": total_fuel_cost,
        "average_efficiency": average_efficiency,
        "most_common_trip_type": most_common_trip
    }

@router.get("/{log_id}", response_model=LogResponse)
async def get_ride_log(
    log_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific ride log"""
    log = db.query(RideLog).filter(RideLog.id == log_id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride log not found"
        )
    return log

@router.put("/{log_id}", response_model=LogResponse)
async def update_ride_log(
    log_id: int,
    log_update: LogUpdate,
    db: Session = Depends(get_db)
):
    """Update a ride log"""
    db_log = db.query(RideLog).filter(RideLog.id == log_id).first()
    if not db_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride log not found"
        )
    
    update_data = log_update.dict(exclude_unset=True)
    
    # Recalculate distance if mileage changed
    if 'end_mileage' in update_data or 'start_mileage' in update_data:
        start = update_data.get('start_mileage', db_log.start_mileage)
        end = update_data.get('end_mileage', db_log.end_mileage)
        if start and end:
            update_data['distance'] = end - start
    
    # Recalculate fuel efficiency
    distance = update_data.get('distance', db_log.distance)
    fuel = update_data.get('fuel_consumed', db_log.fuel_consumed)
    if distance and fuel and fuel > 0:
        update_data['fuel_efficiency'] = distance / fuel
    
    for field, value in update_data.items():
        setattr(db_log, field, value)
    
    # Update motorcycle mileage if needed
    if db_log.end_mileage:
        motorcycle = db.query(Motorcycle).filter(Motorcycle.id == db_log.motorcycle_id).first()
        if motorcycle and db_log.end_mileage > motorcycle.current_mileage:
            motorcycle.current_mileage = db_log.end_mileage
    
    db.commit()
    db.refresh(db_log)
    return db_log

@router.delete("/{log_id}")
async def delete_ride_log(
    log_id: int,
    db: Session = Depends(get_db)
):
    """Delete a ride log"""
    db_log = db.query(RideLog).filter(RideLog.id == log_id).first()
    if not db_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride log not found"
        )
    
    db.delete(db_log)
    db.commit()
    return {"message": "Ride log deleted successfully"}

@router.get("/fuel/statistics")
async def get_fuel_statistics(
    motorcycle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get fuel consumption statistics"""
    query = db.query(RideLog).filter(
        RideLog.fuel_consumed.isnot(None),
        RideLog.fuel_consumed > 0
    )
    
    if motorcycle_id:
        query = query.filter(RideLog.motorcycle_id == motorcycle_id)
    
    logs = query.all()
    
    if not logs:
        return {
            "total_fuel_consumed": 0,
            "total_fuel_cost": 0,
            "average_price_per_liter": 0,
            "best_efficiency": None,
            "worst_efficiency": None,
            "average_efficiency": 0
        }
    
    total_fuel = sum(log.fuel_consumed for log in logs)
    total_cost = sum(log.fuel_cost or 0 for log in logs)
    
    # Calculate average price per liter
    fuel_with_cost = [(log.fuel_consumed, log.fuel_cost) for log in logs if log.fuel_cost]
    avg_price = sum(cost/fuel for fuel, cost in fuel_with_cost) / len(fuel_with_cost) if fuel_with_cost else 0
    
    # Find best and worst efficiency
    efficiency_logs = [log for log in logs if log.fuel_efficiency]
    best_efficiency = max(efficiency_logs, key=lambda x: x.fuel_efficiency) if efficiency_logs else None
    worst_efficiency = min(efficiency_logs, key=lambda x: x.fuel_efficiency) if efficiency_logs else None
    avg_efficiency = sum(log.fuel_efficiency for log in efficiency_logs) / len(efficiency_logs) if efficiency_logs else 0
    
    return {
        "total_fuel_consumed": total_fuel,
        "total_fuel_cost": total_cost,
        "average_price_per_liter": avg_price,
        "best_efficiency": {
            "value": best_efficiency.fuel_efficiency,
            "date": best_efficiency.start_date.isoformat(),
            "trip_type": best_efficiency.trip_type
        } if best_efficiency else None,
        "worst_efficiency": {
            "value": worst_efficiency.fuel_efficiency,
            "date": worst_efficiency.start_date.isoformat(),
            "trip_type": worst_efficiency.trip_type
        } if worst_efficiency else None,
        "average_efficiency": avg_efficiency
    }