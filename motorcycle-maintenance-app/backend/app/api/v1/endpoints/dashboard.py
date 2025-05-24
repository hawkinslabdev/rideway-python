# backend/app/api/v1/endpoints/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.motorcycle import Motorcycle
from app.models.maintenance import MaintenanceRecord, ServiceType

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get main dashboard statistics"""
    try:
        # Get motorcycle stats
        total_motorcycles = db.query(Motorcycle).count()
        active_motorcycles = db.query(Motorcycle).filter(
            Motorcycle.is_active == True,
            Motorcycle.is_archived == False
        ).count()
        
        # Calculate total mileage
        active_bikes = db.query(Motorcycle).filter(
            Motorcycle.is_active == True,
            Motorcycle.is_archived == False
        ).all()
        total_mileage = sum(bike.current_mileage or 0 for bike in active_bikes)
        
        # Get upcoming maintenance count
        upcoming_maintenance = db.query(MaintenanceRecord).filter(
            MaintenanceRecord.next_service_date >= datetime.utcnow().date(),
            MaintenanceRecord.next_service_date <= (datetime.utcnow() + timedelta(days=30)).date()
        ).count()
        
        # Get overdue maintenance count
        overdue_maintenance = db.query(MaintenanceRecord).filter(
            MaintenanceRecord.next_service_date < datetime.utcnow().date()
        ).count()
        
        # Calculate monthly expenses (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        monthly_expenses = db.query(MaintenanceRecord).filter(
            MaintenanceRecord.performed_at >= thirty_days_ago,
            MaintenanceRecord.is_completed == True
        ).all()
        total_expenses = sum(record.total_cost or 0 for record in monthly_expenses)
        
        # Get recent activities
        recent_activities = db.query(MaintenanceRecord, Motorcycle).join(
            Motorcycle, MaintenanceRecord.motorcycle_id == Motorcycle.id
        ).filter(
            MaintenanceRecord.is_completed == True
        ).order_by(
            MaintenanceRecord.performed_at.desc()
        ).limit(10).all()
        
        activities_list = []
        for maintenance, motorcycle in recent_activities:
            activities_list.append({
                "id": maintenance.id,
                "type": "maintenance",
                "description": maintenance.service_name,
                "motorcycle_name": motorcycle.name,
                "motorcycle_id": motorcycle.id,
                "date": maintenance.performed_at.isoformat(),
                "mileage": maintenance.mileage_at_service,
                "cost": maintenance.total_cost,
                "service_type": maintenance.service_type.value
            })
        
        return {
            "total_motorcycles": total_motorcycles,
            "active_motorcycles": active_motorcycles,
            "total_mileage": total_mileage,
            "upcoming_services": upcoming_maintenance,
            "overdue_services": overdue_maintenance,
            "monthly_expenses": total_expenses,
            "recent_activities": activities_list
        }
    except Exception as e:
        # Return default values if error
        return {
            "total_motorcycles": 0,
            "active_motorcycles": 0,
            "total_mileage": 0,
            "upcoming_services": 0,
            "overdue_services": 0,
            "monthly_expenses": 0,
            "recent_activities": []
        }

@router.get("/maintenance-due")
async def get_maintenance_due_soon(
    days_ahead: int = 60,
    motorcycle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get maintenance due within specified days"""
    try:
        query = db.query(MaintenanceRecord, Motorcycle).join(
            Motorcycle, MaintenanceRecord.motorcycle_id == Motorcycle.id
        )
        
        if motorcycle_id:
            query = query.filter(MaintenanceRecord.motorcycle_id == motorcycle_id)
        
        # Filter for records that have next service dates or mileage
        query = query.filter(
            (MaintenanceRecord.next_service_date.isnot(None)) |
            (MaintenanceRecord.next_service_mileage.isnot(None))
        )
        
        results = []
        cutoff_date = datetime.utcnow() + timedelta(days=days_ahead)
        
        for maintenance, motorcycle in query.all():
            upcoming_item = {
                'id': maintenance.id,
                'motorcycle_id': motorcycle.id,
                'motorcycle_name': motorcycle.name,
                'service_name': maintenance.service_name,
                'service_type': maintenance.service_type.value,
                'due_date': maintenance.next_service_date.isoformat() if maintenance.next_service_date else None,
                'due_mileage': maintenance.next_service_mileage,
                'current_mileage': motorcycle.current_mileage,
                'is_overdue': False,
                'days_overdue': None,
                'mileage_overdue': None,
                'priority': 'low'
            }
            
            # Check if overdue by date
            if maintenance.next_service_date:
                if maintenance.next_service_date < datetime.utcnow().date():
                    upcoming_item['is_overdue'] = True
                    upcoming_item['days_overdue'] = (
                        datetime.utcnow().date() - maintenance.next_service_date
                    ).days
                    upcoming_item['priority'] = 'high'
                elif maintenance.next_service_date <= cutoff_date.date():
                    days_until = (maintenance.next_service_date - datetime.utcnow().date()).days
                    if days_until <= 7:
                        upcoming_item['priority'] = 'high'
                    elif days_until <= 30:
                        upcoming_item['priority'] = 'medium'
            
            # Check if overdue by mileage
            if maintenance.next_service_mileage and motorcycle.current_mileage:
                if motorcycle.current_mileage >= maintenance.next_service_mileage:
                    upcoming_item['is_overdue'] = True
                    upcoming_item['mileage_overdue'] = (
                        motorcycle.current_mileage - maintenance.next_service_mileage
                    )
                    upcoming_item['priority'] = 'high'
                elif motorcycle.current_mileage >= (maintenance.next_service_mileage - 1000):
                    if upcoming_item['priority'] != 'high':
                        upcoming_item['priority'] = 'medium'
            
            # Only include if due within timeframe or overdue
            if (upcoming_item['is_overdue'] or 
                (maintenance.next_service_date and maintenance.next_service_date <= cutoff_date.date())):
                results.append(upcoming_item)
        
        # Sort by priority and date
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        results.sort(key=lambda x: (
            priority_order[x['priority']], 
            x['due_date'] or '9999-12-31'
        ))
        
        return results
    except Exception as e:
        return []

