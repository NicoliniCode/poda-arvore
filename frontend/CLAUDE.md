# Instrucoes do Claude - Frontend


## Padrões de UI/UX
Para QUALQUER decisão de interface (layout, componentes, cores, tipografia,
espaçamento, estados, feedback), siga rigorosamente o arquivo `ui-ux.md`
(mesma pasta). Ele é a fonte única de verdade de UI. Em conflito com hábitos
antigos do código ou com versões anteriores, o `ui-ux.md` vence. Não reproduza
padrões visuais antigos.

## Stack Obrigatoria

| Categoria | Biblioteca | Observacao |
|---|---|---|
| Build | Vite | Ja configurado. |
| Linguagem | TypeScript estrito | `strict: true` em `tsconfig`. |
| Estilizacao | Tailwind CSS | Zero CSS solto. |
| Componentes | shadcn/ui | Instalar componente a componente via `npx shadcn@latest add ...` em `src/components/ui/`. |
| Primitivos | Radix UI | Vem com shadcn. |
| Icones | `lucide-react` | Stroke 1.5-2, tamanho 16-20 por padrao. |
| Fonte | Inter (`@fontsource-variable/inter`) | Com `font-feature-settings: "cv11"`. |
| Roteamento | `react-router-dom` v6+ | Rotas protegidas por perfil. |
| Estado de servidor | `@tanstack/react-query` | Cache, refetch, loading/error states. |
| Formularios | `react-hook-form` + `zod` + `@hookform/resolvers/zod` | Validacao no cliente. |
| HTTP | `axios` ou `fetch` com wrapper | Cliente unico em `src/api/cliente.ts`. |
| Tabelas | `@tanstack/react-table` v8 | Junto com `DataTable` do shadcn. |
| Datas | `date-fns` + locale `ptBR` | `format(date, "dd/MM/yyyy", { locale: ptBR })`. |
| Toasts | `sonner` (via shadcn) | Top-right. |
| Drawer | `vaul` (via shadcn) | Para Drawer lateral. |
| Utilidades | `clsx` + `tailwind-merge` | Helper `cn()` do shadcn. |


## Estrutura de Pastas

```
frontend/src/
  api/                 # cliente HTTP + funcoes por dominio
    cliente.ts         # instancia axios/fetch com interceptors
    auth.ts
    usuarios.ts
    solicitacoes.ts
  components/
    ui/                # componentes shadcn (button, input, dialog, ...)
    AppLayout.tsx
    Sidebar.tsx
    Topbar.tsx
    UserMenu.tsx
    DataTable.tsx
    PageHeader.tsx
    StatCard.tsx
    EmptyState.tsx
    FileUpload.tsx
  hooks/
    useAuth.ts
    usePermissao.ts
  pages/
    LoginPage.tsx
    SolicitacoesPage.tsx
    SolicitacaoDetalhePage.tsx
    UsuariosPage.tsx
    PerfilPage.tsx
  types/               # tipos compartilhados com backend
  lib/
    utils.ts           # helper cn()
    constants.ts       # rotas, status labels, etc.
  router.tsx
  App.tsx
  main.tsx
  index.css            # tokens CSS + tailwind base
```

## Responsabilidades

- Exibir telas e formularios.
- Consumir API REST do backend via `react-query`.
- Guardar token de sessao (sugestao: `localStorage` + interceptor que injeta no header).
- Exibir/ocultar elementos conforme permissoes **recebidas do backend** em `GET /api/auth/me`.
- Enviar anexos com `multipart/form-data`.

## O Que o Frontend NAO Faz

- Nao decide autorizacao — reflete o que o backend permite.
- Nao escolhe perfil no login. Perfil vem do `/api/auth/me`.
- Nao executa regra de negocio sensivel sem backend.
- Nao consulta o banco diretamente.
- Nao guarda senha em estado, log ou storage.

## Padroes de Codigo

