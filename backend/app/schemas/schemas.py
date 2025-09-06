from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Order schemas
class OrderBase(BaseModel):
    table_id: int
    date: str
    time: str
    dish_name: str
    quantity: int
    note: Optional[str] = ''  # Thêm note field

class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Report schemas
class ReportBase(BaseModel):
    table_id: int
    date: str
    hour: str
    product_code: str
    product_name: str
    quantity: int
    total: float
    ship_fee: float = 0
    discount: float = 0

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# API Request schemas
class AddOrderRequest(BaseModel):
    table_id: int
    dish_name: str
    quantity: int
    date: str
    time: str
    note: Optional[str] = ''  # Thêm note field

class AddReportRequest(BaseModel):
    tableNumber: int
    date: str
    time: str
    code: str
    nameDish: str
    quantity: int
    totalCheck: float
    shipFee: float
    discountCheck: float
