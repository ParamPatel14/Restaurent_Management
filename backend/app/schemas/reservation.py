from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReservationBase(BaseModel):
    table_id: int
    customer_name: str
    customer_phone: str
    reservation_time: datetime
    party_size: int
    duration_minutes: Optional[int] = 90

class ReservationCreate(ReservationBase):
    pass

class Reservation(ReservationBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