- Componentes funcionais com hooks.
- Tipos das respostas da API em `src/types/`, espelhando o backend.
- Cliente HTTP unico em `src/api/cliente.ts`:
  - Base URL do `.env` (`VITE_API_URL`).
  - Interceptor injeta `Authorization: Bearer <token>`.
  - Interceptor de resposta trata `401` (logout) e `403` (toast de permissao).
- Funcoes de API por dominio (`src/api/solicitacoes.ts` etc.), tipadas, **nao** usar `fetch` direto em componente.
- Uso de `react-query`:
  - `useQuery` para listagens e detalhes.
  - `useMutation` para criar/editar/excluir, com `invalidateQueries` no `onSuccess`.
  - Toast no `onSuccess` e `onError` via `sonner`.
- Formularios:
  - Schema `zod` ao lado do componente.
  - `useForm` com `resolver: zodResolver(schema)`.
  - Componente `<Form>` do shadcn (`FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`).

## Setup Inicial (caso ainda nao exista)

Comandos a rodar uma vez para preparar o projeto:

```bash
# Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn (vai pedir respostas; aceitar defaults com TS)
npx shadcn@latest init

# Componentes base
npx shadcn@latest add button input label textarea select form
npx shadcn@latest add card badge avatar dropdown-menu
npx shadcn@latest add dialog drawer sheet alert-dialog
npx shadcn@latest add table skeleton sonner

# Demais libs
npm install lucide-react @tanstack/react-query @tanstack/react-table
npm install react-hook-form zod @hookform/resolvers
npm install axios date-fns
npm install @fontsource-variable/inter
npm install react-router-dom
```

Em `src/main.tsx`, importar a fonte:

```tsx
import "@fontsource-variable/inter";
```

Em `tailwind.config.js`, adicionar `Inter Variable` como `fontFamily.sans`.

## Permissoes na UI

Esconder/desabilitar botoes conforme permissoes do usuario, **assumindo que o backend tambem vai validar**.

Hook sugerido:
```tsx
// src/hooks/usePermissao.ts
import { useAuth } from "./useAuth";

export function usePermissao() {
  const { usuario } = useAuth();
  const tem = (codigo: string) => usuario?.permissoes?.includes(codigo) ?? false;
  return { tem };
}

// uso
const { tem } = usePermissao();
{tem("SOLICITACAO_ENCAMINHAR_FISCAL") && <Button>Encaminhar</Button>}
```

Permissoes relevantes (vindas do backend):

- `SOLICITACAO_CRIAR`
- `SOLICITACAO_VER_PROPRIA`
- `SOLICITACAO_VER_TODAS`
- `SOLICITACAO_VER_ENCAMINHADA`
- `SOLICITACAO_ENCAMINHAR_FISCAL`
- `VISTORIA_REGISTRAR`
- `SOLICITACAO_APROVAR_REPROVAR`
- `USUARIO_GERENCIAR`

## Roteamento

Wrapper de rota protegida:

```tsx
// src/components/RotaProtegida.tsx
function RotaProtegida({ permissao, children }: { permissao?: string; children: ReactNode }) {
  const { usuario, carregando } = useAuth();
  const { tem } = usePermissao();

  if (carregando) return <SkeletonPagina />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (permissao && !tem(permissao)) return <Navigate to="/sem-permissao" replace />;
  return <>{children}</>;
}
```

## Anexos

- `multipart/form-data` com `FormData`.
- Limites (tamanho, tipo) sincronizados com o backend — extrair para `src/lib/constants.ts`.
- Preview de imagem opcional; nao bloqueia envio.

## O Que Evitar

- `any` em respostas da API — sempre tipar.
- Logica de autorizacao "definitiva" no cliente.
- `fetch` solto em componente — usar `src/api/`.
- Inline styles, `style={{}}` — usar Tailwind.
- CSS custom em `.css` separado quando da pra fazer com Tailwind.
- Dependencia nova sem necessidade clara.
- Mudar contrato com o backend sem alinhar.

## Comandos

```bash
npm run dev      # servidor de desenvolvimento Vite
npm run build    # build de producao
npm run lint     # ESLint
npm run preview  # servir build local
```
