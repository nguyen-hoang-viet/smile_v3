from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from urllib.parse import unquote
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy import func

from app.database import get_db
from app.models.models import Order
from app.schemas.schemas import OrderResponse, OrderCreate, AddOrderRequest

router = APIRouter()

class NoteUpdate(BaseModel):
    note: str = ""

class ItemCreate(BaseModel):
    dish_name: str
    quantity: int = 1
    note: str = ""

@router.post("/table/{table_id}/item", response_model=OrderResponse)
def create_item(table_id: int, data: ItemCreate, db: Session = Depends(get_db)):
    """Create or update an order item with note in ONE transaction."""
    name = data.dish_name.strip()

    existing = (
        db.query(Order)
        .filter(
            Order.table_id == table_id,
            func.lower(func.trim(Order.dish_name)) == func.lower(func.trim(name)),
        )
        .first()
    )

    now_date = datetime.now().strftime("%Y-%m-%d")
    now_time = datetime.now().strftime("%H:%M:%S")

    if existing:
        # upsert: cập nhật luôn số lượng + note
        existing.quantity = data.quantity
        if data.note is not None:
            existing.note = data.note
        existing.date = now_date
        existing.time = now_time
        db.commit()
        db.refresh(existing)
        return existing

    db_order = Order(
        table_id=table_id,
        dish_name=name,
        quantity=data.quantity,
        note=data.note or "",
        date=now_date,
        time=now_time,
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

# SỬA LỖI: Đã xóa dòng @router.get("") bị trùng lặp. Chỉ giữ lại một dòng.
@router.get("/", response_model=List[OrderResponse])
def get_all_orders(db: Session = Depends(get_db)):
    """Get all orders"""
    orders = db.query(Order).order_by(Order.dish_name).all()
    return orders

@router.get("/table/{table_id}", response_model=List[OrderResponse])
def get_orders_by_table(table_id: int, db: Session = Depends(get_db)):
    """Get orders by table ID"""
    orders = db.query(Order).filter(Order.table_id == table_id).all()
    return orders

@router.post("/", response_model=OrderResponse)
def create_order(order_request: AddOrderRequest, db: Session = Depends(get_db)):
    """Create a new order or update existing one"""
    order_data = OrderCreate(
        table_id=order_request.table_id,
        date=order_request.date,
        time=order_request.time,
        dish_name=order_request.dish_name,
        quantity=order_request.quantity,
        note=order_request.note or ''
    )
    
    try:
        existing_order = db.query(Order).filter(
            Order.table_id == order_data.table_id,
            Order.dish_name == order_data.dish_name
        ).first()
        
        if existing_order:
            # Nếu đã tồn tại, cập nhật quantity, note, và thời gian
            print(f"Order exists, updating: Table {order_data.table_id}, Dish: {order_data.dish_name}")
            existing_order.quantity = order_data.quantity
            if order_data.note:
                existing_order.note = order_data.note
            existing_order.date = order_data.date
            existing_order.time = order_data.time
            db.commit()
            db.refresh(existing_order)
            return existing_order
        else:
            # Tạo order mới
            print(f"Creating new order: Table {order_data.table_id}, Dish: {order_data.dish_name}, Qty: {order_data.quantity}")
            db_order = Order(**order_data.model_dump())
            db.add(db_order)
            db.commit()
            db.refresh(db_order)
            return db_order
            
    except Exception as e:
        db.rollback()
        print(f"Error creating/updating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating/updating order: {str(e)}")

@router.put("/table/{table_id}/dish/{dish_name}/note")
def update_order_note(
    table_id: int,
    dish_name: str,
    note_data: NoteUpdate,
    db: Session = Depends(get_db),
):
    decoded = unquote(dish_name)

    # tìm món theo tên, bỏ khoảng trắng và không phân biệt hoa thường
    order = (
        db.query(Order)
        .filter(
            Order.table_id == table_id,
            func.lower(func.trim(Order.dish_name)) == func.lower(func.trim(decoded)),
        )
        .first()
    )
    if not order:
        # trả 404 thật, FE sẽ bỏ pending cho món không còn tồn tại
        raise HTTPException(
            status_code=404,
            detail=f"Order not found for table {table_id} and dish '{decoded}'",
        )

    order.note = note_data.note or ""
    db.commit()
    db.refresh(order)
    return {"message": "ok", "order_id": order.id, "note": order.note}

@router.put("/table/{table_id}/dish/{dish_name}")
def update_order_quantity(table_id: int, dish_name: str, quantity_data: dict, db: Session = Depends(get_db)):
    """Update order quantity for specific table and dish"""
    try:
        decoded_dish_name = unquote(dish_name)
        print(f"Updating order - Table: {table_id}, Dish: {decoded_dish_name}, Data: {quantity_data}")
        
        order = db.query(Order).filter(
            Order.table_id == table_id,
            Order.dish_name == decoded_dish_name
        ).first()
        
        if not order:
            print(f"Order not found, creating new order for table {table_id} and dish '{decoded_dish_name}'")
            new_order = Order(
                table_id=table_id,
                dish_name=decoded_dish_name,
                quantity=quantity_data.get('quantity', 1),
                date=datetime.now().strftime("%Y-%m-%d"),
                time=datetime.now().strftime("%H:%M:%S"),
                note=''
            )
            db.add(new_order)
            db.commit()
            db.refresh(new_order)
            return {"message": "Order created successfully", "order": new_order}
        else:
            order.quantity = quantity_data.get('quantity', order.quantity)
            db.commit()
            db.refresh(order)
            return {"message": "Order quantity updated successfully", "order": order}
            
    except Exception as e:
        db.rollback()
        print(f"Error updating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating order: {str(e)}")

@router.delete("/by-table/{table_id}")
def delete_orders_by_table(table_id: int, db: Session = Depends(get_db)):
    """Delete all orders for a specific table"""
    try:
        num_deleted = db.query(Order).filter(Order.table_id == table_id).delete(synchronize_session=False)
        db.commit()
        
        if num_deleted == 0:
            # Vẫn trả về thành công nếu không có order nào để xóa
            print(f"No orders found for table {table_id} to delete.")
        
        print(f"Successfully deleted {num_deleted} orders for table {table_id}")
        return {"message": f"Successfully deleted {num_deleted} orders for table {table_id}"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting orders for table {table_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting orders for table {table_id}: {str(e)}")

@router.delete("/table/{table_id}/dish/{dish_name}")
def delete_order_by_table_and_dish(table_id: int, dish_name: str, db: Session = Depends(get_db)):
    """Delete order by table ID and dish name"""
    # CẢI THIỆN: Đã làm gọn khối try...except
    try:
        decoded_dish_name = unquote(dish_name)
        print(f"Deleting order - Table: {table_id}, Dish: {decoded_dish_name}")
        
        order = db.query(Order).filter(
            Order.table_id == table_id,
            Order.dish_name == decoded_dish_name
        ).first()
        
        if not order:
            print(f"Order not found for table {table_id} and dish '{decoded_dish_name}'")
            raise HTTPException(status_code=404, detail=f"Order not found for table {table_id} and dish '{decoded_dish_name}'")
        
        db.delete(order)
        db.commit()
        
        print(f"Successfully deleted order for table {table_id} and dish '{decoded_dish_name}'")
        return {"message": "Order deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting order: {str(e)}")

@router.delete("/")
def delete_all_orders(db: Session = Depends(get_db)):
    """Delete all orders (TRUNCATE equivalent)"""
    try:
        db.query(Order).delete()
        db.commit()
        return {"message": "All orders deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting orders: {str(e)}")

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete a specific order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"}