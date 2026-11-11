```markdown
# 03. Backend FastAPI Specification - ApexRide

## 1. Visão Geral e Arquitetura do Backend

O backend do **ApexRide** é construído em **Python 3.11+** com **FastAPI**, estruturado sob arquitetura em camadas (Clean/Modular Architecture). Ele lida de forma totalmente assíncrona com autenticação baseada em Cookies HTTP-Only, cálculo de preços de locação, trava eletrônica de velocidade por nível de piloto, validação presencial de QR Code e telemetria pós-corrida.

### 1.1. Estrutura Modular de Diretórios (`/backend`)

```text
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py          # Autenticação e Perfil (Register/Login/Logout/Me)
│   │   │   │   ├── tracks.py        # Cadastro e listagem de Autódromos
│   │   │   │   ├── motorcycles.py   # Gestão da Frota de Motocicletas Esportivas
│   │   │   │   ├── equipments.py    # Catálogo de Equipamentos de Proteção
│   │   │   │   ├── rentals.py       # Reservas, Cálculo de Preços e Ingressos QR Code
│   │   │   │   ├── groups.py        # Reservas e Salas de Corrida em Grupo
│   │   │   │   ├── operator.py      # Scanner e Validação na Pista (Uso Médico/Fiscal)
│   │   │   │   └── telemetry.py     # Logs de Desempenho e Leaderboard Arcade
│   │   │   └── api.py               # Roteador Central da API v1
│   ├── core/
│   │   ├── config.py                # Configurações globais e pydantic-settings (.env)
│   │   ├── database.py              # Engine assíncrona SQLModel/SQLAlchemy e sessions
│   │   ├── security.py              # Hashing de senhas (bcrypt) e utilitários JWT
│   │   └── speed_governor.py        # Engine da Matriz de Trava de Velocidade
│   ├── crud/                        # Funções de acesso direto ao banco de dados
│   │   ├── crud_user.py
│   │   ├── crud_rental.py
│   │   └── crud_telemetry.py
│   ├── schemas/                     # Schemas Pydantic v2 (DTOs de Requisição e Resposta)
│   │   ├── auth_schema.py
│   │   ├── rental_schema.py
│   │   ├── operator_schema.py
│   │   └── telemetry_schema.py
│   ├── services/                    # Lógicas complexas de negócio
│   │   ├── pricing_service.py       # Engine de Cálculo Financeiro da Locação
│   │   ├── qrcode_service.py        # Gerador de QR Code em Base64/PNG
│   │   └── ticket_service.py        # Formatador de Ingressos Digitais
│   └── main.py                      # Instância FastAPI, Middlewares (CORS) e Eventos
├── alembic/                         # Controle de Migrações do MySQL
├── tests/                           # Testes automatizados com pytest e httpx
├── Dockerfile                       # Multi-stage build para produção
└── pyproject.toml                   # Dependências do Poetry/Pip

```

---

## 2. Autenticação, Criptografia e Segurança

### 2.1. Fluxo de Token via Cookie HTTP-Only

1. No login (`POST /api/v1/auth/login`), a API valida o e-mail e hash da senha (`bcrypt`).
2. Se válido, a API gera um token JWT assinado digitalmente com `SECRET_KEY` utilizando algoritmo `HS256`.
3. A resposta injeta o token no cabeçalho HTTP:
```http
Set-Cookie: access_token=Bearer <JWT_TOKEN>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400

