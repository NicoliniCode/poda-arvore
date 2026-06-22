# UI/UX — Autoriza Poda

Documento de referência de design do sistema. **É a fonte única de verdade para a interface.** Sempre que houver conflito entre este arquivo e um hábito antigo do código, **este arquivo vence**.

Referências de qualidade-alvo: **Linear, Vercel, shadcn/ui**. O produto é um sistema administrativo municipal (autorização de poda de árvores) — o tom é **limpo, calmo, confiável e denso na medida certa**, não chamativo. Identidade visual: neutros frios + verde institucional (a folha do logo).

Stack de UI: **React + TypeScript + Tailwind CSS + shadcn/ui + lucide-react + sonner**, fonte **Inter**.

---

## 1. Princípios

1. **Clareza acima de decoração.** Cada elemento tem uma função. Nada é adicionado só para "enfeitar".
2. **Densidade adequada.** Interface administrativa é densa: tabelas compactas, espaçamento contido, leitura rápida. Não desperdiçar altura vertical.
3. **Hierarquia por tipografia e cor, não por peso pesado.** Títulos em semibold, corpo em normal. Contraste vem de tamanho/cor, não de negrito espalhado.
4. **Consistência.** A mesma intenção usa sempre o mesmo componente, a mesma cor e o mesmo texto. Um botão "Salvar" sempre se parece e se comporta igual em todo o sistema.
5. **Sutileza.** Bordas finas (1px), sombras leves, cantos com raio moderado, cores dessaturadas. Sem sombras pesadas nem bordas grossas.
6. **Feedback imediato e efêmero.** Resultado de ação aparece em **toast**, nunca como bloco fixo ocupando a tela.

---

## 2. Anti-padrões — o que NUNCA fazer

Esta seção existe porque o sistema acumulou vícios visuais. **Evite explicitamente:**

- ❌ **Texto digitado em inputs com negrito.** Valor de input é sempre `font-normal` (400). Negrito em campo é erro.
- ❌ **Mensagens de status fixas no layout** (ex.: barra verde "Usuário atualizado." parada no topo). Substituir por **toast (sonner)**.
- ❌ **Ícone sobrepondo o placeholder** do campo de busca. O texto nunca passa por baixo do ícone.
- ❌ **Selects nativos sem padronização** — seta colada na borda, desalinhada. Padronizar todos.
- ❌ **Linhas de tabela muito altas.** Densidade compacta, não `py-6`.
- ❌ **Tela inteira para uma edição simples** (ex.: perfil). Usar **dialog/modal**.
- ❌ **Títulos redundantes** (ex.: "Meu perfil" repetido no eyebrow e no card).
- ❌ **Dois botões diferentes com a mesma ação.** Cada ícone/ação tem um comportamento único.
- ❌ Sombras fortes (`shadow-xl`+ em cards comuns), bordas grossas, raios exagerados, cores saturadas/berrantes.
- ❌ Várias fontes ou pesos aleatórios. Só Inter, só a escala definida abaixo.

---

## 3. Design tokens

Use a convenção de CSS variables do shadcn/ui (HSL) e consuma via Tailwind (`bg-primary`, `text-muted-foreground`, `border-border`, etc.). Ajuste os valores no `globals.css`/tema; **não** chumbe cores hex soltas nos componentes.

```css
:root {
  /* Neutros (cinza levemente frio) */
  --background: 0 0% 100%;
  --foreground: 222 22% 11%;        /* texto principal */
  --muted: 210 20% 97%;             /* fundos sutis / zebra */
  --muted-foreground: 215 16% 47%;  /* texto secundário, labels */
  --border: 214 20% 90%;            /* bordas hairline */
  --input: 214 20% 90%;
  --ring: 142 60% 36%;              /* anel de foco (verde) */

  /* Primária — verde institucional Autoriza Poda */
  --primary: 142 71% 29%;           /* ~#15803d botões primários */
  --primary-foreground: 0 0% 100%;
  --primary-soft: 142 52% 94%;      /* fundo do badge/logo verde claro */

  /* Superfícies */
  --card: 0 0% 100%;
  --card-foreground: 222 22% 11%;
  --popover: 0 0% 100%;

  /* Semânticas (dessaturadas, modernas) */
  --success: 142 71% 29%;
  --success-soft: 142 52% 94%;
  --warning: 35 92% 45%;
  --warning-soft: 40 96% 94%;
  --destructive: 0 72% 45%;
  --destructive-soft: 0 86% 97%;
  --info: 214 80% 48%;
  --info-soft: 214 95% 96%;

  --radius: 0.5rem; /* 8px base */
}
```

