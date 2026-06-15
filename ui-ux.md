# UI/UX do Sistema Autoriza Poda

Este documento define as regras visuais e de experiencia do usuario para o frontend do sistema Autoriza Poda. Toda tela nova ou alteracao de interface deve seguir estes padroes.

## Objetivo da Interface

A interface deve transmitir confianca, clareza e organizacao para um processo administrativo municipal. O sistema deve parecer uma ferramenta de trabalho, nao uma pagina promocional.

Prioridades:

- Facilitar o cadastro e acompanhamento de solicitacoes.
- Reduzir duvidas sobre status, responsavel e proximo passo.
- Dar agilidade ao administrador e ao fiscal.
- Evitar excesso visual que prejudique leitura e operacao.
- Manter consistencia entre todas as telas.

## Padrao Visual Geral

- Visual limpo, institucional e funcional.
- Composicao baseada em paineis, listas, formularios e areas de detalhe.
- Evitar visual de landing page, secoes promocionais ou hero grande.
- Priorizar densidade moderada de informacao, com boa separacao entre blocos.
- Usar cantos com raio pequeno, preferencialmente entre `6px` e `8px`.
- Usar sombras discretas apenas quando ajudarem hierarquia.
- Evitar decoracoes sem funcao, como blobs, orbes, gradientes fortes ou fundos ilustrativos.

## Identidade Visual

Tema principal:

- Servico publico municipal.
- Meio ambiente urbano.
- Processo administrativo de vistoria e autorizacao.

Elementos recomendados:

- Icones simples relacionados a folhas, documentos, usuarios, lista, envio, upload e confirmacao.
- Linguagem objetiva e institucional.
- Nomes de acoes claros: `Cadastrar`, `Salvar`, `Encaminhar`, `Registrar vistoria`, `Aprovar`, `Reprovar`, `Cancelar`.

## Cores

### Paleta Principal

- Verde institucional: `#166534`
- Verde escuro para textos e destaques: `#14532d`
- Verde claro para superficies suaves: `#dcfce7`
- Fundo geral: `#f6f8f5`
- Superficie principal: `#ffffff`
- Borda neutra: `#d8e1d5`
- Texto principal: `#17231d`
- Texto secundario: `#647169`

### Cores de Apoio

- Azul informativo: `#1d4ed8`
- Amarelo de andamento: `#92400e`
- Vermelho de erro/reprovacao: `#991b1b`
- Cinza de estado neutro/cancelado: `#374151`

### Uso das Cores

- Verde deve indicar identidade, acoes primarias e estados positivos.
- Azul deve indicar estado inicial ou informativo.
- Amarelo deve indicar andamento, analise ou vistoria pendente.
- Vermelho deve indicar erro, reprovar, bloquear ou acao destrutiva.
- Cinza deve indicar estado neutro, cancelado ou inativo.
- Nao usar muitas variacoes de uma mesma cor em uma tela.
- Nao usar contraste baixo entre texto e fundo.

## Tipografia

- Fonte padrao: system UI (`Inter`, `Segoe UI`, `Roboto`, `Arial`, sans-serif).
- Tamanho base: `16px`.
- Texto comum: peso `400`.
- Rotulos e acoes: peso `700` ou `800`.
- Titulos de pagina: entre `24px` e `32px`.
- Titulos de secao: entre `17px` e `20px`.
- Textos auxiliares: entre `12px` e `14px`.
- Nao usar letter-spacing negativo.
- Nao escalar fonte com largura da viewport.

## Espacamentos

Tokens recomendados:

- `4px`: ajuste fino.
- `8px`: distancia entre itens pequenos.
- `12px`: padding interno compacto.
- `16px`: espacamento padrao entre campos e blocos.
- `24px`: separacao entre secoes.
- `28px` ou `32px`: padding de tela em desktop.

Regras:

- Formularios devem ter espacamento suficiente entre campos.
- Listas densas podem usar `8px` a `12px`.
- Paineis principais devem usar padding entre `20px` e `32px`.
- Evitar grandes vazios em telas operacionais.

