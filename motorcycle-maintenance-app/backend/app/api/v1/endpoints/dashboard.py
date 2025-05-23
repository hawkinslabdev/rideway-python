# backend/app/api/v1/endpoints/dashboard.py
from http.client import HTTPException
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get main dashboard statistics"""
    service = DashboardService(db)
    return service.get_dashboard_stats()


@router.get("/motorcycle/{motorcycle_id}")
async def get_motorcycle_overview(
    motorcycle_id: int,
    db: Session = Depends(get_db)
):
    """Get overview for a specific motorcycle"""
    service = DashboardService(db)
    overview = service.get_motorcycle_overview(motorcycle_id)
    if not overview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Motorcycle not found"
        )
    return overview


@router.get("/maintenance-due")
async def get_maintenance_due_soon(
    days_ahead: int = 30,
    db: Session = Depends(get_db)
):
    """Get maintenance due within specified days"""
    service = DashboardService(db)
    return service.get_maintenance_due_soon(days_ahead=days_ahead)


@router.get("/fleet-summary")
async def get_fleet_summary(db: Session = Depends(get_db)):
    """Get fleet-wide summary statistics"""
    service = DashboardService(db)
    return service.get_fleet_summary()