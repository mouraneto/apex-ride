```markdown
# 06. Agent Prompts Tasklist (Prompt Chain) - ApexRide

## 1. Diretrizes de Execução Agêntica para o Antigravity / Claude Code

Este documento estabelece o **Prompt Chain** sequencial e atomizado para que agentes autônomos de código (**Antigravity**, **Claude Code**, **Cursor**) construam a aplicação **ApexRide** do zero com consumo otimizado de tokens e alucinação zero.

### 1.1. Regras de Otimização e Consumo de Contexto
1. **Execução Estritamente Sequencial:** Execute uma fase por vez (do PROMPT 1 ao PROMPT 6). **Não avance** para o próximo prompt sem validar os critérios de aceite e testes da fase atual.
2. **Escopo Fechado por Especificação:** O agente deve consultar unicamente as specs correspondentes de `/specs/01` a `/specs/05` para implementar o código daquela fase. Não instale bibliotecas adicionais não autorizadas na especificação de arquitetura.
3. **Commit Atomizado por Fase:** Ao concluir e validar cada fase, realize o commit no Git com a mensagem padronizada indicada no final do prompt.
4. **Resoluções Automáticas de Tipagem:** Todo código Python deve passar no `mypy` e todo código TypeScript deve compilar sem avisos com `tsc --noEmit`.

---

## 2. Orquestração do Prompt Chain (Fases 1 a 6)

```text
[ PROMPT 1: Setup Docker & Monorepo ]
                 |
                 v
[ PROMPT 2: Database Models & Alembic ]
                 |
                 v
[ PROMPT 3: Auth HTTP-Only & LGPD Profile ]
                 |
                 v
[ PROMPT 4: Business Engine, Speed Governor & QR Code ]
                 |
                 v
[ PROMPT 5: Frontend Next.js Arcade UI & Garage ]
                 |
                 v
[ PROMPT 6: Ingressos QR Code, Telemetria & Scanner ]

```

---

## 3. Prompts de Execução Prontos para Copiar e Colar

### PROMPT 1: Setup da Infraestrutura Docker e Monorepo

#### Objetivo

Criar a estrutura base de pastas do monorepo, a configuração do `docker-compose.yml`, os Dockerfiles multi-stage para Backend e Frontend, a configuração do proxy reverso Nginx e as variáveis de ambiente `.env.example`.

#### Specs de Referência

* `specs/01-architecture-overview.md`
* `specs/05-docker-infrastructure.md`

#### Prompt para o Agente:

```text
Você é o engenheiro de DevOps e Infraestrutura do projeto ApexRide.
Sua tarefa é criar a estrutura inicial do Monorepo e a orquestração em containers Docker conforme detalhado no arquivo `specs/05-docker-infrastructure.md`.

REQUISITOS DE IMPLEMENTAÇÃO:
1. Crie a estrutura de diretórios do projeto:
   /backend
   /frontend
   /nginx
   /specs (mantenha as especificações existentes)

2. Na raiz do projeto, crie o arquivo `docker-compose.yml` contendo os 5 serviços:
   - `db`: Imagem MySQL 8.0 com suporte a utf8mb4, healthcheck com mysqladmin ping, volume `mysql_data` e porta 3306 exposta apenas localmente.
   - `backend`: Build a partir de `./backend/Dockerfile`, dependente do `db` saudável, exposto na porta 8000.
   - `frontend`: Build a partir de `./frontend/Dockerfile`, exposto na porta 3000.
   - `nginx`: Imagem `nginx:1.25-alpine`, dependente do `backend` e `frontend`, mapeando portas 80:80 e 443:443, lendo `./nginx/nginx.conf`.
   - `cloudflared`: Imagem `cloudflare/cloudflared:latest`, executando a flag `tunnel --no-autoupdate run` com a variável `TUNNEL_TOKEN`.

