# Sistema Autoriza Poda de Arvores

Sistema web para solicitacao, analise, vistoria e aprovacao ou reprovacao tecnica de pedidos de poda de arvores.

## Objetivo

Centralizar o processo de autorizacao de poda de arvores, permitindo que solicitantes registrem pedidos, administradores acompanhem e encaminhem solicitacoes, e fiscais emitam parecer tecnico apos vistoria.

## Perfis de Usuario

- Solicitante: cadastra pedidos e acompanha apenas suas proprias solicitacoes.
- Fiscal: visualiza apenas solicitacoes encaminhadas para ele e registra vistoria.
- Administrador: visualiza todas as solicitacoes, gerencia usuarios e encaminha pedidos para fiscais.

O perfil do usuario vem do banco de dados apos autenticacao. A tela de login nao deve permitir escolha manual de perfil.

## Tecnologias

- Frontend: React, Vite e TypeScript.
- Backend: Node.js, Express e TypeScript.
- Banco de dados: MySQL.
- Ambiente: Docker Compose.
- phpMyAdmin para apoio ao desenvolvimento.
- Uploads em pasta `uploads`.

## Funcionalidades

- Login.
- Cadastro de solicitante.
- Recuperacao de senha.
- Perfil do usuario.
- Edicao de usuario.
- Gerenciamento de usuarios para administrador.
- Listagem de solicitacoes conforme perfil.
- Cadastro de solicitacao de poda.
- Edicao de solicitacao quando o status permitir.
- Detalhes da solicitacao.
- Historico de andamento.
- Anexos.
- Encaminhamento para fiscal.
- Registro de vistoria.
- Parecer tecnico.
- Aprovacao ou reprovacao tecnica.
- Controle de permissoes por perfil.

## Regras de Acesso

- Solicitante visualiza apenas solicitacoes criadas por ele.
- Fiscal visualiza apenas solicitacoes encaminhadas para ele.
- Administrador visualiza todas as solicitacoes.
- Toda autenticacao e autorizacao deve passar pelo backend.
- O frontend nao deve conter regra de negocio sensivel como fonte de verdade.

## Estrutura do Projeto

```text
backend/      API Node.js/Express/TypeScript
frontend/     Aplicacao React/Vite/TypeScript
database/     Scripts SQL do MySQL
uploads/      Arquivos enviados pelos usuarios
```

## Banco de Dados

O banco principal e `poda_arvores`.

O schema fica em:

```text
database/schema.sql
```

Tabelas principais:

- `perfil`
- `permissao`
- `perfil_permissao`
- `usuario`
- `usuario_login_historico`
- `solicitacao_poda`
- `solicitacao_anexo`
- `solicitacao_encaminhamento`
- `vistoria_poda`
- `solicitacao_status_historico`

View principal:

- `vw_solicitacao_poda_detalhada`

## Execucao com Docker

Servicos esperados:

- MySQL
- phpMyAdmin
- Backend
- Frontend

Com Docker em execucao:

```bash
docker compose up -d
```

URLs padrao:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Healthcheck: `http://localhost:3000/api/health`
- phpMyAdmin: `http://localhost:8082`

## Documentacao

- `requisitos.md`: requisitos funcionais e nao funcionais.
- `regras-negocio.md`: regras do fluxo de solicitacao, status e perfis.
- `permissoes.md`: matriz de acesso por perfil.
- `banco-de-dados.md`: estrutura e orientacoes do banco.
- `arquitetura.md`: organizacao tecnica do frontend, backend, banco e Docker.
- `AGENTS.md`: orientacoes para manutencao por agentes de codigo.

## Orientacoes de Desenvolvimento

- Manter backend modular.
- Manter frontend focado em interface e consumo da API.
- Validar permissoes no backend.
- Registrar historico em alteracoes relevantes.
- Usar transacoes em operacoes que alteram varias tabelas.
- Nao alterar Docker sem necessidade.
