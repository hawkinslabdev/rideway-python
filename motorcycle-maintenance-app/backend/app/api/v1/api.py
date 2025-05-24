from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

api_router = APIRouter()

# Simple test endpoint
@api_router.get("/test")
async def test_endpoint():
    return {"message": "API is working!", "status": "ok"}

# Health check with database
@api_router.get("/health-db")
async def health_check_db(db: Session = Depends(get_db)):
    try:
        # Simple database test
        result = db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "error": str(e)}

# Simple dashboard endpoint
@api_router.get("/dashboard/stats")
async def dashboard_stats(db: Session = Depends(get_db)):
    try:
        from app.models.motorcycle import Motorcycle
        motorcycles = db.query(Motorcycle).all()
        active_motorcycles = [m for m in motorcycles if m.is_active and not m.is_archived]
        
        return {
            "total_motorcycles": len(motorcycles),
            "active_motorcycles": len(active_motorcycles),
            "total_mileage": sum(m.current_mileage or 0 for m in active_motorcycles),
            "upcoming_services": 0,
            "overdue_services": 0,
            "monthly_expenses": 0,
            "recent_activities": []
        }
    except Exception as e:
        return {
            "error": str(e),
            "total_motorcycles": 0,
            "active_motorcycles": 0,
            "total_mileage": 0,
            "upcoming_services": 0,
            "overdue_services": 0,
            "monthly_expenses": 0,
            "recent_activities": []
        }

# Simple motorcycles endpoint
@api_router.get("/motorcycles")
async def list_motorcycles(
    include_archived: bool = False,
    db: Session = Depends(get_db)
):
    try:
        from app.models.motorcycle import Motorcycle
        query = db.query(Motorcycle)
        
        if not include_archived:
            query = query.filter(Motorcycle.is_archived == False)
            
        motorcycles = query.all()
        
        return [
            {
                "id": m.id,
                "name": m.name,
                "make": m.make,
                "model": m.model,
                "year": m.year,
                "engine_size": m.engine_size,
                "license_plate": m.license_plate,
                "vin": m.vin,
                "current_mileage": m.current_mileage,
                "purchase_date": m.purchase_date.isoformat() if m.purchase_date else None,
                "purchase_price": m.purchase_price,
                "notes": m.notes,
                "is_active": m.is_active,
                "is_archived": m.is_archived,
                "created_at": m.created_at.isoformat() if m.created_at else None,
                "updated_at": m.updated_at.isoformat() if m.updated_at else None
            }
            for m in motorcycles
        ]
    except Exception as e:
        return {"error": str(e), "motorcycles": []}

# Create motorcycle endpoint
@api_router.post("/motorcycles")
async def create_motorcycle(motorcycle_data: dict, db: Session = Depends(get_db)):
    try:
        from app.models.motorcycle import Motorcycle
        
        # Create new motorcycle
        db_motorcycle = Motorcycle(
            name=motorcycle_data["name"],
            make=motorcycle_data["make"], 
            model=motorcycle_data["model"],
            year=motorcycle_data["year"],
            engine_size=motorcycle_data.get("engine_size"),
            license_plate=motorcycle_data.get("license_plate"),
            vin=motorcycle_data.get("vin"),
            current_mileage=motorcycle_data.get("current_mileage", 0),
            purchase_date=motorcycle_data.get("purchase_date"),
            purchase_price=motorcycle_data.get("purchase_price"),
            notes=motorcycle_data.get("notes")
        )
        
        db.add(db_motorcycle)
        db.commit()
        db.refresh(db_motorcycle)
        
        return {
            "data": {
                "id": db_motorcycle.id,
                "name": db_motorcycle.name,
                "make": db_motorcycle.make,
                "model": db_motorcycle.model,
                "year": db_motorcycle.year,
                "current_mileage": db_motorcycle.current_mileage,
                "is_active": db_motorcycle.is_active,
                "is_archived": db_motorcycle.is_archived,
                "created_at": db_motorcycle.created_at.isoformat() if db_motorcycle.created_at else None
            }
        }
    except Exception as e:
        return {"error": str(e)}