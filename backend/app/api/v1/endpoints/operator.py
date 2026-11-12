from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_current_operator
from app.core.database import get_session
from app.models import Rental, User, Motorcycle, Track, RentalStatus
from app.schemas.operator_schema import (
    ValidateQRRequest,
    ValidateQRResponse,
    OperatorMedicalRecordResponse,
)

router = APIRouter()


@router.post(
    "/validate-qr",
    response_model=ValidateQRResponse,
    status_code=status.HTTP_200_OK,
    summary="Validar QR Code do piloto e liberar ficha médica na pista"
)
async def validate_qr_code(
    payload: ValidateQRRequest,
    current_operator: User = Depends(get_current_operator),
    session: AsyncSession = Depends(get_session)
):
    stmt = (
        select(Rental, User, Motorcycle, Track)
        .join(User, Rental.user_id == User.id)
        .join(Motorcycle, Rental.motorcycle_id == Motorcycle.id)
        .join(Track, Rental.track_id == Track.id)
        .where(Rental.rental_uuid == payload.rental_uuid)
    )
    result = (await session.execute(stmt)).first()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva não encontrada para o código fornecido."
        )

    rental, pilot, bike, track = result

    # Apenas reservas confirmadas ou concluídas são elegíveis
    is_valid = rental.status in [RentalStatus.CONFIRMED, RentalStatus.COMPLETED]

    medical_info = OperatorMedicalRecordResponse(
        pilot_name=pilot.name,
        emergency_contact=pilot.emergency_contact,
        blood_type=pilot.blood_type,
        sus_card=pilot.sus_card or "Não informado",
        cnh_number=pilot.cnh_number or "Não informada"
    )

    return ValidateQRResponse(
        valid=is_valid,
        status=rental.status.value,
        rental_uuid=rental.rental_uuid,
        track_name=track.name,
        motorcycle_model=f"{bike.brand} {bike.model}",
        effective_speed_limit=rental.effective_speed_limit,
        start_time=rental.start_time,
        end_time=rental.end_time,
        medical_record=medical_info
    )
