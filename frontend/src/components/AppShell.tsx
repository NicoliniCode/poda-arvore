import type { ReactNode } from 'react'
import { ClipboardList, RefreshCw, Users } from 'lucide-react'
import type { AuthUser } from '../types/domain'
import { AppLayout } from './AppLayout'
import type { NavItem } from './Sidebar'

export type AppViewKey = 'solicitacoes' | 'usuarios' | 'perfil' | 'seguranca'

const VIEW_TITLES: Record<AppViewKey, string> = {
  solicitacoes: 'Solicitações',
  usuarios: 'Usuários',
  perfil: 'Meu perfil',
  seguranca: 'Segurança',
}

type AppShellProps = {
  user: AuthUser
  activeView: AppViewKey
  canManageUsers: boolean
  loading: boolean
  children: ReactNode
  onNavigate: (view: AppViewKey) => void
  onRefresh: () => void
  onLogout: () => void
}

/**
 * Adaptador que mantém a interface existente do App.tsx e delega ao AppLayout.
 * Constrói os itens de navegação e o botão Atualizar da topbar.
 */
export function AppShell({
  user,
  activeView,
  canManageUsers,
  loading,
  children,
  onNavigate,
  onRefresh,
  onLogout,
}: AppShellProps) {
  const navItems: NavItem[] = [
    {
      key: 'solicitacoes',
      label: 'Solicitações',
      icon: <ClipboardList size={16} aria-hidden />,
    },
    ...(canManageUsers
      ? [
          {
            key: 'usuarios',
            label: 'Usuários',
            icon: <Users size={16} aria-hidden />,
          } satisfies NavItem,
        ]
      : []),
  ]

  const topbarActions = (
    <button
      type="button"
      onClick={onRefresh}
      disabled={loading}
      aria-label="Atualizar dados"
      title="Atualizar"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
    >
      <RefreshCw
        size={16}
        aria-hidden
        className={loading ? 'animate-spin' : ''}
      />
    </button>
  )

  return (
    <AppLayout
      user={user}
      navItems={navItems}
      activeKey={activeView}
      pageTitle={VIEW_TITLES[activeView]}
      topbarActions={topbarActions}
      onNavigate={(key) => onNavigate(key as AppViewKey)}
      onLogout={onLogout}
      onNavigateProfile={() => onNavigate('perfil')}
      onNavigateSecurity={() => onNavigate('seguranca')}
    >
      {children}
    </AppLayout>
  )
}
