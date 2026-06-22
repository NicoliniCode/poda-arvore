# Regras de Negocio

Este documento define o comportamento esperado do sistema de autorizacao de poda de arvores.

## Perfis

O sistema possui tres perfis principais:

- `SOLICITANTE`
- `FISCAL`
- `ADMINISTRADOR`

O perfil do usuario deve ser carregado do banco de dados apos login. A tela de login nao deve permitir escolha manual de perfil.

## Fluxo Principal da Solicitacao

1. O solicitante realiza login ou sign up.
2. O solicitante cadastra uma solicitacao de poda.
3. A solicitacao inicia com status `ABERTA`.
4. O administrador visualiza a solicitacao.
5. O administrador pode iniciar analise e para qual fiscal deseja encaminhar a solicitacao.
6. Ao encaminhar, a solicitacao passa para `ENCAMINHADA_FISCAL`.
7. O fiscal selecionado visualiza a solicitacao.
8. O fiscal registra vistoria com parecer tecnico.
9. O fiscal aprova ou reprova tecnicamente a solicitacao.
10. A solicitacao passa para `APROVADA` ou `REPROVADA`.
11. O solicitante acompanha o andamento e resultado.

## Regras do Solicitante

O solicitante pode:

- Cadastrar solicitacao de poda.
- Visualizar apenas solicitacoes criadas por ele.
- Visualizar detalhes, anexos e historico das proprias solicitacoes.
- Editar seus dados pessoais.
- Editar solicitacao apenas quando o status permitir.

O solicitante nao pode:

- Visualizar solicitacoes de outros solicitantes.
- Encaminhar solicitacao para fiscal.
- Registrar vistoria.
- Aprovar ou reprovar solicitacao.
- Gerenciar usuarios.
- Alterar status livremente.

## Regras do Fiscal

O fiscal pode:

- Visualizar apenas solicitacoes encaminhadas para ele.
- Visualizar detalhes e anexos das solicitacoes atribuidas a ele.
- Registrar vistoria.
- Inserir parecer tecnico.
- Aprovar ou reprovar tecnicamente solicitacao atribuida a ele.

O fiscal nao pode:

- Visualizar solicitacoes encaminhadas para outros fiscais.
- Visualizar solicitacoes sem encaminhamento para ele.
- Gerenciar usuarios.
- Encaminhar solicitacoes.
- Alterar dados de solicitacoes que nao estejam sob sua responsabilidade.
- alterar dados pessoais de solicitantes.

## Regras do Administrador

O administrador pode:

- Visualizar todas as solicitacoes.
- Visualizar detalhes, anexos e historico completo.
- Gerenciar usuarios fiscais.
- Encaminhar solicitacoes para fiscais.
- Alterar status conforme necessidade operacional.
- Acompanhar auditoria e historico.

O administrador nao pode:
- alterar dados pessoais de solicitantes.

O administrador deve:

- Registrar encaminhamentos no historico.
- Evitar alterar status final sem justificativa.
- Manter rastreabilidade de acoes relevantes.

## Regras de Edicao da Solicitacao

Edicao pelo solicitante:

- Permitida somente quando a solicitacao estiver `ABERTA`.
- Nao permitida em nenhum outro status.

Edicao pelo administrador:
- Permitida em qualquer status nao-final (`ABERTA`, `EM_ANALISE`, `ENCAMINHADA_FISCAL`, `EM_VISTORIA`).
- Toda edicao pelo administrador gera registro em `solicitacao_status_historico`.

Edicao pelo fiscal:
- Restrita ao registro de vistoria, parecer tecnico e resultado via rota propria.
- Nao pode editar dados principais da solicitacao (`PUT /api/solicitacoes/:id` retorna 403).

## Regras de Cancelamento

- Cancelamento via `POST /api/solicitacoes/:id/cancelar`.
- `ADMINISTRADOR`: pode cancelar nos status `ABERTA` ou `ENCAMINHADA_FISCAL`.
- `SOLICITANTE`: pode cancelar **apenas a propria solicitacao** e **somente** quando o status for `ABERTA`.
- `FISCAL`: nao pode cancelar (403).
- Status incompativel retorna 409.
- O cancelamento e um soft-delete: seta `status = 'CANCELADA'` e grava `solicitacao_status_historico`.
- Linha, anexos e historico sao preservados para auditoria.

## Regras de Status

Status permitidos:

- `ABERTA`: solicitacao cadastrada.
- `EM_ANALISE`: administrador iniciou analise.
- `ENCAMINHADA_FISCAL`: administrador encaminhou para fiscal.
- `EM_VISTORIA`: fiscal iniciou ou registrou vistoria.
- `APROVADA`: fiscal aprovou tecnicamente.
- `REPROVADA`: fiscal reprovou tecnicamente.
- `CANCELADA`: solicitacao encerrada sem continuidade.

Status finais:

- `APROVADA`
- `REPROVADA`
- `CANCELADA`

Solicitacoes com status final nao devem receber novos encaminhamentos ou vistorias, salvo regra administrativa explicita.

## Regras de Encaminhamento

- Apenas administrador pode encaminhar solicitacao.
- O fiscal escolhido deve estar ativo e possuir perfil `FISCAL`.
- O encaminhamento deve gravar data, administrador, fiscal e observacao.
- A solicitacao deve armazenar `id_admin_responsavel` e `id_fiscal_responsavel`.
- O historico deve receber evento de encaminhamento.

## Regras de Vistoria

- Apenas o fiscal responsavel pode registrar vistoria.
- A vistoria deve possuir parecer tecnico obrigatorio.
- O resultado deve ser `APROVADA` ou `REPROVADA`.
- A decisao deve atualizar `data_decisao`.
- O historico deve registrar vistoria e resultado.

## Regras de Anexos

- Solicitacoes podem possuir fotos, documentos ou outros anexos.
- O arquivo deve ser salvo em pasta de uploads.
- O banco deve armazenar nome, tipo, caminho e data de upload.
- Anexos devem ser visiveis apenas para usuarios com acesso a solicitacao.

## Regras de Seguranca

- Senhas nunca devem ser gravadas em texto puro.
- Toda autenticacao deve passar pelo backend.
- Toda autorizacao deve ser validada no backend.
- Tokens expirados ou invalidos devem ser recusados.
- Usuarios inativos nao podem acessar o sistema.
