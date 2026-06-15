# Banco de Dados

Banco utilizado: MySQL.

O arquivo principal do banco e `database/schema.sql`. Ele define a estrutura inicial, perfis, permissoes, usuarios de exemplo, solicitacoes, anexos, encaminhamentos, vistorias, historico e view de consulta detalhada.

## Banco

Nome do banco:

```sql
poda_arvores
```

## Tabelas Principais

### `perfil`

Armazena os perfis do sistema.

Perfis esperados:

- `SOLICITANTE`
- `ADMINISTRADOR`
- `FISCAL`

Campos principais:

- `id_perfil`
- `nome`
- `descricao`

### `permissao`

Armazena permissoes funcionais usadas pelo backend.

Exemplos:

- `SOLICITACAO_CRIAR`
- `SOLICITACAO_VER_PROPRIA`
- `SOLICITACAO_VER_TODAS`
- `SOLICITACAO_ENCAMINHAR_FISCAL`
- `SOLICITACAO_VER_ENCAMINHADA`
- `VISTORIA_REGISTRAR`
- `SOLICITACAO_APROVAR_REPROVAR`
- `USUARIO_GERENCIAR`

### `perfil_permissao`

Relaciona perfis e permissoes.

Essa tabela deve ser usada pelo backend para montar as permissoes do usuario autenticado.

### `usuario`

Armazena usuarios do sistema.

Campos principais:

- `id_usuario`
- `id_perfil`
- `nome`
- `cpf`
- `email`
- `telefone`
- `senha_hash`
- `ativo`
- `data_cadastro`
- `data_atualizacao`
- `ultimo_login`

Regras:

- `email` deve ser unico.
- `cpf` deve ser unico quando informado.
- `senha_hash` deve conter hash da senha.
- Usuario inativo nao deve autenticar.

### `usuario_login_historico`

Registra tentativas de login.

Campos principais:

- `id_login_historico`
- `id_usuario`
- `email_informado`
- `sucesso`
- `ip_origem`
- `user_agent`
- `mensagem`
- `data_tentativa`

### `solicitacao_poda`

Tabela central do fluxo de poda.

Campos principais:

- `id_solicitacao`
- `id_usuario_solicitante`
- `id_admin_responsavel`
- `id_fiscal_responsavel`
- `endereco`
- `numero`
- `bairro`
- `cidade`
- `uf`
- `ponto_referencia`
- `motivo`
- `observacao`
- `status`
- `data_solicitacao`
- `data_encaminhamento_fiscal`
- `data_decisao`
- `data_atualizacao`

Status permitidos:

- `ABERTA`
- `EM_ANALISE`
- `ENCAMINHADA_FISCAL`
- `EM_VISTORIA`
- `APROVADA`
- `REPROVADA`
- `CANCELADA`

### `solicitacao_anexo`

Armazena anexos vinculados a solicitacao.

Campos principais:

- `id_anexo`
- `id_solicitacao`
- `tipo`
- `nome_arquivo`
- `caminho_arquivo`
- `data_upload`

Tipos permitidos:

- `FOTO`
- `DOCUMENTO`
- `OUTRO`

### `solicitacao_encaminhamento`

Registra encaminhamento administrativo para fiscal.

Campos principais:

- `id_encaminhamento`
- `id_solicitacao`
- `id_admin`
- `id_fiscal`
- `observacao`
- `data_encaminhamento`

### `vistoria_poda`

Registra vistoria tecnica.

Campos principais:

- `id_vistoria`
- `id_solicitacao`
- `id_fiscal`
- `data_vistoria`
- `parecer_tecnico`
- `resultado`
- `observacao`

Resultados permitidos:

- `APROVADA`
- `REPROVADA`

### `solicitacao_status_historico`

Registra andamento da solicitacao.

Campos principais:

- `id_historico`
- `id_solicitacao`
- `id_usuario_responsavel`
- `status`
- `observacao`
- `data_evento`

Toda mudanca relevante de status deve gerar registro nessa tabela.

## View

### `vw_solicitacao_poda_detalhada`

View de consulta para listagem e detalhes de solicitacoes, trazendo dados da solicitacao, solicitante, administrador e fiscal.

Uso recomendado:

- Solicitante: filtrar por `id_usuario_solicitante`.
- Fiscal: filtrar por `id_fiscal_responsavel`.
- Administrador: sem filtro de usuario.

## Relacionamentos

- `usuario.id_perfil` referencia `perfil.id_perfil`.
- `perfil_permissao.id_perfil` referencia `perfil.id_perfil`.
- `perfil_permissao.id_permissao` referencia `permissao.id_permissao`.
- `solicitacao_poda.id_usuario_solicitante` referencia `usuario.id_usuario`.
- `solicitacao_poda.id_admin_responsavel` referencia `usuario.id_usuario`.
- `solicitacao_poda.id_fiscal_responsavel` referencia `usuario.id_usuario`.
- `solicitacao_anexo.id_solicitacao` referencia `solicitacao_poda.id_solicitacao`.
- `solicitacao_encaminhamento.id_solicitacao` referencia `solicitacao_poda.id_solicitacao`.
- `vistoria_poda.id_solicitacao` referencia `solicitacao_poda.id_solicitacao`.
- `solicitacao_status_historico.id_solicitacao` referencia `solicitacao_poda.id_solicitacao`.

## Orientacoes

- Nao criar regras de acesso apenas no frontend.
- Sempre filtrar solicitacoes no backend conforme perfil.
- Usar transacao ao criar solicitacao com anexos, encaminhar ou registrar vistoria.
- Registrar historico para eventos relevantes.
- Manter `schema.sql` como fonte principal da estrutura do banco.
