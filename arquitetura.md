# Arquitetura do Sistema

O projeto e um sistema web full stack para autorizacao de poda de arvores. A arquitetura separa frontend, backend, banco de dados e arquivos enviados pelo usuario.

## Tecnologias

- Frontend: React, Vite e TypeScript.
- Backend: Node.js, Express e TypeScript.
- Banco de dados: MySQL.
- Uploads: pasta local `uploads`, montada no ambiente Docker.
- Ambiente: Docker Compose.
- phpMyAdmin: ferramenta auxiliar para inspecao do banco.

## Organizacao Geral

Estrutura esperada:

```text
backend/
  src/
    config/
    middleware/
    modules/
      auth/
      users/
      solicitacoes/
    types/
    utils/

frontend/
  src/
    api/
    types/
    App.tsx
    App.css

database/
  schema.sql
  seed.sql
  inserts-teste.sql

uploads/
```

## Frontend

O frontend deve ser responsavel por:

- Exibir telas e formularios.
- Consumir a API REST do backend.
- Guardar token de sessao no cliente quando necessario.
- Exibir ou ocultar elementos conforme perfil e permissoes retornadas pelo backend.
- Enviar anexos usando `multipart/form-data`.

O frontend nao deve:

- Validar regra de acesso como fonte de verdade.
- Determinar perfil manualmente.
- Aplicar regra de negocio sensivel sem confirmacao do backend.
- Consultar o banco diretamente.

## Backend

O backend deve ser responsavel por:

- Autenticacao.
- Geracao e validacao de token.
- Consulta de perfil e permissoes.
- Regras de negocio.
- Controle de acesso por perfil.
- Validacao de dados de entrada.
- Persistencia no MySQL.
- Registro de historico.
- Upload e registro de anexos.

Camadas recomendadas:

- `config`: configuracoes de ambiente e banco.
- `middleware`: autenticacao, autorizacao e tratamento de erros.
- `modules/auth`: login, sessao e recuperacao de senha.
- `modules/users`: perfil do usuario e gerenciamento de usuarios.
- `modules/solicitacoes`: solicitacoes, encaminhamentos, anexos, vistorias e historico.
- `types`: tipos compartilhados do backend.
- `utils`: utilitarios de API e erros.

## Banco de Dados

O MySQL e inicializado a partir de `database/schema.sql`. Esse arquivo deve ser a referencia principal para nomes de tabelas, campos, relacionamentos, status e permissoes.

O backend deve usar as tabelas existentes em vez de criar estruturas paralelas sem necessidade.

## API

Padrao recomendado:

- `POST /api/auth/login`: autentica usuario.
- `GET /api/auth/me`: retorna usuario autenticado, perfil e permissoes.
- `POST /api/auth/forgot-password`: inicia recuperacao de senha.
- `POST /api/auth/reset-password`: conclui recuperacao de senha.
- `GET /api/usuarios`: lista usuarios para administrador.
- `POST /api/usuarios`: cria usuario para administrador.
- `PUT /api/usuarios/:id`: edita usuario para administrador.
- `GET /api/usuarios/fiscais`: lista fiscais ativos para encaminhamento.
- `GET /api/perfil`: retorna dados do usuario logado.
- `PUT /api/perfil`: edita dados do usuario logado.
- `GET /api/solicitacoes`: lista solicitacoes conforme perfil.
- `POST /api/solicitacoes`: cria solicitacao.
- `GET /api/solicitacoes/:id`: detalhe da solicitacao.
- `PUT /api/solicitacoes/:id`: edita solicitacao quando permitido.
- `POST /api/solicitacoes/:id/encaminhar`: encaminha para fiscal.
- `POST /api/solicitacoes/:id/vistoria`: registra vistoria e decisao tecnica.

## Controle de Acesso

O controle de acesso deve ocorrer no backend:

- Solicitante: filtro por `id_usuario_solicitante`.
- Fiscal: filtro por `id_fiscal_responsavel`.
- Administrador: acesso a todas as solicitacoes.

Mesmo que o frontend esconda botoes, a API deve bloquear requisicoes sem permissao.

## Uploads

- Arquivos enviados devem ser salvos em `uploads`.
- Cada anexo deve possuir registro em `solicitacao_anexo`.
- O caminho publico deve ser armazenado no banco.
- O tamanho maximo e tipos aceitos devem ser validados pelo backend.

## Docker

O Docker Compose deve manter os servicos:

- `mysql`
- `phpmyadmin`
- `backend`
- `frontend`

Alteracoes no Docker devem ser feitas apenas quando forem necessarias para o funcionamento do sistema.
