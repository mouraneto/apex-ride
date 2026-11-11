import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List
from decimal import Decimal
from sqlmodel import SQLModel, Field, Relationship, Column, VARCHAR, DECIMAL

# ==========================================
# Enumeradores (ENUMs)
# ==========================================

class UserRole(str, Enum):
    PILOT = "PILOT"
    OPERATOR = "OPERATOR"

class PilotLevel(str, Enum):
    INICIANTE = "INICIANTE"
    AMADOR = "AMADOR"
    INTERMEDIARIO = "INTERMEDIARIO"
    AVANCADO = "AVANCADO"
    PROFISSIONAL = "PROFISSIONAL"

class MotorcycleStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    RENTED = "RENTED"
    MAINTENANCE = "MAINTENANCE"

class EquipmentCategory(str, Enum):
    HELMET = "HELMET"
    SUIT = "SUIT"
    GLOVES = "GLOVES"
    BOOTS = "BOOTS"

class RentalStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class GroupStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    COMPLETED = "COMPLETED"

# ==========================================
# Modelos da Base de Dados
# ==========================================

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, sa_column=Column(VARCHAR(36), primary_key=True))
    name: str = Field(nullable=False)
    email: str = Field(nullable=False, unique=True, index=True)
    password_hash: str = Field(nullable=False)
    role: UserRole = Field(default=UserRole.PILOT, nullable=False, index=True)
    
    # Dados de Contato e Documentacao
    cnh_number: Optional[str] = Field(default=None)
    phone: str = Field(nullable=False)
    
    # Dados Medicos e de Emergencia (Protegidos)
    emergency_contact: str = Field(nullable=False)
    blood_type: str = Field(nullable=False)
    sus_card: Optional[str] = Field(default=None)
    
    # Perfil de Pilotagem e Preferencia de Equipamentos
    pilot_level: PilotLevel = Field(default=PilotLevel.INICIANTE, nullable=False)
    helmet_size: Optional[str] = Field(default=None)
    suit_size: Optional[str] = Field(default=None)
    glove_size: Optional[str] = Field(default=None)
    boot_size: Optional[str] = Field(default=None)
    
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relacionamentos
    rentals: List["Rental"] = Relationship(back_populates="user")
    led_groups: List["GroupBooking"] = Relationship(back_populates="leader")


class Track(SQLModel, table=True):
    __tablename__ = "tracks"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, sa_column=Column(VARCHAR(36), primary_key=True))
    name: str = Field(nullable=False)
    location: str = Field(nullable=False)
    length_km: Decimal = Field(sa_column=Column(DECIMAL(5, 2), nullable=False))
    hourly_rate: Decimal = Field(sa_column=Column(DECIMAL(10, 2), nullable=False))
    image_url: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True, nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relacionamentos
    motorcycles: List["Motorcycle"] = Relationship(back_populates="track")
    rentals: List["Rental"] = Relationship(back_populates="track")


class Motorcycle(SQLModel, table=True):
    __tablename__ = "motorcycles"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, sa_column=Column(VARCHAR(36), primary_key=True))
    track_id: str = Field(foreign_key="tracks.id", nullable=False, index=True)
    brand: str = Field(nullable=False)
    model: str = Field(nullable=False)
    cc: int = Field(nullable=False)
    base_top_speed: int = Field(nullable=False)
    base_hourly_price: Decimal = Field(sa_column=Column(DECIMAL(10, 2), nullable=False))
    image_url: Optional[str] = Field(default=None)
    status: MotorcycleStatus = Field(default=MotorcycleStatus.AVAILABLE, nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relacionamentos
    track: Optional[Track] = Relationship(back_populates="motorcycles")
    rentals: List["Rental"] = Relationship(back_populates="motorcycle")


class Equipment(SQLModel, table=True):
    __tablename__ = "equipments"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, sa_column=Column(VARCHAR(36), primary_key=True))
    name: str = Field(nullable=False)
    category: EquipmentCategory = Field(nullable=False, index=True)
    daily_price: Decimal = Field(sa_column=Column(DECIMAL(10, 2), nullable=False))
    available_sizes: str = Field(nullable=False)  # Armazenado como CSV (ex: "54,56,58,60")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relacionamentos
    rental_links: List["RentalEquipment"] = Relationship(back_populates="equipment")


class GroupBooking(SQLModel, table=True):
    __tablename__ = "group_bookings"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, sa_column=Column(VARCHAR(36), primary_key=True))
    leader_user_id: str = Field(foreign_key="users.id", nullable=False)
    group_name: str = Field(nullable=False)
    invite_code: str = Field(nullable=False, unique=True, index=True)
    status: GroupStatus = Field(default=GroupStatus.OPEN, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relacionamentos
    leader: Optional[User] = Relationship(back_populates="led_groups")
    rentals: List["Rental"] = Relationship(back_populates="group_booking")


class Rental(SQLModel, table=True):
    __tablename__ = "rentals"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, sa_column=Column(VARCHAR(36), primary_key=True))
    rental_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    user_id: str = Field(foreign_key="users.id", nullable=False, index=True)
    motorcycle_id: str = Field(foreign_key="motorcycles.id", nullable=False, index=True)
    track_id: str = Field(foreign_key="tracks.id", nullable=False)
    group_booking_id: Optional[str] = Field(default=None, foreign_key="group_bookings.id")
    
    start_time: datetime = Field(nullable=False)
    end_time: datetime = Field(nullable=False)
    total_price: Decimal = Field(sa_column=Column(DECIMAL(10, 2), nullable=False))
    status: RentalStatus = Field(default=RentalStatus.CONFIRMED, nullable=False, index=True)
    effective_speed_limit: int = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relacionamentos
    user: Optional[User] = Relationship(back_populates="rentals")
    motorcycle: Optional[Motorcycle] = Relationship(back_populates="rentals")
    track: Optional[Track] = Relationship(back_populates="rentals")
    group_booking: Optional[GroupBooking] = Relationship(back_populates="rentals")
    equipments: List["RentalEquipment"] = Relationship(back_populates="rental")
    telemetry_logs: List["TelemetryLog"] = Relationship(back_populates="rental")


class RentalEquipment(SQLModel, table=True):
    __tablename__ = "rental_equipments"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, sa_column=Column(VARCHAR(36), primary_key=True))
    rental_id: str = Field(foreign_key="rentals.id", nullable=False)
    equipment_id: str = Field(foreign_key="equipments.id", nullable=False)
    chosen_size: str = Field(nullable=False)
    price_at_booking: Decimal = Field(sa_column=Column(DECIMAL(10, 2), nullable=False))

    # Relacionamentos
    rental: Optional[Rental] = Relationship(back_populates="equipments")
    equipment: Optional[Equipment] = Relationship(back_populates="rental_links")


class TelemetryLog(SQLModel, table=True):
    __tablename__ = "telemetry_logs"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, sa_column=Column(VARCHAR(36), primary_key=True))
    rental_id: str = Field(foreign_key="rentals.id", nullable=False, index=True)
    lap_number: int = Field(nullable=False)
    lap_time_seconds: Decimal = Field(sa_column=Column(DECIMAL(6, 3), nullable=False))
    max_speed_kmh: Decimal = Field(sa_column=Column(DECIMAL(5, 2), nullable=False), index=True)
    avg_speed_kmh: Decimal = Field(sa_column=Column(DECIMAL(5, 2), nullable=False), index=True)
    max_g_force: Decimal = Field(sa_column=Column(DECIMAL(3, 2), nullable=False))
    falls_count: int = Field(default=0, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relacionamentos
    rental: Optional[Rental] = Relationship(back_populates="telemetry_logs")
