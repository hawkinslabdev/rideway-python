# backend/app/api/v1/endpoints/parts.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.parts import Part
from app.models.motorcycle import Motorcycle
from app.schemas.parts import PartCreate, PartUpdate, PartResponse, PartUse, PartRestock

router = APIRouter()


@router.get("/", response_model=List[PartResponse])
async def get_parts(
    skip: int = 0,
    limit: int = 100,
    motorcycle_id: Optional[int] = None,
    category: Optional[str] = None,
    in_stock_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get parts with optional filtering"""
    query = db.query(Part)
    
    if motorcycle_id:
        query = query.filter(Part.motorcycle_id == motorcycle_id)
    
    if category:
        query = query.filter(Part.category == category)
        
    if in_stock_only:
        query = query.filter(Part.quantity_in_stock > 0)
    
    return query.offset(skip).limit(limit).all()


@router.post("/", response_model=PartResponse)
async def create_part(
    part: PartCreate,
    db: Session = Depends(get_db)
):
    """Create a new part"""
    # Verify motorcycle exists
    motorcycle = db.query(Motorcycle).filter(Motorcycle.id == part.motorcycle_id).first()
    if not motorcycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Motorcycle not found"
        )
    
    db_part = Part(**part.dict())
    db.add(db_part)
@router.get("/expenses")
async def get_parts_expenses(
    motorcycle_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get parts expense summary"""
    query = db.query(Part)
    
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


@router.get("/replacement-needed")
async def get_parts_needing_replacement(
    motorcycle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get parts that may need replacement"""
    query = db.query(Part).filter(
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


@router.get("/categories/{motorcycle_id}")
async def get_parts_by_category(
    motorcycle_id: int,
    db: Session = Depends(get_db)
):
    """Get parts grouped by category for a motorcycle"""
    parts = db.query(Part).filter(Part.motorcycle_id == motorcycle_id).all()
    
    categories = {}
    for part in parts:
        category = part.category or "Uncategorized"
        if category not in categories:
            categories[category] = []
        categories[category].append({
            "id": part.id,
            "name": part.name,
            "part_number": part.part_number,
            "quantity_in_stock": part.quantity_in_stock,
            "unit_price": part.unit_price
        })
    
    return categories


@router.get("/low-stock")
async def get_low_stock_parts(
    motorcycle_id: Optional[int] = None,
    threshold: int = 5,
    db: Session = Depends(get_db)
):
    """Get parts with low stock"""
    query = db.query(Part).filter(
        Part.quantity_in_stock <= threshold,
        Part.quantity_in_stock > 0
    )
    
    if motorcycle_id:
        query = query.filter(Part.motorcycle_id == motorcycle_id)
    
    return query.all()


@router.get("/{part_id}", response_model=PartResponse)
async def get_part(
    part_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific part"""
    part = db.query(Part).filter(Part.id == part_id).first()
    if not part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part not found"
        )
    return part


@router.put("/{part_id}", response_model=PartResponse)
async def update_part(
    part_id: int,
    part_update: PartUpdate,
    db: Session = Depends(get_db)
):
    """Update a part"""
    db_part = db.query(Part).filter(Part.id == part_id).first()
    if not db_part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part not found"
        )
    
    update_data = part_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_part, field, value)
    
    db.commit()
    db.refresh(db_part)
    return db_part


@router.delete("/{part_id}")
async def delete_part(
    part_id: int,
    db: Session = Depends(get_db)
):
    """Delete a part"""
    db_part = db.query(Part).filter(Part.id == part_id).first()
    if not db_part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part not found"
        )
    
    db.delete(db_part)
    db.commit()
    return {"message": "Part deleted successfully"}


@router.post("/{part_id}/use", response_model=PartResponse)
async def use_part(
    part_id: int,
    use_data: PartUse,
    db: Session = Depends(get_db)
):
    """Use a part (reduce stock, increase used count)"""
    db_part = db.query(Part).filter(Part.id == part_id).first()
    if not db_part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part not found"
        )
    
    if db_part.quantity_in_stock < use_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough parts in stock. Available: {db_part.quantity_in_stock}"
        )
    
    db_part.quantity_in_stock -= use_data.quantity
    db_part.quantity_used += use_data.quantity
    
    db.commit()
    db.refresh(db_part)
    return db_part


@router.post("/{part_id}/restock", response_model=PartResponse)
async def restock_part(
    part_id: int,
    restock_data: PartRestock,
    db: Session = Depends(get_db)
):
    """Add stock to a part"""
    db_part = db.query(Part).filter(Part.id == part_id).first()
    if not db_part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part not found"
        )
    
    db_part.quantity_in_stock += restock_data.quantity
    
    if restock_data.unit_price:
        db_part.unit_price = restock_data.unit_price
        db_part.total_cost = (db_part.total_cost or 0) + (restock_data.quantity * restock_data.unit_price)
    
    db.commit()
    db.refresh(db_part)
    return db_part