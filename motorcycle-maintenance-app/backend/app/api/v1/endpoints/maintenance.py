# backend/app/api/v1/endpoints/maintenance.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.maintenance import MaintenanceRecord
from app.models.motorcycle import Motorcycle
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse

router = APIRouter()


@router.get("/", response_model=List[MaintenanceResponse])
async def get_maintenance_records(
    skip: int = 0,
    limit: int = 100,
    motorcycle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get maintenance records with optional filtering"""
    query = db.query(MaintenanceRecord)
    
    if motorcycle_id:
        query = query.filter(MaintenanceRecord.motorcycle_id == motorcycle_id)
    
    return query.order_by(MaintenanceRecord.performed_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=MaintenanceResponse)
async def create_maintenance_record(
    maintenance: MaintenanceCreate,
    db: Session = Depends(get_db)
):
    """Create a new maintenance record"""
    # Verify motorcycle exists
    motorcycle = db.query(Motorcycle).filter(Motorcycle.id == maintenance.motorcycle_id).first()
    if not motorcycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Motorcycle not found"
        )
    
    # Calculate total cost
    total_cost = (maintenance.labor_cost or 0) + (maintenance.parts_cost or 0)
    
    # Create maintenance record
    data_dict = maintenance.dict()
    data_dict['total_cost'] = total_cost
    
    # Update motorcycle mileage if this service has higher mileage
    if maintenance.mileage_at_service > motorcycle.current_mileage:
        motorcycle.current_mileage = maintenance.mileage_at_service
    
    db_record = MaintenanceRecord(**data_dict)
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    
    return db_record


@router.get("/upcoming")
async def get_upcoming_maintenance(
    motorcycle_id: Optional[int] = None,
    days_ahead: int = 60,
    db: Session = Depends(get_db)
):
    """Get upcoming maintenance based on date and mileage"""
    # This endpoint works, so we know it's properly registered
    # Return empty list for now
    return []


@router.get("/overdue")
async def get_overdue_maintenance(
    motorcycle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get overdue maintenance"""
    return []


@router.get("/{maintenance_id}", response_model=MaintenanceResponse)
async def get_maintenance_record(
    maintenance_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific maintenance record"""
    record = db.query(MaintenanceRecord).filter(MaintenanceRecord.id == maintenance_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance record not found"
        )
    return record


@router.put("/{maintenance_id}", response_model=MaintenanceResponse)
async def update_maintenance_record(
    maintenance_id: int,
    maintenance_update: MaintenanceUpdate,
    db: Session = Depends(get_db)
):
    """Update a maintenance record"""
    db_record = db.query(MaintenanceRecord).filter(MaintenanceRecord.id == maintenance_id).first()
    if not db_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance record not found"
        )
    
    update_data = maintenance_update.dict(exclude_unset=True)
    
    # Recalculate total cost if costs changed
    if 'labor_cost' in update_data or 'parts_cost' in update_data:
        labor = update_data.get('labor_cost', db_record.labor_cost) or 0
        parts = update_data.get('parts_cost', db_record.parts_cost) or 0
        update_data['total_cost'] = labor + parts
    
    for field, value in update_data.items():
        setattr(db_record, field, value)
    
    db.commit()
    db.refresh(db_record)
    return db_record


@router.delete("/{maintenance_id}")
async def delete_maintenance_record(
    maintenance_id: int,
    db: Session = Depends(get_db)
):
    """Delete a maintenance record"""
    db_record = db.query(MaintenanceRecord).filter(MaintenanceRecord.id == maintenance_id).first()
    if not db_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance record not found"
        )
    
    db.delete(db_record)
    db.commit()
    return {"message": "Maintenance record deleted successfully"}