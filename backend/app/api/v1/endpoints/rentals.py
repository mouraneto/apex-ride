import uuid
from decimal import Decimal
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select, or_, and_
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_session
from app.core.speed_governor import calculate_effective_speed_limit
from app.models import (
    User,
    Rental,
    RentalStatus,
    Motorcycle,
    Track,
    Equipment,
    RentalEquipment,
)
from app.schemas.rental_schema import (
    CreateRentalRequest,
    RentalSummaryResponse,
    CheckoutRequest,
    CheckoutResponse,
    RentalTicketResponse,
)
from app.services.pricing_service import calculate_total_rental_price
from app.services.qrcode_service import generate_rental_qr_code_base64

router = APIRouter()


@router.post(
    "",
    response_model=RentalSummaryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar solicitação de locação"
)
async def create_rental(
    rental_in: CreateRentalRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    # 1. Validação de datas
    if rental_in.end_time <= rental_in.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A data final da locação deve ser posterior à data inicial."
        )

    # 2. Buscar motocicleta e pista
    bike_stmt = select(Motorcycle).where(Motorcycle.id == rental_in.motorcycle_id)
    bike = (await session.execute(bike_stmt)).scalar_one_or_none()
    if not bike:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Motocicleta não encontrada."
        )

    track_stmt = select(Track).where(Track.id == rental_in.track_id)
    track = (await session.execute(track_stmt)).scalar_one_or_none()
    if not track:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Autódromo não encontrado."
        )

    # 3. Prevenção de Overbooking Temporal
    conflict_stmt = select(Rental).where(
        Rental.motorcycle_id == rental_in.motorcycle_id,
        Rental.status.in_([RentalStatus.PENDING, RentalStatus.CONFIRMED]),
        and_(
            rental_in.start_time < Rental.end_time,
            rental_in.end_time > Rental.start_time
        )
    )
    conflict = (await session.execute(conflict_stmt)).scalars().first()
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A motocicleta selecionada já está reservada no horário solicitado."
        )

    # 4. Buscar equipamentos selecionados
    equipments: List[Equipment] = []
    for eq_sel in rental_in.equipments:
        eq_stmt = select(Equipment).where(Equipment.id == eq_sel.equipment_id)
        eq = (await session.execute(eq_stmt)).scalar_one_or_none()
        if eq:
            equipments.append(eq)

    # 5. Cálculo Financeiro e Limite de Velocidade
    pricing = calculate_total_rental_price(
        start_time=rental_in.start_time,
        end_time=rental_in.end_time,
        bike_hourly_price=bike.base_hourly_price,
        track_hourly_price=track.hourly_rate,
        equipments=equipments
    )

    effective_limit = calculate_effective_speed_limit(
        bike_base_top_speed=bike.base_top_speed,
        pilot_level=current_user.pilot_level
    )

    # 6. Salvar Rental
    rental = Rental(
        user_id=current_user.id,
        motorcycle_id=bike.id,
        track_id=track.id,
        group_booking_id=rental_in.group_booking_id,
        start_time=rental_in.start_time,
        end_time=rental_in.end_time,
        total_price=pricing["total_price"],
        status=RentalStatus.PENDING,
        effective_speed_limit=effective_limit
    )
    session.add(rental)
    await session.commit()
    await session.refresh(rental)

    # 7. Salvar equipamentos associados
    for eq_sel in rental_in.equipments:
        eq_obj = next((e for e in equipments if e.id == eq_sel.equipment_id), None)
        if eq_obj:
            r_eq = RentalEquipment(
                rental_id=rental.id,
                equipment_id=eq_obj.id,
                chosen_size=eq_sel.chosen_size,
                price_at_booking=eq_obj.daily_price
            )
            session.add(r_eq)
    await session.commit()

    return RentalSummaryResponse(
        rental_id=rental.id,
        rental_uuid=rental.rental_uuid,
        motorcycle_id=bike.id,
        motorcycle_name=f"{bike.brand} {bike.model}",
        track_id=track.id,
        track_name=track.name,
        start_time=rental.start_time,
        end_time=rental.end_time,
        effective_speed_limit=rental.effective_speed_limit,
        hourly_rate_bike=bike.base_hourly_price,
        hourly_rate_track=track.hourly_rate,
        equipments_total=pricing["equipments_cost"],
        insurance_fee=pricing["insurance_fee"],
        total_price=rental.total_price,
        status=rental.status.value,
        qr_code_base64=None
    )


