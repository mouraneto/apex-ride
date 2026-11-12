import random
from decimal import Decimal
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select, desc
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_current_user, get_current_operator
from app.core.database import get_session
from app.models import Rental, TelemetryLog, User, Track, Motorcycle, RentalStatus
from app.schemas.telemetry_schema import (
    TelemetryRentalResponse,
    TelemetryLap,
    MockSessionRequest,
    LeaderboardItemResponse,
)

router = APIRouter()


@router.get(
    "/rental/{rental_id}",
    response_model=TelemetryRentalResponse,
    summary="Obter histórico de telemetria de uma locação"
)
async def get_rental_telemetry(
    rental_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    rental_stmt = (
        select(Rental, Track, Motorcycle)
        .join(Track, Rental.track_id == Track.id)
        .join(Motorcycle, Rental.motorcycle_id == Motorcycle.id)
        .where(Rental.id == rental_id, Rental.user_id == current_user.id)
    )
    res = (await session.execute(rental_stmt)).first()
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Locação não encontrada."
        )

    rental, track, bike = res

    logs_stmt = (
        select(TelemetryLog)
        .where(TelemetryLog.rental_id == rental_id)
        .order_by(TelemetryLog.lap_number.asc())
    )
    logs = (await session.execute(logs_stmt)).scalars().all()

    laps = [
        TelemetryLap(
            lap_number=l.lap_number,
            lap_time_seconds=l.lap_time_seconds,
            max_speed_kmh=l.max_speed_kmh,
            avg_speed_kmh=l.avg_speed_kmh,
            max_g_force=l.max_g_force,
            falls_count=l.falls_count
        )
        for l in logs
    ]

    best_lap = min([l.lap_time_seconds for l in laps], default=None)
    overall_max_speed = max([l.max_speed_kmh for l in laps], default=None)
    overall_avg_speed = (
        (sum([l.avg_speed_kmh for l in laps]) / len(laps)).quantize(Decimal("0.01"))
        if laps else None
    )
    total_falls = sum([l.falls_count for l in laps])

    return TelemetryRentalResponse(
        rental_id=rental.id,
        rental_uuid=rental.rental_uuid,
        track_name=track.name,
        motorcycle_name=f"{bike.brand} {bike.model}",
        laps=laps,
        best_lap_seconds=best_lap,
        overall_max_speed=overall_max_speed,
        overall_avg_speed=overall_avg_speed,
        total_falls=total_falls
    )


@router.post(
    "/mock-session",
    response_model=TelemetryRentalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Gerar dados sintéticos de telemetria para testes (Operador)"
)
async def generate_mock_telemetry_session(
    payload: MockSessionRequest,
    current_operator: User = Depends(get_current_operator),
    session: AsyncSession = Depends(get_session)
):
    rental_stmt = (
        select(Rental, Track, Motorcycle)
        .join(Track, Rental.track_id == Track.id)
        .join(Motorcycle, Rental.motorcycle_id == Motorcycle.id)
        .where(Rental.id == payload.rental_id)
    )
    res = (await session.execute(rental_stmt)).first()
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada."
        )

    rental, track, bike = res

    # Remover logs antigos se houver
    del_stmt = select(TelemetryLog).where(TelemetryLog.rental_id == rental.id)
    old_logs = (await session.execute(del_stmt)).scalars().all()
    for ol in old_logs:
        await session.delete(ol)

    # Base de velocidade respeitando effective_speed_limit
    max_allowed = float(rental.effective_speed_limit)
    new_logs = []

    for lap in range(1, payload.laps_count + 1):
        lap_time = Decimal(str(round(random.uniform(92.0, 115.0), 3)))
        max_speed = Decimal(str(round(random.uniform(max_allowed * 0.85, max_allowed), 2)))
        avg_speed = Decimal(str(round(float(max_speed) * random.uniform(0.65, 0.78), 2)))
        g_force = Decimal(str(round(random.uniform(1.15, 1.65), 2)))
        falls = 1 if (random.random() < 0.1 and lap > 1) else 0

        t_log = TelemetryLog(
            rental_id=rental.id,
            lap_number=lap,
            lap_time_seconds=lap_time,
            max_speed_kmh=max_speed,
            avg_speed_kmh=avg_speed,
            max_g_force=g_force,
            falls_count=falls
        )
        session.add(t_log)
        new_logs.append(t_log)

    rental.status = RentalStatus.COMPLETED
    session.add(rental)
    await session.commit()

    return await get_rental_telemetry(
        rental_id=rental.id,
        current_user=await session.get(User, rental.user_id),
        session=session
    )


@router.get(
    "/leaderboard",
    response_model=List[LeaderboardItemResponse],
    summary="Ranking global Arcade (Leaderboard)"
)
async def get_leaderboard(session: AsyncSession = Depends(get_session)):
    stmt = (
        select(TelemetryLog, Rental, User, Track, Motorcycle)
        .join(Rental, TelemetryLog.rental_id == Rental.id)
        .join(User, Rental.user_id == User.id)
        .join(Track, Rental.track_id == Track.id)
        .join(Motorcycle, Rental.motorcycle_id == Motorcycle.id)
        .order_by(TelemetryLog.lap_time_seconds.asc())
        .limit(20)
    )
    results = (await session.execute(stmt)).all()

    leaderboard = []
    for rank, (tlog, rental, user, track, bike) in enumerate(results, start=1):
        leaderboard.append(
            LeaderboardItemResponse(
                rank=rank,
                pilot_name=user.name,
                pilot_level=user.pilot_level.value,
                track_name=track.name,
                motorcycle_model=f"{bike.brand} {bike.model}",
                best_lap_time=tlog.lap_time_seconds,
                max_speed_kmh=tlog.max_speed_kmh,
                avg_speed_kmh=tlog.avg_speed_kmh,
                max_g_force=tlog.max_g_force
            )
        )
    return leaderboard
