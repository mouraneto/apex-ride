from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel
from app.models import MotorcycleStatus, EquipmentCategory


class TrackResponse(BaseModel):
    id: str
    name: str
    location: str
    length_km: Decimal
    hourly_rate: Decimal
    image_url: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class MotorcycleResponse(BaseModel):
    id: str
    track_id: str
    brand: str
    model: str
    cc: int
    base_top_speed: int
    base_hourly_price: Decimal
    image_url: Optional[str] = None
    status: MotorcycleStatus

    class Config:
        from_attributes = True


class EquipmentResponse(BaseModel):
    id: str
    name: str
    category: EquipmentCategory
    daily_price: Decimal
    available_sizes: str
    available_sizes_list: Optional[List[str]] = None

    class Config:
        from_attributes = True
