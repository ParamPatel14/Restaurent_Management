from fastapi import APIRouter, HTTPException, Body, WebSocket, WebSocketDisconnect
from typing import List
from datetime import datetime
from app.utils.db_helper import fetch_all, fetch_one, fetch_one_and_commit, execute_query, get_db_connection
from app.schemas.order import Order, OrderCreate, OrderUpdateStatus, OrderItem, PaymentCreate, Payment
from app.utils.websockets import manager

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, maybe wait for messages (though we only broadcast mostly)
            # If client sends something, we can handle it here
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.post("/", response_model=Order)
async def create_order(order: OrderCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # 1. Validate table
        cur.execute("SELECT id FROM tables WHERE id = %s", (order.table_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Table not found")
            
        # 2. Calculate total and validate items
        total_amount = 0
        valid_items = []
        
        for item in order.items:
            cur.execute("SELECT price, name FROM menu_items WHERE id = %s", (item.menu_item_id,))
            menu_item = cur.fetchone()
            if not menu_item:
                raise HTTPException(status_code=404, detail=f"Menu item {item.menu_item_id} not found")
            
            price = float(menu_item[0])
            name = menu_item[1]
            total_amount += price * item.quantity
            valid_items.append({
                "menu_item_id": item.menu_item_id,
                "quantity": item.quantity,
                "unit_price": price,
                "notes": item.notes,
                "name": name
            })
            
        # 3. Create Order
        cur.execute("""
            INSERT INTO orders (table_id, reservation_id, total_amount, status)
            VALUES (%s, %s, %s, 'pending')
            RETURNING id, created_at, updated_at
        """, (order.table_id, order.reservation_id, total_amount))
        
        order_row = cur.fetchone()
        order_id = order_row[0]
        created_at = order_row[1]
        updated_at = order_row[2]
        
        # 4. Create Order Items
        for item in valid_items:
            cur.execute("""
                INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes)
                VALUES (%s, %s, %s, %s, %s)
            """, (order_id, item["menu_item_id"], item["quantity"], item["unit_price"], item["notes"]))
            
        conn.commit()
        
        # Construct response
        response_items = [
            OrderItem(
                id=0, # We didn't fetch IDs for items, but usually frontend needs order ID more
                order_id=order_id,
                menu_item_id=i["menu_item_id"],
                quantity=i["quantity"],
                unit_price=i["unit_price"],
                notes=i["notes"],
                menu_item_name=i["name"]
            ) for i in valid_items
        ]
        # Construct response object first
        new_order = Order(
            id=order_id,
            table_id=order.table_id,
            reservation_id=order.reservation_id,
            status='pending',
            total_amount=total_amount,
            created_at=created_at,
            updated_at=updated_at,
            items=response_items
        )
        
        # Broadcast event
        await manager.broadcast({
            "type": "new_order",
            "order": {
                "id": new_order.id,
                "table_id": new_order.table_id,
                "status": new_order.status,
                "items": [{"name": i.menu_item_name, "quantity": i.quantity} for i in new_order.items],
                "created_at": new_order.created_at.isoformat()
            }
        })
        
        return new_order
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

@router.get("/{order_id}", response_model=Order)
def get_order(order_id: int):
    query_order = "SELECT id, table_id, reservation_id, status, total_amount, created_at, updated_at FROM orders WHERE id = %s"
    order_row = fetch_one(query_order, (order_id,))
    if not order_row:
        raise HTTPException(status_code=404, detail="Order not found")
        
    query_items = """
        SELECT oi.id, oi.order_id, oi.menu_item_id, oi.quantity, oi.unit_price, oi.notes, m.name
        FROM order_items oi
        JOIN menu_items m ON oi.menu_item_id = m.id
        WHERE oi.order_id = %s
    """
    items_rows = fetch_all(query_items, (order_id,))
    
    items = [
        OrderItem(
            id=r[0],
            order_id=r[1],
            menu_item_id=r[2],
            quantity=r[3],
            unit_price=float(r[4]),
            notes=r[5],
            menu_item_name=r[6]
        ) for r in items_rows
    ]
    
    return Order(
        id=order_row[0],
        table_id=order_row[1],
        reservation_id=order_row[2],
        status=order_row[3],
        total_amount=float(order_row[4]),
        created_at=order_row[5],
        updated_at=order_row[6],
        items=items
    )

@router.get("/", response_model=List[Order])
def get_orders(status: str = None):
    query = "SELECT id, table_id, reservation_id, status, total_amount, created_at, updated_at FROM orders"
    params = []
    if status:
        query += " WHERE status = %s"
        params.append(status)
    query += " ORDER BY created_at DESC"
    
    orders_rows = fetch_all(query, tuple(params) if params else None)
    
    orders = []
    for r in orders_rows:
        query_items = """
            SELECT oi.id, oi.order_id, oi.menu_item_id, oi.quantity, oi.unit_price, oi.notes, m.name
            FROM order_items oi
            JOIN menu_items m ON oi.menu_item_id = m.id
            WHERE oi.order_id = %s
        """
        items_rows = fetch_all(query_items, (r[0],))
        items = [
            OrderItem(
                id=ir[0],
                order_id=ir[1],
                menu_item_id=ir[2],
                quantity=ir[3],
                unit_price=float(ir[4]),
                notes=ir[5],
                menu_item_name=ir[6]
            ) for ir in items_rows
        ]
        
        orders.append(Order(
            id=r[0],
            table_id=r[1],
            reservation_id=r[2],
            status=r[3],
            total_amount=float(r[4]),
            created_at=r[5],
            updated_at=r[6],
            items=items
        ))
        
    return orders

@router.put("/{order_id}/status", response_model=Order)
async def update_order_status(order_id: int, status_update: OrderUpdateStatus):
    valid_statuses = ['pending', 'preparing', 'ready', 'served', 'paid', 'cancelled']
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get current status
        cur.execute("SELECT status FROM orders WHERE id = %s", (order_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Order not found")
        
        old_status = row[0]
        new_status = status_update.status
        
        cur.execute("""
            UPDATE orders 
            SET status = %s, updated_at = CURRENT_TIMESTAMP 
            WHERE id = %s 
        """, (new_status, order_id))
        
        cur.execute("""
            INSERT INTO order_logs (order_id, old_status, new_status)
            VALUES (%s, %s, %s)
        """, (order_id, old_status, new_status))
        
        conn.commit()
        
        # Broadcast update
        await manager.broadcast({
            "type": "status_update",
            "order_id": order_id,
            "new_status": new_status,
            "old_status": old_status
        })
        
        return get_order(order_id)
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

@router.post("/{order_id}/pay", response_model=Payment)
async def pay_order(order_id: int, payment: PaymentCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # 1. Get Order
        cur.execute("SELECT status, total_amount FROM orders WHERE id = %s", (order_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Order not found")
        
        status, total_amount = row
        
        # 2. Check status
        if status == 'paid':
             raise HTTPException(status_code=400, detail="Order already paid")
             
        # 3. Record Payment
        cur.execute("""
            INSERT INTO payments (order_id, amount, payment_method, transaction_id)
            VALUES (%s, %s, %s, %s)
            RETURNING id, payment_time
        """, (order_id, payment.amount, payment.payment_method, payment.transaction_id))
        
        pay_row = cur.fetchone()
        payment_id = pay_row[0]
        payment_time = pay_row[1]
        
        # 4. Update Order Status to 'paid'
        new_status = 'paid'
        cur.execute("""
            UPDATE orders 
            SET status = %s, updated_at = CURRENT_TIMESTAMP 
            WHERE id = %s 
        """, (new_status, order_id))
        
        # 5. Log change
        cur.execute("""
            INSERT INTO order_logs (order_id, old_status, new_status)
            VALUES (%s, %s, %s)
        """, (order_id, status, new_status))
        
        conn.commit()
        
        # Broadcast update
        await manager.broadcast({
            "type": "status_update",
            "order_id": order_id,
            "new_status": new_status,
            "old_status": status
        })
        
        return Payment(
            id=payment_id,
            order_id=order_id,
            amount=payment.amount,
            payment_method=payment.payment_method,
            transaction_id=payment.transaction_id,
            payment_time=payment_time
        )
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()
