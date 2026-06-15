import { useState, type ReactNode } from 'react'
import {
  ClipboardList,
  Home,
  KeyRound,
  Leaf,
  LogOut,
  RefreshCw,
  User,
  Users,
} from 'lucide-react'
import type { AuthUser } from '../types/domain'
import { Button } from './ui'

export type AppViewKey = 'solicitacoes' | 'usuarios' | 'perfil' | 'seguranca'

type NavigationItem = {
  key: AppViewKey
  label: string
  icon: ReactNode
  visible: boolean
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
  const items: NavigationItem[] = [
    {
      key: 'solicitacoes',
      label: 'Solicitações',
      icon: <ClipboardList size={18} aria-hidden="true" />,
      visible: true,
    },
    {
      key: 'usuarios',
      label: 'Usuários',
      icon: <Users size={18} aria-hidden="true" />,
      visible: canManageUsers,
    },
  ]

  return (
    <main className="min-h-screen bg-[#f6f8f5] text-[#17231d]">
      <div className="grid min-h-screen lg:grid-cols-[264px_minmax(0,1fr)]">
        <Sidebar
          items={items}
          activeView={activeView}
          onNavigate={onNavigate}
        />
        <div className="flex min-w-0 flex-col">
          <Topbar
            user={user}
            loading={loading}
            onRefresh={onRefresh}
            onNavigate={onNavigate}
            onLogout={onLogout}
          />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </main>
  )
}

function Sidebar({
  items,
  activeView,
  onNavigate,
}: {
  items: NavigationItem[]
  activeView: AppViewKey
  onNavigate: (view: AppViewKey) => void
}) {
  const profileItems: NavigationItem[] = [
    {
      key: 'perfil',
      label: 'Meu perfil',
      icon: <User size={18} aria-hidden="true" />,
      visible: true,
    },
    {
      key: 'seguranca',
      label: 'Segurança',
      icon: <KeyRound size={18} aria-hidden="true" />,
      visible: true,
    },
  ]

  return (
    <aside className="border-b border-[#d8e1d5] bg-white lg:border-b-0 lg:border-r">
      <div className="flex min-h-[72px] items-center gap-3 border-b border-[#d8e1d5] px-5">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#dcfce7] text-[#14532d]">
          <Leaf size={22} aria-hidden="true" />
        </span>
        <div>
          <strong className="block text-[18px] leading-tight text-[#102117]">Autoriza Poda</strong>
          <span className="block text-[13px] font-semibold text-[#647169]">Sistema municipal</span>
        </div>
      </div>

      <nav className="grid gap-4 p-3" aria-label="Navegação principal">
        <NavigationGroup title="Painel">
          <NavButton
            item={{
              key: 'solicitacoes',
              label: 'Voltar ao painel',
              icon: <Home size={18} aria-hidden="true" />,
              visible: true,
            }}
            active={activeView === 'solicitacoes'}
            onNavigate={onNavigate}
          />
          {items
            .filter((item) => item.visible && item.key !== 'solicitacoes')
            .map((item) => (
              <NavButton
                key={item.key}
                item={item}
                active={item.key === activeView}
                onNavigate={onNavigate}
              />
            ))}
        </NavigationGroup>

        <NavigationGroup title="Perfil">
          {profileItems.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={item.key === activeView}
              onNavigate={onNavigate}
            />
          ))}
        </NavigationGroup>
      </nav>
    </aside>
  )
}

function NavigationGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <span className="px-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#647169]">
        {title}
      </span>
      <div className="flex gap-2 overflow-x-auto lg:grid lg:overflow-visible">{children}</div>
    </div>
  )
}

function NavButton({
  item,
  active,
  onNavigate,
}: {
  item: NavigationItem
  active: boolean
  onNavigate: (view: AppViewKey) => void
}) {
  return (
    <button
      type="button"
      className={[
        'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-extrabold transition focus:outline-none focus:ring-3 focus:ring-blue-600/30',
        active
          ? 'border-[#b9c8bb] bg-[#eef3ec] text-[#14532d]'
          : 'border-transparent bg-white text-[#394c42] hover:border-[#d8e1d5] hover:bg-[#f6f8f5]',
      ].join(' ')}
      onClick={() => onNavigate(item.key)}
    >
      {item.icon}
      {item.label}
    </button>
  )
}

function Topbar({
  user,
  loading,
  onRefresh,
  onNavigate,
  onLogout,
}: {
  user: AuthUser
  loading: boolean
  onRefresh: () => void
  onNavigate: (view: AppViewKey) => void
  onLogout: () => void
}) {
  return (
    <header className="flex min-h-[72px] items-center justify-between gap-4 border-b border-[#d8e1d5] bg-white px-5 py-3">
      <div className="min-w-0">
        <span className="block text-xs font-extrabold uppercase tracking-[0.08em] text-[#647169]">
          Painel operacional
        </span>
        <strong className="block truncate text-base text-[#17231d]">Autoriza Poda</strong>
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="secondary" icon={<RefreshCw size={18} />} onClick={onRefresh} loading={loading}>
          Atualizar
        </Button>
        <UserMenuDropdown user={user} onNavigate={onNavigate} onLogout={onLogout} />
      </div>
    </header>
  )
}

function UserMenuDropdown({
  user,
  onNavigate,
  onLogout,
}: {
  user: AuthUser
  onNavigate: (view: AppViewKey) => void
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const goTo = (view: AppViewKey) => {
    onNavigate(view)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="flex min-h-10 items-center gap-2 rounded-md border border-[#cbd7cf] bg-white px-3 text-left text-sm font-extrabold text-[#17231d]"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="grid h-7 w-7 place-items-center rounded-md bg-[#dcfce7] text-[#14532d]">
          <User size={16} aria-hidden="true" />
        </span>
        <span className="hidden max-w-[180px] truncate sm:inline">{user.nome}</span>
      </button>
      {open ? (
        <div className="absolute right-0 z-10 mt-2 w-64 rounded-md border border-[#d8e1d5] bg-white p-3 shadow-[0_16px_36px_rgba(28,45,36,0.12)]">
          <div className="border-b border-[#e3ebe1] pb-3">
            <strong className="block truncate text-[#17231d]">{user.nome}</strong>
            <span className="block truncate text-sm text-[#647169]">{user.email}</span>
          </div>
          <div className="grid gap-1 border-b border-[#e3ebe1] py-2">
            <button
              type="button"
              className="flex min-h-9 items-center gap-2 rounded-md px-2 text-left text-sm font-bold text-[#394c42] hover:bg-[#f6f8f5]"
              onClick={() => goTo('perfil')}
            >
              <User size={16} aria-hidden="true" />
              Meu perfil
            </button>
            <button
              type="button"
              className="flex min-h-9 items-center gap-2 rounded-md px-2 text-left text-sm font-bold text-[#394c42] hover:bg-[#f6f8f5]"
              onClick={() => goTo('seguranca')}
            >
              <KeyRound size={16} aria-hidden="true" />
              Segurança
            </button>
          </div>
          <button
            type="button"
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-[#991b1b] bg-[#991b1b] px-3 text-sm font-extrabold text-white hover:brightness-95"
            onClick={onLogout}
          >
            <LogOut size={16} aria-hidden="true" />
            Sair
          </button>
        </div>
      ) : null}
    </div>
  )
}
