class RideLog(Base):
    __tablename__ = "ride_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    motorcycle_id = Column(Integer, ForeignKey("motorcycles.id"), nullable=False)
    
    # Trip details
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)
    start_mileage = Column(Float, nullable=False)
    end_mileage = Column(Float)
    distance = Column(Float)  # Calculated or manual
    
    # Fuel tracking
    fuel_consumed = Column(Float)  # in liters
    fuel_cost = Column(Float)
    fuel_efficiency = Column(Float)  # km/L
    
    # Location
    start_location = Column(String)
    end_location = Column(String)
    route_description = Column(Text)
    
    # Weather & conditions
    weather_conditions = Column(String)
    road_conditions = Column(String)
    
    # Trip type
    trip_type = Column(String)  # Commute, Recreation, Touring, etc.
    
    # Notes
    notes = Column(Text)
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    motorcycle = relationship("Motorcycle", back_populates="ride_logs")