## Layout Global

Estrutura recomendada para usuario autenticado:

- Header fixo ou persistente no topo.
- Menu ou abas de navegacao logo abaixo do header.
- Conteudo principal em area ampla.
- Layout de listagem com coluna lateral e painel de detalhe quando fizer sentido.

Regras:

- O conteudo principal deve ocupar a maior parte da viewport.
- Elementos de navegacao devem ser previsiveis e consistentes.
- Evitar cards aninhados dentro de cards.
- Secoes de pagina devem ser bandas ou paineis simples, nao composicoes decorativas.

## Header

O header deve conter:

- Nome do sistema: `Autoriza Poda`.
- Identificacao do perfil ou area atual.
- Nome do usuario autenticado.
- Acao de sair.

Padroes:

- Altura entre `64px` e `76px`.
- Fundo branco.
- Borda inferior discreta.
- Logo ou icone pequeno a esquerda.
- Botao de sair como icone com tooltip ou titulo acessivel.

## Menu

O menu pode ser em abas horizontais ou navegacao lateral, conforme complexidade.

Itens esperados:

- Solicitacoes.
- Nova solicitacao, para solicitante.
- Usuarios, para administrador.
- Perfil, quando implementado.

Regras:

- Mostrar apenas itens permitidos ao perfil.
- O item ativo deve ter destaque claro.
- O menu nao deve ser usado para burlar permissao; o backend deve validar tudo.
- Em mobile, permitir quebra de linha ou menu compacto sem sobrepor conteudo.

## Cards e Paineis

Uso recomendado:

- Resumos de solicitacao.
- Blocos de informacao em detalhes.
- Itens de listagem.
- Paineis de acao, como encaminhamento e vistoria.

Padroes:

- Raio: `6px` a `8px`.
- Borda: `1px solid #d8e1d5`.
- Fundo: `#ffffff`.
- Sombra: opcional e discreta.
- Padding: `12px` a `16px`.

Evitar:

- Cards dentro de cards.
- Cards com excesso de sombra.
- Cards meramente decorativos.

## Botoes

### Primario

Uso:

- Entrar.
- Cadastrar.
- Salvar.
- Encaminhar.
- Registrar vistoria.

Estilo:

- Fundo verde `#166534`.
- Texto branco.
- Borda verde.
- Altura minima `40px`.
- Icone opcional a esquerda.

### Secundario

Uso:

- Atualizar.
- Voltar.
- Filtrar.
- Acoes auxiliares.

Estilo:

- Fundo branco.
- Borda neutra.
- Texto verde escuro ou texto principal.

### Perigoso

Uso:

- Reprovar.
- Cancelar.
- Inativar usuario.

Estilo:

- Fundo vermelho ou borda vermelha conforme gravidade.
- Texto claro quando fundo vermelho.

Regras:

- Botao deve ter texto claro de acao.
- Usar icones da biblioteca adotada quando fizer sentido.
- Estados `hover`, `focus`, `disabled` e `loading` devem ser visiveis.
- Nao usar apenas cor para indicar significado.

## Formularios

Padroes:

- Labels sempre visiveis em campos importantes.
- Campos obrigatorios devem ser indicados por texto ou padrao visual claro.
- Inputs com altura minima `40px`.
- Textareas redimensionaveis verticalmente.
- Mensagens de erro proximas ao campo quando possivel.
- Agrupar campos relacionados.
- Usar `select` para opcoes fechadas, como perfil, status ou resultado.
- Usar upload com area clara para anexos.

Regras:

- Validar no frontend para ajudar o usuario.
- Validar no backend como fonte de verdade.
- Nao limpar formulario apos erro.
- Apos sucesso, informar resultado e atualizar listagens.

## Tabelas e Listagens

Uso:

- Listagem de solicitacoes.
- Listagem de usuarios.
- Historico de eventos.

Padroes:

- Cabecalho claro em tabelas.
- Linhas com separacao por borda suave.
- Status visivel em badge.
- Data formatada em padrao brasileiro.
- Texto longo deve quebrar sem estourar layout.
- Acoes por linha devem ficar no final.

Listas de solicitacao:

- Exibir numero da solicitacao.
- Exibir status.
- Exibir endereco.
- Exibir solicitante, quando o perfil puder ver.
- Exibir data de abertura.

## Badges de Status

Padroes por status:

- `ABERTA`: azul claro, texto azul.
- `EM_ANALISE`: amarelo claro, texto marrom/amarelo escuro.
- `ENCAMINHADA_FISCAL`: amarelo claro, texto marrom/amarelo escuro.
- `EM_VISTORIA`: amarelo claro, texto marrom/amarelo escuro.
- `APROVADA`: verde claro, texto verde.
- `REPROVADA`: vermelho claro, texto vermelho.
- `CANCELADA`: cinza claro, texto cinza.

Regras:

- Badge deve ter texto, nao apenas cor.
- Usar nomes amigaveis: `Aberta`, `Em analise`, `Encaminhada`, `Em vistoria`, `Aprovada`, `Reprovada`, `Cancelada`.
- Manter tamanho compacto e legivel.

## Modais

Usar modais para:

- Confirmar acoes importantes.
- Editar informacao curta sem sair da tela.
- Exibir detalhes complementares.

Regras:

- Modal deve ter titulo claro.
- Deve possuir botao de fechar.
- Deve fechar com `Esc`.
- Foco deve ficar preso dentro do modal enquanto aberto.
- Acao primaria deve ficar clara.
- Acao destrutiva deve exigir confirmacao.
- Evitar modais grandes para formularios complexos; nesses casos, usar pagina ou painel dedicado.

## Mensagens

### Sucesso

- Fundo verde claro.
- Texto verde escuro.
- Mensagem objetiva: `Solicitacao cadastrada.`, `Usuario atualizado.`

### Erro

- Fundo vermelho claro.
- Texto vermelho escuro.
- Mensagem deve explicar o problema sem termos tecnicos desnecessarios.

### Alerta

- Fundo amarelo claro.
- Texto amarelo escuro.
- Usar para pendencias, campos incompletos ou atencao operacional.

Regras:

- Mensagens devem aparecer perto da acao realizada ou no topo da area principal.
- Nao deixar mensagens antigas confundindo o usuario.
- Erros de permissao devem informar que a acao nao esta autorizada.

## Responsividade

Breakpoints recomendados:

- Mobile: ate `640px`.
- Tablet: ate `980px`.
- Desktop: acima de `980px`.

Regras:

- Em mobile, layout de duas colunas deve virar uma coluna.
- Listas podem aparecer antes do detalhe.
- Botoes devem ter area de toque confortavel.
- Tabelas devem virar lista, grid de linhas ou permitir rolagem controlada.
- Texto nao deve sobrepor botoes ou outros elementos.
- Inputs devem ocupar a largura disponivel.
- Menu deve quebrar linha ou virar navegacao compacta.

## Acessibilidade Basica

- Toda imagem informativa deve ter `alt`.
- Icones decorativos devem usar `aria-hidden`.
- Botoes somente com icone devem ter `title` ou `aria-label`.
- Formularios devem usar `label` associado ao campo.
- Contraste deve ser suficiente para leitura.
- Foco de teclado deve ser visivel.
- Nao depender apenas de cor para transmitir status.
- Modais devem gerenciar foco.
- Mensagens de erro devem ser perceptiveis por leitores de tela quando possivel.

## Tela de Login

Padroes:

- Tela simples e centralizada.
- Nome do sistema visivel.
- Campos: email e senha.
- Link para cadastro de solicitante.
- Link para recuperacao de senha.
- Nao permitir escolha manual de perfil.
- Botao principal: `Entrar`.
- Mensagem clara para credenciais invalidas.

Evitar:

- Lista de perfis no login.
- Login por botoes de perfil em producao.
- Conteudo promocional excessivo.

