import type { FormEvent } from 'react'
import { ArrowLeft, KeyRound, Save, ShieldCheck, User } from 'lucide-react'
import type { AuthUser } from '../types/domain'
import { formatPerfil } from '../utils/formatters'
import { Button, Card, Field } from './ui'

type ProfileViewProps = {
  user: AuthUser
  onBack: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

type SecurityViewProps = {
  onBack: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function ProfileAccountView({ user, onBack, onSubmit }: ProfileViewProps) {
  return (
    <section className="grid gap-4">
      <ProfilePageHeader
        eyebrow="Perfil"
        title="Meu perfil"
        description="Dados básicos da conta autenticada."
        onBack={onBack}
      />

      <Card className="max-w-3xl">
        <div className="flex flex-col gap-4 border-b border-[#e3ebe1] pb-4 sm:flex-row sm:items-center">
          <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#dcfce7] text-[#14532d]">
            <User size={28} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <strong className="block truncate text-lg text-[#17231d]">{user.nome}</strong>
            <span className="block truncate text-sm font-semibold text-[#647169]">{user.email}</span>
            <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full border border-[#bbd7c4] bg-[#eefbf2] px-2.5 py-1 text-xs font-extrabold text-[#166534]">
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
              Salvar alterações
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}

export function SecurityView({ onBack, onSubmit }: SecurityViewProps) {
  return (
    <section className="grid gap-4">
      <ProfilePageHeader
        eyebrow="Perfil"
        title="Segurança"
        description="Altere sua senha de acesso ao sistema."
        onBack={onBack}
      />

      <Card className="max-w-2xl">
        <div className="flex items-center gap-3 border-b border-[#e3ebe1] pb-4">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#eef3ec] text-[#14532d]">
            <KeyRound size={24} aria-hidden="true" />
          </div>
          <div>
            <strong className="block text-[#17231d]">Alteração de senha</strong>
            <span className="text-sm font-semibold text-[#647169]">
              Use uma senha diferente da atual.
            </span>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <Field label="Senha atual" name="senhaAtual" type="password" autoComplete="current-password" />
          <Field label="Nova senha" name="novaSenha" type="password" autoComplete="new-password" />
          <Field label="Confirmar nova senha" name="confirmarSenha" type="password" autoComplete="new-password" />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" icon={<KeyRound size={18} />}>
              Alterar senha
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}

function ProfilePageHeader({
  eyebrow,
  title,
  description,
  onBack,
}: {
  eyebrow: string
  title: string
  description: string
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#d8e1d5] bg-white p-4 shadow-[0_12px_32px_rgba(28,45,36,0.06)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#647169]">
          {eyebrow}
        </span>
        <h1 className="mt-1 text-2xl font-extrabold text-[#17231d]">{title}</h1>
        <p className="mt-1 text-sm font-semibold text-[#647169]">{description}</p>
      </div>
      <Button type="button" variant="secondary" icon={<ArrowLeft size={18} />} onClick={onBack}>
        Voltar ao painel
      </Button>
    </div>
  )
}
