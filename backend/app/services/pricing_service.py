from decimal import Decimal
from datetime import datetime
from typing import List
from app.models import Equipment

FIXED_INSURANCE_FEE = Decimal("75.00")  # Seguro de pista obrigatório


def calculate_total_rental_price(
    start_time: datetime,
    end_time: datetime,
    bike_hourly_price: Decimal,
    track_hourly_price: Decimal,
    equipments: List[Equipment]
) -> dict:
    """
    Calcula o valor total da reserva somando a duracao das horas de uso,
    diária dos equipamentos e seguro obrigatório.
    """
    duration_seconds = (end_time - start_time).total_seconds()
    # Mínimo de 1 hora
    hours = Decimal(max(1.0, duration_seconds / 3600.0))

    bike_cost = (bike_hourly_price * hours).quantize(Decimal("0.01"))
    track_cost = (track_hourly_price * hours).quantize(Decimal("0.01"))
    equipments_cost = sum([eq.daily_price for eq in equipments], Decimal("0.00")).quantize(Decimal("0.01"))
    
    total = (bike_cost + track_cost + equipments_cost + FIXED_INSURANCE_FEE).quantize(Decimal("0.01"))

    return {
        "hours": float(hours),
        "bike_cost": bike_cost,
        "track_cost": track_cost,
        "equipments_cost": equipments_cost,
        "insurance_fee": FIXED_INSURANCE_FEE,
        "total_price": total
    }
