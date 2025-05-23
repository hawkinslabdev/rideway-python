from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.motorcycle import Motorcycle
from app.schemas.motorcycle import MotorcycleCreate, MotorcycleUpdate


class MotorcycleService:
    def __init__(self, db: Session):
        self.db = db

    def get_motorcycles(self, skip: int = 0, limit: int = 100, include_archived: bool = False) -> List[Motorcycle]:
        query = self.db.query(Motorcycle)
        if not include_archived:
            query = query.filter(Motorcycle.is_archived == False)
        return query.offset(skip).limit(limit).all()

    def get_motorcycle(self, motorcycle_id: int) -> Optional[Motorcycle]:
        return self.db.query(Motorcycle).filter(Motorcycle.id == motorcycle_id).first()

    def create_motorcycle(self, motorcycle_data: MotorcycleCreate) -> Motorcycle:
        db_motorcycle = Motorcycle(**motorcycle_data.dict())
        self.db.add(db_motorcycle)
        self.db.commit()
        self.db.refresh(db_motorcycle)
        return db_motorcycle

    def update_motorcycle(self, motorcycle_id: int, motorcycle_update: MotorcycleUpdate) -> Optional[Motorcycle]:
        db_motorcycle = self.get_motorcycle(motorcycle_id)
        if not db_motorcycle:
            return None
        
        update_data = motorcycle_update.dict(exclude_unset=True)
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

    def update_mileage(self, motorcycle_id: int, new_mileage: float) -> Optional[Motorcycle]:
        db_motorcycle = self.get_motorcycle(motorcycle_id)
        if not db_motorcycle:
            return None
        
        if new_mileage < db_motorcycle.current_mileage:
            raise ValueError("New mileage cannot be less than current mileage")
        
        db_motorcycle.current_mileage = new_mileage
        self.db.commit()
        self.db.refresh(db_motorcycle)
        return db_motorcycle
