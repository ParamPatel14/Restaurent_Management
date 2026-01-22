from fastapi import APIRouter, HTTPException
from typing import List
from datetime import timedelta
from app.utils.db_helper import fetch_all, fetch_one, execute_query, fetch_one_and_commit
from app.schemas.reservation import Reservation, ReservationCreate

router = APIRouter(prefix="/api/reservations", tags=["Reservations"])

@router.get("/", response_model=List[Reservation])
def get_reservations():
    query = """
        SELECT id, table_id, customer_name, customer_phone, reservation_time, party_size, duration_minutes, status, created_at 
        FROM reservations 
        ORDER BY reservation_time DESC
    """
    results = fetch_all(query)
    if not results:
        return []
    return [
        {
            "id": r[0], 
            "table_id": r[1], 
            "customer_name": r[2], 
            "customer_phone": r[3], 
            "reservation_time": r[4], 
            "party_size": r[5],
            "duration_minutes": r[6],
            "status": r[7], 
            "created_at": r[8]
        } 
        for r in results
    ]

@router.post("/", response_model=Reservation)
def create_reservation(reservation: ReservationCreate):
    # Check if table exists
    table_query = "SELECT capacity FROM tables WHERE id = %s"
    table = fetch_one(table_query, (reservation.table_id,))
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    # Check capacity
    if reservation.party_size > table[0]:
         raise HTTPException(status_code=400, detail="Party size exceeds table capacity")

    # Calculate end time for the new reservation
    new_start = reservation.reservation_time
    new_end = new_start + timedelta(minutes=reservation.duration_minutes)

    # Check for conflicts
    # Overlap logic: (StartA < EndB) and (StartB < EndA)
    conflict_query = """
        SELECT id FROM reservations
        WHERE table_id = %s
          AND status != 'cancelled'
          AND (%s < reservation_time + make_interval(mins => duration_minutes))
          AND (reservation_time < %s)
    """
    # Note: make_interval is PostgreSQL specific.
    
    conflict = fetch_one(conflict_query, (reservation.table_id, new_start, new_end))
    if conflict:
        raise HTTPException(status_code=409, detail="Table is already reserved for this time slot")

    query = """
        INSERT INTO reservations (table_id, customer_name, customer_phone, reservation_time, party_size, duration_minutes, status)
        VALUES (%s, %s, %s, %s, %s, %s, 'confirmed')
        RETURNING id, table_id, customer_name, customer_phone, reservation_time, party_size, duration_minutes, status, created_at
    """
    result = fetch_one_and_commit(query, (
        reservation.table_id, 
        reservation.customer_name, 
        reservation.customer_phone, 
        reservation.reservation_time, 
        reservation.party_size,
        reservation.duration_minutes
    ))
    
    return {
        "id": result[0],
        "table_id": result[1],
        "customer_name": result[2],
        "customer_phone": result[3],
        "reservation_time": result[4],
        "party_size": result[5],
        "duration_minutes": result[6],
        "status": result[7],
        "created_at": result[8]
    }
