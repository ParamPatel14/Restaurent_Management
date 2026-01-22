
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