### Raio
- Base `--radius` = 8px. Inputs/botões: 8px. Cards/modais: 12px (`rounded-xl`). Badges: full (`rounded-full`).

### Sombra
- Cards: `shadow-sm` (sutil). Modais/popovers: `shadow-lg`. Nada além disso em uso comum.

### Espaçamento
- Escala Tailwind padrão (múltiplos de 4px). Padding interno de card: `p-6`. Gaps de formulário: `gap-4`. **Tabela é exceção** (densa, ver §5).

---

## 4. Tipografia

Fonte única: **Inter**. Texto base **14px** (`text-sm`) — padrão de app administrativo (Linear/Vercel). Pesos com restrição:

| Uso | Tamanho | Peso |
|---|---|---|
| Título de página / card | `text-xl`–`text-2xl` | `font-semibold` (600) |
| Subtítulo / descrição | `text-sm` | `font-normal` (400), `text-muted-foreground` |
| Eyebrow / label de seção | `text-xs` uppercase, `tracking-wide` | `font-medium` (500), `text-muted-foreground` |
| Label de campo | `text-sm` | `font-medium` (500) |
| **Valor de input / corpo** | `text-sm` | **`font-normal` (400)** |
| Texto de botão | `text-sm` | `font-medium` (500) |
| Dados de tabela | `text-sm` | `font-normal` (400) |

**Regra dura:** valores digitados, conteúdo de células e texto corrido são **sempre 400**. Negrito só em título/label, nunca no conteúdo.

---

## 5. Componentes

Prefira os componentes do **shadcn/ui** já instalados. Padronize cada um conforme abaixo.

### Botões (`Button`)
Variantes (intenção → estilo):
- **primary** — ação principal. Verde sólido (`bg-primary text-primary-foreground`), `hover` levemente mais escuro.
- **secondary / outline** — ação secundária (ex.: "Cancelar", "Voltar"). Fundo branco, borda `border-border`, texto `foreground`.
- **ghost** — ação terciária / ícones de tabela. Sem fundo, `hover:bg-muted`.
- **destructive** — excluir/desativar. `bg-destructive` ou outline vermelho.

Regras: altura `h-9` (padrão) / `h-8` (compacto em tabela). Ícone (lucide) à esquerda do texto com `gap-2`, tamanho `h-4 w-4`. Estado **loading** com spinner e `disabled`. Sempre `focus-visible:ring-2 ring-ring`. Botão de ícone puro: quadrado (`h-8 w-8`), `aria-label` obrigatório.

### Inputs (`Input`)
- Altura `h-9`, `px-3`, `text-sm`, **`font-normal`**, `rounded-md`, `border-input`.
- Foco: `focus-visible:ring-2 ring-ring ring-offset-0`, sem borda grossa.
- Erro (com zod): borda `border-destructive` + mensagem `text-xs text-destructive` abaixo.
- **Campo com ícone (busca):** ícone `absolute left-3` centralizado verticalmente (`h-4 w-4 text-muted-foreground`) e input com `pl-9`/`pl-10` para o placeholder **não** ficar sob o ícone.

### Select (`Select` do shadcn — preferir ao `<select>` nativo)
- Use o `Select` do shadcn para ter seta e padding consistentes. Se mantiver nativo, aplicar `appearance-none` + ícone `ChevronDown` (lucide) posicionado `right-3`, com `pr-9` no controle. Seta **centralizada e com respiro da borda**, igual em todos os filtros.

### Textarea
- Mesmo estilo do input, `min-h-[80px]`, `font-normal`, redimensionável vertical.

