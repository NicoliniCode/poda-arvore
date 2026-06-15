# Instrucoes para o Codex

Este projeto e um sistema web para autorizacao de poda de arvores.

## Tecnologias

- Frontend: React com Vite e TypeScript.
- Backend: Node.js, Express e TypeScript.
- Banco de dados: MySQL.
- Ambiente: Docker.
- Uploads: pasta `uploads`.

## Regras Gerais

- Manter codigo organizado por modulos.
- Nao recriar frontend ou backend do zero.
- Nao alterar configuracao Docker sem necessidade.
- Usar `database/schema.sql` como referencia principal do banco.
- Nao misturar regra de negocio no frontend.
- Toda autenticacao deve passar pelo backend.
- Toda autorizacao deve ser validada no backend.
- Senhas devem ser armazenadas apenas como hash.
- Usuario inativo nao deve autenticar.

## Perfis

O sistema possui tres perfis principais:

- `SOLICITANTE`
- `FISCAL`
- `ADMINISTRADOR`

A tela de login nao deve permitir escolher perfil manualmente. O perfil deve ser obtido do banco de dados apos autenticacao.

## Solicitante

Pode:

- Cadastrar solicitacao de poda.
- Visualizar somente suas proprias solicitacoes.
- Editar seus dados pessoais.
- Editar solicitacao apenas quando o status permitir.

Nao pode:

- Ver solicitacoes de outros usuarios.
- Encaminhar para fiscal.
- Registrar vistoria.
- Aprovar ou reprovar solicitacao.
- Gerenciar usuarios.

## Fiscal

Pode:

- Visualizar somente solicitacoes encaminhadas para ele.
- Registrar vistoria.
- Inserir parecer tecnico.
- Aprovar ou reprovar tecnicamente solicitacao atribuida a ele.
- Editar seus dados pessoais.

Nao pode:

- Ver solicitacoes de outros fiscais.
- Gerenciar usuarios.
- Encaminhar solicitacoes.

## Administrador

Pode:

- Visualizar todas as solicitacoes.
- Gerenciar usuarios.
- Encaminhar solicitacoes para fiscais.
- Editar solicitacoes quando necessario.
- Alterar status conforme regra operacional.
- Acompanhar historico completo.

## Funcionalidades Esperadas

- Login.
- Cadastro de solicitante.
- Recuperacao de senha.
- Perfil do usuario.
- Edicao de usuario.
- Listagem de solicitacoes.
- Cadastro de solicitacao.
- Edicao de solicitacao.
- Tela de detalhes.
- Historico de andamento.
- Anexos.
- Controle de permissoes por perfil.

## Orientacoes de Desenvolvimento

- Frontend deve consumir API REST do backend.
- Frontend deve exibir informacoes conforme usuario autenticado e permissoes recebidas.
- Qualquer alteracao no frontend deve seguir obrigatoriamente o guia visual e de experiencia definido em `ui-ux.md`.
- Backend deve validar payloads, permissoes e escopo de acesso.
- Solicitante deve ser filtrado por `id_usuario_solicitante`.
- Fiscal deve ser filtrado por `id_fiscal_responsavel`.
- Administrador pode consultar todas as solicitacoes.
- Alteracoes relevantes devem gerar registro em `solicitacao_status_historico`.
- Uploads devem gerar registros em `solicitacao_anexo`.
- Encaminhamentos devem gerar registros em `solicitacao_encaminhamento`.
- Vistorias devem gerar registros em `vistoria_poda`.

## Qualidade

- Preferir TypeScript estrito.
- Centralizar configuracoes de ambiente.
- Evitar duplicacao de regras.
- Tratar erros de API de forma padronizada.
- Manter nomes coerentes com o schema do banco.
