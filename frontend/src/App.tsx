import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import {
  Leaf,
  Mail,
  UserPlus,
} from 'lucide-react'
import { api, clearStoredToken, getStoredToken, setStoredToken } from './api/client'
import { AppShell, type AppViewKey } from './components/AppShell'
import { ProfileAccountView, SecurityView } from './components/ProfileUI'
import {
  CreateSolicitacaoModal,
  EditSolicitacaoModal,
  RequestsDashboard,
  SolicitacaoDetailModal,
  type SolicitacaoStatusFilter,
} from './components/SolicitacaoUI'
import {
  CreateUserModal,
  EditUserModal,
  UsersDashboard,
  type UsuarioPerfilFilter,
  type UsuarioStatusFilter,
} from './components/UserUI'
import {
  Button,
  Field,
  Modal,
} from './components/ui'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Toaster } from '@/components/ui/sonner'
import { dashboardLabel } from './utils/formatters'
import type {
  AuthUser,
  Perfil,
  Solicitacao,
  SolicitacaoDetails,
  StatusSolicitacao,
  Usuario,
} from './types/domain'
import './App.css'

type AuthMode = 'login' | 'register' | 'forgot'

type LoginResponse = {
  token: string
  user: AuthUser
}

type ConfirmAction = {
  title: string
  description: string
  label: string
  variant: 'primary' | 'danger'
  run: () => Promise<void>
}

const REMEMBER_EMAIL_KEY = 'poda_arvores_remembered_email'
const finalStatuses: StatusSolicitacao[] = ['APROVADA', 'REPROVADA', 'CANCELADA']

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const response = error.response?.data as { message?: string } | undefined
    return response?.message || 'Falha ao comunicar com a API.'
  }

  return 'Falha inesperada.'
}