3. Crie os Dockerfiles otimizados (Multi-stage build):
   - `./backend/Dockerfile`: Base Python 3.11-slim. Estágio 1 (builder) para instalar dependências de compilação C/MySQL; Estágio 2 (runner) enxuto com execução automática do Alembic (`alembic upgrade head`) e inicialização do `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
   - `./frontend/Dockerfile`: Base Node.js 20-alpine. Estágio 1 (deps), Estágio 2 (builder com `npm run build`), Estágio 3 (runner standalone com usuário não-root `nextjs`).

4. Crie o arquivo `./nginx/nginx.conf` com proxy reverso:
   - Roteamento de `/api/v1/` para o upstream `backend:8000`.
   - Roteamento de `/docs` e `/openapi.json` para o upstream `backend:8000`.
   - Roteamento de `/uploads/` mapeando o volume estático.
   - Roteamento de `/` para o upstream `frontend:3000`.
   - Headers de segurança habilitados (X-Frame-Options, X-XSS-Protection, X-Content-Type-Options).

5. Crie o arquivo `.env.example` contendo todas as variáveis necessárias de MySQL, JWT SECRET_KEY, CORS_ORIGINS, NEXT_PUBLIC_API_URL e TUNNEL_TOKEN.

CRITÉRIOS DE ACEITE:
- Execute `docker compose config` sem erros de sintaxe.
- Valide se todos os caminhos de volumes e networks (`apexride_net`) correspondem exatamente à spec 05.

COMMIT MSG SUGERIDA: "feat(infra): setup initial monorepo, docker-compose, multi-stage dockerfiles and nginx proxy"

```

---

### PROMPT 2: Camada de Dados, Modelos SQLModel e Migrações Alembic

#### Objetivo

Implementar a camada de persistência de dados no backend usando Python 3.11, SQLModel e SQLAlchemy 2.0 assíncrono, configurar o Alembic e criar o script de seed inicial com pistas, motos esportivas, equipamentos e usuários de teste.

#### Specs de Referência

* `specs/02-database-schema-mysql.md`
* `specs/03-backend-fastapi-spec.md`

#### Prompt para o Agente:

```text
Você é o desenvolvedor Backend Sênior especialista em banco de dados e SQLModel.
Sua tarefa é implementar a camada de banco de dados do ApexRide no diretório `/backend` conforme a especificação `specs/02-database-schema-mysql.md`.

REQUISITOS DE IMPLEMENTAÇÃO:
1. Configure a conexão de banco assíncrona em `backend/app/core/database.py`:
   - Utilize `create_async_engine` com a URL `mysql+aiomysql://...` vinda do `.env`.
   - Crie a fábrica de sessões `async_sessionmaker`.
   - Crie a função geradora de sessão FastAPI `async def get_session()`.

2. Crie os modelos SQLModel completos em `backend/app/models/` com os enumeradores e relacionamentos bidirecionais:
   - `UserRole` (PILOT, OPERATOR), `PilotLevel` (INICIANTE, AMADOR, INTERMEDIARIO, AVANCADO, PROFISSIONAL).
   - `MotorcycleStatus` (AVAILABLE, RENTED, MAINTENANCE), `EquipmentCategory` (HELMET, SUIT, GLOVES, BOOTS).
   - `RentalStatus` (PENDING, CONFIRMED, COMPLETED, CANCELLED), `GroupStatus` (OPEN, CLOSED, COMPLETED).
   - Modelos: `User`, `Track`, `Motorcycle`, `Equipment`, `GroupBooking`, `Rental`, `RentalEquipment`, `TelemetryLog`.
   - Garanta que todos os PKs sejam `VARCHAR(36)` gerados via `uuid.uuid4()`.
   - Defina os índices explícitos em `email`, `role`, `rental_uuid`, `is_active` e índices compostos de agendamento e leaderboard.

3. Configure o Alembic em `backend/alembic/`:
   - Configure o `env.py` para carregar `SQLModel.metadata` e importar todos os modelos.
   - Habilite o suporte a execução assíncrona no `env.py`.
   - Gere a migração inicial executando `alembic revision --autogenerate -m "initial_schema"`.

