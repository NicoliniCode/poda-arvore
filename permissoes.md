# Permissoes do Sistema

As permissoes devem ser controladas no backend com base no perfil do usuario autenticado e nas permissoes cadastradas no banco de dados.

O frontend pode ocultar botoes e telas, mas isso nao substitui a validacao no backend.

## Perfis

- `SOLICITANTE`
- `FISCAL`
- `ADMINISTRADOR`

A tela de login nao deve permitir selecao manual de perfil. O perfil deve vir do banco apos autenticacao.

## Permissoes Funcionais

Permissoes previstas no banco:

- `SOLICITACAO_CRIAR`
- `SOLICITACAO_VER_PROPRIA`
- `SOLICITACAO_VER_TODAS`
- `SOLICITACAO_ENCAMINHAR_FISCAL`
- `SOLICITACAO_VER_ENCAMINHADA`
- `VISTORIA_REGISTRAR`
- `SOLICITACAO_APROVAR_REPROVAR`
- `USUARIO_GERENCIAR`

Permissoes adicionais recomendadas para evolucao:

- `USUARIO_EDITAR_PROPRIO`
- `SOLICITACAO_EDITAR_PROPRIA`
- `SOLICITACAO_EDITAR_TODAS`
- `SOLICITACAO_ALTERAR_STATUS`
- `HISTORICO_VER_COMPLETO`
- `SENHA_RECUPERAR`

## Solicitante

Pode:

- Fazer login.
- Cadastrar solicitacao de poda.
- Consultar apenas suas proprias solicitacoes.
- Ver detalhes, anexos e historico das proprias solicitacoes.
- Editar seus dados pessoais.
- Editar solicitacao propria apenas quando o status permitir.
- Solicitar recuperacao de senha.

Nao pode:

- Ver solicitacoes de outros solicitantes.
- Ver solicitacoes encaminhadas para fiscais se nao forem suas.
- Encaminhar solicitacao.
- Registrar vistoria.
- Inserir parecer tecnico.
- Aprovar ou reprovar solicitacao.
- Gerenciar usuarios.
- Alterar status manualmente.

## Fiscal

Pode:

- Fazer login.
- Consultar apenas solicitacoes encaminhadas para ele.
- Ver detalhes, anexos e historico das solicitacoes sob sua responsabilidade.
- Registrar vistoria.
- Inserir parecer tecnico.
- Aprovar ou reprovar tecnicamente a solicitacao.
- Editar seus dados pessoais.
- Solicitar recuperacao de senha.

Nao pode:

- Ver solicitacoes de outros fiscais.
- Ver solicitacoes nao encaminhadas para ele.
- Gerenciar usuarios.
- Encaminhar solicitacao.
- Editar dados principais de solicitacao sem permissao administrativa.
- Alterar perfil de usuario.

## Administrador

Pode:

- Fazer login.
- Visualizar todas as solicitacoes.
- Ver detalhes, anexos e historico completo.
- Encaminhar solicitacoes para fiscais.
- Gerenciar usuarios.
- Alterar status conforme regra operacional.
- Ativar e inativar usuarios.
- Acompanhar auditoria do processo.
- Solicitar recuperacao de sua senha.
- Cadastrar um novo usuario.

Nao pode 
- Alterar perfil de usuario.

Deve:

- Registrar historico de alteracoes relevantes.
- Garantir que encaminhamentos sejam feitos para fiscais ativos.
- Usar alteracao manual de status apenas com justificativa.

## Matriz de Acesso

| Funcionalidade | Solicitante | Fiscal | Administrador |
| --- | --- | --- | --- |
| Login | Sim | Sim | Sim |
| Cadastro de solicitante | Sim | Nao |Sim |
| Recuperacao de senha | Sim | Sim | Sim |
| Editar proprio perfil | Sim | Sim | Sim |
| Gerenciar usuarios | Nao | Nao | Sim |
| Criar solicitacao | Sim | Nao | Opcional |
| Ver proprias solicitacoes | Sim | Se for responsavel | Sim |
| Ver todas as solicitacoes | Nao | Nao | Sim |
| Ver solicitacoes encaminhadas | Nao | Apenas as suas | Sim |
| Editar solicitacao | Quando permitido | Apenas vistoria/parecer | Sim |
| Encaminhar para fiscal | Nao | Nao | Sim |
| Registrar vistoria | Nao | Sim, se responsavel | Opcional |
| Aprovar/reprovar tecnicamente | Nao | Sim, se responsavel | Opcional |
| Alterar status | Nao | Apenas resultado tecnico | Sim |
| Ver historico completo | Das proprias | Das atribuidas | Sim |

## Regras de Implementacao

- Toda rota protegida deve exigir token valido.
- Toda rota sensivel deve verificar permissoes.
- O backend deve filtrar dados conforme perfil.
- O backend deve retornar `403` quando o usuario autenticado nao possuir permissao.
- O backend pode retornar `404` quando o recurso nao puder ser acessado pelo usuario, evitando expor existencia de dados restritos.
