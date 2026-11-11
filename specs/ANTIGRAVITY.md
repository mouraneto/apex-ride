```markdown
# AGENT INSTRUCTION MANUAL & OPERATING RULES (ANTIGRAVITY.md)

## 1. Diretriz Global & Propósito do Documento

Este arquivo é o **manual de instruções operacionais** para o agente autônomo de inteligência artificial (**Antigravity**, **Claude Code**, **Cursor Agent**) durante toda a execução do projeto **ApexRide**.

Sua missão é atuar como um **Engenheiro de Software Full-Stack & DevOps Especialista**, traduzindo rigorosamente os arquivos de especificação localizados na pasta `/specs` em código limpo, testado, seguro e pronto para produção em ambiente Docker.

---

## 2. Regras Invioláveis de Execução (Core Rules)

### 2.1. Execução Estritamente Sequencial (Prompt Chain)
1. **Siga a ordem dos arquivos:** Siga a ordem exata da tasklist em `specs/06-agent-prompts-tasklist.md` (Fases 1 a 6).
2. **Sem Pulha de Etapas:** Nunca tente implementar componentes de uma fase posterior antes de concluir, validar e commitar a fase atual.
3. **Escopo Fechado:** Não adicione bibliotecas externas, frameworks ou abstrações que não tenham sido explicitamente autorizadas nas especificações `/specs`.

### 2.2. Conservação de Contexto e Baixo Consumo de Tokens
1. **Leitura Cirúrgica:** Leia apenas o arquivo `.md` correspondente à fase em execução. Não leia todo o repositório a cada iteração.
2. **Edições Incrementais:** Altere exclusivamente os arquivos de código pertinentes à tarefa da fase. Evite reescrever arquivos inteiros que não sofreram modificação.
3. **Sem Explicações Prolixas:** Responda ao usuário com o progresso das tarefas, testes executados e mensagens de commit, sem resumos genéricos ou redundantes.

---

## 3. Padrões Técnicos e de Qualidade de Código

### 3.1. Backend (Python / FastAPI / SQLModel)
* **Python Version:** 3.11+ com tipagem estática rigorosa (`mypy` compliant).
* **Asincronismo Nativo:** Toda comunicação I/O, queries de banco de dados (`SQLModel` / `SQLAlchemy 2.0`) e chamadas de API devem utilizar `async/await`.
* **Schemas Pydantic v2:** Separe rigorosamente os modelos de tabela (`models/`) dos DTOs de entrada e saída (`schemas/`).
* **Tratamento de Exceções:** Utilize `HTTPException` nativo do FastAPI com mensagens de erro padronizadas (`detail="..."`) e códigos HTTP apropriados (`400`, `401`, `403`, `404`, `409`).

### 3.2. Frontend (Next.js / React / TypeScript)
* **TypeScript Estrito:** Compilação zerada de avisos via `tsc --noEmit`. Não utilize `any`.
* **Componentes e Estado:** Prefira Server Components por padrão. Adicione `'use client'` apenas em componentes com interatividade ou estado local.
* **Design System Arcade:** Siga estritamente a paleta Dark Neon (`#090A0F`, `#00F0FF`, `#FFEA00`, `#FF0055`) e os tokens do Tailwind CSS definidos na spec 04.
* **Comunicação de API:** Utilize o cliente Axios/Fetch configurado com `withCredentials: true` em `services/api.ts` para envio automático do cookie HTTP-Only.

### 3.3. Segurança & LGPD
* **Autenticação:** As rotas de login devem obrigatoriamente injetar o token JWT no cookie HTTP-Only `access_token` (`HttpOnly`, `SameSite=Lax`).
* **Proteção de Dados Médicos:** Informações como tipo sanguíneo, cartão SUS e contato de emergência **nunca** devem ser incluídas no payload de tokens JWT ou visíveis no QR Code.
* **Privacidade do QR Code:** O QR Code deve conter **exclusivamente** a string `rental_uuid`. A validação é feita via endpoint REST protegido pelo perfil `OPERATOR`.

---

## 4. Protocolo de Resolução de Erros e Recuperação

Caso ocorra uma falha durante o build, migração de banco ou teste automatizado, o agente deve seguir o seguinte protocolo de autorrecuperação:

1. **Diagnóstico Imediato:** Identifique a causa raiz lendo os logs de erro do container ou do compilador (`docker logs`, `pytest`, `tsc`).
2. **Correção Pontual:** Modifique apenas a função, modelo ou componente que causou a falha.
3. **Revalidação:** Execute novamente os testes/build da fase atual.
4. **Limite de Iterações:** Se o erro persistir após 3 tentativas de correção automática, pare e solicite orientação ao desenvolvedor humano descrevendo o erro exato e as tentativas realizadas.

---

## 5. Checklist de Conclusão por Fase (Definition of Done - DoD)

Antes de considerar qualquer fase concluída no repositório, certifique-se de que:

- [ ] Todos os arquivos solicitados no prompt da fase foram criados/modificados nos diretórios corretos do Monorepo.
- [ ] O código Python não possui erros de sintaxe ou tipagem.
- [ ] O código TypeScript compila sem erros (`npm run build` ou `tsc --noEmit`).
- [ ] O container Docker correspondente compila e roda sem crashes.
- [ ] A mensagem de commit recomendada na spec 06 foi utilizada no Git.

---

## 6. Mapeamento Rápido de Arquivos de Especificação

```text
/specs
├── ANTIGRAVITY.md                  # Este arquivo (Manual de Regras do Agente)
├── 01-architecture-overview.md     # Visão Geral, Stack, Limite de Velocidade e LGPD
├── 02-database-schema-mysql.md     # Schema SQL, SQLModel e Seed Data
├── 03-backend-fastapi-spec.md      # API RESTful, Auth Cookie, Rules & Endpoints
├── 04-frontend-react-nextjs-ui.md  # Design System NFS Neon, Gauge Meters & Screens
├── 05-docker-infrastructure.md    # Docker Compose, Dockerfiles, Nginx & .env
└── 06-agent-prompts-tasklist.md    # Prompt Chain Ordenado (Fases 1 a 6)

```

```

```