4. Crie o script de seed em `backend/app/seed.py`:
   - Popule 3 Autódromos (Interlagos, Fazenda Capuava, Velo Città).
   - Popule 6 Motocicletas esportivas (Ducati Panigale V2, Suzuki GSX-R750, Kawasaki ZX-6R, Honda CB 650R, Yamaha R6, BMW S1000RR).
   - Popule 4 Equipamentos de proteção com tamanhos variados.
   - Popule 2 Usuários iniciais (1 Operador de Pista e 1 Piloto com senha bcrypt hashada).

CRITÉRIOS DE ACEITE:
- A execução do script `seed.py` em uma instância MySQL limpa insere os dados sem violação de chaves estrangeiras.
- O comando `alembic upgrade head` roda sem erros.

COMMIT MSG SUGERIDA: "feat(backend): implement SQLModel schemas, async database connection, alembic migrations and seed data"

```

---

### PROMPT 3: Autenticação Segura via Cookie HTTP-Only e Perfil LGPD

#### Objetivo

Implementar o módulo de autenticação JWT com persistência em Cookie HTTP-Only, criptografia de senhas com bcrypt, gerenciamento de perfil do piloto (incluindo dados médicos e CNH) e injeção de dependências para controle de acesso baseado em roles (RBAC).

#### Specs de Referência

* `specs/01-architecture-overview.md` (Seção 6 - LGPD)
* `specs/03-backend-fastapi-spec.md` (Seções 2 e 4.1)

#### Prompt para o Agente:

```text
Você é o desenvolvedor Backend Sênior responsável pela segurança e autenticação da aplicação ApexRide.
Implemente o módulo de autenticação e gerenciamento de perfil no diretório `/backend` conforme especificado em `specs/03-backend-fastapi-spec.md`.

REQUISITOS DE IMPLEMENTAÇÃO:
1. Implemente o utilitário de segurança em `backend/app/core/security.py`:
   - Hashing e verificação de senha usando `passlib[bcrypt]`.
   - Geração de token JWT contendo `sub` (user_id) e `role` com tempo de expiração configurável.
   - Leitura do token JWT primariamente a partir do Cookie HTTP-Only `access_token` da requisição HTTP (com fallback para o cabeçalho Authorization Bearer).

2. Implemente os DTOs Pydantic v2 em `backend/app/schemas/auth_schema.py`:
   - `UserRegisterRequest`: Nome, email, senha, telefone, CNH (opcional), dados médicos obrigatórios (`emergency_contact`, `blood_type`, `sus_card`), nível de pilotagem e tamanhos de EPIs (`helmet_size`, `suit_size`, `glove_size`, `boot_size`).
   - `UserLoginRequest`: Email e senha.
   - `UserProfileResponse`: Retorna o perfil completo excluindo a senha hashada.

3. Implemente as dependências de autorização em `backend/app/api/deps.py`:
   - `get_current_user`: Decodifica o JWT do cookie, busca o usuário no banco de dados MySQL assíncrono e levanta `401 Unauthorized` se inválido/expirado.
   - `get_current_operator`: Valida se o usuário retornado por `get_current_user` possui `role == UserRole.OPERATOR`. Caso contrário, levanta `403 Forbidden`.

4. Implemente os endpoints RESTful em `backend/app/api/v1/endpoints/auth.py`:
   - `POST /api/v1/auth/register`: Valida se o e-mail já existe (levanta `400 Bad Request` se duplicado), criptografa a senha, salva o usuário no banco e retorna HTTP Status 201.
   - `POST /api/v1/auth/login`: Valida credenciais. Em caso de sucesso, injeta o cookie HTTP-Only `access_token` na resposta HTTP (`httponly=True`, `samesite='lax'`, `secure=False` em dev / `True` em prod) e retorna o perfil do usuário.
   - `POST /api/v1/auth/logout`: Limpa o cookie `access_token` definindo max-age=0 e expiração no passado.
   - `GET /api/v1/auth/me`: Retorna o perfil do usuário atualmente autenticado.

