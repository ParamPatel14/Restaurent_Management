from fastapi import APIRouter, HTTPException
from app.utils.db_helper import fetch_all, fetch_one, execute_query
from app.schemas.menu import MenuItem, MenuItemCreate, MenuItemUpdate, Category
from typing import List

router = APIRouter(prefix="/api/menu", tags=["Menu"])

@router.get("/categories", response_model=List[Category])
def get_categories():
    query = "SELECT id, name, display_order FROM categories ORDER BY display_order"
    results = fetch_all(query)
    if not results:
        return []
    return [{"id": r[0], "name": r[1], "display_order": r[2]} for r in results]

@router.get("/items", response_model=List[MenuItem])
def get_menu_items():
    query = """
        SELECT m.id, m.name, m.description, m.price, m.category_id, m.image_url, m.is_active, c.name as category_name
        FROM menu_items m
        LEFT JOIN categories c ON m.category_id = c.id
        ORDER BY c.display_order, m.name
    """
    results = fetch_all(query)
    if not results:
        return []
    
    items = []
    for r in results:
        items.append({
            "id": r[0],
            "name": r[1],
            "description": r[2],
            "price": float(r[3]),
            "category_id": r[4],
            "image_url": r[5],
            "is_active": r[6],
            "category_name": r[7]
        })
    return items

@router.post("/items", response_model=MenuItem)
def create_menu_item(item: MenuItemCreate):
    query = """
        INSERT INTO menu_items (name, description, price, category_id, image_url, is_active)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
    """
    params = (item.name, item.description, item.price, item.category_id, item.image_url, item.is_active)
    
    # We need to execute and fetch the ID, but execute_query doesn't return result.
    # So we'll use a custom fetch here or modify execute_query. 
    # Actually, let's just write the logic here for simplicity or add fetch_value to helper.
    # For now, I'll just use a raw connection here since I need RETURNING.
    
    from app.core.database import get_db_connection
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(query, params)
        new_id = cur.fetchone()[0]
        conn.commit()
        
        # Fetch the full object to return
        return {**item.dict(), "id": new_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@router.put("/items/{item_id}")
def update_menu_item(item_id: int, item: MenuItemUpdate):
    # Construct dynamic update query
    fields = []
    values = []
    
    if item.name is not None:
        fields.append("name = %s")
        values.append(item.name)
    if item.description is not None:
        fields.append("description = %s")
        values.append(item.description)
    if item.price is not None:
        fields.append("price = %s")
        values.append(item.price)
    if item.category_id is not None:
        fields.append("category_id = %s")
        values.append(item.category_id)
    if item.image_url is not None:
        fields.append("image_url = %s")
        values.append(item.image_url)
    if item.is_active is not None:
        fields.append("is_active = %s")
        values.append(item.is_active)
        
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    query = f"UPDATE menu_items SET {', '.join(fields)} WHERE id = %s"
    values.append(item_id)
    
    try:
        execute_query(query, tuple(values))
        return {"message": "Item updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/items/{item_id}")
def delete_menu_item(item_id: int):
    query = "DELETE FROM menu_items WHERE id = %s"
    try:
        execute_query(query, (item_id,))
        return {"message": "Item deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
