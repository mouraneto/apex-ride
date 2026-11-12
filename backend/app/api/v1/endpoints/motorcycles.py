from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.models import Motorcycle
from app.schemas.catalog_schema import MotorcycleResponse

router = APIRouter()


@router.get("", response_model=List[MotorcycleResponse], summary="Listar todas as motos")
async def list_motorcycles(session: AsyncSession = Depends(get_session)):
    stmt = select(Motorcycle)
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/{motorcycle_id}", response_model=MotorcycleResponse, summary="Obter detalhes de uma moto")
async def get_motorcycle(
    motorcycle_id: str,
    session: AsyncSession = Depends(get_session)
):
    stmt = select(Motorcycle).where(Motorcycle.id == motorcycle_id)
    motorcycle = (await session.execute(stmt)).scalar_one_or_none()
    if not motorcycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Motocicleta não encontrada."
        )
    return motorcycle
