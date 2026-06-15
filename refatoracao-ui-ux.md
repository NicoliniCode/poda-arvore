# Correção obrigatória da refatoração UI/UX

A refatoração anterior não atendeu ao padrão visual solicitado.

O layout atual continua com aparência administrativa antiga, desalinhamentos visuais, excesso de informações repetidas e componentes fora do padrão moderno de dashboard.

Refazer a interface seguindo obrigatoriamente as regras abaixo.

---

## 1. Remover informações desnecessárias do menu lateral

O menu lateral não deve exibir card com nome, e-mail ou perfil do usuário.

Remover do menu lateral:

* Card com nome do usuário;
* Card com perfil;
* Informações duplicadas como `João Silva`, `Solicitante`, `Administrador`, etc.

O menu lateral deve conter apenas navegação.

Estrutura esperada:

* Logo do sistema;
* Dashboard ou Voltar ao painel;
* Solicitações;
* Usuários, somente para administrador;
* Perfil;

  * Meu perfil;
  * Segurança.

O usuário autenticado deve aparecer apenas no topo direito, dentro de um menu de usuário/dropdown.

---

## 2. Remover bloco “Perfil autenticado” do topo

Remover o bloco grande no topo escrito:

* `PERFIL AUTENTICADO`;
* `Solicitante`;
* `Administrador`.

Essa informação ocupa espaço sem necessidade e deixa a tela desalinhada.

O topo deve ser uma topbar limpa, contendo apenas:

* título/contexto da página, quando necessário;
* botão Atualizar, se necessário;
* menu do usuário no canto direito.

---

## 3. Tela de solicitações deve usar grid moderna

A tela principal de solicitações não deve usar cards laterais grandes como lista principal.

Criar uma grid/tabela moderna semelhante aos exemplos enviados.

A tela deve conter:

* título: `Solicitações`;
* subtítulo: `Acompanhe suas solicitações de poda`;
* cards pequenos de resumo no topo, se necessário:

  * Total;
  * Pendentes;
  * Em vistoria;
  * Concluídas;
* botão principal no topo direito: `Nova solicitação`;
* campo de busca;
* filtro por status;
* grid/tabela com as solicitações.

Colunas sugeridas da grid:

* Número;
* Endereço;
* Bairro;
* Status;
* Fiscal;
* Data;
* Ações.

A grid deve ter:

* visual limpo;
* cabeçalho destacado;
* linhas com hover;
* espaçamento confortável;
* badges de status;
* ações por ícones ou menu de três pontos;
* nada de botões grandes dentro das linhas.

---

## 4. Nova solicitação deve abrir em modal ou drawer

A tela não deve abrir um formulário grande fixo para `Nova solicitação`.

Ao clicar no botão `Nova solicitação`, abrir um modal central ou drawer lateral.

Preferência: usar drawer lateral em telas grandes e modal em telas menores.

O formulário deve conter:

* Endereço;
* Número;
* Bairro;
* Cidade;
* UF;
* Ponto de referência;
* Motivo;
* Observação;
* Anexos.

Botões do formulário:

* `Cancelar`;
* `Salvar`.

Não usar o texto `Cadastrar`.

Não exibir botão `Voltar` dentro do formulário, pois a navegação já existe no menu lateral.

---

## 5. Corrigir o campo de anexos

O campo de anexos está desalinhado e visualmente ruim.

Refazer o componente de upload.

O upload deve ser um componente padronizado com Tailwind, alinhado corretamente, com:

* borda tracejada;
* ícone de upload;
* texto claro;
* botão discreto para escolher arquivo;
* nome do arquivo selecionado em linha separada ou abaixo;
* altura e largura consistentes com os demais campos.

Não usar o input padrão bruto do navegador visível diretamente.

Implementação esperada:

* esconder o input nativo com `hidden`;
* usar uma label customizada;
* ao selecionar arquivo, mostrar o nome do arquivo;
* manter alinhamento com o grid do formulário.

Exemplo visual esperado:

`Anexos`
Área com borda tracejada:
`Clique para anexar arquivos ou arraste aqui`
`PNG, JPG ou PDF`

