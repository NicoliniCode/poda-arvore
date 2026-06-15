import type { AuthUser, Solicitacao } from '../types/domain'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const formatDate = (value: string | null): string => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export const getAttachmentUrl = (path: string | null): string => {
  if (!path) {
    return '#'
  }

  return path.startsWith('http') ? path : `${API_BASE_URL}${path}`
}

export const buildEndereco = (solicitacao: Solicitacao): string => {
  const numero = solicitacao.numero ? `, ${solicitacao.numero}` : ''
  const bairro = solicitacao.bairro ? ` - ${solicitacao.bairro}` : ''

  return `${solicitacao.endereco}${numero}${bairro}, ${solicitacao.cidade}/${solicitacao.uf}`
}

export const formatPerfil = (perfil: AuthUser['perfil']): string => {
  const labels = {
    SOLICITANTE: 'Solicitante',
    FISCAL: 'Fiscal',
    ADMINISTRADOR: 'Administrador',
  }

  return labels[perfil]
}

export const dashboardLabel = (perfil: AuthUser['perfil']): string => {
  if (perfil === 'ADMINISTRADOR') {
    return 'Todas as solicitações'
  }

  if (perfil === 'FISCAL') {
    return 'Encaminhadas para você'
  }

  return 'Suas solicitações'
}
