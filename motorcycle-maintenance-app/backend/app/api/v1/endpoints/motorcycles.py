from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.motorcycle import Motorcycle
from app.schemas.motorcycle import MotorcycleCreate, MotorcycleUpdate, MotorcycleResponse
from app.services.motorcycle_service import MotorcycleService

router = APIRouter()


@router.get("/", response_model=List[MotorcycleResponse])
async def get_motorcycles(
    skip: int = 0,
    limit: int = 100,
    include_archived: bool = False,
    db: Session = Depends(get_db)
):
    """Get all motorcycles with optional pagination and filtering"""
    service = MotorcycleService(db)
    return service.get_motorcycles(skip=skip, limit=limit, include_archived=include_archived)


@router.post("/", response_model=MotorcycleResponse)
async def create_motorcycle(
    motorcycle: MotorcycleCreate,
    db: Session = Depends(get_db)
):
    """Create a new motorcycle"""
    service = MotorcycleService(db)
    return service.create_motorcycle(motorcycle)


@router.get("/{motorcycle_id}", response_model=MotorcycleResponse)
async def get_motorcycle(
    motorcycle_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific motorcycle by ID"""
    service = MotorcycleService(db)
    motorcycle = service.get_motorcycle(motorcycle_id)
    if not motorcycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Motorcycle not found"
        )
    return motorcycle


@router.put("/{motorcycle_id}", response_model=MotorcycleResponse)
async def update_motorcycle(
    motorcycle_id: int,
    motorcycle_update: MotorcycleUpdate,
    db: Session = Depends(get_db)
):
    """Update a motorcycle"""
    service = MotorcycleService(db)
    motorcycle = service.update_motorcycle(motorcycle_id, motorcycle_update)
    if not motorcycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Motorcycle not found"
        )
    return motorcycle


@router.delete("/{motorcycle_id}")
async def delete_motorcycle(
    motorcycle_id: int,
    db: Session = Depends(get_db)
):
    """Delete a motorcycle (soft delete - archives it)"""
    service = MotorcycleService(db)
    success = service.archive_motorcycle(motorcycle_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Motorcycle not found"
        )
    return {"message": "Motorcycle archived successfully"}


@router.post("/{motorcycle_id}/mileage")
async def update_mileage(
    motorcycle_id: int,
    new_mileage: float,
    db: Session = Depends(get_db)
):
    """Update motorcycle mileage"""
    service = MotorcycleService(db)
    motorcycle = service.update_mileage(motorcycle_id, new_mileage)
    if not motorcycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Motorcycle not found"
        )
    return {"message": "Mileage updated successfully", "new_mileage": new_mileage}