---

## 6. Tela de detalhe da solicitação

Ao clicar em uma solicitação na grid, abrir modal, drawer ou página de detalhe organizada.

A tela de detalhe deve ser limpa, com seções bem definidas:

* Dados da solicitação;
* Endereço;
* Motivo;
* Anexos;
* Histórico;
* Ações disponíveis.

Não usar layout dividido com lista lateral grande e detalhes ao lado, se isso deixar a tela poluída.

Se usar lista lateral, ela precisa seguir o padrão dos exemplos enviados, com estilo profissional e bom espaçamento.

---

## 7. Perfil e Segurança

A área de perfil deve ser simples e moderna.

Menu lateral:

* Meu perfil;
* Segurança.

Não exibir botão `Voltar ao painel` dentro do conteúdo da tela de perfil se já existir navegação no menu lateral.

A tela `Meu perfil` deve conter:

* card limpo com avatar;
* nome;
* e-mail;
* perfil como badge;
* campos editáveis;
* botão `Salvar`.

O botão deve se chamar apenas:

`Salvar`

Não usar:

`Salvar alterações`

A tela `Segurança` deve conter apenas:

* Senha atual;
* Nova senha;
* Confirmar nova senha;
* botão `Salvar`.

---

## 8. Botões

Padronizar todos os botões usando componente reutilizável `Button`.

Criar variantes:

* `primary`;
* `secondary`;
* `ghost`;
* `danger`;
* `icon`.

Os botões devem ter:

* altura consistente;
* borda arredondada;
* hover;
* focus ring;
* disabled;
* ícone opcional;
* texto curto.

Evitar botões grandes e pesados dentro de grids.

Na grid, usar preferencialmente:

* ícone de visualizar;
* ícone de editar;
* menu de três pontos.

---

## 9. Visual obrigatório baseado nos exemplos enviados

O sistema deve se aproximar visualmente dos dashboards enviados como referência.

Aplicar:

* sidebar mais moderna;
* item ativo bem destacado;
* grid/tabela com aparência profissional;
* cores mais equilibradas;
* menos bordas verdes em excesso;
* menos texto em negrito desnecessário;
* melhor espaçamento;
* melhor alinhamento;
* cards mais elegantes;
* tipografia mais leve;
* ações discretas.

O visual atual verde claro não deve continuar igual. Ele pode manter a identidade verde do sistema, mas deve ser aplicado com mais equilíbrio, como cor de destaque, não em excesso.

---

## 10. Componentes obrigatórios

Criar ou refatorar os seguintes componentes:

* `AppLayout`;
* `Sidebar`;
* `Topbar`;
* `UserMenu`;
* `Button`;
* `IconButton`;
* `Input`;
* `Textarea`;
* `Select`;
* `FileUpload`;
* `Modal`;
* `Drawer`;
* `DataTable`;
* `Badge`;
* `PageHeader`;
* `StatCard`;
* `ActionMenu`.

Esses componentes devem ser usados nas telas refatoradas.

Não manter componentes duplicados ou estilos manuais espalhados.

---

## 11. Regras técnicas

Usar TailwindCSS de forma real e consistente.

Remover CSS manual duplicado quando ele estiver apenas replicando algo que pode ser feito com Tailwind.

Não alterar:

* backend;
* banco de dados;
* autenticação;
* permissões;
* rotas da API;
* regras de negócio;
* Docker.

A alteração deve ser apenas no frontend.

---

## 12. Critérios de aceite

A refatoração só estará correta se:

* o menu lateral não tiver card com nome do usuário;
* o bloco `Perfil autenticado` tiver sido removido;
* `Nova solicitação` abrir em modal ou drawer;
* o formulário não tiver botão `Voltar`;
* o botão do formulário for `Salvar`;
* o campo de anexos estiver alinhado e customizado;
* solicitações aparecerem em grid/tabela moderna;
* ações da grid forem discretas;
* Perfil e Segurança estiverem separados;
* o visual estiver claramente mais próximo dos exemplos enviados;
* o Tailwind estiver sendo usado por componentes reutilizáveis.
