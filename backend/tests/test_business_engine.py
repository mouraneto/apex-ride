from datetime import datetime, timedelta
from decimal import Decimal
import pytest
from app.models import PilotLevel, Equipment, EquipmentCategory
from app.core.speed_governor import calculate_effective_speed_limit, SPEED_LIMIT_MAP
from app.services.pricing_service import calculate_total_rental_price, FIXED_INSURANCE_FEE
from app.services.qrcode_service import generate_rental_qr_code_base64


def test_speed_governor_limits():
    # Ducati Panigale V2 top speed = 270 km/h
    bike_top_speed = 270

    # Iniciante: max 100 km/h
    assert calculate_effective_speed_limit(bike_top_speed, PilotLevel.INICIANTE) == 100
    # Amador: max 160 km/h
    assert calculate_effective_speed_limit(bike_top_speed, PilotLevel.AMADOR) == 160
    # Intermediario: max 220 km/h
    assert calculate_effective_speed_limit(bike_top_speed, PilotLevel.INTERMEDIARIO) == 220
    # Avancado: 270 (pois bike top speed 270 < 280)
    assert calculate_effective_speed_limit(bike_top_speed, PilotLevel.AVANCADO) == 270
    # Profissional: 270 (bike top speed)
    assert calculate_effective_speed_limit(bike_top_speed, PilotLevel.PROFISSIONAL) == 270

    # Honda CB 650R top speed = 220 km/h
    cb_speed = 220
    assert calculate_effective_speed_limit(cb_speed, PilotLevel.INICIANTE) == 100
    assert calculate_effective_speed_limit(cb_speed, PilotLevel.AMADOR) == 160
    assert calculate_effective_speed_limit(cb_speed, PilotLevel.INTERMEDIARIO) == 220
    assert calculate_effective_speed_limit(cb_speed, PilotLevel.AVANCADO) == 220


def test_pricing_calculation():
    start = datetime(2026, 12, 10, 9, 0, 0)
    end = datetime(2026, 12, 10, 11, 0, 0) # 2 horas
    bike_rate = Decimal("450.00")
    track_rate = Decimal("250.00")
    
    helmet = Equipment(
        id="eq-001",
        name="Capacete AGV",
        category=EquipmentCategory.HELMET,
        daily_price=Decimal("50.00"),
        available_sizes="58"
    )

    pricing = calculate_total_rental_price(
        start_time=start,
        end_time=end,
        bike_hourly_price=bike_rate,
        track_hourly_price=track_rate,
        equipments=[helmet]
    )

    # 2 * 450 = 900
    # 2 * 250 = 500
    # equip = 50
    # seguro = 75
    # total = 1525.00
    assert pricing["hours"] == 2.0
    assert pricing["bike_cost"] == Decimal("900.00")
    assert pricing["track_cost"] == Decimal("500.00")
    assert pricing["equipments_cost"] == Decimal("50.00")
    assert pricing["insurance_fee"] == FIXED_INSURANCE_FEE
    assert pricing["total_price"] == Decimal("1525.00")


def test_qr_code_generation():
    test_uuid = "e9b2a75d-3174-4b5b-b9f8-d748f21e5c0e"
    qr_b64 = generate_rental_qr_code_base64(test_uuid)
    
    assert qr_b64.startswith("data:image/png;base64,")
    assert len(qr_b64) > 100
