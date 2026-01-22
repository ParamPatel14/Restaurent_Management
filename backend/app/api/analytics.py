from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.utils.db_helper import fetch_all, fetch_one, get_db_connection

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/summary")
def get_analytics_summary():
    """
    Returns high-level metrics:
    - Total Revenue (from payments)
    - Total Orders (served/paid)
    - Average Order Value
    - Pending Orders
    """
    try:
        # 1. Total Revenue
        # Use payments table for authoritative revenue
        query_revenue = "SELECT COALESCE(SUM(amount), 0) FROM payments"
        total_revenue = fetch_one(query_revenue)[0]

        # 2. Total Paid Orders
        query_paid_orders = "SELECT COUNT(*) FROM orders WHERE status = 'paid'"
        total_paid_orders = fetch_one(query_paid_orders)[0]

        # 3. Average Order Value (AOV)
        aov = float(total_revenue) / total_paid_orders if total_paid_orders > 0 else 0

        # 4. Active Orders (not paid, not cancelled, not served)
        # Assuming 'served' is technically active until paid, but let's count 'pending', 'preparing', 'ready'
        query_active = "SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'preparing', 'ready')"
        active_orders = fetch_one(query_active)[0]

        return {
            "total_revenue": float(total_revenue),
            "total_orders": total_paid_orders,
            "average_order_value": round(aov, 2),
            "active_orders": active_orders
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/revenue-chart")
def get_revenue_chart(period: str = 'daily'):
    """
    Returns revenue data grouped by day for charts.
    """
    try:
        # Group payments by date
        # Postgres: date_trunc('day', payment_time)
        query = """
            SELECT 
                TO_CHAR(payment_time, 'YYYY-MM-DD') as date, 
                SUM(amount) as revenue 
            FROM payments 
            GROUP BY TO_CHAR(payment_time, 'YYYY-MM-DD') 
            ORDER BY date ASC 
            LIMIT 30
        """
        rows = fetch_all(query)
        
        return [
            {"date": r[0], "revenue": float(r[1])}
            for r in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-items")
def get_top_items():
    """
    Returns top selling menu items by quantity.
    """
    try:
        # Join order_items with menu_items, filter by non-cancelled orders
        query = """
            SELECT 
                m.name, 
                SUM(oi.quantity) as total_qty,
                SUM(oi.quantity * oi.unit_price) as total_sales
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN menu_items m ON oi.menu_item_id = m.id
            WHERE o.status != 'cancelled'
            GROUP BY m.name
            ORDER BY total_qty DESC
            LIMIT 5
        """
        rows = fetch_all(query)
        
        return [
            {"name": r[0], "quantity": r[1], "sales": float(r[2])}
            for r in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/order-status")
def get_order_status_distribution():
    """
    Returns count of orders by status.
    """
    try:
        query = "SELECT status, COUNT(*) FROM orders GROUP BY status"
        rows = fetch_all(query)
        
        return [
            {"status": r[0], "count": r[1]}
            for r in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
