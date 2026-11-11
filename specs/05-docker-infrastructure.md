```markdown
# 05. Docker Infrastructure & Deployment - ApexRide

## 1. Visão Geral da Infraestrutura de Containers

A infraestrutura do **ApexRide** é baseada em uma arquitetura de micro-serviços conteinerizados via **Docker** e orquestrados pelo **Docker Compose**. O ambiente garante isolamento total entre banco de dados, backend, frontend e proxy reverso, além de persistência de dados em volumes Docker gerenciados e suporte nativo a acesso externo seguro via **Cloudflare Tunnel**.

### 1.1. Diagrama de Rede e Orquestração (`apexride_net`)

```text
                                  [ INTERNET ]
                                       |
                                       v
                            +--------------------+
                            | Cloudflare Tunnel  |
                            |   (cloudflared)    |
                            +--------------------+
                                       |
                                       v (Rede Interna: apexride_net)
                            +--------------------+
                            | Nginx Reverse Proxy|
                            |   (Porta 80/443)   |
                            +--------------------+
                                 /          \
                     /----------/            \----------\
                    v                                    v
        +-----------------------+            +-----------------------+
        |   Frontend (Next.js)  |            |   Backend (FastAPI)   |
        |     (Porta 3000)      |            |     (Porta 8000)      |
        +-----------------------+            +-----------------------+
                                                         |
                                                         v
                                             +-----------------------+
                                             |    Database (MySQL)   |
                                             |     (Porta 3306)      |
                                             +-----------------------+
                                                         |
                                                         v
                                              [ Volume: mysql_data ]

```

---

## 2. Docker Compose Completo (`docker-compose.yml`)

```yaml
version: '3.8'

networks:
  apexride_net:
    driver: bridge
    name: apexride_net

volumes:
  mysql_data:
    name: apexride_mysql_data
  static_uploads:
    name: apexride_static_uploads