CRITÉRIOS DE ACEITE:
- Teste unitário/integrado enviando requisições com `httpx` garantindo que o cookie é configurado corretamente no login e apagado no logout.
- O acesso a rotas protegidas sem cookie HTTP-Only retorna `401 Unauthorized`.

COMMIT MSG SUGERIDA: "feat(backend): implement HTTP-Only cookie authentication, JWT security, RBAC dependencies and user profile endpoints"

```

---

### PROMPT 4: Business Engine de Locação, Trava de Velocidade e QR Code

#### Objetivo

Implementar a regra de negócio central da locação de motocicletas esportivas: cálculo financeiro transparente, matriz de limitação de velocidade por nível de pilotagem, prevenção de overbooking temporal, geração de QR Code em Base64 e o módulo de validação presencial para o operador de pista.

#### Specs de Referência

* `specs/01-architecture-overview.md` (Seção 4.2 e 5)
* `specs/02-database-schema-mysql.md`
* `specs/03-backend-fastapi-spec.md` (Seções 4.3, 4.4 e 5)

#### Prompt para o Agente:

```text
Você é o desenvolvedor Backend responsável pelo motor de regras de negócio da ApexRide.
Implemente o ciclo de vida da locação, trava eletrônica de velocidade, geração de QR Code e painel do operador no diretório `/backend` conforme `specs/03-backend-fastapi-spec.md`.

REQUISITOS DE IMPLEMENTAÇÃO:
1. Implemente o Governor de Velocidade em `backend/app/core/speed_governor.py`:
   - Crie o dicionário com os tetos de velocidade: INICIANTE (100 km/h), AMADOR (160 km/h), INTERMEDIARIO (220 km/h), AVANCADO (280 km/h), PROFISSIONAL (sem limite/999).
   - Implemente `calculate_effective_speed_limit(bike_top_speed: int, pilot_level: PilotLevel) -> int`, retornando `min(bike_top_speed, teto_do_piloto)`.

2. Implemente a Engine Financeira em `backend/app/services/pricing_service.py`:
   - Implemente `calculate_total_rental_price(start_time, end_time, bike_hourly_price, track_hourly_price, equipments)` considerando a taxa fixa de seguro obrigatório de R$ 75,00.

3. Implemente o Gerador de QR Code em `backend/app/services/qrcode_service.py`:
   - Utilize a biblioteca `qrcode` do Python para gerar uma imagem PNG codificada em string Base64 contendo EXCLUSIVAMENTE a string `rental_uuid` (sem dados pessoais do piloto no payload da imagem).

4. Implemente os endpoints de Locação em `backend/app/api/v1/endpoints/rentals.py`:
   - `POST /api/v1/rentals`: Verifica choque de horários na moto selecionada no MySQL (`:start_time < end_time AND :end_time > start_time`). Calcula a velocidade efetiva e o preço total. Salva a reserva com status `PENDING`.
   - `POST /api/v1/payments/checkout`: Checkout mock. Altera status da reserva de `PENDING` para `CONFIRMED`, gera o QR Code e salva no banco.
   - `GET /api/v1/rentals/my-garage`: Retorna a lista de reservas do piloto autenticado.

5. Implemente o Módulo do Operador em `backend/app/api/v1/endpoints/operator.py`:
   - `POST /api/v1/operator/validate-qr`: Protegido por `get_current_operator`. Recebe `{ "rental_uuid": "..." }`. Se o UUID for válido e a reserva estiver no status `CONFIRMED`, retorna os dados da locação E exibe o bloco `medical_record` (Nome do piloto, tipo sanguíneo, cartão SUS, CNH e contato de emergência).

CRITÉRIOS DE ACEITE:
- Tentativas de reservar uma moto com choque de horário em relação a uma reserva existente retornam HTTP Status `409 Conflict`.
- Apenas usuários com perfil `OPERATOR` conseguem consumir a rota `/api/v1/operator/validate-qr`. Usuários comuns recebem `403 Forbidden`.

COMMIT MSG SUGERIDA: "feat(backend): implement speed governor engine, pricing calculation, QR Code generation and operator validation endpoints"

