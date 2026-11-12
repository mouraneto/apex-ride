from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class TelemetryLap(BaseModel):
    lap_number: int
    lap_time_seconds: Decimal
    max_speed_kmh: Decimal
    avg_speed_kmh: Decimal
    max_g_force: Decimal
    falls_count: int

    class Config:
        from_attributes = True


class TelemetryRentalResponse(BaseModel):
    rental_id: str
    rental_uuid: str
    track_name: str
    motorcycle_name: str
    laps: List[TelemetryLap]
    best_lap_seconds: Optional[Decimal] = None
    overall_max_speed: Optional[Decimal] = None
    overall_avg_speed: Optional[Decimal] = None
    total_falls: int = 0


class MockSessionRequest(BaseModel):
    rental_id: str
    laps_count: int = 5


class LeaderboardItemResponse(BaseModel):
    rank: int
    pilot_name: str
    pilot_level: str
    track_name: str
    motorcycle_model: str
    best_lap_time: Decimal
    max_speed_kmh: Decimal
    avg_speed_kmh: Decimal
    max_g_force: Decimal
