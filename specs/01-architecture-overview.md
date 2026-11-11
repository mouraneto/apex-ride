```markdown
# 01. Architecture Overview - ApexRide

## 1. Visão Geral e Objetivo do Sistema

O **ApexRide** é uma plataforma digital *full-stack* voltada para a locação de motocicletas esportivas de alta cilindrada para uso exclusivo em autódromos e circuitos fechados (*Track Days*). O sistema elimina a barreira financeira de aquisição e manutenção de motocicletas esportivas de alto desempenho, permitindo que entusiastas pilotem em ambiente seguro com infraestrutura completa.

### 1.1. Propósitos Centrais do Projeto
* **Gamificação & Experiência Imersiva (NFS/Midnight Club):** Interface inspirada em jogos clássicos de corrida (*Need for Speed*, *Midnight Club*), apresentando estatísticas do veículo em *gauge meters* (velocidade, aceleração, frenagem, curva) e badges de nível de piloto.
* **Governança Dinâmica de Segurança:** Limitação eletrônica de velocidade máxima da motocicleta atrelada dinamicamente ao nível de experiência cadastrado do piloto.
* **Gestão de Ingressos e Acesso Físico via QR Code:** Validação de segurança presencial no autódromo com checagem de cadastro, termos de seguro e exibição de ficha médica para equipes de socorro em caso de incidentes.
* **Telemetria Pós-Corrida & Ranking:** Módulo de análise de desempenho do piloto por sessão de pista (tempos de volta, aceleração lateral G, velocidade média) e ranking comunitário (*Leaderboard*).

---

## 2. Topologia da Arquitetura & Fluxo de Dados

A aplicação adota uma arquitetura em camadas desacopladas (*Monorepo*), conteinerizadas via Docker, com comunicação RESTful assíncrona entre o cliente Web e o backend em Python.


```

+-------------------------------------------------------------------------------+
|                                CLIENTE (BROWSER)                              |
|   Next.js (App Router) + React + Tailwind CSS (Estética NFS Neon Arcade)       |
+-------------------------------------------------------------------------------+
|
(Cookies HTTP-Only / JSON)
v
+-------------------------------------------------------------------------------+
|                            NGINX REVERSE PROXY                                |
|           Roteamento de rotas estáticas (`/`) e rotas de API (`/api/v1/`)     |
+-------------------------------------------------------------------------------+
|
v
+-------------------------------------------------------------------------------+
|                             FASTAPI BACKEND (PYTHON)                          |
|  Auth (JWT) | Business Engine | Speed Governor | QR Code Gen | Telemetry API  |
+-------------------------------------------------------------------------------+
|
v
+-------------------------------------------------------------------------------+
|                             MYSQL 8.0 DATABASE                                |
|    Users, Tracks, Motorcycles, Equipments, Rentals, Telemetry, Audit Logs     |
+-------------------------------------------------------------------------------+