## Dashboard do Solicitante

Deve priorizar:

- Criar nova solicitacao.
- Ver solicitacoes proprias.
- Acompanhar status.
- Acessar detalhes, historico e anexos.
- Editar dados pessoais.

Layout recomendado:

- Lista de solicitacoes proprias.
- Filtro por status.
- Botao `Nova solicitacao`.
- Painel de detalhes ao selecionar uma solicitacao.

## Dashboard do Fiscal

Deve priorizar:

- Solicitacoes encaminhadas para o fiscal logado.
- Status de vistoria.
- Acesso rapido para registrar parecer tecnico.
- Resultado tecnico: aprovar ou reprovar.

Layout recomendado:

- Lista de solicitacoes atribuidas.
- Destaque para pendencias.
- Painel de detalhe com endereco, motivo, anexos e historico.
- Area de vistoria objetiva, com parecer e resultado.

## Dashboard do Administrador

Deve priorizar:

- Visao completa das solicitacoes.
- Filtros por status, fiscal e solicitante.
- Encaminhamento para fiscal.
- Gerenciamento de usuarios.
- Acompanhamento do historico completo.

Layout recomendado:

- Lista geral com filtros.
- Painel de detalhe.
- Area de encaminhamento.
- Aba ou tela de usuarios.
- Indicadores simples de quantidade por status, quando util.

## Cadastro, Edicao e Detalhe de Solicitacao

Cadastro:

- Campos de endereco agrupados.
- Campo de motivo em destaque.
- Observacao como texto livre.
- Upload de anexos.
- Botao principal `Cadastrar`.

Edicao:

- Mostrar status atual.
- Indicar quando a edicao estiver bloqueada pelo status.
- Preservar dados preenchidos ao ocorrer erro.
- Registrar historico quando houver alteracao relevante.

Detalhe:

- Mostrar status no topo.
- Mostrar numero da solicitacao.
- Mostrar solicitante, fiscal, endereco, motivo e observacoes.
- Mostrar anexos.
- Mostrar historico em ordem cronologica.
- Mostrar vistorias e pareceres quando existirem.

## Edicao de Usuario e Perfil

Perfil proprio:

- Campos: nome, email, telefone, CPF quando aplicavel.
- Troca de senha separada ou claramente identificada.
- Botao principal `Salvar`.

Gerenciamento pelo administrador:

- Listagem de usuarios com nome, email, perfil e status.
- Cadastro de usuario com perfil.
- Edicao de usuario com ativar/inativar.
- Evitar exclusao fisica; preferir inativacao.

## O Que Deve Ser Evitado

- Permitir escolha de perfil na tela de login.
- Colocar regra de negocio sensivel no frontend.
- Exibir dados que o perfil nao pode acessar.
- Usar cores sem texto para indicar status.
- Criar telas com visual de landing page.
- Usar grandes imagens decorativas no fluxo operacional.
- Usar gradientes fortes ou ornamentos que tirem foco do trabalho.
- Misturar muitos estilos de botao.
- Usar cards aninhados.
- Criar formularios sem labels.
- Criar tabelas que quebrem em mobile sem alternativa.
- Esconder erros genericos sem orientar o usuario.
- Usar termos tecnicos internos em mensagens para usuario final.
- Alterar padroes visuais sem atualizar este documento.

O sistema deve seguir padrões modernos de UI/UX inspirados em design systems consolidados de mercado, como Google Material Design, Microsoft Fluent Design, Apple Human Interface Guidelines, IBM Carbon Design System e Atlassian Design System.

Não copiar identidade visual, marca, cores ou componentes proprietários dessas empresas, mas adotar os princípios de qualidade utilizados por sistemas profissionais:

- consistência visual
- clareza de navegação
- hierarquia de informação
- acessibilidade
- responsividade
- componentes reutilizáveis
- feedback visual ao usuário
- estados de interação
- padronização de botões, cards, tabelas, formulários e badges
- experiência simples, objetiva e profissional