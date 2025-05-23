class Part(Base):
    __tablename__ = "parts"
    
    id = Column(Integer, primary_key=True, index=True)
    motorcycle_id = Column(Integer, ForeignKey("motorcycles.id"), nullable=False)
    
    # Part details
    name = Column(String, nullable=False)
    part_number = Column(String)
    manufacturer = Column(String)
    category = Column(String)  # Engine, Brakes, Electrical, etc.
    
    # Inventory
    quantity_in_stock = Column(Integer, default=0)
    quantity_used = Column(Integer, default=0)
    unit_price = Column(Float)
    total_cost = Column(Float)
    currency = Column(String, default="EUR")
    
    # Purchase info
    purchase_date = Column(DateTime)
    vendor = Column(String)
    
    # Installation
    installed_date = Column(DateTime)
    installed_mileage = Column(Float)
    replacement_interval_km = Column(Float)
    replacement_interval_months = Column(Integer)
    
    # Documentation
    receipt_path = Column(String)
    installation_notes = Column(Text)
    
    # Status
    is_installed = Column(Boolean, default=False)
    is_consumable = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    motorcycle = relationship("Motorcycle", back_populates="parts")
