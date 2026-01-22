from fastapi import APIRouter
from app.utils.db_helper import fetch_one

router = APIRouter(prefix="/api")

@router.get("/health")
def health_check():
    db_status = fetch_one("SELECT 1;")
    return {
        "status": "OK",
        "database": "connected" if db_status else "not connected"
    }