```


4. O cliente React/Next.js realiza as requisições subsequentes com `credentials: 'include'`. As credenciais são lidas automaticamente via injeção de dependência FastAPI (`get_current_user`).

### 2.2. Injeção de Dependências de Autorização (RBAC)

* `get_current_user`: Garante que o cookie JWT é válido e injeta o objeto `User` ativo.
* `get_current_operator`: Garante que `user.role == UserRole.OPERATOR`. Lança exceção `403 Forbidden` caso seja um piloto comum.

---

## 3. Schemas Pydantic v2 (Input & Output DTOs)

### 3.1. Schemas de Autenticação & Usuário (`schemas/auth_schema.py`)

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum

class UserRoleEnum(str, Enum):
    PILOT = "PILOT"
    OPERATOR = "OPERATOR"

class PilotLevelEnum(str, Enum):
    INICIANTE = "INICIANTE"
    AMADOR = "AMADOR"
    INTERMEDIARIO = "INTERMEDIARIO"
    AVANCADO = "AVANCADO"
    PROFISSIONAL = "PROFISSIONAL"

# DTO de Registro do Usuário (Entrada)
class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=100, example="João Neto")
    email: EmailStr = Field(..., example="joao@apexride.com")
    password: str = Field(..., min_length=8, example="SenhaSegura123!")
    phone: str = Field(..., example="19988887777")
    cnh_number: Optional[str] = Field(None, example="1234567890")
    
    # Dados Medicos e de Emergencia (Obrigatório para LGPD/Pista)
    emergency_contact: str = Field(..., example="Marine Moura - (19) 97777-6666")
    blood_type: str = Field(..., example="O+")
    sus_card: Optional[str] = Field(None, example="123456789012345")
    
    # Nível e Equipamentos
    pilot_level: PilotLevelEnum = Field(default=PilotLevelEnum.INICIANTE)
    helmet_size: Optional[str] = Field(None, example="58")
    suit_size: Optional[str] = Field(None, example="52")
    glove_size: Optional[str] = Field(None, example="L")
    boot_size: Optional[str] = Field(None, example="42")

# DTO de Login (Entrada)
class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

# DTO de Resposta do Perfil
class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: UserRoleEnum
    phone: str
    pilot_level: PilotLevelEnum
    helmet_size: Optional[str]
    suit_size: Optional[str]
    glove_size: Optional[str]
    boot_size: Optional[str]

    class Config:
        from_attributes = True

```

### 3.2. Schemas de Locação e Checkout (`schemas/rental_schema.py`)

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from decimal import Decimal

class EquipmentSelection(BaseModel):
    equipment_id: str
    chosen_size: str

# Criar Reserva (Entrada)
class CreateRentalRequest(BaseModel):
    motorcycle_id: str
    track_id: str
    start_time: datetime
    end_time: datetime
    group_booking_id: Optional[str] = None
    equipments: List[EquipmentSelection] = []

# Resumo da Reserva / Simulação de Checkout (Resposta)
class RentalSummaryResponse(BaseModel):
    rental_id: str
    rental_uuid: str
    motorcycle_name: str
    track_name: str
    start_time: datetime
    end_time: datetime
    effective_speed_limit: int
    hourly_rate_bike: Decimal
    hourly_rate_track: Decimal
    equipments_total: Decimal
    insurance_fee: Decimal
    total_price: Decimal
    status: str
    qr_code_base64: str

    class Config:
        from_attributes = True

```

### 3.3. Schemas do Operador de Pista (`schemas/operator_schema.py`)

```python
from pydantic import BaseModel
from datetime import datetime

class ValidateQRRequest(BaseModel):
    rental_uuid: str

class OperatorMedicalRecordResponse(BaseModel):
    pilot_name: str
    emergency_contact: str
    blood_type: str
    sus_card: str
    cnh_number: str

class ValidateQRResponse(BaseModel):
    valid: bool
    status: str
    rental_uuid: str
    track_name: str
    motorcycle_model: str
    effective_speed_limit: int
    start_time: datetime
    end_time: datetime
    medical_record: OperatorMedicalRecordResponse

```

---

## 4. Endpoints RESTful Detalhados (API Spec v1)

### 4.1. Módulo de Autenticação (`/api/v1/auth`)

| Método | Endpoint | Descrição | Proteção | HTTP Status |
| --- | --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Cadastra novo piloto no sistema | Aberto | `201 Created` |
| `POST` | `/api/v1/auth/login` | Valida credenciais e injeta Cookie HTTP-Only | Aberto | `200 OK` |
| `POST` | `/api/v1/auth/logout` | Invalida o Cookie de sessão HTTP-Only | Autenticado | `200 OK` |
| `GET` | `/api/v1/auth/me` | Retorna o perfil completo do usuário logado | Autenticado | `200 OK` |

---

### 4.2. Módulo de Catálogo e Frota (`/api/v1/tracks` & `/api/v1/motorcycles`)

| Método | Endpoint | Descrição | Proteção | HTTP Status |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/tracks` | Lista todos os autódromos ativos | Aberto | `200 OK` |
| `GET` | `/api/v1/tracks/{id}/motorcycles` | Lista motos disponíveis em um autódromo específico | Aberto | `200 OK` |
| `GET` | `/api/v1/equipments` | Lista o catálogo de equipamentos e tamanhos | Aberto | `200 OK` |

