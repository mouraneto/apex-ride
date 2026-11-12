from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    tracks,
    motorcycles,
    equipments,
    rentals,
    operator,
    telemetry,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(tracks.router, prefix="/tracks", tags=["tracks"])
api_router.include_router(motorcycles.router, prefix="/motorcycles", tags=["motorcycles"])
api_router.include_router(equipments.router, prefix="/equipments", tags=["equipments"])
api_router.include_router(rentals.router, prefix="/rentals", tags=["rentals"])
# Roteamento de payments/checkout conforme spec 03 seção 4.3
api_router.include_router(rentals.router, prefix="/payments", tags=["payments"])
api_router.include_router(operator.router, prefix="/operator", tags=["operator"])
api_router.include_router(telemetry.router, prefix="/telemetry", tags=["telemetry"])
