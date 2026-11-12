from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.models import Equipment
from app.schemas.catalog_schema import EquipmentResponse

router = APIRouter()


@router.get("", response_model=List[EquipmentResponse], summary="Listar catálogo de equipamentos")
async def list_equipments(session: AsyncSession = Depends(get_session)):
    stmt = select(Equipment)
    result = await session.execute(stmt)
    equipments = result.scalars().all()
    
    response = []
    for eq in equipments:
        eq_data = EquipmentResponse.model_validate(eq)
        eq_data.available_sizes_list = [s.strip() for s in eq.available_sizes.split(",") if s.strip()]
        response.append(eq_data)
        
    return response
