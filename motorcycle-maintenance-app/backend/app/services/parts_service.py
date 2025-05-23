# backend/app/services/parts_service.py
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.models.parts import Part
from app.schemas.parts import PartCreate, PartUpdate


class PartsService:
    def __init__(self, db: Session):
        self.db = db

    def get_parts(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        motorcycle_id: Optional[int] = None,
        category: Optional[str] = None,
        in_stock_only: bool = False
    ) -> List[Part]:
        query = self.db.query(Part)
        
        if motorcycle_id:
            query = query.filter(Part.motorcycle_id == motorcycle_id)
        
        if category:
            query = query.filter(Part.category == category)
            
        if in_stock_only:
            query = query.filter(Part.quantity_in_stock > 0)
        
        return query.offset(skip).limit(limit).all()

    def get_part(self, part_id: int) -> Optional[Part]:
        return self.db.query(Part).filter(Part.id == part_id).first()

    def create_part(self, part_data: PartCreate) -> Part:
        db_part = Part(**part_data.dict())
        self.db.add(db_part)
        self.db.commit()
        self.db.refresh(db_part)
        return db_part

    def update_part(self, part_id: int, part_update: PartUpdate) -> Optional[Part]:
        db_part = self.get_part(part_id)
        if not db_part:
            return None
        
        update_data = part_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_part, field, value)
        
        self.db.commit()
        self.db.refresh(db_part)
        return db_part

    def delete_part(self, part_id: int) -> bool:
        db_part = self.get_part(part_id)
        if not db_part:
            return False
        
        self.db.delete(db_part)
        self.db.commit()
        return True

    def use_part(self, part_id: int, quantity: int) -> Optional[Part]:
        """Use a part (reduce quantity in stock, increase quantity used)"""
        db_part = self.get_part(part_id)
        if not db_part:
            return None
        
        if db_part.quantity_in_stock < quantity:
            raise ValueError(f"Not enough parts in stock. Available: {db_part.quantity_in_stock}")
        
        db_part.quantity_in_stock -= quantity
        db_part.quantity_used += quantity
        
        self.db.commit()
        self.db.refresh(db_part)
        return db_part

    def restock_part(self, part_id: int, quantity: int, unit_price: Optional[float] = None) -> Optional[Part]:
        """Add stock to a part"""
        db_part = self.get_part(part_id)
        if not db_part:
            return None
        
        db_part.quantity_in_stock += quantity
        
        if unit_price:
            db_part.unit_price = unit_price
            db_part.total_cost = (db_part.total_cost or 0) + (quantity * unit_price)
        
        self.db.commit()
        self.db.refresh(db_part)
        return db_part

    def get_parts_by_category(self, motorcycle_id: int) -> dict:
        """Get parts grouped by category for a motorcycle"""
        parts = self.db.query(Part).filter(Part.motorcycle_id == motorcycle_id).all()
        
        categories = {}
        for part in parts:
            category = part.category or "Uncategorized"
            if category not in categories:
                categories[category] = []
            categories[category].append(part)
        
        return categories

    def get_low_stock_parts(self, motorcycle_id: Optional[int] = None, threshold: int = 5) -> List[Part]:
        """Get parts with low stock"""
        query = self.db.query(Part).filter(
            Part.quantity_in_stock <= threshold,
            Part.quantity_in_stock > 0
        )
        
        if motorcycle_id:
            query = query.filter(Part.motorcycle_id == motorcycle_id)
        
        return query.all()

    def get_parts_needing_replacement(self, motorcycle_id: Optional[int] = None) -> List[dict]:
        """Get installed parts that may need replacement based on mileage/time"""
        query = self.db.query(Part).filter(
            Part.is_installed == True,
            Part.replacement_interval_km.isnot(None) | Part.replacement_interval_months.isnot(None)
        )
        
        if motorcycle_id:
            query = query.filter(Part.motorcycle_id == motorcycle_id)
        
        parts_needing_replacement = []
        for part in query.all():
            needs_replacement = False
            reason = ""
            
            # Check mileage-based replacement
            if part.replacement_interval_km and part.installed_mileage:
                # We'd need current motorcycle mileage to calculate this properly
                # For now, we'll mark it as needing attention
                replacement_mileage = part.installed_mileage + part.replacement_interval_km
                needs_replacement = True
                reason = f"Check mileage - replace at {replacement_mileage} km"
            
            # Check time-based replacement
            if part.replacement_interval_months and part.installed_date:
                months_since_install = (
                    datetime.utcnow() - part.installed_date
                ).days / 30.44  # Average days per month
                
                if months_since_install >= part.replacement_interval_months:
                    needs_replacement = True
                    reason = f"Time-based replacement due ({part.replacement_interval_months} months)"
            
            if needs_replacement:
                parts_needing_replacement.append({
                    "part": part,
                    "reason": reason,
                    "priority": "high" if "overdue" in reason.lower() else "medium"
                })
        
        return parts_needing_replacement

    def get_parts_expense_summary(
        self, 
        motorcycle_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> dict:
        """Get parts expense summary"""
        query = self.db.query(Part)
        
        if motorcycle_id:
            query = query.filter(Part.motorcycle_id == motorcycle_id)
        
        if start_date:
            query = query.filter(Part.purchase_date >= start_date)
        
        if end_date:
            query = query.filter(Part.purchase_date <= end_date)
        
        parts = query.all()
        
        total_cost = sum(part.total_cost for part in parts if part.total_cost)
        total_parts = len(parts)
        total_stock_value = sum(
            (part.unit_price or 0) * part.quantity_in_stock 
            for part in parts 
            if part.unit_price
        )
        
        # Group by category
        category_costs = {}
        for part in parts:
            category = part.category or "Uncategorized"
            if category not in category_costs:
                category_costs[category] = 0
            category_costs[category] += part.total_cost or 0
        
        return {
            "total_cost": total_cost,
            "total_parts": total_parts,
            "total_stock_value": total_stock_value,
            "average_part_cost": total_cost / total_parts if total_parts > 0 else 0,
            "category_breakdown": category_costs
        }