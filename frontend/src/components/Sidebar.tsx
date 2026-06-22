import type { ReactNode } from 'react'
import { Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NavItem = {
  key: string
  label: string
  icon: ReactNode
}

export type SidebarContentProps = {
  items: NavItem[]
  activeKey: string
  onNavigate: (key: string) => void
}

/**
 * Conteúdo interno da sidebar (logo + nav).
 * Renderizado tanto na sidebar fixa (desktop) quanto no Sheet (mobile).
 * Não inclui dados do usuário — apenas navegação principal.
 */
export function SidebarContent({ items, activeKey, onNavigate }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Logo / brand mark — h-14 alinhado com a Topbar */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          aria-hidden
        >
          <Leaf size={16} />
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Autoriza Poda
        </span>
      </div>

      {/* Navegação principal */}
      <nav aria-label="Navegação principal" className="flex-1 space-y-0.5 p-3">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onNavigate(item.key)}
            className={cn(
              'flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors',
              activeKey === item.key
                ? 'bg-primary-muted text-primary'
                : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
            )}
          >
            {/* Ícone 16 × 16 conforme ui-ux.md */}
            <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
