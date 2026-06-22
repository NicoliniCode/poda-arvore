import { KeyRound, LogOut, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AuthUser } from '@/types/domain'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

export type UserMenuProps = {
  user: AuthUser
  onLogout: () => void
  onNavigateProfile: () => void
  onNavigateSecurity: () => void
}

export function UserMenu({
  user,
  onLogout,
  onNavigateProfile,
  onNavigateSecurity,
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Menu do usuário ${user.nome}`}
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="h-8 w-8 cursor-pointer transition-opacity hover:opacity-90">
            <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
              {getInitials(user.nome)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* Header: nome + email — não clicável */}
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium leading-none text-foreground">
            {user.nome}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onNavigateProfile} className="cursor-pointer gap-2">
          <User size={16} aria-hidden />
          Meu perfil
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onNavigateSecurity} className="cursor-pointer gap-2">
          <KeyRound size={16} aria-hidden />
          Segurança
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
        >
          <LogOut size={16} aria-hidden />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