```

---

### PROMPT 5: Frontend React Next.js - UI Arcade Need for Speed e Garagem

#### Objetivo

Implementar o frontend em Next.js 14 (App Router) no diretório `/frontend`, configurando o Tailwind CSS com a identidade visual *Dark Neon Arcade* inspirada nos jogos *Need for Speed* e *Midnight Club*, e criando os componentes de Gauge Meter, Pilot Badge e o catálogo de seleção de autódromos e veículos.

#### Specs de Referência

* `specs/01-architecture-overview.md` (Seção 1.1)
* `specs/04-frontend-react-nextjs-ui.md` (Seções 2, 3 e 5)

#### Prompt para o Agente:

```text
Você é o desenvolvedor Frontend Sênior especialista em React, Next.js e UI/UX Gamificada.
Sua tarefa é criar o Design System Arcade e as telas iniciais da ApexRide no diretório `/frontend` conforme a especificação `specs/04-frontend-react-nextjs-ui.md`.

REQUISITOS DE IMPLEMENTAÇÃO:
1. Configure os tokens do Tailwind CSS em `frontend/tailwind.config.js`:
   - Paleta de cores `racing`: bg (`#090A0F`), card (`#12151E`), border (`#1F2433`), cyan (`#00F0FF`), yellow (`#FFEA00`), red (`#FF0055`), green (`#00FF66`).
   - Fontes: Display (`Orbitron`), Sans (`Inter`).
   - Box-shadows com efeitos de brilho neon (`neon-cyan`, `neon-yellow`, `neon-red`).

2. Crie o cliente de API assíncrono em `frontend/services/api.ts`:
   - Instância Axios/Fetch configurada com `withCredentials: true` para enviar automaticamente os Cookies HTTP-Only para o backend.

3. Desenvolva os componentes visuais reutilizáveis em `frontend/components/ui/`:
   - `GaugeMeter.tsx`: Componente que renderiza uma barra dividida em 20 blocos gráficos animados com `framer-motion` para velocidade, aceleração e curva.
   - `PilotBadge.tsx`: Badge brilhante que exibe o nível do piloto (`BRONZE PILOT`, `SILVER PILOT`, `GOLD PILOT`, etc.) e a velocidade máxima destravada em km/h.
   - `MotorcycleCard.tsx`: Card de apresentação da motocicleta contendo imagem do veículo, marca, modelo, valor por hora, aviso de trava eletrônica ativada e botão de ação com brilho ciano.

4. Implemente as páginas principais:
   - `app/(auth)/login/page.tsx` & `app/(auth)/register/page.tsx`: Formulários estilizados em Dark Neon. O cadastro deve coletar os dados médicos (SUS, Tipo Sanguíneo, Emergência) e os tamanhos de equipamentos.
   - `app/tracks/page.tsx`: Visualizador estilo mapa de seleções de autódromos (Interlagos, Capuava, Velo Città).
   - `app/garage/page.tsx`: Catálogo de motocicletas da pista selecionada, permitindo comparar atributos através dos Gauge Meters.
   - `app/checkout/page.tsx`: Resumo com seletor de tamanhos de equipamentos, discriminativo de valores (moto + pista + seguro) e botão de confirmação.

CRITÉRIOS DE ACEITE:
- As páginas devem ser totalmente responsivas e apresentar animações suaves ao passar o mouse sobre os cards de garagem.
- O layout respeita rigorosamente a paleta Dark Neon sem elementos brancos ou desalinhados.

COMMIT MSG SUGERIDA: "feat(frontend): setup NFS Dark Neon design system, gauge meter components, tracks map and garage catalog"