```

### 2.1. Fluxo de Vida de uma Reserva (End-to-End)
1. **Autenticação:** O piloto realiza login; o backend valida as credenciais e injeta um token JWT em um cookie `HTTP-Only` seguro (`samesite=lax`).
2. **Navegação & Seleção:** O piloto seleciona o autódromo desejado. A API retorna apenas as motocicletas alocadas naquele autódromo e disponíveis no inventário.
3. **Cálculo da Locação:** O backend calcula em tempo real a tarifa total:
   $$\text{Preço Total} = (\text{Tarifa Moto/Hora} \times \text{Horas}) + \text{Taxa Autódromo} + \text{Equipamentos} + \text{Seguro Obrigatório}$$
4. **Checkout Mock:** Ao confirmar o pagamento em modo de simulação, o sistema altera o status da reserva para `CONFIRMED` e gera um identificador único universal (`rental_uuid`).
5. **Geração do Ingresso QR Code:** O sistema gera o QR Code contendo **exclusivamente** o `rental_uuid` (nenhum dado pessoal do piloto é exposto na imagem do QR Code).
6. **Validação na Pista (Operador):** O fiscal do autódromo acessa a rota `/operator/scanner`, lê o QR Code e o backend retorna o status da reserva junto com a ficha médica de emergência do piloto.

---

## 3. Stack Tecnológica & Especificação de Infraestrutura

| Camada | Tecnologia | Justificativa Técnica |
| :--- | :--- | :--- |
| **Backend** | Python 3.11+ / FastAPI | Alta performance assíncrona (`async/await`), validação de tipos automática via Pydantic v2 e documentação OpenAPI nativa. |
| **ORM / Data Access** | SQLModel / SQLAlchemy 2.0 | Unificação de modelos Pydantic e tabelas relacionais em uma única estrutura de código assíncrona. |
| **Migrações de Banco** | Alembic | Controle de versão de esquema SQL automatizado no ciclo de vida do container backend. |
| **Frontend** | Next.js 14+ (App Router) / React | Renderização rápida, gerenciamento de rotas robusto e consumo otimizado de ativos estáticos. |
| **Estilização & UI** | Tailwind CSS / Lucide Icons / Framer Motion | Facilidade na criação do Design System *Dark Arcade Neon* com animações fluidas de gauge meters. |
| **Banco de Dados** | MySQL 8.0 | Banco relacional robusto com suporte a transações ACID, chaves estrangeiras e tipos ENUM nativos. |
| **Reverse Proxy** | Nginx (Alpine) | Centralizador de portas 80/443, proxy reverso, gerenciador de buffer de requisições e headers de segurança. |
| **Containerização** | Docker & Docker Compose | Isolamento completo do ambiente de desenvolvimento e produção com *multi-stage builds*. |
| **Conectividade Externa**| Cloudflare Tunnel | Publicação segura em domínio Hostinger sem necessidade de abertura de portas de roteador (NAT Traversal). |

---

## 4. Governança de Velocidade & Perfis de Acesso (RBAC)

### 4.1. Perfis do Sistema (`role`)
1. **`PILOT` (Piloto / Cliente):**
   * Acesso à escolha de motos, agendamento de pistas, seleção de tamanho de equipamentos e gerenciamento de perfil.
   * Acesso ao painel *"Minha Garagem"* para visualização de ingressos em QR Code, relatório de telemetria e *Leaderboard*.
2. **`OPERATOR` (Administrador / Operador de Pista):**
   * Acesso ao painel administrativo para cadastro e manutenção de motocicletas e circuitos.
   * Acesso ao leitor/scanner de QR Code para validação de acesso ao autódromo e verificação de prontuário médico de emergência.

### 4.2. Matriz de Limitação de Velocidade Eletrônica (`effective_speed_limit`)
Para garantir a segurança dos usuários e a integridade da frota, toda motocicleta alugada tem sua velocidade máxima ajustada com base no nível do piloto cadastrado no sistema (`pilot_level`). A limitação é calculada pela função:

$$\text{Velocidade Efetiva} = \min(\text{Velocidade Máxima da Moto}, \text{Teto do Nível do Piloto})$$

| Nível do Piloto (`pilot_level`) | Teto de Velocidade Permitida | Badge no App | Requisitos / Perfil |
| :--- | :--- | :--- | :--- |
| **Iniciante** | **100 km/h** | `BRONZE PILOT` | Primeiro acesso ao app ou pouca experiência em circuitos. |
| **Amador** | **160 km/h** | `SILVER PILOT` | Piloto com histórico de track days supervisionados. |
| **Intermediário** | **220 km/h** | `GOLD PILOT` | Histórico comprovado de pilotagem em alta velocidade. |
| **Avançado** | **280 km/h** | `PLATINUM PILOT` | Experiência avançada em circuitos fechados. |
| **Profissional** | **Sem Limite (300+ km/h)** | `PRO RACER` | Pilotos federados ou com histórico limpo e avançado na plataforma. |

---

## 5. Regras de Negócio e Lógica Comercial (Business Engine)

### 5.1. Regra de Bloqueio de Inventário & Autódromos
* **Alocação Física:** Cada motocicleta pertence a um autódromo específico (`track_id`).
* **Bloqueio Temporal:** Uma motocicleta não pode possuir duas locações com sobreposição de horário ($T_{\text{inicio}} < T_{\text{fim\_existente}}$ E $T_{\text{fim}} > T_{\text{inicio\_existente}}$).
* **Filtro de Busca:** Ao escolher um autódromo, o catálogo de veículos exibe unicamente as motocicletas vinculadas àquele local e livres na janela de data/hora selecionada.

### 5.2. Modalidades de Reserva (Individual vs. Grupo)
* **Reserva Individual:** O piloto efetua o pagamento integral de sua locação (moto + pista + equipamentos) e recebe 1 QR Code.
* **Reserva em Grupo:** Um piloto líder cria um grupo de corrida e gera um `group_booking_id`. O sistema permite que cada participante entre na sala do grupo, escolha sua moto/equipamentos e efetue o pagamento da sua quota individualmente. O ingresso em QR Code é gerado individualmente para cada integrante após a confirmação do pagamento correspondente.

### 5.3. Equipamentos de Proteção Individual (EPIs)
* No momento da reserva, o sistema sugere automaticamente o tamanho dos equipamentos (Capacete, Macacão, Luvas, Botas) com base nos dados previamente salvos no perfil do piloto.
* Os equipamentos são tarifados por valor diário fixo e integrados ao valor total do checkout.

---

## 6. Privacidade, Segurança & Conformidade (LGPD)

### 6.1. Proteção de Dados Sensíveis e Médicos
O sistema coleta dados de emergência do piloto durante o cadastro para apoio em eventuais acidentes na pista:
* Número da CNH (Categoria A)
* Telefone de Contato de Emergência
* Tipo Sanguíneo (ex: `O+`, `A-`)
* Número do Cartão do SUS

**Diretriz de Acesso aos Dados Médicos:**
* Os dados médicos **não** são expostos em endpoints públicos e **não** ficam visíveis no payload do token JWT ou no QR Code.
* A API `/api/v1/operator/validate-qr` libera o acesso visual às informações médicas **exclusivamente** para usuários com o perfil `OPERATOR` autenticados durante a janela de horário da corrida.

### 6.2. Arquitetura do QR Code
* **Payload:** O QR Code armazena apenas uma string `UUIDv4` legível (ex: `f47ac10b-58cc-4372-a567-0e02b2c3d479`).
* **Validação:** A validação é realizada *server-side*. Ao escanear o código, o aplicativo do operador faz um `POST` enviando o UUID para a API, que valida a autenticidade e o status no banco de dados MySQL.

---

## 7. Estratégia de Deploy & Resiliência de Infraestrutura

### 7.1. Isolamento em Containers Docker
O projeto utiliza 4 containers interconectados na mesma rede virtual interna (`apexride_net`):
1. `apexride_db`: Instância MySQL 8.0 com volume persistente para dados.
2. `apexride_backend`: Aplicação FastAPI executando sob `uvicorn`.
3. `apexride_frontend`: Aplicação Next.js compilada para produção.
4. `apexride_nginx`: Proxy reverso escutando as portas 80/443 e encaminhando requisições.

### 7.2. Configuração de Variáveis de Ambiente (`.env`)
Nenhum segredo ou credencial é commitado no código-fonte. O arquivo `.env` centraliza:
* Credenciais do banco de dados MySQL (`MYSQL_ROOT_PASSWORD`, `MYSQL_USER`, `MYSQL_PASSWORD`)
* Chave secreta de criptografia JWT (`SECRET_KEY`)
* URLs de comunicação entre serviços (`NEXT_PUBLIC_API_URL`)
* Token de autenticação do túnel seguro (`TUNNEL_TOKEN`)

```