@router.post(
    "/checkout",
    response_model=CheckoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Checkout e confirmação da reserva"
)
async def checkout_payment(
    checkout_in: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    stmt = select(Rental).where(
        Rental.id == checkout_in.rental_id,
        Rental.user_id == current_user.id
    )
    rental = (await session.execute(stmt)).scalar_one_or_none()
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada."
        )

    rental.status = RentalStatus.CONFIRMED
    session.add(rental)
    await session.commit()
    await session.refresh(rental)

    qr_code = generate_rental_qr_code_base64(rental.rental_uuid)

    return CheckoutResponse(
        rental_id=rental.id,
        rental_uuid=rental.rental_uuid,
        status=rental.status.value,
        qr_code_base64=qr_code,
        message="Pagamento confirmado com sucesso! Ingresso emitido."
    )


@router.get(
    "/my-garage",
    response_model=List[RentalSummaryResponse],
    summary="Listar histórico de reservas do piloto"
)
async def get_my_garage(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    stmt = (
        select(Rental, Motorcycle, Track)
        .join(Motorcycle, Rental.motorcycle_id == Motorcycle.id)
        .join(Track, Rental.track_id == Track.id)
        .where(Rental.user_id == current_user.id)
        .order_by(Rental.created_at.desc())
    )
    results = (await session.execute(stmt)).all()

    response = []
    for rental, bike, track in results:
        qr = generate_rental_qr_code_base64(rental.rental_uuid) if rental.status in [RentalStatus.CONFIRMED, RentalStatus.COMPLETED] else None
        response.append(
            RentalSummaryResponse(
                rental_id=rental.id,
                rental_uuid=rental.rental_uuid,
                motorcycle_id=bike.id,
                motorcycle_name=f"{bike.brand} {bike.model}",
                track_id=track.id,
                track_name=track.name,
                start_time=rental.start_time,
                end_time=rental.end_time,
                effective_speed_limit=rental.effective_speed_limit,
                hourly_rate_bike=bike.base_hourly_price,
                hourly_rate_track=track.hourly_rate,
                equipments_total=Decimal("0.00"),
                insurance_fee=Decimal("75.00"),
                total_price=rental.total_price,
                status=rental.status.value,
                qr_code_base64=qr
            )
        )
    return response


@router.get(
    "/{rental_id}/ticket",
    response_model=RentalTicketResponse,
    summary="Obter dados do ingresso para impressão"
)
async def get_ticket(
    rental_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    stmt = (
        select(Rental, Motorcycle, Track, User)
        .join(Motorcycle, Rental.motorcycle_id == Motorcycle.id)
        .join(Track, Rental.track_id == Track.id)
        .join(User, Rental.user_id == User.id)
        .where(Rental.id == rental_id, Rental.user_id == current_user.id)
    )
    res = (await session.execute(stmt)).first()
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingresso não encontrado."
        )

    rental, bike, track, user = res
    qr = generate_rental_qr_code_base64(rental.rental_uuid)

    return RentalTicketResponse(
        rental_id=rental.id,
        rental_uuid=rental.rental_uuid,
        pilot_name=user.name,
        track_name=track.name,
        track_location=track.location,
        motorcycle_model=bike.model,
        motorcycle_brand=bike.brand,
        start_time=rental.start_time,
        end_time=rental.end_time,
        effective_speed_limit=rental.effective_speed_limit,
        total_price=rental.total_price,
        status=rental.status.value,
        qr_code_base64=qr
    )
