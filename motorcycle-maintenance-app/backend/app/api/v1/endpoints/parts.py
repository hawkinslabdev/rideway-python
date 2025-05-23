# backend/app/api/v1/endpoints/parts.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.services.parts_service import PartsService
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
    service = PartsService(db)
    return service.get_parts(
        skip=skip, 
        limit=limit, 
        motorcycle_id=motorcycle_id,
        category=category,
        in_stock_only=in_stock_only
    )


@router.post("/", response_model=PartResponse)
async def create_part(
    part: PartCreate,
    db: Session = Depends(get_db)
):
    """Create a new part"""
    service = PartsService(db)
    return service.create_part(part)


@router.get("/categories/{motorcycle_id}")
async def get_parts_by_category(
    motorcycle_id: int,
    db: Session = Depends(get_db)
):
    """Get parts grouped by category for a motorcycle"""
    service = PartsService(db)
    return service.get_parts_by_category(motorcycle_id)


@router.get("/low-stock")
async def get_low_stock_parts(
    motorcycle_id: Optional[int] = None,
    threshold: int = 5,
    db: Session = Depends(get_db)
):
    """Get parts with low stock"""
    service = PartsService(db)
    return service.get_low_stock_parts(motorcycle_id=motorcycle_id, threshold=threshold)


@router.get("/replacement-needed")
async def get_parts_needing_replacement(
    motorcycle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get parts that may need replacement"""
    service = PartsService(db)
    return service.get_parts_needing_replacement(motorcycle_id=motorcycle_id)


@router.get("/expenses")
async def get_parts_expenses(
    motorcycle_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get parts expense summary"""
    service = PartsService(db)
    return service.get_parts_expense_summary(
        motorcycle_id=motorcycle_id,
        start_date=start_date,
        end_date=end_date
    )


@router.get("/{part_id}", response_model=PartResponse)
async def get_part(
    part_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific part"""
    service = PartsService(db)
    part = service.get_part(part_id)
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
    service = PartsService(db)
    part = service.update_part(part_id, part_update)
    if not part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part not found"
        )
    return part


@router.delete("/{part_id}")
async def delete_part(
    part_id: int,
    db: Session = Depends(get_db)
):
    """Delete a part"""
    service = PartsService(db)
    success = service.delete_part(part_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part not found"
        )
    return {"message": "Part deleted successfully"}


@router.post("/{part_id}/use", response_model=PartResponse)
async def use_part(
    part_id: int,
    use_data: PartUse,
    db: Session = Depends(get_db)
):
    """Use a part (reduce stock, increase used count)"""
    service = PartsService(db)
    try:
        part = service.use_part(part_id, use_data.quantity)
        if not part:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Part not found"
            )
        return part
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{part_id}/restock", response_model=PartResponse)
async def restock_part(
    part_id: int,
    restock_data: PartRestock,
    db: Session = Depends(get_db)
):
    """Add stock to a part"""
    service = PartsService(db)
    part = service.restock_part(part_id, restock_data.quantity, restock_data.unit_price)
    if not part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part not found"
        )
    return part