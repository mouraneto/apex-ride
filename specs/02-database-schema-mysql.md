```markdown
# 02. Database Schema (MySQL + SQLModel) - ApexRide

## 1. Visão Geral da Modelagem de Dados

O banco de dados do **ApexRide** foi projetado para garantir integridade referencial rigorosa (ACID), suporte a consultas de alta concorrência durante checagens de disponibilidade de pista e isolamento de informações médicas sensíveis sob exigências da LGPD.

### 1.1. Princípios Arquiteturais do Schema
* **Chaves Primárias Consistentes:** Uso de `VARCHAR(36)` contendo identificadores únicos universais (`UUIDv4`) gerados via aplicação para evitar enumeração de registros.
* **Índices de Alta Performance:** Indexação estratégica em campos de busca frequente (`track_id`, `start_time`, `end_time`, `rental_uuid`, `email`).
* **Relacionamentos Efetivos:** Controle de exclusão e integridade referencial via `FOREIGN KEY` com regras de `ON DELETE RESTRICT` e `ON DELETE CASCADE` otimizadas.
* **Tipagem Forte & ENUMs:** Definição de estados finitos para permissões, status de veículos, categorias de EPIs e níveis de pilotagem.

---

## 2. Diagrama Entidade-Relacionamento (Relacional)


```

+--------------------+       +--------------------+       +--------------------+
|       USERS        |       |    GROUP_BOOKINGS  |       |       TRACKS       |
+--------------------+       +--------------------+       +--------------------+
| PK  id             |<------+ PK  id             |       | PK  id             |
|     email          |       | FK  leader_user_id |       |     name           |
|     pilot_level    |       +--------------------+       +--------------------+
+--------------------+                  |                            |
|                                |                            |
| 1                              | 0..1                       | 1
|                                v                            v
| 1..N                     +--------------------+ 1..N +--------------------+
+------------------------->|      RENTALS       |----->|    MOTORCYCLES     |
+--------------------+      +--------------------+
| PK  id             |      | PK  id             |
| UK  rental_uuid    |      | FK  track_id       |
| FK  user_id        |      +--------------------+
| FK  motorcycle_id  |

| FK  track_id       |

+--------------------+

| 1

|

+-----------------------+-----------------------+

| 1..N                                          | 1..N
v                                               v

+--------------------+                          +--------------------+
| RENTAL_EQUIPMENTS  |                          |   TELEMETRY_LOGS   |
+--------------------+                          +--------------------+
| PK  id             |                          | PK  id             |
| FK  rental_id      |                          | FK  rental_id      |
| FK  equipment_id   |                          +--------------------+
+--------------------+

```

---

## 3. DDL Completo em SQL Purificado (MySQL 8.0)

```sql
-- Criacao do Banco de Dados e Definicao do Character Set
CREATE DATABASE IF NOT EXISTS apexride_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE apexride_db;

