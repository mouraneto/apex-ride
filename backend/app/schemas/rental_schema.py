from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class EquipmentSelection(BaseModel):
    equipment_id: str
    chosen_size: str


class CreateRentalRequest(BaseModel):
    motorcycle_id: str
    track_id: str
    start_time: datetime
    end_time: datetime
    group_booking_id: Optional[str] = None
    equipments: List[EquipmentSelection] = []


class RentalSummaryResponse(BaseModel):
    rental_id: str
    rental_uuid: str
    motorcycle_id: str
    motorcycle_name: str
    track_id: str
    track_name: str
    start_time: datetime
    end_time: datetime
    effective_speed_limit: int
    hourly_rate_bike: Decimal
    hourly_rate_track: Decimal
    equipments_total: Decimal
    insurance_fee: Decimal
    total_price: Decimal
    status: str
    qr_code_base64: Optional[str] = None

    class Config:
        from_attributes = True


class CheckoutRequest(BaseModel):
    rental_id: str


class CheckoutResponse(BaseModel):
    rental_id: str
    rental_uuid: str
    status: str
    qr_code_base64: str
    message: str


class RentalTicketResponse(BaseModel):
    rental_id: str
    rental_uuid: str
    pilot_name: str
    track_name: str
    track_location: str
    motorcycle_model: str
    motorcycle_brand: str
    start_time: datetime
    end_time: datetime
    effective_speed_limit: int
    total_price: Decimal
    status: str
    qr_code_base64: str
