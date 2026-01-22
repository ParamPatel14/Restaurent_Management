from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.menu import router as menu_router
from app.api.tables import router as tables_router
from app.api.reservations import router as reservations_router
from app.api.orders import router as orders_router

app = FastAPI(
    title="Restaurant Management System",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(menu_router)
app.include_router(tables_router)
app.include_router(reservations_router)
app.include_router(orders_router)

@app.get("/")
def root():
    return {"message": "RMS Backend Running"}