---

### 4.3. Módulo de Locação e Checkout (`/api/v1/rentals`)

#### `POST /api/v1/rentals`

* **Descrição:** Valida a disponibilidade temporal da motocicleta no autódromo, calcula a tarifa total com base nas horas selecionadas, equipamentos e taxa de seguro, calcula a limitação eletrônica de velocidade conforme o nível do piloto e salva a reserva com status `PENDING`.

```json
// Requisição (Payload JSON)
{
  "motorcycle_id": "mc-001",
  "track_id": "tr-001",
  "start_time": "2026-12-10T09:00:00Z",
  "end_time": "2026-12-10T11:00:00Z",
  "equipments": [
    { "equipment_id": "eq-001", "chosen_size": "58" },
    { "equipment_id": "eq-002", "chosen_size": "52" }
  ]
}

```

#### `POST /api/v1/payments/checkout`

* **Descrição:** Simula o pagamento (checkout mock). Altera o status da reserva de `PENDING` para `CONFIRMED` e gera o QR Code definitivo do ingresso.

| Método | Endpoint | Descrição | Proteção | HTTP Status |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/rentals/my-garage` | Retorna o histórico de reservas ativas e concluídas do piloto | PILOT | `200 OK` |
| `GET` | `/api/v1/rentals/{id}/ticket` | Retorna o payload estruturado para renderização do Ticket em PDF/PNG | PILOT | `200 OK` |

---

### 4.4. Módulo do Operador da Pista (`/api/v1/operator`)

#### `POST /api/v1/operator/validate-qr`

* **Proteção Exclusiva:** `OPERATOR`
* **Descrição:** Endpoint consumido pelo fiscal do autódromo. Recebe a string do QR Code (`rental_uuid`), valida a janela de permissão de acesso e libera a ficha médica de emergência do piloto na tela do operador.

```json
// Resposta de Sucesso (200 OK)
{
  "valid": true,
  "status": "CONFIRMED",
  "rental_uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "track_name": "Autódromo de Interlagos",
  "motorcycle_model": "Ducati Panigale V2",
  "effective_speed_limit": 220,
  "start_time": "2026-12-10T09:00:00Z",
  "end_time": "2026-12-10T11:00:00Z",
  "medical_record": {
    "pilot_name": "João Neto",
    "emergency_contact": "Marine Moura - (19) 97777-6666",
    "blood_type": "O+",
    "sus_card": "123456789012345",
    "cnh_number": "1234567890"
  }
}

```

---

### 4.5. Módulo de Telemetria e Leaderboard (`/api/v1/telemetry`)

| Método | Endpoint | Descrição | Proteção | HTTP Status |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/telemetry/rental/{rental_id}` | Retorna dados de voltas, aceleração G e velocidades registradas | PILOT | `200 OK` |
| `POST` | `/api/v1/telemetry/mock-session` | Gera logs sintéticos de telemetria pós-corrida para testes | OPERATOR | `201 Created` |
| `GET` | `/api/v1/telemetry/leaderboard` | Retorna o ranking global dos pilotos com melhores tempos e velocidades | Aberto | `200 OK` |

---

## 5. Implementação das Regras de Negócio Core (Python Code Specs)

### 5.1. Engine de Cálculo da Trava de Velocidade (`core/speed_governor.py`)

