from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.models import Track, Motorcycle, MotorcycleStatus
from app.schemas.catalog_schema import TrackResponse, MotorcycleResponse

router = APIRouter()


@router.get("", response_model=List[TrackResponse], summary="Listar autódromos ativos")
async def get_tracks(session: AsyncSession = Depends(get_session)):
    stmt = select(Track).where(Track.is_active == True)
    result = await session.execute(stmt)
    return result.scalars().all()


@router.get("/{track_id}/motorcycles", response_model=List[MotorcycleResponse], summary="Listar motos do autódromo")
async def get_motorcycles_by_track(
    track_id: str,
    session: AsyncSession = Depends(get_session)
):
    stmt = select(Motorcycle).where(
        Motorcycle.track_id == track_id,
        Motorcycle.status == MotorcycleStatus.AVAILABLE
    )
    result = await session.execute(stmt)
    return result.scalars().all()
