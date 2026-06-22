import type { StatusSolicitacao } from '../types/domain'

export const statusInfo: Record<StatusSolicitacao, { label: string; className: string; badgeClass: string }> = {
  ABERTA: {
    label: 'Aberta',
    className: 'bg-blue-500',
    badgeClass: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  },
  EM_ANALISE: {
    label: 'Em análise',
    className: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  ENCAMINHADA_FISCAL: {
    label: 'Encaminhada',
    className: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  EM_VISTORIA: {
    label: 'Em vistoria',
    className: 'bg-purple-500',
    badgeClass: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  },
  APROVADA: {
    label: 'Aprovada',
    className: 'bg-green-600',
    badgeClass: 'bg-green-50 text-green-700 ring-green-600/20',
  },
  REPROVADA: {
    label: 'Reprovada',
    className: 'bg-red-600',
    badgeClass: 'bg-red-50 text-red-700 ring-red-600/20',
  },
  CANCELADA: {
    label: 'Cancelada',
    className: 'bg-zinc-400',
    badgeClass: 'bg-zinc-100 text-zinc-600 ring-zinc-500/20',
  },
}
