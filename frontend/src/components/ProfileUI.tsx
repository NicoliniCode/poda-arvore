import type { FormEvent } from 'react'
import { KeyRound, Save, ShieldCheck, User } from 'lucide-react'
import type { AuthUser } from '../types/domain'
import { formatPerfil } from '../utils/formatters'
import { Button, Field } from './ui'

type ProfileViewProps = {
  user: AuthUser
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

type SecurityViewProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function ProfileAccountView({ user, onSubmit }: ProfileViewProps) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-4 border-b border-[#e3ebe1] pb-4 sm:flex-row sm:items-center">
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#dcfce7] text-[#14532d]">
          <User size={28} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <strong className="block truncate text-lg text-[#17231d]">{user.nome}</strong>
          <span className="block truncate text-sm font-semibold text-[#647169]">{user.email}</span>
          <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full border border-[#bbd7c4] bg-[#eefbf2] px-2.5 py-1 text-xs font-semibold text-[#166534]">
            <ShieldCheck size={14} aria-hidden="true" />
            {formatPerfil(user.perfil)}
          </span>
        </div>
      </div>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome" name="nome" defaultValue={user.nome} required />
          <Field label="Email" name="email" type="email" defaultValue={user.email} required />
          <Field label="Telefone" name="telefone" />
          <Field label="CPF" name="cpf" />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={<Save size={18} />}>
            Salvar
          </Button>
        </div>
      </form>
    </div>
  )
}

export function SecurityView({ onSubmit }: SecurityViewProps) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3 border-b border-[#e3ebe1] pb-4">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#eef3ec] text-[#14532d]">
          <KeyRound size={24} aria-hidden="true" />
        </div>
        <div>
          <strong className="block text-[#17231d]">Alteração de senha</strong>
          <span className="text-sm font-semibold text-[#647169]">Use uma senha diferente da atual.</span>
        </div>
      </div>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <Field label="Senha atual" name="senhaAtual" type="password" autoComplete="current-password" />
        <Field label="Nova senha" name="novaSenha" type="password" autoComplete="new-password" />
        <Field label="Confirmar nova senha" name="confirmarSenha" type="password" autoComplete="new-password" />
        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={<KeyRound size={18} />}>
            Salvar
          </Button>
        </div>
      </form>
    </div>
  )
}
