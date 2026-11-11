Você é o engenheiro de DevOps e Infraestrutura do projeto ApexRide.
Sua tarefa é criar a estrutura inicial do Monorepo e a orquestração em containers Docker para o projeto, seguindo rigorosamente a especificação técnica localizada em `specs/05-docker-infrastructure.md` e as diretrizes globais de `specs/ANTIGRAVITY.md`.

REQUISITOS DE IMPLEMENTAÇÃO:

1. Crie a estrutura de diretórios do Monorepo:
   /backend
   /frontend
   /nginx
   /specs

2. Na raiz do projeto, crie o arquivo `docker-compose.yml` contendo os 5 serviços:
   - `db`: Imagem MySQL 8.0 com suporte a utf8mb4, healthcheck via `mysqladmin ping`, volume gerenciado `mysql_data` e porta 3306 exposta apenas no localhost.
   - `backend`: Build a partir de `./backend/Dockerfile`, dependente do `db` saudável, exposto na porta 8000 interna.
   - `frontend`: Build a partir de `./frontend/Dockerfile`, exposto na porta 3000 interna.
   - `nginx`: Imagem `nginx:1.25-alpine`, dependente do `backend` e `frontend`, mapeando portas 80:80 e 443:443, utilizando a configuração `./nginx/nginx.conf`.
   - `cloudflared`: Imagem `cloudflare/cloudflared:latest`, executando `tunnel --no-autoupdate run` e utilizando a variável `${TUNNEL_TOKEN}`.

3. Crie os Dockerfiles (Multi-stage build):
   - `./backend/Dockerfile`: Base `python:3.11-slim`. Estágio builder (instalação de dependências de compilação/MySQL) e estágio runner enxuto executando `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000`.
   - `./frontend/Dockerfile`: Base `node:20-alpine`. Estágio deps, builder (`npm run build`) e runner standalone enxuto com usuário não-root `nextjs`.

4. Crie a configuração do Nginx em `./nginx/nginx.conf`:
   - Reverse proxy encaminhando `/api/v1/`, `/docs` e `/openapi.json` para o container `backend:8000`.
   - Mapeamento de arquivos estáticos em `/uploads/`.
   - Reverse proxy encaminhando a raiz `/` para o container `frontend:3000`.
   - Headers de segurança habilitados (X-Frame-Options, X-XSS-Protection, X-Content-Type-Options).

5. Crie o arquivo `.env.example` contendo todas as variáveis necessárias de MySQL, SECRET_KEY do JWT, CORS_ORIGINS, NEXT_PUBLIC_API_URL e TUNNEL_TOKEN.

CRITÉRIOS DE ACEITE:
- Execute `docker compose config` e valide que a sintaxe está 100% correta.
- Garanta que todos os nomes de volumes, redes (`apexride_net`) e dependências sigam fielmente o `specs/05-docker-infrastructure.md`.

Realize o commit ao concluir com a mensagem:
`feat(infra): setup initial monorepo, docker-compose, multi-stage dockerfiles and nginx proxy`