```

---

### PROMPT 6: Painel "Minha Garagem", Ingressos QR Code, Telemetria e Scanner

#### Objetivo

Finalizar a aplicação implementando o painel *"Minha Garagem"* para consulta de reservas, o componente de Passe de Corrida Digital com visualização e download de QR Code, a aba de Telemetria pós-corrida com gráficos de desempenho, a página de Placar de Líderes (*Leaderboard*) e o scanner de QR Code para uso do operador de pista no autódromo.

#### Specs de Referência

* `specs/01-architecture-overview.md`
* `specs/04-frontend-react-nextjs-ui.md` (Seções 4.6, 4.7, 4.8 e 5.3)

#### Prompt para o Agente:

```text
Você é o desenvolvedor Frontend Sênior responsável por finalizar os módulos avançados do ApexRide.
Implemente as páginas de Ingressos, Telemetria, Leaderboard e o Scanner do Operador conforme `specs/04-frontend-react-nextjs-ui.md`.

REQUISITOS DE IMPLEMENTAÇÃO:
1. Implemente o componente de Ingresso Passe de Pista em `frontend/components/ui/TicketCard.tsx`:
   - Visual de ticket oficial de autódromo com borda ciano neon.
   - Exibição centralizada da imagem em Base64 do QR Code gerado pelo backend.
   - Exibição do UUID formatado da reserva, autódromo, data/horário e limite de velocidade liberado em destaque vermelho.
   - Botão para acionar a impressão/download em PDF (`window.print()`).

2. Implemente a página "Minha Garagem" em `frontend/app/my-garage/page.tsx`:
   - Lista todas as reservas do piloto autenticado consumindo `/api/v1/rentals/my-garage`.
   - Aba para visualização e impressão dos ingressos em QR Code.
   - Aba de Telemetria pós-corrida renderizando o componente `TelemetryChart.tsx` com gráficos de linha e barras (tempos por volta, velocidade máxima e força G lateral por curva).

3. Implemente a página de Placar de Líderes em `frontend/app/leaderboard/page.tsx`:
   - Placar estilizado com estética de arcade de fliperama.
   - Destaque Neon Ouro, Prata e Bronze para os 3 pilotos no topo do ranking.
   - Filtros por autódromo e modelo de motocicleta.

4. Implemente o Scanner do Operador de Pista em `frontend/app/operator/scanner/page.tsx`:
   - Interface limpa e responsiva para tablets/smartphones de fiscais de pista.
   - Campo para digitação manual ou leitura de QR Code via câmera web/mobile enviando requisição para `/api/v1/operator/validate-qr`.
   - Em caso de validação com sucesso, exibe o cartão verde com os detalhes da reserva E libera a visualização da Ficha Médica de Emergência (Tipo sanguíneo, SUS, CNH e telefone de emergência).

CRITÉRIOS DE ACEITE:
- O fluxo completo end-to-end funciona: Cadastro -> Seleção de Pista -> Garagem de Moto -> Checkout -> Minha Garagem -> QR Code gerado -> Leitura no Scanner do Operador exibindo a ficha médica.
- A página de impressão do ingresso remove barras de navegação indesejadas e formata o ticket centralizado na página A4.

COMMIT MSG SUGERIDA: "feat(frontend): implement my-garage panel, digital ticket QR Code, telemetry chart HUD, leaderboard and operator scanner"

```

---

## 4. Matriz de Verificação de Qualidade (Definition of Done)

Para considerar o projeto **ApexRide** concluído com sucesso ao final da execução do Prompt Chain, certifique-se de que a checklist abaixo seja atendida:

* [ ] Todos os 4 containers Docker (`db`, `backend`, `frontend`, `nginx`) sobem via `docker compose up -d` com status `healthy`.
* [ ] O script `seed.py` popula o banco de dados e permite login imediato com as contas de teste.
* [ ] O token JWT é armazenado de forma segura no Cookie `access_token` com a flag `HttpOnly`.
* [ ] A velocidade máxima liberada para a motocicleta respeita o teto do nível de pilotagem cadastrado do usuário.
* [ ] O QR Code impresso no ingresso contém unicamente a string `UUID` e pode ser escaneado pelo operador na rota `/operator/scanner`.
* [ ] A ficha médica de emergência do piloto fica protegida e visível exclusivamente no painel do operador durante a validação do ingresso na pista.

```

```