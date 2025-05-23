# backend/app/services/dashboard_service.py
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, List

from app.models.motorcycle import Motorcycle
from app.models.maintenance import MaintenanceRecord
from app.models.parts import Part
from app.services.maintenance_service import MaintenanceService


class DashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.maintenance_service = MaintenanceService(db)

    def get_dashboard_stats(self) -> Dict:
        """Get dashboard statistics"""
        # Motorcycle stats
        total_motorcycles = self.db.query(Motorcycle).count()
        active_motorcycles = self.db.query(Motorcycle).filter(
            Motorcycle.is_active == True,
            Motorcycle.is_archived == False
        ).count()
        
        # Total mileage across all active motorcycles
        active_bikes = self.db.query(Motorcycle).filter(
            Motorcycle.is_active == True,
            Motorcycle.is_archived == False
        ).all()
        total_mileage = sum(bike.current_mileage or 0 for bike in active_bikes)
        
        # Upcoming maintenance
        upcoming_maintenance = self.maintenance_service.get_upcoming_maintenance(days_ahead=30)
        upcoming_services = len(upcoming_maintenance)
        overdue_services = len([item for item in upcoming_maintenance if item['is_overdue']])
        
        # Monthly expenses (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        monthly_expenses = self._get_monthly_expenses(thirty_days_ago)
        
        # Recent activities (last 10 completed maintenance records)
        recent_activities = self._get_recent_activities(limit=10)
        
        return {
            "total_motorcycles": total_motorcycles,
            "active_motorcycles": active_motorcycles,
            "total_mileage": total_mileage,
            "upcoming_services": upcoming_services,
            "overdue_services": overdue_services,
            "monthly_expenses": monthly_expenses,
            "recent_activities": recent_activities
        }

    def _get_monthly_expenses(self, since_date: datetime) -> float:
        """Calculate total expenses for maintenance and parts since given date"""
        # Maintenance costs
        maintenance_costs = self.db.query(MaintenanceRecord).filter(
            MaintenanceRecord.performed_at >= since_date,
            MaintenanceRecord.is_completed == True
        ).all()
        
        maintenance_total = sum(record.total_cost or 0 for record in maintenance_costs)
        
        # Parts costs
        parts_costs = self.db.query(Part).filter(
            Part.purchase_date >= since_date.date()
        ).all()
        
        parts_total = sum(part.total_cost or 0 for part in parts_costs)
        
        return maintenance_total + parts_total

    def _get_recent_activities(self, limit: int = 10) -> List[Dict]:
        """Get recent maintenance activities"""
        recent_maintenance = self.db.query(MaintenanceRecord, Motorcycle).join(
            Motorcycle, MaintenanceRecord.motorcycle_id == Motorcycle.id
        ).filter(
            MaintenanceRecord.is_completed == True
        ).order_by(
            MaintenanceRecord.performed_at.desc()
        ).limit(limit).all()
        
        activities = []
        for maintenance, motorcycle in recent_maintenance:
            activities.append({
                "id": maintenance.id,
                "type": "maintenance",
                "description": maintenance.service_name,
                "motorcycle_name": motorcycle.name,
                "motorcycle_id": motorcycle.id,
                "date": maintenance.performed_at,
                "mileage": maintenance.mileage_at_service,
                "cost": maintenance.total_cost,
                "service_type": maintenance.service_type
            })
        
        return activities

    def get_motorcycle_overview(self, motorcycle_id: int) -> Dict:
        """Get overview for a specific motorcycle"""
        motorcycle = self.db.query(Motorcycle).filter(Motorcycle.id == motorcycle_id).first()
        if not motorcycle:
            return None
        
        # Upcoming maintenance for this motorcycle
        upcoming_maintenance = self.maintenance_service.get_upcoming_maintenance(
            motorcycle_id=motorcycle_id, 
            days_ahead=60
        )
        
        # Recent maintenance history
        recent_maintenance = self.db.query(MaintenanceRecord).filter(
            MaintenanceRecord.motorcycle_id == motorcycle_id,
            MaintenanceRecord.is_completed == True
        ).order_by(MaintenanceRecord.performed_at.desc()).limit(5).all()
        
        # Parts summary
        parts_summary = self._get_parts_summary(motorcycle_id)
        
        # Maintenance costs (last 12 months)
        twelve_months_ago = datetime.utcnow() - timedelta(days=365)
        annual_maintenance_costs = self.db.query(MaintenanceRecord).filter(
            MaintenanceRecord.motorcycle_id == motorcycle_id,
            MaintenanceRecord.performed_at >= twelve_months_ago,
            MaintenanceRecord.is_completed == True
        ).all()
        
        total_annual_cost = sum(record.total_cost or 0 for record in annual_maintenance_costs)
        
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
                    "performed_at": record.performed_at,
                    "mileage": record.mileage_at_service,
                    "cost": record.total_cost,
                    "service_type": record.service_type
                }
                for record in recent_maintenance
            ],
            "parts_summary": parts_summary,
            "annual_maintenance_cost": total_annual_cost,
            "maintenance_frequency": len(annual_maintenance_costs)
        }

    def _get_parts_summary(self, motorcycle_id: int) -> Dict:
        """Get parts summary for a motorcycle"""
        parts = self.db.query(Part).filter(Part.motorcycle_id == motorcycle_id).all()
        
        total_parts = len(parts)
        total_stock_value = sum((part.unit_price or 0) * part.quantity_in_stock for part in parts)
        low_stock_parts = len([part for part in parts if part.quantity_in_stock <= 5 and part.quantity_in_stock > 0])
        
        return {
            "total_parts": total_parts,
            "total_stock_value": total_stock_value,
            "low_stock_parts": low_stock_parts,
            "categories": len(set(part.category for part in parts if part.category))
        }

    def get_maintenance_due_soon(self, days_ahead: int = 30) -> List[Dict]:
        """Get maintenance due within specified days"""
        return self.maintenance_service.get_upcoming_maintenance(days_ahead=days_ahead)

    def get_fleet_summary(self) -> Dict:
        """Get fleet-wide summary statistics"""
        motorcycles = self.db.query(Motorcycle).filter(
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
        
        # Calculate fleet value (purchase prices)
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
            },
            "highest_mileage": {
                "name": highest_mileage_bike.name,
                "mileage": highest_mileage_bike.current_mileage,
                "make": highest_mileage_bike.make,
                "model": highest_mileage_bike.model
            },
            "fleet_value": fleet_value
        }