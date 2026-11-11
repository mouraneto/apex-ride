import asyncio
import os
import sys
from decimal import Decimal
from passlib.context import CryptContext
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

# Ajuste no path para importação correta
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import async_session_factory
from app.models import (
    User,
    UserRole,
    PilotLevel,
    Track,
    Motorcycle,
    MotorcycleStatus,
    Equipment,
    EquipmentCategory,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Senha padrão para testes: "Apex123!"
DEFAULT_HASH = pwd_context.hash("Apex123!")

TRACKS_DATA = [
    {
        "id": "tr-001",
        "name": "Autódromo José Carlos Pace (Interlagos)",
        "location": "São Paulo - SP",
        "length_km": Decimal("4.30"),
        "hourly_rate": Decimal("250.00"),
        "image_url": "/images/tracks/interlagos.svg",
        "is_active": True,
    },
    {
        "id": "tr-002",
        "name": "Autódromo Fazenda Capuava",
        "location": "Indaiatuba - SP",
        "length_km": Decimal("2.70"),
        "hourly_rate": Decimal("180.00"),
        "image_url": "/images/tracks/capuava.svg",
        "is_active": True,
    },
    {
        "id": "tr-003",
        "name": "Autódromo Internacional Velo Città",
        "location": "Mogi Guaçu - SP",
        "length_km": Decimal("3.40"),
        "hourly_rate": Decimal("220.00"),
        "image_url": "/images/tracks/velocitta.svg",
        "is_active": True,
    },
]

MOTORCYCLES_DATA = [
    {
        "id": "mc-001",
        "track_id": "tr-001",
        "brand": "Ducati",
        "model": "Panigale V2",
        "cc": 955,
        "base_top_speed": 270,
        "base_hourly_price": Decimal("450.00"),
        "image_url": "/images/bikes/panigale_v2.svg",
        "status": MotorcycleStatus.AVAILABLE,
    },
    {
        "id": "mc-002",
        "track_id": "tr-001",
        "brand": "Suzuki",
        "model": "GSX-R750",
        "cc": 750,
        "base_top_speed": 280,
        "base_hourly_price": Decimal("380.00"),
        "image_url": "/images/bikes/gsxr750.svg",
        "status": MotorcycleStatus.AVAILABLE,
    },
    {
        "id": "mc-003",
        "track_id": "tr-002",
        "brand": "Kawasaki",
        "model": "Ninja ZX-6R",
        "cc": 636,
        "base_top_speed": 260,
        "base_hourly_price": Decimal("320.00"),
        "image_url": "/images/bikes/zx6r.svg",
        "status": MotorcycleStatus.AVAILABLE,
    },
    {
        "id": "mc-004",
        "track_id": "tr-002",
        "brand": "Honda",
        "model": "CB 650R Racing",
        "cc": 649,
        "base_top_speed": 220,
        "base_hourly_price": Decimal("250.00"),
        "image_url": "/images/bikes/cb650r.svg",
        "status": MotorcycleStatus.AVAILABLE,
    },
    {
        "id": "mc-005",
        "track_id": "tr-003",
        "brand": "Yamaha",
        "model": "YZF-R6",
        "cc": 599,
        "base_top_speed": 265,
        "base_hourly_price": Decimal("340.00"),
        "image_url": "/images/bikes/r6.svg",
        "status": MotorcycleStatus.AVAILABLE,
    },
    {
        "id": "mc-006",
        "track_id": "tr-003",
        "brand": "BMW",
        "model": "S1000RR Track Edition",
        "cc": 999,
        "base_top_speed": 305,
        "base_hourly_price": Decimal("550.00"),
        "image_url": "/images/bikes/s1000rr.svg",
        "status": MotorcycleStatus.AVAILABLE,
    },
]

EQUIPMENTS_DATA = [
    {
        "id": "eq-001",
        "name": "Capacete AGV K3 SV Racing",
        "category": EquipmentCategory.HELMET,
        "daily_price": Decimal("50.00"),
        "available_sizes": "54,56,58,60",
    },
    {
        "id": "eq-002",
        "name": "Macacão Alpinestars GP Plus 1 Pça",
        "category": EquipmentCategory.SUIT,
        "daily_price": Decimal("120.00"),
        "available_sizes": "48,50,52,54,56",
    },
    {
        "id": "eq-003",
        "name": "Luvas Dainese Full Metal 6",
        "category": EquipmentCategory.GLOVES,
        "daily_price": Decimal("35.00"),
        "available_sizes": "S,M,L,XL",
    },
    {
        "id": "eq-004",
        "name": "Botas Sidi Rex Air",
        "category": EquipmentCategory.BOOTS,
        "daily_price": Decimal("45.00"),
        "available_sizes": "39,40,41,42,43,44",
    },
]

USERS_DATA = [
    {
        "id": "usr-op01",
        "name": "Fiscal de Pista Interlagos",
        "email": "operador@apexride.com",
        "password_hash": DEFAULT_HASH,
        "role": UserRole.OPERATOR,
        "cnh_number": "9999999999",
        "phone": "19999999999",
        "emergency_contact": "Central Autódromo - 193",
        "blood_type": "O+",
        "sus_card": "999888777666",
        "pilot_level": PilotLevel.PROFISSIONAL,
        "helmet_size": "58",
        "suit_size": "52",
        "glove_size": "L",
        "boot_size": "42",
    },
    {
        "id": "usr-pl01",
        "name": "João Neto",
        "email": "joao@apexride.com",
        "password_hash": DEFAULT_HASH,
        "role": UserRole.PILOT,
        "cnh_number": "1234567890",
        "phone": "19988887777",
        "emergency_contact": "Marine Moura - (19) 97777-6666",
        "blood_type": "O+",
        "sus_card": "123456789012345",
        "pilot_level": PilotLevel.INTERMEDIARIO,
        "helmet_size": "58",
        "suit_size": "52",
        "glove_size": "L",
        "boot_size": "42",
    },
]


async def seed_database() -> None:
    print("Iniciando Seed Data do ApexRide...")
    async with async_session_factory() as session:
        # 1. Pistas
        for track_item in TRACKS_DATA:
            res = await session.execute(select(Track).where(Track.id == track_item["id"]))
            if not res.scalar_one_or_none():
                track = Track(**track_item)
                session.add(track)
        await session.commit()
        print("✓ Autódromos semeados.")

        # 2. Motocicletas
        for mc_item in MOTORCYCLES_DATA:
            res = await session.execute(select(Motorcycle).where(Motorcycle.id == mc_item["id"]))
            if not res.scalar_one_or_none():
                mc = Motorcycle(**mc_item)
                session.add(mc)
        await session.commit()
        print("✓ Motocicletas semeadas.")

        # 3. Equipamentos
        for eq_item in EQUIPMENTS_DATA:
            res = await session.execute(select(Equipment).where(Equipment.id == eq_item["id"]))
            if not res.scalar_one_or_none():
                eq = Equipment(**eq_item)
                session.add(eq)
        await session.commit()
        print("✓ Equipamentos semeados.")

        # 4. Usuários
        for usr_item in USERS_DATA:
            res = await session.execute(select(User).where(User.email == usr_item["email"]))
            if not res.scalar_one_or_none():
                user = User(**usr_item)
                session.add(user)
        await session.commit()
        print("✓ Usuários de teste semeados.")

    print("Seed concluído com sucesso!")


if __name__ == "__main__":
    asyncio.run(seed_database())
