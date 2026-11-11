from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_session
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.models import User, UserRole, PilotLevel
from app.schemas.auth_schema import (
    UserLoginRequest,
    UserProfileResponse,
    UserRegisterRequest,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=UserProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar novo piloto"
)
async def register(
    user_in: UserRegisterRequest,
    session: AsyncSession = Depends(get_session)
):
    # Checar duplicidade de email
    stmt = select(User).where(User.email == user_in.email)
    existing_user = (await session.execute(stmt)).scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um usuário cadastrado com este e-mail.",
        )

    user_data = user_in.model_dump(exclude={"password"})
    user = User(
        **user_data,
        password_hash=get_password_hash(user_in.password),
        role=UserRole.PILOT,
        pilot_level=PilotLevel(user_in.pilot_level.value)
    )

    session.add(user)
    await session.commit()
    await session.refresh(user)

    return user


@router.post(
    "/login",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Login com injeção de Cookie HTTP-Only"
)
async def login(
    login_data: UserLoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_session)
):
    stmt = select(User).where(User.email == login_data.email)
    user = (await session.execute(stmt)).scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail ou senha incorretos.",
        )

    # Gerar token JWT
    token = create_access_token(subject=user.id, role=user.role.value)

    # Injetar Cookie HTTP-Only
    max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=max_age,
        expires=max_age,
        samesite="lax",
        secure=False,  # Permite HTTP em localhost / túnel dev
        path="/"
    )

    return user


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout e invalidação de sessão"
)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user)
):
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        samesite="lax"
    )
    return {"message": "Sessão encerrada com sucesso."}


@router.get(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter perfil do usuário autenticado"
)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
