from pydantic import BaseModel
from typing import Optional, List

class CategoryBase(BaseModel):
    name: str
    display_order: int = 0

class Category(CategoryBase):
    id: int

class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category_id: int
    image_url: Optional[str] = None
    is_active: bool = True

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class MenuItem(MenuItemBase):
    id: int
    category_name: Optional[str] = None

class MenuResponse(BaseModel):
    categories: List[Category]
    items: List[MenuItem]
