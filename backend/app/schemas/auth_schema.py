from typing import Optional
from enum import Enum
from pydantic import BaseModel, EmailStr, Field


class UserRoleEnum(str, Enum):
    PILOT = "PILOT"
    OPERATOR = "OPERATOR"


class PilotLevelEnum(str, Enum):
    INICIANTE = "INICIANTE"
    AMADOR = "AMADOR"
    INTERMEDIARIO = "INTERMEDIARIO"
    AVANCADO = "AVANCADO"
    PROFISSIONAL = "PROFISSIONAL"


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: str
    cnh_number: Optional[str] = None
    
    # Dados Médicos e de Emergência (Obrigatório para LGPD e segurança em pista)
    emergency_contact: str
    blood_type: str
    sus_card: Optional[str] = None
    
    # Nível e Equipamentos
    pilot_level: PilotLevelEnum = Field(default=PilotLevelEnum.INICIANTE)
    helmet_size: Optional[str] = None
    suit_size: Optional[str] = None
    glove_size: Optional[str] = None
    boot_size: Optional[str] = None


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: UserRoleEnum
    phone: str
    cnh_number: Optional[str] = None
    pilot_level: PilotLevelEnum
    helmet_size: Optional[str] = None
    suit_size: Optional[str] = None
    glove_size: Optional[str] = None
    boot_size: Optional[str] = None

    class Config:
        from_attributes = True
