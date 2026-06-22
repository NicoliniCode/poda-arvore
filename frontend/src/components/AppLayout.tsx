import { useState, type ReactNode } from 'react'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import type { AuthUser } from '@/types/domain'
import { SidebarContent, type NavItem } from './Sidebar'
import { Topbar } from './Topbar'

export type AppLayoutProps = {
  user: AuthUser
  navItems: NavItem[]
  activeKey: string
  pageTitle: string
  topbarActions?: ReactNode
  children: ReactNode
  onNavigate: (key: string) => void
  onLogout: () => void
  onNavigateProfile: () => void
  onNavigateSecurity: () => void
}

/**
 * Layout raiz autenticado.
 *
 * Desktop (lg+):  sidebar fixa w-60 à esquerda + topbar no topo
 * Mobile  (<lg):  topbar com botão hambúrguer que abre Sheet lateral
 *
 * Segue exatamente o diagrama de ui-ux.md:
 *   +------------------+-------------------+
 *   | Sidebar (240px)  | Topbar (56px)     |
 *   |                  +-------------------+
 *   |                  | Conteúdo          |
 *   +------------------+-------------------+
 */
export function AppLayout({
  user,
  navItems,
  activeKey,
  pageTitle,
  topbarActions,
  children,
  onNavigate,
  onLogout,
  onNavigateProfile,
  onNavigateSecurity,
}: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavigate = (key: string) => {
    setMobileOpen(false)
    onNavigate(key)
  }

  const handleNavigateProfile = () => {
    setMobileOpen(false)
    onNavigateProfile()
  }

  const handleNavigateSecurity = () => {
    setMobileOpen(false)
    onNavigateSecurity()
  }

  return (
    <div className="flex min-h-screen bg-surface-muted">
      {/* ── Sidebar fixa — desktop (lg+) ── */}
      <aside className="hidden w-60 shrink-0 border-r border-border lg:flex lg:flex-col">
        <SidebarContent
          items={navItems}
          activeKey={activeKey}
          onNavigate={handleNavigate}
        />
      </aside>

      {/* ── Sidebar em Sheet — mobile (<lg) ── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          {/* Título acessível oculto visualmente (Radix exige) */}
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          <SidebarContent
            items={navItems}
            activeKey={activeKey}
            onNavigate={handleNavigate}
          />
        </SheetContent>
      </Sheet>

      {/* ── Coluna principal (topbar + conteúdo) ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={pageTitle}
          actions={topbarActions}
          user={user}
          onMobileMenuToggle={() => setMobileOpen(true)}
          onLogout={onLogout}
          onNavigateProfile={handleNavigateProfile}
          onNavigateSecurity={handleNavigateSecurity}
        />

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
