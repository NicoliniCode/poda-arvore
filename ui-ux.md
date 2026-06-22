# UI/UX — Autoriza Poda

Documento de referência de design do sistema. **É a fonte única de verdade para a interface.** Em conflito entre este arquivo e um hábito antigo do código, **este arquivo vence**.

Referências de qualidade: **Linear, Vercel, shadcn/ui**. **O sistema é usado principalmente em dispositivos móveis** — o alvo é parecer um **app nativo**, não um site espremido. Tom: limpo, calmo, confiável. Identidade: neutros frios + verde institucional.

Stack de UI: **React + TypeScript + Tailwind CSS + shadcn/ui + lucide-react + sonner**, fonte **Inter**.

---

## 1. Princípios

1. **Mobile-first.** Desenhe primeiro para a tela pequena (~360–390px) e depois amplie. Toda tela tem de ser confortável no celular antes de ser no desktop.
2. **Sensação de app nativo.** Alvos de toque generosos, transições curtas, navegação por gestos/tap, nada de interação que dependa de mouse (hover).
3. **Clareza acima de decoração.** Cada elemento tem função.
4. **Densidade adequada ao contexto.** Compacto no desktop; no mobile, respiro e alvos maiores.
5. **Hierarquia por tipografia e cor, não por negrito espalhado.**
6. **Consistência.** Mesma intenção → mesmo componente, cor e texto.
7. **Sutileza.** Bordas finas, sombras leves, raios moderados, cores dessaturadas.
8. **Feedback imediato e efêmero** via toast — nunca bloco fixo na tela.

---

## 2. Mobile-first e sensação de app nativo

Esta seção é prioritária. Toda tela deve segui-la.

- **Breakpoints:** base = mobile. Use os prefixos do Tailwind (`sm:`, `md:`, `lg:`) para **adicionar** complexidade em telas maiores, nunca para "consertar" o mobile depois.
- **Alvos de toque:** mínimo **44×44px** em qualquer elemento tocável (botões, ícones de ação, linhas clicáveis). Espaçamento suficiente entre alvos para não errar o toque.
- **Tabelas viram cartões no mobile.** Tabela com muitas colunas (Solicitações, Usuários) **não** deve virar scroll horizontal no celular. Abaixo de `md`, cada registro vira um **cartão empilhado** com pares rótulo/valor e as ações acessíveis. Tabela tradicional só de `md` para cima.
- **Modais viram tela cheia / bottom sheet no mobile.** Abaixo de `sm`/`md`, os `Dialog` ocupam a tela inteira (ou sobem como bottom sheet), com header fixo (título + fechar) e conteúdo rolável. Modal centralizado estreito é só para desktop.
- **Navegação:** a sidebar fixa vira **drawer** (menu hambúrguer) ou **barra inferior de abas** no mobile. Top bar fixa com o essencial.
- **Áreas seguras:** respeitar notch/barra do sistema com `env(safe-area-inset-*)` (padding em top/bottom quando fixo).
- **Rolagem:** vertical com momentum; **nunca** provocar scroll horizontal na página. Conteúdo se ajusta à largura.
- **Sem hover-only:** toda ação tem de ser alcançável por toque. Nada de revelar botão só no hover.
- **Inputs no mobile:** fonte **≥16px** para o iOS não dar zoom; usar `type`/`inputmode` certos (`email`, `tel`, numérico) para abrir o teclado adequado; campos e botões largos (full-width quando fizer sentido).
- **Botões primários no mobile:** tendem a ocupar a largura toda (full-width) e ficar ao alcance do polegar.
- **Toasts (sonner):** posicionados no topo dentro da área segura; não cobrir ações.
- **Transições curtas** (~150–200ms), sem animação chamativa; respeitar `prefers-reduced-motion`.

---

## 3. Anti-padrões — NUNCA fazer

- ❌ **Tabela com scroll horizontal como única saída no mobile** → no celular vira cartão.
- ❌ **Modal centralizado apertado no mobile** → vira tela cheia / bottom sheet.
- ❌ **Alvo de toque pequeno** (ícone solto < 44px) ou botões colados.
- ❌ **Interação que só funciona no hover** (mouse).
- ❌ valor de input em negrito → sempre `font-normal`.
- ❌ mensagem de status fixa no layout → sempre toast (sonner).
- ❌ ícone cobrindo o placeholder do campo de busca.
- ❌ select com seta colada/desalinhada na borda.
- ❌ linha de tabela alta (desktop) → densidade compacta.
- ❌ tela inteira para edição simples → modal/sheet.
- ❌ títulos redundantes; dois botões/ícones com a mesma ação.
- ❌ sombras pesadas, bordas grossas, cores saturadas, hex solto no componente.

---

## 4. Design tokens

CSS variables do shadcn/ui (HSL), consumidas via Tailwind (`bg-primary`, `text-muted-foreground`, `border-border`). Não chumbar hex nos componentes.