-- -----------------------------------------------------
-- Tabela: USERS
-- -----------------------------------------------------
CREATE TABLE users (
    id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('PILOT', 'OPERATOR') NOT NULL DEFAULT 'PILOT',
    cnh_number VARCHAR(50) NULL,
    phone VARCHAR(50) NOT NULL,
    emergency_contact VARCHAR(255) NOT NULL,
    blood_type VARCHAR(10) NOT NULL,
    sus_card VARCHAR(50) NULL,
    pilot_level ENUM('INICIANTE', 'AMADOR', 'INTERMEDIARIO', 'AVANCADO', 'PROFISSIONAL') NOT NULL DEFAULT 'INICIANTE',
    helmet_size VARCHAR(10) NULL,
    suit_size VARCHAR(10) NULL,
    glove_size VARCHAR(10) NULL,
    boot_size VARCHAR(10) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: TRACKS (Autodromos / Circuitos)
-- -----------------------------------------------------
CREATE TABLE tracks (
    id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    length_km DECIMAL(5,2) NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_tracks_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: MOTORCYCLES (Frota Esportiva)
-- -----------------------------------------------------
CREATE TABLE motorcycles (
    id VARCHAR(36) NOT NULL,
    track_id VARCHAR(36) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    cc INT NOT NULL,
    base_top_speed INT NOT NULL,
    base_hourly_price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500) NULL,
    status ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_motorcycles_track
        FOREIGN KEY (track_id) REFERENCES tracks (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_motorcycles_track_status (track_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: EQUIPMENTS (Equipamentos de Protecao)
-- -----------------------------------------------------
CREATE TABLE equipments (
    id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    category ENUM('HELMET', 'SUIT', 'GLOVES', 'BOOTS') NOT NULL,
    daily_price DECIMAL(10,2) NOT NULL,
    available_sizes VARCHAR(100) NOT NULL, -- Ex: "54,56,58,60"
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_equipments_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: GROUP_BOOKINGS (Salas de Grupo de Corrida)
-- -----------------------------------------------------
CREATE TABLE group_bookings (
    id VARCHAR(36) NOT NULL,
    leader_user_id VARCHAR(36) NOT NULL,
    group_name VARCHAR(150) NOT NULL,
    invite_code VARCHAR(20) NOT NULL,
    status ENUM('OPEN', 'CLOSED', 'COMPLETED') NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE INDEX idx_group_invite_code (invite_code),
    CONSTRAINT fk_group_leader
        FOREIGN KEY (leader_user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: RENTALS (Agendamentos e Ingressos)
-- -----------------------------------------------------
CREATE TABLE rentals (
    id VARCHAR(36) NOT NULL,
    rental_uuid VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    motorcycle_id VARCHAR(36) NOT NULL,
    track_id VARCHAR(36) NOT NULL,
    group_booking_id VARCHAR(36) NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    effective_speed_limit INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE INDEX idx_rentals_uuid (rental_uuid),
    CONSTRAINT fk_rentals_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rentals_motorcycle
        FOREIGN KEY (motorcycle_id) REFERENCES motorcycles (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rentals_track
        FOREIGN KEY (track_id) REFERENCES tracks (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rentals_group
        FOREIGN KEY (group_booking_id) REFERENCES group_bookings (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_rentals_schedule (motorcycle_id, start_time, end_time),
    INDEX idx_rentals_user_history (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: RENTAL_EQUIPMENTS (Itens Alugados na Reserva)
-- -----------------------------------------------------
CREATE TABLE rental_equipments (
    id VARCHAR(36) NOT NULL,
    rental_id VARCHAR(36) NOT NULL,
    equipment_id VARCHAR(36) NOT NULL,
    chosen_size VARCHAR(10) NOT NULL,
    price_at_booking DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_req_rental
        FOREIGN KEY (rental_id) REFERENCES rentals (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_req_equipment
        FOREIGN KEY (equipment_id) REFERENCES equipments (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabela: TELEMETRY_LOGS (Desempenho e Voltas da Corrida)
-- -----------------------------------------------------
CREATE TABLE telemetry_logs (
    id VARCHAR(36) NOT NULL,
    rental_id VARCHAR(36) NOT NULL,
    lap_number INT NOT NULL,
    lap_time_seconds DECIMAL(6,3) NOT NULL,
    max_speed_kmh DECIMAL(5,2) NOT NULL,
    avg_speed_kmh DECIMAL(5,2) NOT NULL,
    max_g_force DECIMAL(3,2) NOT NULL,
    falls_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_telemetry_rental
        FOREIGN KEY (rental_id) REFERENCES rentals (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_telemetry_rental_lap (rental_id, lap_number),
    INDEX idx_telemetry_leaderboard (max_speed_kmh, avg_speed_kmh)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

```

---

## 4. Implementação dos Modelos em Python (`SQLModel`)

Abaixo estão as definições exatas das classes em Python utilizando **SQLModel** para o backend FastAPI, compatíveis com SQLAlchemy 2.0 assíncrono.

```python
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

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(nullable=False)
    email: str = Field(nullable=False, unique=True, index=True)
    password_hash: str = Field(nullable=False)
    role: UserRole = Field(default=UserRole.PILOT, nullable=False)
    
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

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(nullable=False)
    location: str = Field(nullable=False)
    length_km: Decimal = Field(sa_column=Column(DECIMAL(5, 2), nullable=False))
    hourly_rate: Decimal = Field(sa_column=Column(DECIMAL(10, 2), nullable=False))
    image_url: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relacionamentos
    motorcycles: List["Motorcycle"] = Relationship(back_populates="track")
    rentals: List["Rental"] = Relationship(back_populates="track")


class Motorcycle(SQLModel, table=True):
    __tablename__ = "motorcycles"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    track_id: str = Field(foreign_key="tracks.id", nullable=False)
    brand: str = Field(nullable=False)
    model: str = Field(nullable=False)
    cc: int = Field(nullable=False)
    base_top_speed: int = Field(nullable=False)
    base_hourly_price: Decimal = Field(sa_column=Column(DECIMAL(10, 2), nullable=False))
    image_url: Optional[str] = Field(default=None)
    status: MotorcycleStatus = Field(default=MotorcycleStatus.AVAILABLE, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relacionamentos
    track: Track = Relationship(back_populates="motorcycles")
    rentals: List["Rental"] = Relationship(back_populates="motorcycle")


class Equipment(SQLModel, table=True):
    __tablename__ = "equipments"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(nullable=False)
    category: EquipmentCategory = Field(nullable=False)
    daily_price: Decimal = Field(sa_column=Column(DECIMAL(10, 2), nullable=False))
    available_sizes: str = Field(nullable=False)  # Armazenado como CSV (ex: "54,56,58,60")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relacionamentos
    rental_links: List["RentalEquipment"] = Relationship(back_populates="equipment")


class GroupBooking(SQLModel, table=True):
    __tablename__ = "group_bookings"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    leader_user_id: str = Field(foreign_key="users.id", nullable=False)
    group_name: str = Field(nullable=False)
    invite_code: str = Field(nullable=False, unique=True)
    status: GroupStatus = Field(default=GroupStatus.OPEN, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relacionamentos
    leader: User = Relationship(back_populates="led_groups")
    rentals: List["Rental"] = Relationship(back_populates="group_booking")


class Rental(SQLModel, table=True):
    __tablename__ = "rentals"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    rental_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    user_id: str = Field(foreign_key="users.id", nullable=False)
    motorcycle_id: str = Field(foreign_key="motorcycles.id", nullable=False)
    track_id: str = Field(foreign_key="tracks.id", nullable=False)
    group_booking_id: Optional[str] = Field(default=None, foreign_key="group_bookings.id")
    
    start_time: datetime = Field(nullable=False)
    end_time: datetime = Field(nullable=False)
    total_price: Decimal = Field(sa_column=Column(DECIMAL(10, 2), nullable=False))
    status: RentalStatus = Field(default=RentalStatus.CONFIRMED, nullable=False)
    effective_speed_limit: int = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relacionamentos
    user: User = Relationship(back_populates="rentals")
    motorcycle: Motorcycle = Relationship(back_populates="rentals")
    track: Track = Relationship(back_populates="rentals")
    group_booking: Optional[GroupBooking] = Relationship(back_populates="rentals")
    equipments: List["RentalEquipment"] = Relationship(back_populates="rental")
    telemetry_logs: List["TelemetryLog"] = Relationship(back_populates="rental")


class RentalEquipment(SQLModel, table=True):
    __tablename__ = "rental_equipments"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    rental_id: str = Field(foreign_key="rentals.id", nullable=False)
    equipment_id: str = Field(foreign_key="equipments.id", nullable=False)
    chosen_size: str = Field(nullable=False)
    price_at_booking: Decimal = Field(sa_column=Column(DECIMAL(10, 2), nullable=False))

    # Relacionamentos
    rental: Rental = Relationship(back_populates="equipments")
    equipment: Equipment = Relationship(back_populates="rental_links")


class TelemetryLog(SQLModel, table=True):
    __tablename__ = "telemetry_logs"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    rental_id: str = Field(foreign_key="rentals.id", nullable=False)
    lap_number: int = Field(nullable=False)
    lap_time_seconds: Decimal = Field(sa_column=Column(DECIMAL(6, 3), nullable=False))
    max_speed_kmh: Decimal = Field(sa_column=Column(DECIMAL(5, 2), nullable=False))
    avg_speed_kmh: Decimal = Field(sa_column=Column(DECIMAL(5, 2), nullable=False))
    max_g_force: Decimal = Field(sa_column=Column(DECIMAL(3, 2), nullable=False))
    falls_count: int = Field(default=0, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relacionamentos
    rental: Rental = Relationship(back_populates="telemetry_logs")

```

---

## 5. Script de Carga Inicial (Seed Data SQL)

Este script popula o banco de dados inicial para testes da aplicação e prototipagem no frontend.

```sql
USE apexride_db;

-- 1. Inserir Pistas Iniciais
INSERT INTO tracks (id, name, location, length_km, hourly_rate, image_url, is_active) VALUES
('tr-001', 'Autódromo José Carlos Pace (Interlagos)', 'São Paulo - SP', 4.30, 250.00, '/images/tracks/interlagos.jpg', TRUE),
('tr-002', 'Autódromo Fazenda Capuava', 'Indaiatuba - SP', 2.70, 180.00, '/images/tracks/capuava.jpg', TRUE),
('tr-003', 'Autódromo Internacional Velo Città', 'Mogi Guaçu - SP', 3.40, 220.00, '/images/tracks/velocitta.jpg', TRUE);

-- 2. Inserir Frota de Motocicletas Esportivas
INSERT INTO motorcycles (id, track_id, brand, model, cc, base_top_speed, base_hourly_price, image_url, status) VALUES
('mc-001', 'tr-001', 'Ducati', 'Panigale V2', 955, 270, 450.00, '/images/bikes/panigale_v2.jpg', 'AVAILABLE'),
('mc-002', 'tr-001', 'Suzuki', 'GSX-R750', 750, 280, 380.00, '/images/bikes/gsxr750.jpg', 'AVAILABLE'),
('mc-003', 'tr-002', 'Kawasaki', 'Ninja ZX-6R', 636, 260, 320.00, '/images/bikes/zx6r.jpg', 'AVAILABLE'),
('mc-004', 'tr-002', 'Honda', 'CB 650R Racing', 649, 220, 250.00, '/images/bikes/cb650r.jpg', 'AVAILABLE'),
('mc-005', 'tr-003', 'Yamaha', 'YZF-R6', 599, 265, 340.00, '/images/bikes/r6.jpg', 'AVAILABLE'),
('mc-006', 'tr-003', 'BMW', 'S1000RR Track Edition', 999, 305, 550.00, '/images/bikes/s1000rr.jpg', 'AVAILABLE');

-- 3. Inserir Catálogo de Equipamentos
INSERT INTO equipments (id, name, category, daily_price, available_sizes) VALUES
('eq-001', 'Capacete AGV K3 SV Racing', 'HELMET', 50.00, '54,56,58,60'),
('eq-002', 'Macacão Alpinestars GP Plus 1 Pça', 'SUIT', 120.00, '48,50,52,54,56'),
('eq-003', 'Luvas Dainese Full Metal 6', 'GLOVES', 35.00, 'S,M,L,XL'),
('eq-004', 'Botas Sidi Rex Air', 'BOOTS', 45.00, '39,40,41,42,43,44');

-- 4. Inserir Usuários (1 Operador e 1 Piloto Inicial)
-- Senha padrao hashada para testes: "Apex123!" -> \$2b\$12\$KIXH84J7yA9sM5z5n3hZLe7mU2dZ9y3gQ3g5G5G5G5G5G5G5G5G5G
INSERT INTO users (id, name, email, password_hash, role, cnh_number, phone, emergency_contact, blood_type, sus_card, pilot_level, helmet_size, suit_size, glove_size, boot_size) VALUES
('usr-op01', 'Fiscal de Pista Interlagos', 'operador@apexride.com', '\$2b\$12\$e9g0J.mC8yO/.Z.6XzX.7u4y1xT0wGfQ8D5v0S.R.z5N0M.X1xY2.', 'OPERATOR', '9999999999', '19999999999', 'Central Autódromo - 193', 'O+', '999888777666', 'PROFISSIONAL', '58', '52', 'L', '42'),
('usr-pl01', 'João Neto', 'joao@apexride.com', '\$2b\$12\$e9g0J.mC8yO/.Z.6XzX.7u4y1xT0wGfQ8D5v0S.R.z5N0M.X1xY2.', 'PILOT', '1234567890', '19988887777', 'Marine Moura - (19) 97777-6666', 'O+', '123456789012345', 'INTERMEDIARIO', '58', '52', 'L', '42');

```

---

## 6. Estratégia de Indexação & Otimização de Performance

### 6.1. Prevenção de Overbooking (Concorrência de Agendamento)

Para evitar que duas requisições simultâneas aluguem a mesma motocicleta no mesmo intervalo de tempo, o banco de dados conta com o índice composto:

```sql
INDEX idx_rentals_schedule (motorcycle_id, start_time, end_time)

```

A query de verificação executada pela API FastAPI valida o conflito usando a seguinte cláusula assíncrona:

```sql
SELECT id FROM rentals 
WHERE motorcycle_id = :motorcycle_id 
  AND status IN ('PENDING', 'CONFIRMED')
  AND (:start_time < end_time AND :end_time > start_time);

```

### 6.2. Leitura Rápida do Operador de Pista

O escaneamento do QR Code realiza uma consulta direta indexada por `rental_uuid`, com complexidade de tempo $O(1)$:

```sql
INDEX idx_rentals_uuid (rental_uuid)

```

### 6.3. Desempenho do Leaderboard Arcade

O ranking dos pilotos mais rápidos e com maior aceleração lateral utiliza o índice composto:

```sql
INDEX idx_telemetry_leaderboard (max_speed_kmh, avg_speed_kmh)

```

```

```