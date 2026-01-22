from pydantic import BaseModel
from typing import Optional

class TableBase(BaseModel):
    table_number: int
    capacity: int
    location: Optional[str] = "main_hall"
    is_active: Optional[bool] = True

class TableCreate(TableBase):
    pass

class Table(TableBase):
    id: int

    class Config:
        from_attributes = True