services:
  # -----------------------------------------------------
  # 1. Banco de Dados Relacional (MySQL 8.0)
  # -----------------------------------------------------
  db:
    image: mysql:8.0
    container_name: apexride_db
    restart: always
    networks:
      - apexride_net
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: \${MYSQL_DATABASE}
      MYSQL_USER: \${MYSQL_USER}
      MYSQL_PASSWORD: \${MYSQL_PASSWORD}
      TZ: "America/Sao_Paulo"
    command: >
      --default-authentication-plugin=mysql_native_password
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
      --max_connections=200
    ports:
      - "127.0.0.1:3306:3306" # Exposto apenas para o localhost do host para debug
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p\${MYSQL_ROOT_PASSWORD}"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 15s

  # -----------------------------------------------------
  # 2. Backend FastAPI (Python 3.11 Assíncrono)
  # -----------------------------------------------------
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: apexride_backend
    restart: always
    networks:
      - apexride_net
    environment:
      DATABASE_URL: mysql+aiomysql://\${MYSQL_USER}:${MYSQL_PASSWORD}@db:3306/${MYSQL_DATABASE}
      SECRET_KEY: \${SECRET_KEY}
      ALGORITHM: \${ALGORITHM:-HS256}
      ACCESS_TOKEN_EXPIRE_MINUTES: \${ACCESS_TOKEN_EXPIRE_MINUTES:-1440}
      CORS_ORIGINS: \${CORS_ORIGINS:-http://localhost,http://localhost:3000}
      UPLOAD_DIR: /app/static/uploads
    volumes:
      - static_uploads:/app/static/uploads
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # -----------------------------------------------------
  # 3. Frontend React / Next.js (SSR / SPA Arcade UI)
  # -----------------------------------------------------
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: \${NEXT_PUBLIC_API_URL:-/api/v1}
    container_name: apexride_frontend
    restart: always
    networks:
      - apexride_net
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: \${NEXT_PUBLIC_API_URL:-/api/v1}
    depends_on:
      - backend

  # -----------------------------------------------------
  # 4. Proxy Reverso & Servidor de Arquivos (Nginx)
  # -----------------------------------------------------
  nginx:
    image: nginx:1.25-alpine
    container_name: apexride_nginx
    restart: always
    networks:
      - apexride_net
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - static_uploads:/usr/share/nginx/html/uploads:ro
    depends_on:
      - backend
      - frontend

  # -----------------------------------------------------
  # 5. Cloudflare Tunnel (Acesso Externo Seguro)
  # -----------------------------------------------------
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: apexride_tunnel
    restart: always
    networks:
      - apexride_net
    command: tunnel --no-autoupdate run
    environment:
      TUNNEL_TOKEN: \${TUNNEL_TOKEN}
    depends_on:
      - nginx

```

---

## 3. Especificação dos Dockerfiles (Multi-Stage Builds)

### 3.1. Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
# Stage 1: Build & Dependências
FROM python:3.11-slim as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Imagem Final Otimizada
FROM python:3.11-slim as runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Copia pacotes instalados do builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:\$PATH

# Copia código-fonte e cria pasta de uploads
COPY . .
RUN mkdir -p /app/static/uploads

EXPOSE 8000

# Script de inicialização com migração Alembic automática
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4"]

```

### 3.2. Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
# Stage 1: Dependências
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build da Aplicação Next.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Runner de Produção Leve
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

```

---

## 4. Configuração do Proxy Reverso (`nginx/nginx.conf`)

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr -$remote_user [$time_local] "$request" '
                    '\$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access_log.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Compression Gzip
    gzip on;
    gzip_disable "msie6";
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Upstreams para resolução de nomes no container
    upstream backend_upstream {
        server backend:8000;
    }

    upstream frontend_upstream {
        server frontend:3000;
    }

    server {
        listen 80;
        server_name localhost;

        # Security Headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;

        # 1. Roteamento de APIs Backend
        location /api/v1/ {
            proxy_pass http://backend_upstream;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        # 2. Documentação Swagger / OpenAPI
        location /docs {
            proxy_pass http://backend_upstream/docs;
            proxy_set_header Host \$host;
        }

        location /openapi.json {
            proxy_pass http://backend_upstream/openapi.json;
            proxy_set_header Host \$host;
        }

        # 3. Servir Imagens Estáticas de Upload (Motos e Pistas)
        location /uploads/ {
            alias /usr/share/nginx/html/uploads/;
            expires 7d;
            add_header Cache-Control "public, no-transform";
        }

        # 4. Roteamento Principal Frontend Next.js
        location / {
            proxy_pass http://frontend_upstream;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}

```

---

## 5. Gerenciamento de Variáveis de Ambiente (`.env.example`)

```env
# ==========================================
# ApexRide Environment Variables Template
# ==========================================

# 1. Banco de Dados MySQL
MYSQL_ROOT_PASSWORD=apexride_root_secret_2026
MYSQL_DATABASE=apexride_db
MYSQL_USER=apexride_user
MYSQL_PASSWORD=apexride_password_secure

# 2. Backend FastAPI
SECRET_KEY=9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost,http://localhost:3000,[http://apexride.seu-dominio.com](http://apexride.seu-dominio.com)

# 3. Frontend Next.js
NEXT_PUBLIC_API_URL=/api/v1

# 4. Deployment & Cloudflare Tunnel
TUNNEL_TOKEN=eyJhIjoiZXhhbXBsZXRva2VuMTIzNDU2Nzg5MCIsImQiOiJhcGV4cmlkZS10dW5uZWwtZXhhbXBsZSJ9

```

---

## 6. Scripts de Operação, Deployment e Manutenção

### 6.1. Subir o Ambiente de Desenvolvimento / Produção

```bash
# Clone o repositório e acesse a pasta raiz
git clone [https://github.com/usuario/apexride.git](https://github.com/usuario/apexride.git)
cd apexride

# Crie o arquivo .env a partir do template
cp .env.example .env

# Suba todos os containers com build em background
docker compose up -d --build

```

### 6.2. Executar Seed Data (Popular Pistas e Motos Iniciais)

```bash
# Executa o script de seed diretamente no container do backend
docker exec -it apexride_backend python app/seed.py

```

### 6.3. Migrações de Banco de Dados com Alembic

```bash
# Gerar uma nova migração após alterar modelos SQLModel
docker exec -it apexride_backend alembic revision --autogenerate -m "descricao_da_mudanca"

# Aplicar migrações pendentes
docker exec -it apexride_backend alembic upgrade head

```

### 6.4. Backup e Restauração do Banco de Dados MySQL

```bash
# Realizar Backup (Dump SQL)
docker exec apexride_db mysqldump -u root -p'apexride_root_secret_2026' apexride_db > backup_apexride_\$(date +%Y%m%d).sql

# Restaurar Backup
docker exec -i apexride_db mysql -u root -p'apexride_root_secret_2026' apexride_db < backup_apexride_20261111.sql

```

### 6.5. Monitoramento de Logs em Tempo Real

```bash
# Visualizar logs de todos os serviços
docker compose logs -f

# Visualizar logs apenas do backend FastAPI
docker compose logs -f backend

```

```

```