function App() {
  const [booting, setBooting] = useState(true)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [rememberedEmail] = useState(() => localStorage.getItem(REMEMBER_EMAIL_KEY) || '')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [view, setView] = useState<AppViewKey>('solicitacoes')
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [details, setDetails] = useState<SolicitacaoDetails | null>(null)
  const [fiscais, setFiscais] = useState<Usuario[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [perfis, setPerfis] = useState<Perfil[]>([])
  const [statusFilter, setStatusFilter] = useState<SolicitacaoStatusFilter>('TODAS')
  const [solicitacaoSearch, setSolicitacaoSearch] = useState('')
  const [usuarioSearch, setUsuarioSearch] = useState('')
  const [usuarioPerfilFilter, setUsuarioPerfilFilter] = useState<UsuarioPerfilFilter>('TODOS')
  const [usuarioStatusFilter, setUsuarioStatusFilter] = useState<UsuarioStatusFilter>('TODOS')
  const [loading, setLoading] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [securityOpen, setSecurityOpen] = useState(false)
  const [editingSolicitacao, setEditingSolicitacao] = useState<Solicitacao | null>(null)
  const [creatingSolicitacao, setCreatingSolicitacao] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  const canCreateSolicitacao = user?.permissoes.includes('SOLICITACAO_CRIAR') ?? false
  const canManageUsers = user?.permissoes.includes('USUARIO_GERENCIAR') ?? false
  const canForwardToFiscal =
    user?.permissoes.includes('SOLICITACAO_ENCAMINHAR_FISCAL') ?? false
  const canRegisterVistoria =
    user?.permissoes.includes('VISTORIA_REGISTRAR') &&
    user.permissoes.includes('SOLICITACAO_APROVAR_REPROVAR')

  const filteredSolicitacoes = useMemo(() => {
    const search = solicitacaoSearch.trim().toLowerCase()

    return solicitacoes.filter((solicitacao) => {
      const matchesStatus = statusFilter === 'TODAS' || solicitacao.status === statusFilter
      const matchesSearch =
        !search ||
        String(solicitacao.id_solicitacao).includes(search) ||
        solicitacao.endereco.toLowerCase().includes(search) ||
        solicitacao.nome_solicitante.toLowerCase().includes(search)

      return matchesStatus && matchesSearch
    })
  }, [solicitacaoSearch, solicitacoes, statusFilter])

  const filteredUsuarios = useMemo(() => {
    const search = usuarioSearch.trim().toLowerCase()

    return usuarios.filter((usuario) => {
      const matchesSearch =
        !search ||
        usuario.nome.toLowerCase().includes(search) ||
        usuario.email.toLowerCase().includes(search)
      const matchesPerfil =
        usuarioPerfilFilter === 'TODOS' || usuario.perfil === usuarioPerfilFilter
      const matchesStatus =
        usuarioStatusFilter === 'TODOS' || usuario.ativo === usuarioStatusFilter

      return matchesSearch && matchesPerfil && matchesStatus
    })
  }, [usuarioPerfilFilter, usuarioSearch, usuarioStatusFilter, usuarios])

  const statusCounts = useMemo(() => {
    return solicitacoes.reduce<Record<StatusSolicitacao, number>>(
      (accumulator, solicitacao) => {
        accumulator[solicitacao.status] += 1
        return accumulator
      },
      {
        ABERTA: 0,
        EM_ANALISE: 0,
        ENCAMINHADA_FISCAL: 0,
        EM_VISTORIA: 0,
        APROVADA: 0,
        REPROVADA: 0,
        CANCELADA: 0,
      },
    )
  }, [solicitacoes])

  const selectedDetails =
    details?.solicitacao.id_solicitacao === selectedId ? details : null
  const selectedSolicitacao =
    selectedDetails?.solicitacao ??
    solicitacoes.find((solicitacao) => solicitacao.id_solicitacao === selectedId) ??
    null
  const isSelectedFinal = selectedSolicitacao
    ? finalStatuses.includes(selectedSolicitacao.status)
    : false

  const canEditSolicitacao = useCallback((solicitacao: Solicitacao): boolean => {
    if (finalStatuses.includes(solicitacao.status)) return false
    if (user?.perfil === 'ADMINISTRADOR') return true
    if (user?.perfil === 'SOLICITANTE') {
      return ['ABERTA', 'EM_ANALISE', 'ENCAMINHADA_FISCAL'].includes(solicitacao.status)
    }
    return false
  }, [user])

  const canEditSelected = Boolean(selectedSolicitacao) && canEditSolicitacao(selectedSolicitacao!)

  const loadMe = useCallback(async () => {
    const token = getStoredToken()

    if (!token) {
      setBooting(false)
      return
    }

    try {
      const { data } = await api.get<{ user: AuthUser }>('/api/auth/me')
      setUser(data.user)
    } catch {
      clearStoredToken()
      setUser(null)
    } finally {
      setBooting(false)
    }
  }, [])

  const loadSolicitacoes = useCallback(async () => {
    if (!user) {
      return
    }

    const { data } = await api.get<{ data: Solicitacao[] }>('/api/solicitacoes')
    setSolicitacoes(data.data)
    setSelectedId((currentId) => {
      if (currentId && data.data.some((solicitacao) => solicitacao.id_solicitacao === currentId)) {
        return currentId
      }

      return null
    })
  }, [user])

  const loadDetails = useCallback(async (idSolicitacao: number) => {
    const { data } = await api.get<SolicitacaoDetails>(`/api/solicitacoes/${idSolicitacao}`)
    setDetails(data)
  }, [])

  const loadAdminData = useCallback(async () => {
    if (!canManageUsers && !canForwardToFiscal) {
      return
    }

    const requests: Promise<void>[] = []

    if (canForwardToFiscal) {
      requests.push(
        api.get<{ data: Usuario[] }>('/api/usuarios/fiscais').then(({ data }) => {
          setFiscais(data.data)
        }),
      )
    }

    if (canManageUsers) {
      requests.push(
        api.get<{ data: Usuario[] }>('/api/usuarios').then(({ data }) => {
          setUsuarios(data.data)
        }),
      )
      requests.push(
        api.get<{ data: Perfil[] }>('/api/perfis').then(({ data }) => {
          setPerfis(data.data)
        }),
      )
    }

    await Promise.all(requests)
  }, [canForwardToFiscal, canManageUsers])

  const refreshAll = useCallback(async () => {
    if (!user) {
      return
    }

    setLoading(true)

    try {
      await Promise.all([loadSolicitacoes(), loadAdminData()])
    } catch (refreshError) {
      toast.error(getErrorMessage(refreshError))
    } finally {
      setLoading(false)
    }
  }, [loadAdminData, loadSolicitacoes, user])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMe()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadMe])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshAll()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [refreshAll])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!selectedId || !user) {
        setDetails(null)
        return
      }

      loadDetails(selectedId).catch((detailsError: unknown) => {
        setDetails(null)
        toast.error(getErrorMessage(detailsError))
      })
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadDetails, selectedId, user])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '')
    const lembrarEmail = formData.get('lembrarEmail') === 'on'

    try {
      const { data } = await api.post<LoginResponse>('/api/auth/login', {
        email,
        senha: String(formData.get('senha') || ''),
      })

      if (lembrarEmail) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email)
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY)
      }

      setStoredToken(data.token)
      setUser(data.user)
      setView('solicitacoes')
      toast.success(`Login realizado como ${data.user.nome}.`)
    } catch (loginError) {
      toast.error(getErrorMessage(loginError))
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSolicitante = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.warning('A tela de cadastro está pronta, mas o endpoint público de cadastro de solicitante ainda precisa ser implementado no backend.')
  }

  const handleForgotPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.warning('A tela de recuperação está pronta, mas os endpoints de recuperação de senha ainda precisam ser implementados no backend.')
  }

  const handleLogout = () => {
    clearStoredToken()
    setUser(null)
    setSolicitacoes([])
    setDetails(null)
    setSelectedId(null)
    setView('solicitacoes')
  }

  const handleCreateSolicitacao = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const { data } = await api.post<SolicitacaoDetails>('/api/solicitacoes', formData)
      toast.success('Solicitação salva.')
      form.reset()
      setCreatingSolicitacao(false)
      await loadSolicitacoes()
      setSelectedId(data.solicitacao.id_solicitacao)
      setDetails(data)
    } catch (createError) {
      toast.error(getErrorMessage(createError))
    } finally {
      setLoading(false)
    }
  }

  const handleEditSolicitacao = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingSolicitacao) {
      return
    }

    setLoading(true)

    const formData = new FormData(event.currentTarget)

    try {
      await api.put(`/api/solicitacoes/${editingSolicitacao.id_solicitacao}`, {
        endereco: String(formData.get('endereco') || ''),
        numero: String(formData.get('numero') || ''),
        bairro: String(formData.get('bairro') || ''),
        cidade: String(formData.get('cidade') || ''),
        uf: String(formData.get('uf') || ''),
        pontoReferencia: String(formData.get('pontoReferencia') || ''),
        motivo: String(formData.get('motivo') || ''),
        observacao: String(formData.get('observacao') || ''),
      })

      setEditingSolicitacao(null)
      await loadSolicitacoes()
      if (selectedId) {
        await loadDetails(selectedId)
      }
      toast.success('Solicitação atualizada.')
    } catch (editError) {
      toast.error(getErrorMessage(editError))
    } finally {
      setLoading(false)
    }
  }

  const handleForward = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedSolicitacao) {
      return
    }

    setLoading(true)

    const formData = new FormData(event.currentTarget)

    try {
      const { data } = await api.post<SolicitacaoDetails>(
        `/api/solicitacoes/${selectedSolicitacao.id_solicitacao}/encaminhar`,
        {
          idFiscal: String(formData.get('idFiscal') || ''),
          observacao: String(formData.get('observacao') || ''),
        },
      )

      setDetails(data)
      await loadSolicitacoes()
      toast.success('Solicitação encaminhada para o fiscal.')
    } catch (forwardError) {
      toast.error(getErrorMessage(forwardError))
    } finally {
      setLoading(false)
    }
  }

  const executeVistoria = async (
    idSolicitacao: number,
    payload: { parecerTecnico: string; resultado: string; observacao: string },
    form: HTMLFormElement,
  ) => {
    setLoading(true)

    try {
      const { data } = await api.post<SolicitacaoDetails>(
        `/api/solicitacoes/${idSolicitacao}/vistoria`,
        payload,
      )

      setDetails(data)
      form.reset()
      await loadSolicitacoes()
      toast.success('Vistoria registrada.')
    } catch (vistoriaError) {
      toast.error(getErrorMessage(vistoriaError))
    } finally {
      setLoading(false)
    }
  }

  const handleVistoria = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedSolicitacao) {
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const resultado = String(formData.get('resultado') || '')
    const payload = {
      parecerTecnico: String(formData.get('parecerTecnico') || ''),
      resultado,
      observacao: String(formData.get('observacao') || ''),
    }

    setConfirmAction({
      title: resultado === 'APROVADA' ? 'Confirmar aprovação' : 'Confirmar reprovação',
      description:
        resultado === 'APROVADA'
          ? 'A solicitação será aprovada tecnicamente e encerrada.'
          : 'A solicitação será reprovada tecnicamente e encerrada.',
      label: resultado === 'APROVADA' ? 'Aprovar' : 'Reprovar',
      variant: resultado === 'APROVADA' ? 'primary' : 'danger',
      run: () => executeVistoria(selectedSolicitacao.id_solicitacao, payload, form),
    })
  }

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      await api.post('/api/usuarios', {
        nome: String(formData.get('nome') || ''),
        email: String(formData.get('email') || ''),
        senha: String(formData.get('senha') || ''),
        idPerfil: String(formData.get('idPerfil') || ''),
        cpf: String(formData.get('cpf') || ''),
        telefone: String(formData.get('telefone') || ''),
      })

      form.reset()
      setCreatingUser(false)
      await loadAdminData()
      toast.success('Usuário cadastrado.')
    } catch (userError) {
      toast.error(getErrorMessage(userError))
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingUser) {
      return
    }

    setLoading(true)

    const formData = new FormData(event.currentTarget)

    try {
      await api.put(`/api/usuarios/${editingUser.id_usuario}`, {
        nome: String(formData.get('nome') || ''),
        email: String(formData.get('email') || ''),
        senha: String(formData.get('senha') || ''),
        idPerfil: String(formData.get('idPerfil') || ''),
        cpf: String(formData.get('cpf') || ''),
        telefone: String(formData.get('telefone') || ''),
        ativo: String(formData.get('ativo') || 'S'),
      })

      setEditingUser(null)
      await loadAdminData()
      toast.success('Usuário atualizado.')
    } catch (editError) {
      toast.error(getErrorMessage(editError))
    } finally {
      setLoading(false)
    }
  }

  const requestToggleUser = (usuario: Usuario) => {
    setConfirmAction({
      title: usuario.ativo === 'S' ? 'Inativar usuário' : 'Ativar usuário',
      description:
        usuario.ativo === 'S'
          ? `O usuário ${usuario.nome} não poderá acessar o sistema enquanto estiver inativo.`
          : `O usuário ${usuario.nome} voltará a acessar o sistema.`,
      label: usuario.ativo === 'S' ? 'Inativar' : 'Ativar',
      variant: usuario.ativo === 'S' ? 'danger' : 'primary',
      run: () => handleToggleUser(usuario),
    })
  }

  const handleToggleUser = async (usuario: Usuario) => {
    setLoading(true)

    try {
      await api.put(`/api/usuarios/${usuario.id_usuario}`, {
        nome: usuario.nome,
        email: usuario.email,
        senha: '',
        idPerfil: usuario.id_perfil,
        cpf: usuario.cpf || '',
        telefone: usuario.telefone || '',
        ativo: usuario.ativo === 'S' ? 'N' : 'S',
      })

      await loadAdminData()
      toast.success('Usuário atualizado.')
    } catch (toggleError) {
      toast.error(getErrorMessage(toggleError))
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.warning('A tela de perfil está pronta, mas o endpoint de edição do próprio perfil ainda precisa ser implementado no backend.')
  }

  const handlePasswordUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.warning('A tela de alteração de senha está pronta, mas o endpoint de senha ainda precisa ser implementado no backend.')
  }

  const confirmCurrentAction = async () => {
    if (!confirmAction) {
      return
    }

    const action = confirmAction
    setConfirmAction(null)
    await action.run()
  }

  if (booting) {
    return (
      <main className="boot-screen">
        <Leaf aria-hidden="true" />
        <span>Carregando sistema</span>
      </main>
    )
  }

  if (!user) {
    return (
      <>
      <Toaster richColors position="top-right" />
      <main className="login-shell">
        <section className="login-panel" aria-labelledby="auth-title">
          <div className="brand-mark brand-mark-large">
            <Leaf aria-hidden="true" />
            <div>
              <strong>Autoriza Poda</strong>
              <span>Gestão municipal de solicitações</span>
            </div>
          </div>

          <div className="auth-copy">
            <h1 id="auth-title">
              {authMode === 'login'
                ? 'Acesse sua conta'
                : authMode === 'register'
                  ? 'Cadastro de solicitante'
                  : 'Recuperar senha'}
            </h1>
            <p>
              {authMode === 'login'
                ? 'Entre com email e senha. O perfil será identificado automaticamente pelo sistema.'
                : authMode === 'register'
                  ? 'Informe seus dados para solicitar acesso como solicitante.'
                  : 'Informe seu email para iniciar a recuperação de senha.'}
            </p>
          </div>

          {authMode === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <Field
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={rememberedEmail}
                required
              />
              <Field
                label="Senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
              />
              <div className="auth-row">
                <label className="checkbox-field">
                  <input name="lembrarEmail" type="checkbox" defaultChecked={Boolean(rememberedEmail)} />
                  <span>Lembrar meus dados</span>
                </label>
                <button type="button" className="link-button" onClick={() => setAuthMode('forgot')}>
                  Esqueci minha senha?
                </button>
              </div>
              <Button type="submit" variant="primary" icon={<Leaf size={18} />} loading={loading}>
                Entrar
              </Button>
              <p className="auth-footer">
                Ainda não tem conta?{' '}
                <button type="button" className="link-button" onClick={() => setAuthMode('register')}>
                  Cadastrar-me
                </button>
              </p>
            </form>
          ) : null}

          {authMode === 'register' ? (
            <form className="auth-form" onSubmit={handleRegisterSolicitante}>
              <Field label="Nome completo" name="nome" required minLength={3} />
              <Field label="Email" name="email" type="email" required />
              <Field label="CPF" name="cpf" />
              <Field label="Telefone" name="telefone" />
              <Field label="Senha" name="senha" type="password" required minLength={6} />
              <Button type="submit" variant="primary" icon={<UserPlus size={18} />}>
                Cadastrar-me
              </Button>
              <button type="button" className="link-button auth-back" onClick={() => setAuthMode('login')}>
                Voltar para login
              </button>
            </form>
          ) : null}

          {authMode === 'forgot' ? (
            <form className="auth-form" onSubmit={handleForgotPassword}>
              <Field label="Email" name="email" type="email" defaultValue={rememberedEmail} required />
              <Button type="submit" variant="primary" icon={<Mail size={18} />}>
                Enviar instruções
              </Button>
              <button type="button" className="link-button auth-back" onClick={() => setAuthMode('login')}>
                Voltar para login
              </button>
            </form>
          ) : null}

        </section>
      </main>
      </>
    )
  }

  const handleNavigate = (key: AppViewKey) => {
    if (key === 'perfil') {
      setProfileOpen(true)
    } else if (key === 'seguranca') {
      setSecurityOpen(true)
    } else {
      setView(key)
    }
  }

  return (
    <>
    <Toaster richColors position="top-right" />
    <AppShell
      user={user}
      activeView={view}
      canManageUsers={canManageUsers}
      loading={loading}
      onNavigate={handleNavigate}
      onRefresh={refreshAll}
      onLogout={handleLogout}
    >

      {view === 'solicitacoes' ? (
        <section className="page-surface">
          <RequestsDashboard
            solicitacoes={filteredSolicitacoes}
            totalSolicitacoes={solicitacoes.length}
            statusCounts={statusCounts}
            dashboardScope={dashboardLabel(user.perfil)}
            search={solicitacaoSearch}
            statusFilter={statusFilter}
            selectedId={selectedId}
            canCreateSolicitacao={canCreateSolicitacao}
            canEditSolicitacao={canEditSolicitacao}
            onSearchChange={setSolicitacaoSearch}
            onStatusFilterChange={setStatusFilter}
            onCreateClick={() => setCreatingSolicitacao(true)}
            onOpenDetails={(solicitacao) => setSelectedId(solicitacao.id_solicitacao)}
            onEditSolicitacao={setEditingSolicitacao}
          />
        </section>
      ) : null}

      {view === 'usuarios' && canManageUsers ? (
        <section className="page-surface">
          <UsersDashboard
            usuarios={filteredUsuarios}
            totalUsuarios={usuarios.length}
            perfis={perfis}
            loading={loading}
            search={usuarioSearch}
            perfilFilter={usuarioPerfilFilter}
            statusFilter={usuarioStatusFilter}
            onSearchChange={setUsuarioSearch}
            onPerfilFilterChange={setUsuarioPerfilFilter}
            onStatusFilterChange={setUsuarioStatusFilter}
            onCreateClick={() => setCreatingUser(true)}
            onEdit={setEditingUser}
            onToggleStatus={requestToggleUser}
          />
        </section>
      ) : null}


      <CreateSolicitacaoModal
        open={creatingSolicitacao}
        loading={loading}
        onClose={() => setCreatingSolicitacao(false)}
        onSubmit={handleCreateSolicitacao}
      />
      <SolicitacaoDetailModal
        open={Boolean(selectedId)}
        solicitacao={selectedSolicitacao}
        details={selectedDetails}
        canEdit={canEditSelected}
        canForwardToFiscal={canForwardToFiscal}
        canRegisterVistoria={Boolean(canRegisterVistoria)}
        isFinal={isSelectedFinal}
        fiscais={fiscais}
        loading={loading}
        onClose={() => {
          setSelectedId(null)
          setDetails(null)
        }}
        onEdit={() => {
          if (selectedSolicitacao) {
            setEditingSolicitacao(selectedSolicitacao)
          }
        }}
        onForward={handleForward}
        onVistoria={handleVistoria}
      />
      <EditSolicitacaoModal
        solicitacao={editingSolicitacao}
        loading={loading}
        onClose={() => setEditingSolicitacao(null)}
        onSubmit={handleEditSolicitacao}
      />
      <CreateUserModal
        open={creatingUser}
        perfis={perfis}
        loading={loading}
        onClose={() => setCreatingUser(false)}
        onSubmit={handleCreateUser}
      />
      <EditUserModal
        usuario={editingUser}
        perfis={perfis}
        loading={loading}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEditUser}
        onToggleStatus={(usuario) => {
          setEditingUser(null)
          requestToggleUser(usuario)
        }}
      />
      <Modal
        open={Boolean(confirmAction)}
        title={confirmAction?.title || ''}
        description={confirmAction?.description}
        onClose={() => setConfirmAction(null)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setConfirmAction(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant={confirmAction?.variant || 'primary'}
              onClick={() => void confirmCurrentAction()}
              loading={loading}
            >
              {confirmAction?.label || 'Confirmar'}
            </Button>
          </>
        }
      />
    </AppShell>

    <Dialog open={profileOpen} onOpenChange={(open) => { if (!open) setProfileOpen(false) }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Meu perfil</DialogTitle>
          <DialogDescription>Dados básicos da conta autenticada.</DialogDescription>
        </DialogHeader>
        <ProfileAccountView user={user} onSubmit={handleProfileUpdate} />
      </DialogContent>
    </Dialog>

    <Dialog open={securityOpen} onOpenChange={(open) => { if (!open) setSecurityOpen(false) }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Segurança</DialogTitle>
          <DialogDescription>Altere sua senha de acesso ao sistema.</DialogDescription>
        </DialogHeader>
        <SecurityView onSubmit={handlePasswordUpdate} />
      </DialogContent>
    </Dialog>
    </>
  )
}

export default App