### Tabela (`Table` / TanStack Table)
- **Densidade compacta:** célula com `px-4 py-2.5` (linha ~44–48px). Nunca `py-5/py-6`.
- Cabeçalho: `text-xs uppercase tracking-wide text-muted-foreground font-medium`, fundo `bg-muted/50`, borda inferior.
- Linhas: borda inferior `border-border`, `hover:bg-muted/40`. Zebra é opcional e sutil.
- Coluna **Ações** alinhada à direita, botões `ghost` `h-8 w-8` com ícone, `gap-1`.
- Estado vazio: linha única centralizada com mensagem + ação (ver Empty state).

### Dialog / Modal (`Dialog`)
- Edições e formulários secundários (perfil, editar usuário/solicitação, selecionar fiscal) vão em **modal**, não em tela própria.
- Largura conforme conteúdo (`sm:max-w-md` a `sm:max-w-2xl`), `rounded-xl`, `shadow-lg`, header com título `font-semibold` + descrição curta `text-muted-foreground`, footer com ações à direita (primária à direita, "Cancelar" à esquerda dela).
- **Ao salvar com sucesso: fechar o modal, atualizar os dados e disparar toast.** Em erro, manter aberto e mostrar toast/erro de campo.

### Toast (`sonner`)
- `<Toaster />` montado **uma vez** na raiz, posição `top-right` (ou `bottom-right`), `richColors`.
- `toast.success` (verde), `toast.error` (vermelho), `toast.info`, `toast.warning`. Texto curto e direto.
- **Todo** retorno de ação (salvar, criar, encaminhar, excluir, atualizar) usa toast. Mensagens fixas no layout são proibidas (ver anti-padrões).

### Badge de status (`Badge`)
Pílula `rounded-full`, `text-xs`, `font-medium`, fundo *soft* + texto da cor semântica:

| Status | Cor |
|---|---|
| Aberta | info (azul) |
| Em análise | warning (âmbar) |
| Encaminhada | warning/info |
| Aprovada | success (verde) |
| Reprovada | destructive (vermelho) |
| Concluída | success/neutro |
| Ativo / Inativo (usuário) | success / muted |

### Card
- `bg-card`, `border border-border`, `rounded-xl`, `shadow-sm`, `p-6`. Eyebrow opcional (`text-xs uppercase`), título `font-semibold`, descrição `text-muted-foreground`. **Sem título redundante.**

### Estado vazio (Empty state)
- Ícone leve (lucide), frase curta dizendo o que fazer e, quando aplicável, um botão de ação. Vazio é convite à ação, não espaço morto.

### Loading
- Botões: spinner + `disabled`. Listas/tabelas: **skeleton** com a forma do conteúdo (não um spinner solto no meio da tela).

---

## 6. Interação e escrita

- **Vocabulário consistente:** o botão diz o que acontece e o toast confirma com a mesma palavra. "Salvar" → toast "Alterações salvas". "Encaminhar" → "Solicitação encaminhada".
- **Voz ativa, sentence case.** "Salvar alterações", não "Submeter dados".
- **Erros são direção, não desculpa.** Diga o que houve e como resolver, na voz do sistema. Mensagem de erro da API sempre via toast.
- **Foco visível** em todo elemento interativo (`focus-visible:ring-2 ring-ring`). Navegação por teclado funciona em modais (fechar com Esc, foco preso no dialog).
- **Movimento discreto:** transições curtas (`transition-colors`, ~150ms) em hover/focus. Respeitar `prefers-reduced-motion`. Sem animações chamativas.
- **Responsivo:** funciona até mobile; tabelas com scroll horizontal quando necessário.

---

## 7. Checklist de revisão (antes de considerar uma tela pronta)

- [ ] Valores de input em `font-normal` (sem negrito).
- [ ] Nenhuma mensagem de status fixa — tudo em toast.
- [ ] Campo de busca: ícone não cobre o placeholder.
- [ ] Selects padronizados (seta alinhada, com respiro).
- [ ] Tabela compacta (linha ~44–48px).
- [ ] Edição em modal, com fechamento + toast no sucesso.
- [ ] Sem títulos redundantes.
- [ ] Cada ação/ícone com função única.
- [ ] Cores via tokens (sem hex solto), sombras/bordas sutis.
- [ ] Foco visível e navegação por teclado nos modais.
