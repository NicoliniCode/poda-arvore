# Requisitos do Sistema

Sistema web para autorizacao de poda de arvores, com fluxo de solicitacao, analise administrativa, encaminhamento para fiscal, vistoria tecnica e decisao final.

## Perfis Principais

- Solicitante: cidadao ou usuario externo que registra pedidos de poda.
- Fiscal: usuario tecnico responsavel por vistoriar solicitacoes encaminhadas a ele.
- Administrador: usuario interno responsavel por operacao, acompanhamento, usuarios e encaminhamentos.

O usuario nao escolhe perfil manualmente na tela de login. O perfil deve ser carregado do banco de dados apos autenticacao.

## Requisitos Funcionais

### Autenticacao

- O sistema deve possuir tela de login com email e senha.
- O backend deve validar credenciais e gerar token de sessao.
- O frontend deve carregar o perfil e permissoes do usuario autenticado a partir do backend.
- A autenticacao deve ocorrer sempre no backend.
- O sistema deve possuir recuperacao de senha.
- O sistema deve registrar tentativas de login quando possivel, para auditoria.

### Cadastro de Solicitante

- O sistema deve permitir cadastro de solicitante.
- O cadastro deve coletar, no minimo, nome, email, senha e dados de contato.
- CPF e telefone podem ser usados para identificacao e contato.
- O solicitante cadastrado deve receber perfil `SOLICITANTE`.
- A senha deve ser armazenada somente como hash.

### Perfil do Usuario

- O usuario autenticado deve conseguir visualizar seus dados pessoais.
- O usuario deve conseguir editar seus dados pessoais quando autorizado.
- A troca de email deve respeitar unicidade.
- A troca de senha deve exigir geracao de novo hash pelo backend.

### Gerenciamento de Usuarios

- O administrador deve poder listar usuarios.
- O administrador deve poder cadastrar, editar, ativar e inativar usuarios.
- O administrador deve poder definir perfil de usuario conforme os perfis existentes.
- Fiscal e solicitante nao podem gerenciar usuarios.

### Solicitacoes de Poda

- O solicitante deve poder cadastrar solicitacao de poda.
- A solicitacao deve registrar endereco, numero, bairro, cidade, UF, ponto de referencia, motivo e observacao.
- O solicitante deve visualizar apenas suas proprias solicitacoes.
- O fiscal deve visualizar apenas solicitacoes encaminhadas para ele.
- O administrador deve visualizar todas as solicitacoes.
- A solicitacao deve possuir tela de detalhes.
- A solicitacao deve possuir historico de andamento.
- A solicitacao deve aceitar anexos, como fotos e documentos.
- O solicitante pode editar solicitacao apenas quando o status permitir.
- O administrador pode editar solicitacoes quando necessario.

### Encaminhamento

- O administrador deve encaminhar solicitacoes para fiscais.
- O encaminhamento deve registrar administrador responsavel, fiscal responsavel, data e observacao.
- A solicitacao encaminhada deve alterar status e registrar historico.

### Vistoria

- O fiscal deve registrar vistoria somente em solicitacoes encaminhadas para ele.
- A vistoria deve conter parecer tecnico.
- A vistoria deve permitir resultado tecnico `APROVADA` ou `REPROVADA`.
- A decisao tecnica deve atualizar o status da solicitacao.
- A vistoria deve gerar registro no historico.

### Historico

- Toda mudanca relevante deve gerar historico.
- O historico deve conter solicitacao, usuario responsavel, status, observacao e data do evento.
- O administrador deve acompanhar o historico completo.
- Solicitante e fiscal devem visualizar historico apenas das solicitacoes que podem acessar.

## Requisitos Nao Funcionais

- Frontend em React, Vite e TypeScript.
- Backend em Node.js, Express e TypeScript.
- Banco de dados MySQL.
- Ambiente executado por Docker.
- API REST com validacao de entrada.
- Controle de permissao aplicado no backend.
- Senhas armazenadas com bcrypt ou algoritmo equivalente.
- Uploads armazenados em pasta `uploads` e registrados no banco.
- Codigo organizado por modulos.
- Regras de negocio nao devem ficar no frontend.
- O frontend deve apenas refletir permissoes recebidas do backend.

## Telas Esperadas

- Login.
- Cadastro de solicitante.
- Recuperacao de senha.
- Perfil do usuario.
- Edicao de usuario.
- Listagem de solicitacoes.
- Cadastro de solicitacao.
- Edicao de solicitacao.
- Detalhes da solicitacao.
- Historico de andamento.
- Anexos.
- Gerenciamento de usuarios para administrador.

## Status da Solicitacao

Status previstos no banco de dados:

- `ABERTA`
- `EM_ANALISE`
- `ENCAMINHADA_FISCAL`
- `EM_VISTORIA`
- `APROVADA`
- `REPROVADA`
- `CANCELADA`

Cada status deve ser alterado apenas por perfil autorizado e conforme as regras de negocio.
