import type { FormEvent, KeyboardEvent } from 'react'
import {
  Eye,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  UserX,
} from 'lucide-react'
import type { Perfil, PerfilNome, Usuario } from '../types/domain'
import { formatDate, formatPerfil } from '../utils/formatters'
import { Button, Field, IconButton, Input, Modal, SelectField } from './ui'

export type UsuarioPerfilFilter = 'TODOS' | PerfilNome
export type UsuarioStatusFilter = 'TODOS' | 'S' | 'N'

type UserDashboardProps = {
  usuarios: Usuario[]
  totalUsuarios: number
  perfis: Perfil[]
  loading: boolean
  search: string
  perfilFilter: UsuarioPerfilFilter
  statusFilter: UsuarioStatusFilter
  onSearchChange: (value: string) => void
  onPerfilFilterChange: (value: UsuarioPerfilFilter) => void
  onStatusFilterChange: (value: UsuarioStatusFilter) => void
  onCreateClick: () => void
  onEdit: (usuario: Usuario) => void
  onToggleStatus: (usuario: Usuario) => void
}

type CreateUserModalProps = {
  open: boolean
  perfis: Perfil[]
  loading: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

type EditUserModalProps = {
  usuario: Usuario | null
  perfis: Perfil[]
  loading: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onToggleStatus: (usuario: Usuario) => void
}

export function UsersDashboard({
  usuarios,
  totalUsuarios,
  perfis,
  loading,
  search,
  perfilFilter,
  statusFilter,
  onSearchChange,
  onPerfilFilterChange,
  onStatusFilterChange,
  onCreateClick,
  onEdit,
  onToggleStatus,
}: UserDashboardProps) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-4 rounded-lg border border-[#d8e1d5] bg-white p-3 shadow-[0_12px_32px_rgba(28,45,36,0.06)] sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#647169]">
              Administração
            </span>
            <h1 className="mt-1 text-2xl font-extrabold text-[#17231d]">Usuários</h1>
            <p className="mt-1 text-sm font-semibold text-[#647169]">
              Gerencie os acessos ao sistema.
            </p>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
            <span className="rounded-md border border-[#d8e1d5] bg-[#f6f8f5] px-3 py-2 text-center text-sm font-extrabold text-[#394c42]">
              {totalUsuarios} cadastrados
            </span>
            <Button
              type="button"
              variant="primary"
              icon={<Plus size={18} />}
              className="w-full sm:w-auto"
              onClick={onCreateClick}
            >
              Novo usuário
            </Button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_180px]">
          <label className="grid gap-1.5">
            <span className="text-xs font-extrabold uppercase text-[#647169]">Buscar</span>
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#647169]"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Nome ou e-mail"
                className="pl-9"
              />
            </div>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-extrabold uppercase text-[#647169]">Perfil</span>
            <select
              className="min-h-10 rounded-md border border-[#cbd7cf] bg-white px-2.5 py-2 text-[#17231d] outline-none transition focus:border-[#166534] focus:ring-3 focus:ring-blue-600/30"
              value={perfilFilter}
              onChange={(event) => onPerfilFilterChange(event.target.value as UsuarioPerfilFilter)}
            >
              <option value="TODOS">Todos</option>
              {perfis.map((perfil) => (
                <option key={perfil.id_perfil} value={perfil.nome}>
                  {formatPerfil(perfil.nome)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-extrabold uppercase text-[#647169]">Status</span>
            <select
              className="min-h-10 rounded-md border border-[#cbd7cf] bg-white px-2.5 py-2 text-[#17231d] outline-none transition focus:border-[#166534] focus:ring-3 focus:ring-blue-600/30"
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value as UsuarioStatusFilter)}
            >
              <option value="TODOS">Todos</option>
              <option value="S">Ativos</option>
              <option value="N">Inativos</option>
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#d8e1d5] bg-white shadow-[0_12px_32px_rgba(28,45,36,0.06)]">
        <div className="hidden grid-cols-[1.2fr_1.35fr_0.8fr_0.7fr_0.9fr_120px] gap-3 border-b border-[#d8e1d5] bg-[#f6f8f5] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.06em] text-[#647169] lg:grid">
          <span>Nome</span>
          <span>E-mail</span>
          <span>Perfil</span>
          <span>Status</span>
          <span>Último acesso</span>
          <span className="text-right">Ações</span>
        </div>

        <div className="divide-y divide-[#e3ebe1]">
          {usuarios.map((usuario) => (
            <UserRow
              key={usuario.id_usuario}
              usuario={usuario}
              loading={loading}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>

        {usuarios.length === 0 ? (
          <div className="grid place-items-center gap-2 px-4 py-12 text-center">
            <UserRound size={30} className="text-[#647169]" aria-hidden="true" />
            <strong className="text-[#17231d]">Nenhum usuário encontrado</strong>
            <span className="text-sm font-semibold text-[#647169]">
              Ajuste os filtros ou cadastre um novo acesso.
            </span>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function CreateUserModal({
  open,
  perfis,
  loading,
  onClose,
  onSubmit,
}: CreateUserModalProps) {
  return (
    <Modal
      open={open}
      title="Novo usuário"
      description="Cadastre um novo acesso ao sistema."
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <Field label="Nome" name="nome" required minLength={3} />
          <Field label="Email" name="email" type="email" required />
          <Field label="Senha" name="senha" type="password" required minLength={6} />
          <Field label="CPF" name="cpf" />
          <Field label="Telefone" name="telefone" />
          <SelectField label="Perfil" name="idPerfil" required defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            {perfis.map((perfil) => (
              <option key={perfil.id_perfil} value={perfil.id_perfil}>
                {formatPerfil(perfil.nome)}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="modal-footer inline-footer">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" icon={<Plus size={18} />} loading={loading}>
            Criar usuário
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function EditUserModal({
  usuario,
  perfis,
  loading,
  onClose,
  onSubmit,
  onToggleStatus,
}: EditUserModalProps) {
  return (
    <Modal
      open={Boolean(usuario)}
      title="Editar usuário"
      description="Atualize dados cadastrais, perfil e status de acesso."
      onClose={onClose}
    >
      {usuario ? (
        <form className="modal-form" onSubmit={onSubmit}>
          <div className="form-grid">
            <Field label="Nome" name="nome" defaultValue={usuario.nome} required />
            <Field label="Email" name="email" type="email" defaultValue={usuario.email} required />
            <Field label="CPF" name="cpf" defaultValue={usuario.cpf || ''} />
            <Field label="Telefone" name="telefone" defaultValue={usuario.telefone || ''} />
            <SelectField label="Perfil" name="idPerfil" defaultValue={usuario.id_perfil} required>
              {perfis.map((perfil) => (
                <option key={perfil.id_perfil} value={perfil.id_perfil}>
                  {formatPerfil(perfil.nome)}
                </option>
              ))}
            </SelectField>
            <SelectField label="Status" name="ativo" defaultValue={usuario.ativo} required>
              <option value="S">Ativo</option>
              <option value="N">Inativo</option>
            </SelectField>
          </div>
          <Field label="Nova senha" name="senha" type="password" helper="Deixe em branco para manter a senha atual." />
          <div className="modal-footer inline-footer">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant={usuario.ativo === 'S' ? 'danger' : 'secondary'}
              onClick={() => onToggleStatus(usuario)}
              disabled={loading}
            >
              {usuario.ativo === 'S' ? 'Inativar usuário' : 'Ativar usuário'}
            </Button>
            <Button type="submit" variant="primary" icon={<Pencil size={18} />} loading={loading}>
              Salvar alterações
            </Button>
          </div>
        </form>
      ) : null}
    </Modal>
  )
}

function UserRow({
  usuario,
  loading,
  onEdit,
  onToggleStatus,
}: {
  usuario: Usuario
  loading: boolean
  onEdit: (usuario: Usuario) => void
  onToggleStatus: (usuario: Usuario) => void
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onEdit(usuario)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className="grid cursor-pointer gap-3 px-3 py-4 transition hover:bg-[#f6f8f5] focus:bg-[#f6f8f5] focus:outline-none focus:ring-3 focus:ring-blue-600/20 sm:px-4 lg:grid-cols-[1.2fr_1.35fr_0.8fr_0.7fr_0.9fr_120px] lg:items-center"
      onClick={() => onEdit(usuario)}
      onKeyDown={handleKeyDown}
    >
      <div className="min-w-0">
        <small className="block text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#647169] lg:hidden">
          Nome
        </small>
        <strong className="block truncate text-sm text-[#17231d]">{usuario.nome}</strong>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#647169] lg:hidden">
          <ShieldCheck size={14} aria-hidden="true" />
          {formatPerfil(usuario.perfil)}
        </span>
      </div>
      <span className="grid min-w-0 gap-1">
        <small className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#647169] lg:hidden">
          E-mail
        </small>
        <span className="truncate text-sm font-semibold text-[#394c42]">{usuario.email}</span>
      </span>
      <span className="hidden text-sm font-bold text-[#394c42] lg:inline">{formatPerfil(usuario.perfil)}</span>
      <span className="grid gap-1">
        <small className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#647169] lg:hidden">
          Status
        </small>
        <span
          className={[
            'w-fit rounded-full border px-2.5 py-1 text-xs font-extrabold',
            usuario.ativo === 'S'
              ? 'border-[#bbd7c4] bg-[#eefbf2] text-[#166534]'
              : 'border-[#f1c7c7] bg-[#fef2f2] text-[#991b1b]',
          ].join(' ')}
        >
          {usuario.ativo === 'S' ? 'Ativo' : 'Inativo'}
        </span>
      </span>
      <span className="grid gap-1">
        <small className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#647169] lg:hidden">
          Último acesso
        </small>
        <span className="text-sm font-semibold text-[#647169]">{formatDate(usuario.ultimo_login)}</span>
      </span>
      <div className="flex justify-start gap-2 lg:justify-end" onClick={(event) => event.stopPropagation()}>
        <IconButton label="Visualizar usuário" icon={<Eye size={16} />} onClick={() => onEdit(usuario)} />
        <IconButton label="Editar usuário" icon={<Pencil size={16} />} onClick={() => onEdit(usuario)} />
        <IconButton
          label={usuario.ativo === 'S' ? 'Inativar usuário' : 'Ativar usuário'}
          icon={usuario.ativo === 'S' ? <UserX size={16} /> : <UserCheck size={16} />}
          tone={usuario.ativo === 'S' ? 'danger' : 'success'}
          disabled={loading}
          onClick={() => onToggleStatus(usuario)}
        />
      </div>
    </div>
  )
}
