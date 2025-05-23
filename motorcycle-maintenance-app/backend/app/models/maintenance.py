from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class ServiceType(str, enum.Enum):
    OIL_CHANGE = "oil_change"
    TIRE_REPLACEMENT = "tire_replacement"
    BRAKE_SERVICE = "brake_service"
    CHAIN_MAINTENANCE = "chain_maintenance"
    VALVE_ADJUSTMENT = "valve_adjustment"
    SPARK_PLUG = "spark_plug"
    AIR_FILTER = "air_filter"
    COOLANT_CHANGE = "coolant_change"
    GENERAL_INSPECTION = "general_inspection"
    CUSTOM = "custom"


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"
    
    id = Column(Integer, primary_key=True, index=True)
    motorcycle_id = Column(Integer, ForeignKey("motorcycles.id"), nullable=False)
    
    # Service details
    service_type = Column(Enum(ServiceType), nullable=False)
    service_name = Column(String, nullable=False)
    description = Column(Text)
    
    # Scheduling
    performed_at = Column(DateTime, nullable=False)
    mileage_at_service = Column(Float, nullable=False)
    
    # Next service scheduling
    next_service_mileage = Column(Float)
    next_service_date = Column(DateTime)
    service_interval_km = Column(Float)
    service_interval_months = Column(Integer)
    
    # Cost tracking
    labor_cost = Column(Float, default=0.0)
    parts_cost = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    currency = Column(String, default="EUR")
    
    # Service provider
    service_provider = Column(String)  # Garage name, self-service, etc.
    technician = Column(String)
    
    # Documentation
    receipt_path = Column(String)
    photos = Column(Text)  # JSON array of photo paths
    
    # Status
    is_completed = Column(Boolean, default=True)
    is_scheduled = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    motorcycle = relationship("Motorcycle", back_populates="maintenance_records")