@router.get("/motorcycle/{motorcycle_id}")
async def get_motorcycle_overview(
    motorcycle_id: int,
    db: Session = Depends(get_db)
):
    """Get overview for a specific motorcycle"""
    motorcycle = db.query(Motorcycle).filter(Motorcycle.id == motorcycle_id).first()
    if not motorcycle:
        return None
    
    # Get upcoming maintenance
    upcoming_maintenance = await get_maintenance_due_soon(
        motorcycle_id=motorcycle_id,
        days_ahead=60,
        db=db
    )
    
    # Get recent maintenance
    recent_maintenance = db.query(MaintenanceRecord).filter(
        MaintenanceRecord.motorcycle_id == motorcycle_id,
        MaintenanceRecord.is_completed == True
    ).order_by(MaintenanceRecord.performed_at.desc()).limit(5).all()
    
    # Calculate annual costs
    twelve_months_ago = datetime.utcnow() - timedelta(days=365)
    annual_maintenance = db.query(MaintenanceRecord).filter(
        MaintenanceRecord.motorcycle_id == motorcycle_id,
        MaintenanceRecord.performed_at >= twelve_months_ago,
        MaintenanceRecord.is_completed == True
    ).all()
    
    total_annual_cost = sum(record.total_cost or 0 for record in annual_maintenance)
    
    return {
        "motorcycle": {
            "id": motorcycle.id,
            "name": motorcycle.name,
            "make": motorcycle.make,
            "model": motorcycle.model,
            "year": motorcycle.year,
            "current_mileage": motorcycle.current_mileage,
            "license_plate": motorcycle.license_plate
        },
        "upcoming_maintenance": upcoming_maintenance,
        "recent_maintenance": [
            {
                "id": record.id,
                "service_name": record.service_name,
                "performed_at": record.performed_at.isoformat(),
                "mileage": record.mileage_at_service,
                "cost": record.total_cost,
                "service_type": record.service_type.value
            }
            for record in recent_maintenance
        ],
        "annual_maintenance_cost": total_annual_cost,
        "maintenance_frequency": len(annual_maintenance)
    }

@router.get("/fleet-summary")
async def get_fleet_summary(db: Session = Depends(get_db)):
    """Get fleet-wide summary statistics"""
    motorcycles = db.query(Motorcycle).filter(
        Motorcycle.is_active == True,
        Motorcycle.is_archived == False
    ).all()
    
    if not motorcycles:
        return {
            "total_motorcycles": 0,
            "total_mileage": 0,
            "average_mileage": 0,
            "newest_motorcycle": None,
            "highest_mileage": None,
            "fleet_value": 0
        }
    
    total_mileage = sum(bike.current_mileage or 0 for bike in motorcycles)
    average_mileage = total_mileage / len(motorcycles) if motorcycles else 0
    
    # Find newest and highest mileage bikes
    newest_bike = max(motorcycles, key=lambda x: x.year)
    highest_mileage_bike = max(motorcycles, key=lambda x: x.current_mileage or 0)
    
    # Calculate fleet value
    fleet_value = sum(bike.purchase_price or 0 for bike in motorcycles)
    
    return {
        "total_motorcycles": len(motorcycles),
        "total_mileage": total_mileage,
        "average_mileage": average_mileage,
        "newest_motorcycle": {
            "name": newest_bike.name,
            "year": newest_bike.year,
            "make": newest_bike.make,
            "model": newest_bike.model
        } if newest_bike else None,
        "highest_mileage": {
            "name": highest_mileage_bike.name,
            "mileage": highest_mileage_bike.current_mileage,
            "make": highest_mileage_bike.make,
            "model": highest_mileage_bike.model
        } if highest_mileage_bike else None,
        "fleet_value": fleet_value
    }