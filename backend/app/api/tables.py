from fastapi import APIRouter, HTTPException, Query
from typing import List
from datetime import datetime, timedelta
from app.utils.db_helper import fetch_all, fetch_one, execute_query, fetch_one_and_commit
from app.schemas.table import Table, TableCreate

router = APIRouter(prefix="/api/tables", tags=["Tables"])

@router.get("/available", response_model=List[Table])
def get_available_tables(
    reservation_time: datetime = Query(...),
    duration_minutes: int = Query(90)
):
    end_time = reservation_time + timedelta(minutes=duration_minutes)
    
    # Find tables that are NOT occupied during the requested window
    query = """
        SELECT t.id, t.table_number, t.capacity, t.location, t.is_active 
        FROM tables t
        WHERE t.is_active = TRUE
        AND t.id NOT IN (
            SELECT r.table_id 
            FROM reservations r
            WHERE r.status != 'cancelled'
            AND (%s < r.reservation_time + make_interval(mins => r.duration_minutes))
            AND (r.reservation_time < %s)
        )
        ORDER BY t.capacity ASC, t.table_number ASC
    """
    
    results = fetch_all(query, (reservation_time, end_time))
    if not results:
        return []
        
    return [
        {
            "id": r[0], 
            "table_number": r[1], 
            "capacity": r[2], 
            "location": r[3], 
            "is_active": r[4]
        } 
        for r in results
    ]

@router.get("/", response_model=List[Table])
def get_tables():
    query = "SELECT id, table_number, capacity, location, is_active FROM tables ORDER BY table_number"
    results = fetch_all(query)
    if not results:
        return []
    return [
        {
            "id": r[0], 
            "table_number": r[1], 
            "capacity": r[2], 
            "location": r[3], 
            "is_active": r[4]
        } 
        for r in results
    ]

@router.post("/", response_model=Table)
def create_table(table: TableCreate):
    check_query = "SELECT id FROM tables WHERE table_number = %s"
    if fetch_one(check_query, (table.table_number,)):
        raise HTTPException(status_code=400, detail="Table number already exists")

    query = """
        INSERT INTO tables (table_number, capacity, location, is_active)
        VALUES (%s, %s, %s, %s)
        RETURNING id, table_number, capacity, location, is_active
    """
    result = fetch_one_and_commit(query, (table.table_number, table.capacity, table.location, table.is_active))
    
    return {
        "id": result[0],
        "table_number": result[1],
        "capacity": result[2],
        "location": result[3],
        "is_active": result[4]
    }
