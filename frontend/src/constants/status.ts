import type { StatusSolicitacao } from '../types/domain'

export const statusInfo: Record<StatusSolicitacao, { label: string; className: string }> = {
  ABERTA: { label: 'Aberta', className: 'status-open' },
  EM_ANALISE: { label: 'Em análise', className: 'status-progress' },
  ENCAMINHADA_FISCAL: { label: 'Encaminhada', className: 'status-progress' },
  EM_VISTORIA: { label: 'Em vistoria', className: 'status-progress' },
  APROVADA: { label: 'Aprovada', className: 'status-approved' },
  REPROVADA: { label: 'Reprovada', className: 'status-denied' },
  CANCELADA: { label: 'Cancelada', className: 'status-canceled' },
}
