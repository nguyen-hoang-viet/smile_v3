from sqlalchemy import Column, Integer, String, DateTime, Float, Text
from sqlalchemy.sql import func
from app.database import Base

class Order(Base):
    __tablename__ = "order_list"
    
    id = Column(Integer, primary_key=True, index=True)
    table_id = Column(Integer, nullable=False)
    date = Column(String(50), nullable=False)
    time = Column(String(50), nullable=False)
    dish_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    note = Column(Text, default='')  # Thêm cột note
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Report(Base):
    __tablename__ = "report"
    
    id = Column(Integer, primary_key=True, index=True)
    table_id = Column(Integer, nullable=False)
    date = Column(String(50), nullable=False)
    hour = Column(String(50), nullable=False)
    product_code = Column(String(50), nullable=False)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    total = Column(Float, nullable=False)
    ship_fee = Column(Float, nullable=False, default=0)
    discount = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
