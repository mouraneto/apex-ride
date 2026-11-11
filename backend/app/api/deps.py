from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.core.security import decode_access_token
from app.models import User, UserRole


async def get_current_user(
    request: Request,
    session: AsyncSession = Depends(get_session)
) -> User:
    # 1. Tentar ler do cookie HTTP-Only
    token = request.cookies.get("access_token")

    # 2. Fallback para Authorization Header Bearer
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão ausente. Faça login novamente.",
        )

    # Remover prefixo 'Bearer ' se estiver presente no cookie
    if token.startswith("Bearer "):
        token = token[7:]

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão expirada ou inválida. Faça login novamente.",
        )

    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido.",
        )

    stmt = select(User).where(User.id == user_id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário associado a esta sessão não foi encontrado.",
        )

    return user


async def get_current_operator(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != UserRole.OPERATOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a operadores de pista autorizados.",
        )
    return current_user
