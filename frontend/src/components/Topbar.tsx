import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import type { AuthUser } from '@/types/domain'
import { UserMenu } from './UserMenu'

export type TopbarProps = {
  title: string
  actions?: ReactNode
  user: AuthUser
  onMobileMenuToggle: () => void
  onLogout: () => void
  onNavigateProfile: () => void
  onNavigateSecurity: () => void
}

/**
 * Barra superior fixa.
 * - h-14 (56px), alinhada com o logo da Sidebar
 * - Título da página à esquerda, UserMenu à direita
 * - Botão hambúrguer visível apenas em mobile (<lg)
 */
export function Topbar({
  title,
  actions,
  user,
  onMobileMenuToggle,
  onLogout,
  onNavigateProfile,
  onNavigateSecurity,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-[env(safe-area-inset-top)]">
      {/* Hambúrguer — visível apenas em mobile */}
      <button
        type="button"
        onClick={onMobileMenuToggle}
        aria-label="Abrir menu de navegação"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
      >
        <Menu size={20} aria-hidden />
      </button>

      {/* Título da página */}
      <span className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </span>

      {/* Espaçador */}
      <div className="flex-1" />

      {/* Ações contextuais (ex.: botão Atualizar) */}
      {actions != null && (
        <div className="flex items-center gap-2">{actions}</div>
      )}

      {/* Menu do usuário */}
      <UserMenu
        user={user}
        onLogout={onLogout}
        onNavigateProfile={onNavigateProfile}
        onNavigateSecurity={onNavigateSecurity}
      />
    </header>
  )
}
