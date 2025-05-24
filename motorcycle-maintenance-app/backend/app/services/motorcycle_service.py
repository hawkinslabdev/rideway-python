# backend/app/services/motorcycle_service.py
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from datetime import datetime

from app.models.motorcycle import Motorcycle
from app.schemas.motorcycle import MotorcycleCreate, MotorcycleUpdate


class MotorcycleService:
    def __init__(self, db: Session):
        self.db = db

    def get_motorcycles(self, skip: int = 0, limit: int = 100, include_archived: bool = False) -> List[Motorcycle]:
        query = self.db.query(Motorcycle)
        if not include_archived:
            query = query.filter(Motorcycle.is_archived == False)
        return query.order_by(Motorcycle.created_at.desc()).offset(skip).limit(limit).all()

    def get_motorcycle(self, motorcycle_id: int) -> Optional[Motorcycle]:
        return self.db.query(Motorcycle).filter(Motorcycle.id == motorcycle_id).first()

    def create_motorcycle(self, motorcycle_data: MotorcycleCreate) -> Motorcycle:
        # Check for duplicate VIN or license plate
        if motorcycle_data.vin:
            existing_vin = self.db.query(Motorcycle).filter(
                Motorcycle.vin == motorcycle_data.vin
            ).first()
            if existing_vin:
                raise IntegrityError(
                    "Duplicate VIN",
                    orig="VIN already exists",
                    params={"vin": motorcycle_data.vin}
                )
        
        if motorcycle_data.license_plate:
            existing_plate = self.db.query(Motorcycle).filter(
                Motorcycle.license_plate == motorcycle_data.license_plate
            ).first()
            if existing_plate:
                raise IntegrityError(
                    "Duplicate license plate",
                    orig="License plate already exists",
                    params={"license_plate": motorcycle_data.license_plate}
                )
        
        # Convert purchase_date string to datetime if needed
        data_dict = motorcycle_data.dict()
        if isinstance(data_dict.get('purchase_date'), str):
            try:
                data_dict['purchase_date'] = datetime.fromisoformat(data_dict['purchase_date'].replace('Z', '+00:00'))
            except:
                pass
        
        db_motorcycle = Motorcycle(**data_dict)
        self.db.add(db_motorcycle)
        self.db.commit()
        self.db.refresh(db_motorcycle)
        return db_motorcycle

    def update_motorcycle(self, motorcycle_id: int, motorcycle_update: MotorcycleUpdate) -> Optional[Motorcycle]:
        db_motorcycle = self.get_motorcycle(motorcycle_id)
        if not db_motorcycle:
            return None
        
        update_data = motorcycle_update.dict(exclude_unset=True)
        
        # Check for duplicate VIN or license plate if updating
        if 'vin' in update_data and update_data['vin']:
            existing = self.db.query(Motorcycle).filter(
                Motorcycle.vin == update_data['vin'],
                Motorcycle.id != motorcycle_id
            ).first()
            if existing:
                raise IntegrityError(
                    "Duplicate VIN",
                    orig="VIN already exists",
                    params={"vin": update_data['vin']}
                )
        
        if 'license_plate' in update_data and update_data['license_plate']:
            existing = self.db.query(Motorcycle).filter(
                Motorcycle.license_plate == update_data['license_plate'],
                Motorcycle.id != motorcycle_id
            ).first()
            if existing:
                raise IntegrityError(
                    "Duplicate license plate",
                    orig="License plate already exists",
                    params={"license_plate": update_data['license_plate']}
                )
        
        for field, value in update_data.items():
            setattr(db_motorcycle, field, value)
        
        self.db.commit()
        self.db.refresh(db_motorcycle)
        return db_motorcycle

    def archive_motorcycle(self, motorcycle_id: int) -> bool:
        db_motorcycle = self.get_motorcycle(motorcycle_id)
        if not db_motorcycle:
            return False
        
        db_motorcycle.is_archived = True
        db_motorcycle.is_active = False
        self.db.commit()
        return True

    def restore_motorcycle(self, motorcycle_id: int) -> bool:
        db_motorcycle = self.get_motorcycle(motorcycle_id)
        if not db_motorcycle:
            return False
        
        db_motorcycle.is_archived = False
        db_motorcycle.is_active = True
        self.db.commit()
        return True

    def update_mileage(self, motorcycle_id: int, new_mileage: float) -> Optional[Motorcycle]:
        db_motorcycle = self.get_motorcycle(motorcycle_id)
        if not db_motorcycle:
            return None
        
        if new_mileage < db_motorcycle.current_mileage:
            raise ValueError(f"New mileage ({new_mileage}) cannot be less than current mileage ({db_motorcycle.current_mileage})")
        
        db_motorcycle.current_mileage = new_mileage
        self.db.commit()
        self.db.refresh(db_motorcycle)
        return db_motorcycle

    def get_motorcycle_statistics(self, motorcycle_id: int) -> dict:
        motorcycle = self.get_motorcycle(motorcycle_id)
        if not motorcycle:
            return None
        
        # Calculate age
        current_year = datetime.now().year
        age = current_year - motorcycle.year
        
        # Calculate ownership duration
        ownership_days = 0
        if motorcycle.purchase_date:
            ownership_days = (datetime.now() - motorcycle.purchase_date).days
        
        # Get maintenance count
        from app.models.maintenance import MaintenanceRecord
        maintenance_count = self.db.query(MaintenanceRecord).filter(
            MaintenanceRecord.motorcycle_id == motorcycle_id
        ).count()
        
        # Get parts count
        from app.models.parts import Part
        parts_count = self.db.query(Part).filter(
            Part.motorcycle_id == motorcycle_id
        ).count()
        
        # Get ride logs count
        from app.models.logs import RideLog
        rides_count = self.db.query(RideLog).filter(
            RideLog.motorcycle_id == motorcycle_id
        ).count()
        
        return {
            "age_years": age,
            "ownership_days": ownership_days,
            "total_maintenance_records": maintenance_count,
            "total_parts": parts_count,
            "total_rides": rides_count,
            "average_km_per_year": motorcycle.current_mileage / age if age > 0 else 0,
            "average_km_per_day": motorcycle.current_mileage / ownership_days if ownership_days > 0 else 0
        }