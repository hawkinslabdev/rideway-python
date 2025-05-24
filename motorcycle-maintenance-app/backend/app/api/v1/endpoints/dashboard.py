# backend/app/api/v1/endpoints/dashboard.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from app.core.database import get_db

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get main dashboard statistics"""
    # Import here to avoid circular imports
    try:
        from app.services.dashboard_service import DashboardService
        service = DashboardService(db)
        return service.get_dashboard_stats()
    except ImportError:
        # Fallback if dashboard service is not available
        from app.models.motorcycle import Motorcycle
        
        motorcycles = db.query(Motorcycle).all()
        active_motorcycles = [m for m in motorcycles if m.is_active]
        total_mileage = sum(m.current_mileage or 0 for m in active_motorcycles)
        
        return {
            "total_motorcycles": len(motorcycles),
            "active_motorcycles": len(active_motorcycles),
            "total_mileage": total_mileage,
            "upcoming_services": 0,
            "overdue_services": 0,
            "monthly_expenses": 0,
            "recent_activities": []
        }

@router.get("/motorcycle/{motorcycle_id}")
async def get_motorcycle_overview(
    motorcycle_id: int,
    db: Session = Depends(get_db)
):
    """Get overview for a specific motorcycle"""
    try:
        from app.services.dashboard_service import DashboardService
        service = DashboardService(db)
        overview = service.get_motorcycle_overview(motorcycle_id)
        if not overview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Motorcycle not found"
            )
        return overview
    except ImportError:
        # Fallback
        from app.models.motorcycle import Motorcycle
        motorcycle = db.query(Motorcycle).filter(Motorcycle.id == motorcycle_id).first()
        if not motorcycle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Motorcycle not found"
            )
        return {
            "motorcycle": {
                "id": motorcycle.id,
                "name": motorcycle.name,
                "make": motorcycle.make,
                "model": motorcycle.model,
                "current_mileage": motorcycle.current_mileage
            }
        }

@router.get("/maintenance-due")
async def get_maintenance_due_soon(
    days_ahead: int = 30,
    db: Session = Depends(get_db)
):
    """Get maintenance due within specified days"""
    try:
        from app.services.dashboard_service import DashboardService
        service = DashboardService(db)
        return service.get_maintenance_due_soon(days_ahead=days_ahead)
    except ImportError:
        # Fallback - return empty list
        return []

@router.get("/fleet-summary")
async def get_fleet_summary(db: Session = Depends(get_db)):
    """Get fleet-wide summary statistics"""
    try:
        from app.services.dashboard_service import DashboardService
        service = DashboardService(db)
        return service.get_fleet_summary()
    except ImportError:
        # Fallback
        from app.models.motorcycle import Motorcycle
        motorcycles = db.query(Motorcycle).filter(Motorcycle.is_active == True).all()
        return {
            "total_motorcycles": len(motorcycles),
            "total_mileage": sum(m.current_mileage or 0 for m in motorcycles),
            "average_mileage": 0,
            "fleet_value": 0
        }