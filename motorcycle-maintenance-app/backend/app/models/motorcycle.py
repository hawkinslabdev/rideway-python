from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Motorcycle(Base):
    __tablename__ = "motorcycles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    engine_size = Column(Integer)  # in cc
    license_plate = Column(String, unique=True, index=True)
    vin = Column(String, unique=True, index=True)
    
    # Tracking info
    current_mileage = Column(Float, default=0.0)  # in km
    purchase_date = Column(DateTime)
    purchase_price = Column(Float)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_archived = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    notes = Column(Text)
    
    # Relationships
    maintenance_records = relationship("MaintenanceRecord", back_populates="motorcycle")
    parts = relationship("Part", back_populates="motorcycle")
    ride_logs = relationship("RideLog", back_populates="motorcycle")