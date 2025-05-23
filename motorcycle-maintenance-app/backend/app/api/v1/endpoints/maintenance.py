# backend/app/api/v1/endpoints/maintenance.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.services.maintenance_service import MaintenanceService
from app.schemas.maintenance import (
    MaintenanceCreate, 
    MaintenanceUpdate, 
    MaintenanceResponse,
    MaintenanceBulkComplete
)

router = APIRouter()


@router.get("/", response_model=List[MaintenanceResponse])
async def get_maintenance_records(
    skip: int = 0,
    limit: int = 100,
    motorcycle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get maintenance records with optional filtering"""
    service = MaintenanceService(db)
    return service.get_maintenance_records(skip=skip, limit=limit, motorcycle_id=motorcycle_id)


@router.post("/", response_model=MaintenanceResponse)
async def create_maintenance_record(
    maintenance: MaintenanceCreate,
    db: Session = Depends(get_db)
):
    """Create a new maintenance record"""
    service = MaintenanceService(db)
    return service.create_maintenance_record(maintenance)


@router.get("/upcoming")
async def get_upcoming_maintenance(
    motorcycle_id: Optional[int] = None,
    days_ahead: int = 60,
    db: Session = Depends(get_db)
):
    """Get upcoming maintenance based on date and mileage"""
    service = MaintenanceService(db)
    return service.get_upcoming_maintenance(motorcycle_id=motorcycle_id, days_ahead=days_ahead)


@router.get("/overdue")
async def get_overdue_maintenance(
    motorcycle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get overdue maintenance"""
    service = MaintenanceService(db)
    return service.get_overdue_maintenance(motorcycle_id=motorcycle_id)


@router.post("/bulk-complete")
async def bulk_complete_maintenance(
    bulk_data: MaintenanceBulkComplete,
    db: Session = Depends(get_db)
):
    """Mark multiple maintenance records as completed"""
    service = MaintenanceService(db)
    completed_records = service.bulk_complete_maintenance(bulk_data.maintenance_ids)
    return {
        "message": f"Completed {len(completed_records)} maintenance records",
        "completed_records": completed_records
    }


@router.get("/costs")
async def get_maintenance_costs(
    motorcycle_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get maintenance cost summary"""
    service = MaintenanceService(db)
    return service.get_maintenance_costs(
        motorcycle_id=motorcycle_id,
        start_date=start_date,
        end_date=end_date
    )


@router.get("/{maintenance_id}", response_model=MaintenanceResponse)
async def get_maintenance_record(
    maintenance_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific maintenance record"""
    service = MaintenanceService(db)
    record = service.get_maintenance_record(maintenance_id)
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
    service = MaintenanceService(db)
    record = service.update_maintenance_record(maintenance_id, maintenance_update)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance record not found"
        )
    return record


@router.delete("/{maintenance_id}")
async def delete_maintenance_record(
    maintenance_id: int,
    db: Session = Depends(get_db)
):
    """Delete a maintenance record"""
    service = MaintenanceService(db)
    success = service.delete_maintenance_record(maintenance_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance record not found"
        )
    return {"message": "Maintenance record deleted successfully"}


@router.get("/history/{motorcycle_id}")
async def get_maintenance_history(
    motorcycle_id: int,
    service_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get maintenance history for a specific motorcycle"""
    service = MaintenanceService(db)
    return service.get_maintenance_history(motorcycle_id, service_type)