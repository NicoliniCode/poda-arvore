# Instrucoes para o Claude

Sistema web para autorizacao de poda de arvores. Este arquivo orienta o Claude (no VS Code, via Claude Code) sobre o projeto, regras e fluxo de trabalho esperado.

## Idioma

- Responder sempre em portugues (pt-BR).
- Nomes de variaveis, funcoes e tabelas seguem o padrao do projeto (portugues, snake_case no banco, camelCase no codigo).
- Mensagens de commit, comentarios e logs em portugues.

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui.
- **Backend**: Node.js + Express + TypeScript.
- **Banco**: MySQL.
- **Ambiente**: Docker Compose (`docker-compose.yml`).
- **Uploads**: pasta `uploads/` montada via Docker.

## Arquivos de Referencia

Antes de qualquer alteracao relevante, consultar:

| Arquivo | Para que serve |
|---|---|
| `arquitetura.md` | Visao geral, camadas, padroes de API. |
| `banco-de-dados.md` | Tabelas, status, permissoes, relacionamentos. |
| `database/schema.sql` | **Fonte primaria** da estrutura do banco. Nao inventar campos. |
| `requisitos.md` | Requisitos funcionais e nao-funcionais. |
| `regras-negocio.md` | Fluxo de solicitacao, regras por perfil, status. |
| `permissoes.md` | Matriz de permissoes por perfil. |
| `backend/CLAUDE.md` | Regras especificas do backend. |
| `frontend/CLAUDE.md` | Regras especificas do frontend (stack, padroes). |

Alguns arquivos sobrepoem assuntos (perfis aparecem em 3 deles). Em caso de conflito, a ordem de prioridade e:

1. `database/schema.sql` (estrutura)
2. `regras-negocio.md` (comportamento)
3. `permissoes.md` (controle de acesso)
5. Este arquivo (`CLAUDE.md`)

## Como Trabalhar

1. **Ler antes de escrever.** Inspecionar arquivos existentes do modulo antes de propor mudancas. Reaproveitar padroes ja usados.
2. **Mudancas minimas.** Editar o que for necessario. Nao reescrever modulos inteiros, nao trocar bibliotecas, nao reformatar codigo nao relacionado.
3. **Perguntar quando houver duvida.** Se uma regra de negocio for ambigua ou conflitar com os docs, pedir confirmacao em vez de assumir.
4. **Mostrar o plano antes de mudancas grandes.** Para refatoracoes que tocam varios arquivos, descrever o plano e esperar aprovacao.
5. **Validar.** Apos alterar codigo, sugerir como testar (endpoint a chamar, tela a abrir, comando a rodar).


## Regras Gerais

- Manter codigo organizado por modulos (ver `arquitetura.md`).
- Nao recriar frontend ou backend do zero.
- Nao alterar configuracao Docker sem necessidade explicita.
- Usar `database/schema.sql` como referencia principal do banco.
- Nao misturar regra de negocio no frontend.
- Toda autenticacao passa pelo backend.
- Toda autorizacao e validada no backend (mesmo que o frontend esconda).
- Senhas armazenadas **somente** como hash (bcrypt ou equivalente).
- Usuario inativo nao deve autenticar.

## Perfis

`SOLICITANTE`, `FISCAL`, `ADMINISTRADOR`. Lidos do banco apos autenticacao — **nunca** escolhidos no login. Detalhes completos em `permissoes.md` e `regras-negocio.md`.

Resumo operacional:

- **Solicitante**: cria e ve apenas suas solicitacoes.
- **Fiscal**: ve apenas solicitacoes encaminhadas a ele, registra vistoria, aprova/reprova tecnicamente.
- **Administrador**: ve todas, encaminha, gerencia usuarios.

## Filtros Obrigatorios em Queries

Todas as listagens de solicitacao no backend devem filtrar conforme perfil:

- `SOLICITANTE`: `WHERE id_usuario_solicitante = ?`
- `FISCAL`: `WHERE id_fiscal_responsavel = ?`
- `ADMINISTRADOR`: sem filtro de usuario.

Para listagens complexas, preferir a view `vw_solicitacao_poda_detalhada`.

## Registros Obrigatorios

Toda operacao relevante gera linha em uma tabela de auditoria:

- Mudanca de status → `solicitacao_status_historico`
- Upload de anexo → `solicitacao_anexo`
- Encaminhamento para fiscal → `solicitacao_encaminhamento`
- Vistoria → `vistoria_poda`
- Login (sucesso ou falha) → `usuario_login_historico`

Operacoes compostas (criar solicitacao + anexos, encaminhar, vistoriar) usam **transacao**.

## Qualidade

- TypeScript estrito (`strict: true`).
- Centralizar configuracoes de ambiente em `backend/src/config`.
- Evitar duplicacao de regras (extrair para servico/util).
- Tratar erros de API de forma padronizada (middleware central).
- Nomes coerentes com `schema.sql`.
- Para UI: zero CSS inline ou `<style>` solto. Tudo via Tailwind + componentes shadcn.

## Antes de Considerar a Tarefa Pronta

- [ ] Regra de acesso validada no **backend** (nao so no frontend)?
- [ ] Filtros por perfil aplicados nas queries?
- [ ] Historico/anexo/encaminhamento/vistoria registrado quando aplicavel?
- [ ] Transacao em operacao composta?
- [ ] Nomes batem com `schema.sql`?
- [ ] Erro tratado com mensagem util ao usuario?
- [ ] Documentacao (`arquitetura.md`, `banco-de-dados.md`) atualizada se houve mudanca estrutural?

## Comandos Uteis

```bash
# Subir tudo (mysql, phpmyadmin, backend, frontend)
docker compose up -d

# Backend (dentro de backend/)
npm run dev      # tsx watch src/server.ts
npm run build    # tsc
npm run start    # node dist/server.js

# Frontend (dentro de frontend/)
npm run dev
npm run build
npm run lint
```

## O Que Evitar

- Criar arquivos novos quando ja existe modulo apropriado.
- Adicionar dependencias sem necessidade clara.
- Quebrar contrato existente da API sem aviso.
- Implementar autenticacao ou autorizacao apenas no frontend.
- Consultar o banco diretamente pelo frontend.
- Alterar `docker-compose.yml`, `Dockerfile` ou `schema.sql` sem necessidade explicita.


