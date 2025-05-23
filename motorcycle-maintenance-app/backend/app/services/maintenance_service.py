# backend/app/services/maintenance_service.py
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.models.maintenance import MaintenanceRecord, ServiceType
from app.models.motorcycle import Motorcycle
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate


class MaintenanceService:
    def __init__(self, db: Session):
        self.db = db

    def get_maintenance_records(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        motorcycle_id: Optional[int] = None
    ) -> List[MaintenanceRecord]:
        query = self.db.query(MaintenanceRecord)
        if motorcycle_id:
            query = query.filter(MaintenanceRecord.motorcycle_id == motorcycle_id)
        return query.offset(skip).limit(limit).all()

    def get_maintenance_record(self, record_id: int) -> Optional[MaintenanceRecord]:
        return self.db.query(MaintenanceRecord).filter(MaintenanceRecord.id == record_id).first()

    def create_maintenance_record(self, record_data: MaintenanceCreate) -> MaintenanceRecord:
        # Calculate next service dates if intervals provided
        next_service_date = None
        next_service_mileage = None
        
        if record_data.service_interval_months:
            next_service_date = record_data.performed_at + timedelta(
                days=record_data.service_interval_months * 30
            )
        
        if record_data.service_interval_km:
            next_service_mileage = record_data.mileage_at_service + record_data.service_interval_km

        db_record = MaintenanceRecord(
            **record_data.dict(),
            next_service_date=next_service_date,
            next_service_mileage=next_service_mileage
        )
        
        self.db.add(db_record)
        self.db.commit()
        self.db.refresh(db_record)
        return db_record

    def update_maintenance_record(
        self, 
        record_id: int, 
        record_update: MaintenanceUpdate
    ) -> Optional[MaintenanceRecord]:
        db_record = self.get_maintenance_record(record_id)
        if not db_record:
            return None
        
        update_data = record_update.dict(exclude_unset=True)
        
        # Recalculate next service dates if intervals changed
        if 'service_interval_months' in update_data and update_data['service_interval_months']:
            update_data['next_service_date'] = db_record.performed_at + timedelta(
                days=update_data['service_interval_months'] * 30
            )
        
        if 'service_interval_km' in update_data and update_data['service_interval_km']:
            update_data['next_service_mileage'] = db_record.mileage_at_service + update_data['service_interval_km']
        
        for field, value in update_data.items():
            setattr(db_record, field, value)
        
        self.db.commit()
        self.db.refresh(db_record)
        return db_record

    def delete_maintenance_record(self, record_id: int) -> bool:
        db_record = self.get_maintenance_record(record_id)
        if not db_record:
            return False
        
        self.db.delete(db_record)
        self.db.commit()
        return True

    def get_upcoming_maintenance(
        self, 
        motorcycle_id: Optional[int] = None,
        days_ahead: int = 60
    ) -> List[dict]:
        """Get upcoming maintenance based on date and mileage"""
        query = self.db.query(MaintenanceRecord, Motorcycle).join(Motorcycle)
        
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
                'service_type': maintenance.service_type,
                'due_date': maintenance.next_service_date,
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
                    upcoming_item['priority'] = 'medium'
            
            # Only include if due within timeframe or overdue
            if (upcoming_item['is_overdue'] or 
                (maintenance.next_service_date and maintenance.next_service_date <= cutoff_date.date())):
                results.append(upcoming_item)
        
        # Sort by priority and date
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        results.sort(key=lambda x: (
            priority_order[x['priority']], 
            x['due_date'] or datetime.max.date()
        ))
        
        return results

    def get_overdue_maintenance(self, motorcycle_id: Optional[int] = None) -> List[dict]:
        """Get only overdue maintenance"""
        upcoming = self.get_upcoming_maintenance(motorcycle_id, days_ahead=0)
        return [item for item in upcoming if item['is_overdue']]

    def bulk_complete_maintenance(self, maintenance_ids: List[int]) -> List[MaintenanceRecord]:
        """Mark multiple maintenance records as completed"""
        records = self.db.query(MaintenanceRecord).filter(
            MaintenanceRecord.id.in_(maintenance_ids)
        ).all()
        
        completed_records = []
        for record in records:
            record.is_completed = True
            record.performed_at = datetime.utcnow()
            
            # Generate next service dates
            if record.service_interval_months:
                record.next_service_date = record.performed_at.date() + timedelta(
                    days=record.service_interval_months * 30
                )
            
            if record.service_interval_km:
                # Get current mileage from motorcycle
                motorcycle = self.db.query(Motorcycle).filter(
                    Motorcycle.id == record.motorcycle_id
                ).first()
                if motorcycle:
                    record.mileage_at_service = motorcycle.current_mileage
                    record.next_service_mileage = motorcycle.current_mileage + record.service_interval_km
            
            completed_records.append(record)
        
        self.db.commit()
        return completed_records

    def get_maintenance_history(
        self, 
        motorcycle_id: int, 
        service_type: Optional[str] = None
    ) -> List[MaintenanceRecord]:
        """Get maintenance history for a specific motorcycle"""
        query = self.db.query(MaintenanceRecord).filter(
            MaintenanceRecord.motorcycle_id == motorcycle_id,
            MaintenanceRecord.is_completed == True
        )
        
        if service_type:
            query = query.filter(MaintenanceRecord.service_type == service_type)
        
        return query.order_by(MaintenanceRecord.performed_at.desc()).all()

    def get_maintenance_costs(
        self, 
        motorcycle_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> dict:
        """Get maintenance cost summary"""
        query = self.db.query(MaintenanceRecord).filter(
            MaintenanceRecord.is_completed == True
        )
        
        if motorcycle_id:
            query = query.filter(MaintenanceRecord.motorcycle_id == motorcycle_id)
        
        if start_date:
            query = query.filter(MaintenanceRecord.performed_at >= start_date)
        
        if end_date:
            query = query.filter(MaintenanceRecord.performed_at <= end_date)
        
        records = query.all()
        
        total_cost = sum(record.total_cost for record in records if record.total_cost)
        labor_cost = sum(record.labor_cost for record in records if record.labor_cost)
        parts_cost = sum(record.parts_cost for record in records if record.parts_cost)
        
        return {
            'total_cost': total_cost,
            'labor_cost': labor_cost,
            'parts_cost': parts_cost,
            'record_count': len(records),
            'average_cost': total_cost / len(records) if records else 0
        }