```css
:root {
  --background:0 0% 100%; --foreground:222 22% 11%;
  --muted:210 20% 97%; --muted-foreground:215 16% 47%;
  --border:214 20% 90%; --input:214 20% 90%; --ring:142 60% 36%;
  --primary:142 71% 29%; --primary-foreground:0 0% 100%; --primary-soft:142 52% 94%;
  --success:142 71% 29%; --warning:35 92% 45%; --destructive:0 72% 45%; --info:214 80% 48%;
  --radius:0.5rem; /* 8px; cards/modais rounded-xl; badges rounded-full */
}
```
Sombra: cards `shadow-sm`, modais `shadow-lg`. Borda: 1px `border-border`.

---

## 5. Tipografia (Inter)

Base **14px** (`text-sm`) no desktop; **inputs ≥16px no mobile** (evita zoom do iOS). Pesos com restrição:

| Uso | Peso |
|---|---|
| Título de página/card | `font-semibold` (600) |
| Label de campo / texto de botão | `font-medium` (500) |
| **Valor de input, corpo, dados de tabela/cartão** | **`font-normal` (400)** |

Negrito só em título/label, nunca no conteúdo digitado ou em células.

---

## 6. Componentes

Prefira os do **shadcn/ui** já instalados.

- **Button:** variantes `primary` (verde sólido), `secondary`/`outline`, `ghost`, `destructive`. Altura `h-9` (desktop) / **alvo ≥44px no mobile**. Ícone lucide `h-4 w-4` com `gap-2`. Loading + disabled. `focus-visible:ring-2 ring-ring`. No mobile, ação principal costuma ser full-width. Botão só-ícone: quadrado com `aria-label`.
- **Input/Textarea:** `font-normal`, foco por anel (não borda grossa), erro `border-destructive` + `text-xs`. **Mobile: ≥16px, `inputmode`/`type` adequados.** Busca: ícone `absolute left-3` + `pl-9`/`pl-10`.
- **Upload de imagem (mobile):** oferecer **câmera** e **galeria**. Câmera: `<input type="file" accept="image/*" capture="environment">`. Galeria: `<input type="file" accept="image/*">` (sem `capture`). Dar dois caminhos claros ao usuário (ex.: "Tirar foto" / "Escolher da galeria").
- **Select:** preferir `Select` do shadcn; seta centralizada com respiro (`pr-9`). Igual em todos os filtros.
- **Tabela → Cartões no mobile:** desktop = tabela compacta (`px-4 py-2.5`, header `text-xs uppercase text-muted-foreground` em `bg-muted/50`, `hover:bg-muted/40`, Ações à direita `ghost`). **Abaixo de `md`: cada registro vira um cartão** com rótulo/valor empilhados e ações em alvos grandes. Vazio = mensagem + ação; loading = skeleton.
- **Dialog/Sheet:** edições e visualizações em modal. **Desktop:** centralizado com `max-w` adequado (`sm:max-w-md` a `sm:max-w-2xl`), `rounded-xl`, `shadow-lg`. **Mobile:** tela cheia ou bottom sheet, header fixo (título + fechar), corpo rolável (`max-h`/`overflow-y-auto`), footer com ações ao alcance do polegar. **Ao salvar com sucesso: fechar + atualizar + toast.**
- **Toast (sonner):** `<Toaster richColors />` uma vez na raiz; topo dentro da área segura. Todo retorno de ação vira toast.
- **Badge de status (pílula soft):** Aberta=info · Em análise/Encaminhada=warning · Aprovada=success · Reprovada=destructive · Cancelada/Concluída=neutro/success · Ativo=success / Inativo=muted.
- **Card:** `bg-card border border-border rounded-xl shadow-sm p-6` (p-4 no mobile), sem título redundante.
- **Visualizador de anexo:** abrir o anexo **dentro de um modal** (imagem em `<img>`, PDF em `<iframe>`/`<object>`), com botão **Download** e tratamento de erro (arquivo inexistente → estado de erro no modal, não JSON cru). Mobile: modal em tela cheia.

---

## 7. Interação e escrita

- **Vocabulário consistente:** botão e toast com a mesma palavra ("Salvar" → "Alterações salvas").
- Voz ativa, sentence case. Erros dizem o que houve e como resolver, via toast.
- **Foco visível** e navegação por teclado nos modais (Esc fecha). No mobile, **tudo por toque**, sem depender de hover.
- Movimento discreto; respeitar `prefers-reduced-motion`.

---

## 8. Checklist por tela (antes de considerar pronta)

**Geral:** input sem negrito · status em toast · busca sem ícone sobre o placeholder · selects padronizados · edição/visualização em modal com fechamento+toast · sem título redundante · cada ação com função única · cores por token · foco visível.

**Mobile (obrigatório):** confortável a ~375px sem scroll horizontal · alvos de toque ≥44px · tabela vira cartão · modal vira tela cheia/sheet · navegação por drawer/abas · inputs ≥16px com teclado certo · nada depende de hover · áreas seguras respeitadas.