```python
from app.models import PilotLevel

# Matriz de teto de velocidade por nível de pilotagem (km/h)
SPEED_LIMIT_MAP = {
    PilotLevel.INICIANTE: 100,
    PilotLevel.AMADOR: 160,
    PilotLevel.INTERMEDIARIO: 220,
    PilotLevel.AVANCADO: 280,
    PilotLevel.PROFISSIONAL: 999  # Sem limite eletrônico
}

def calculate_effective_speed_limit(bike_base_top_speed: int, pilot_level: PilotLevel) -> int:
    """
    Calcula a velocidade máxima que a motocicleta terá liberada na pista.
    Regra: MIN(Velocidade Máxima da Moto, Teto do Nível do Piloto)
    """
    pilot_max_allowed = SPEED_LIMIT_MAP.get(pilot_level, 100)
    return min(bike_base_top_speed, pilot_max_allowed)

```

### 5.2. Engine Financeira da Locação (`services/pricing_service.py`)

```python
from decimal import Decimal
from datetime import datetime
from typing import List
from app.models import Equipment

FIXED_INSURANCE_FEE = Decimal("75.00")  # Seguro de pista obrigatório

def calculate_total_rental_price(
    start_time: datetime,
    end_time: datetime,
    bike_hourly_price: Decimal,
    track_hourly_price: Decimal,
    equipments: List[Equipment]
) -> dict:
    """
    Calcula o valor total da reserva somando a duracao das horas de uso,
    diária dos equipamentos e seguro obrigatorio.
    """
    # 1. Duracao em horas (arredondado para cima caso fração de hora)
    duration_seconds = (end_time - start_time).total_seconds()
    hours = Decimal(max(1, duration_seconds / 3600))

    # 2. Custos de pista e veículo por hora
    bike_cost = bike_hourly_price * hours
    track_cost = track_hourly_price * hours

    # 3. Equipamentos adicionais
    equipments_cost = sum([eq.daily_price for eq in equipments], Decimal("0.00"))

    # 4. Total Final
    total = bike_cost + track_cost + equipments_cost + FIXED_INSURANCE_FEE

    return {
        "hours": float(hours),
        "bike_cost": bike_cost,
        "track_cost": track_cost,
        "equipments_cost": equipments_cost,
        "insurance_fee": FIXED_INSURANCE_FEE,
        "total_price": total
    }

```

### 5.3. Gerador de QR Code em Base64 (`services/qrcode_service.py`)

```python
import qrcode
import io
import base64

def generate_rental_qr_code_base64(rental_uuid: str) -> str:
    """
    Gera uma imagem de QR Code codificada em Base64 contendo EXCLUSIVAMENTE o UUID da reserva.
    Nenhum dado pessoal do piloto e inserido no payload do QR Code por motivos de privacidade/LGPD.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(rental_uuid)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_str}"

```

---

## 6. Tratamento de Exceções & Códigos de Status HTTP

A API adota um padrão único de resposta de erro JSON conforme a especificação do FastAPI (`HTTPException`):

```json
{
  "detail": "A motocicleta selecionada já possui uma reserva para este intervalo de tempo."
}

```

### 6.1. Tabela de Exceções Padronizadas

| Código HTTP | Cenário de Ocorrência | Mensagem Retornada |
| --- | --- | --- |
| `400 Bad Request` | Formato de e-mail inválido, datas invertidas ($T_{\text{fim}} \le T_{\text{inicio}}$) | `"A data final da locação deve ser posterior à data inicial."` |
| `401 Unauthorized` | Cookie de sessão ausente, inválido ou expirado | `"Sessão expirada. Faça login novamente."` |
| `403 Forbidden` | Piloto comum tentando acessar rota `/operator/*` | `"Acesso restrito a operadores de pista autorizados."` |
| `404 Not Found` | Moto, pista ou UUID de reserva não encontrado no MySQL | `"Reserva não encontrada para o código fornecido."` |
| `409 Conflict` | Tentativa de reserva com choque de horário para a mesma moto | `"A motocicleta selecionada já está reservada no horário solicitado."` |
| `422 Unprocessable` | Falha na validação de tipos dos schemas Pydantic | `"Campos obrigatórios ausentes ou em formato inválido."` |

```

```