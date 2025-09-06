from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from urllib.parse import unquote

from app.database import get_db
from app.models.models import Order
from app.schemas.schemas import OrderResponse, OrderCreate, AddOrderRequest

router = APIRouter()

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
        note=order_request.note or ''  # Thêm note
    )
    
    try:
        # Kiểm tra xem order đã tồn tại chưa
        existing_order = db.query(Order).filter(
            Order.table_id == order_data.table_id,
            Order.dish_name == order_data.dish_name
        ).first()
        
        if existing_order:
            # Nếu đã tồn tại, cập nhật quantity và note
            print(f"Order exists, updating: Table {order_data.table_id}, Dish: {order_data.dish_name}")
            existing_order.quantity = order_data.quantity
            if order_data.note:  # Chỉ update note nếu có note mới
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

@router.put("/table/{table_id}/dish/{dish_name}")
def update_order_quantity(table_id: int, dish_name: str, quantity_data: dict, db: Session = Depends(get_db)):
    """Update order quantity for specific table and dish"""
    try:
        # Decode URL-encoded dish name
        decoded_dish_name = unquote(dish_name)
        print(f"Updating order - Table: {table_id}, Dish: {decoded_dish_name}, Data: {quantity_data}")
        
        # Tìm order theo table_id và dish_name
        order = db.query(Order).filter(
            Order.table_id == table_id,
            Order.dish_name == decoded_dish_name
        ).first()
        
        if not order:
            # Nếu order không tồn tại, tạo mới thay vì trả lỗi
            print(f"Order not found, creating new order for table {table_id} and dish '{decoded_dish_name}'")
            from datetime import datetime
            
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
            # Cập nhật quantity cho order đã tồn tại
            order.quantity = quantity_data.get('quantity', order.quantity)
            db.commit()
            db.refresh(order)
            
            return {"message": "Order quantity updated successfully", "order": order}
            
    except Exception as e:
        db.rollback()
        print(f"Error updating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating order: {str(e)}")

@router.delete("/table/{table_id}/dish/{dish_name}")
def delete_order_by_table_and_dish(table_id: int, dish_name: str, db: Session = Depends(get_db)):
    """Delete order by table ID and dish name"""
    try:
        # Decode URL-encoded dish name
        decoded_dish_name = unquote(dish_name)
        print(f"Deleting order - Table: {table_id}, Dish: {decoded_dish_name}")
        
        # Tìm order theo table_id và dish_name
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
    except HTTPException:
        raise
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

@router.put("/table/{table_id}/dish/{dish_name}/note")
def update_order_note(table_id: int, dish_name: str, note_data: dict, db: Session = Depends(get_db)):
    """Update order note for specific table and dish"""
    try:
        # Decode URL-encoded dish name
        decoded_dish_name = unquote(dish_name)
        print(f"Updating note - Table: {table_id}, Dish: {decoded_dish_name}, Note: {note_data.get('note', '')}")
        
        # Tìm order theo table_id và dish_name
        order = db.query(Order).filter(
            Order.table_id == table_id,
            Order.dish_name == decoded_dish_name
        ).first()
        
        if not order:
            raise HTTPException(status_code=404, detail=f"Order not found for table {table_id} and dish '{decoded_dish_name}'")
        
        # Cập nhật note
        order.note = note_data.get('note', '')
        db.commit()
        db.refresh(order)
        
        return {"message": "Order note updated successfully", "order": order}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error updating order note: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating order note: {str(e)}")

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete a specific order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"}
