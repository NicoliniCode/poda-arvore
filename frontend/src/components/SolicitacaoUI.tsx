import { useEffect, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Download,
  Eye,
  FileText,
  MapPin,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  User,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { statusInfo } from '../constants/status'
import type { Solicitacao, SolicitacaoDetails, StatusSolicitacao, Usuario } from '../types/domain'
import { buildEndereco, formatDate, getAttachmentUrl } from '../utils/formatters'
import { cn } from '@/lib/utils'
import {
  Button,
  Card,
  Field,
  FileUpload,
  IconButton,
  Input,
  Modal,
  PageHeader,
  SelectField,
  StatusBadge,
  TextareaField,
} from './ui'

export type SolicitacaoStatusFilter = 'TODAS' | StatusSolicitacao

type RequestsDashboardProps = {
  solicitacoes: Solicitacao[]
  totalSolicitacoes: number
  statusCounts: Record<StatusSolicitacao, number>
  dashboardScope: string
  search: string
  statusFilter: SolicitacaoStatusFilter
  selectedId: number | null
  canCreateSolicitacao: boolean
  canEditSolicitacao?: (solicitacao: Solicitacao) => boolean
  canCancelSolicitacao?: (solicitacao: Solicitacao) => boolean
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: SolicitacaoStatusFilter) => void
  onCreateClick: () => void
  onOpenDetails: (solicitacao: Solicitacao) => void
  onEditSolicitacao?: (solicitacao: Solicitacao) => void
  onCancelSolicitacao?: (solicitacao: Solicitacao) => void
}

type SolicitacaoDetailProps = {
  solicitacao: Solicitacao
  details: SolicitacaoDetails | null
  canEdit: boolean
  canForwardToFiscal: boolean
  canRegisterVistoria: boolean
  isFinal: boolean
  fiscais: Usuario[]
  loading: boolean
  onEdit: () => void
  onForward: (event: FormEvent<HTMLFormElement>) => void
  onVistoria: (event: FormEvent<HTMLFormElement>) => void
}

type SolicitacaoDetailModalProps = Omit<SolicitacaoDetailProps, 'solicitacao'> & {
  solicitacao: Solicitacao | null
  open: boolean
  onClose: () => void
}

type EditSolicitacaoModalProps = {
  solicitacao: Solicitacao | null
  loading: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

type CreateSolicitacaoModalProps = {
  open: boolean
  loading: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function RequestsDashboard({
  solicitacoes,
  totalSolicitacoes,
  statusCounts,
  dashboardScope,
  search,
  statusFilter,
  selectedId,
  canCreateSolicitacao,
  canEditSolicitacao,
  canCancelSolicitacao,
  onSearchChange,
  onStatusFilterChange,
  onCreateClick,
  onOpenDetails,
  onEditSolicitacao,
  onCancelSolicitacao,
}: RequestsDashboardProps) {
  return (
    <section className="grid gap-4">
      <PageHeader
        eyebrow="Painel"
        title="Solicitações"
        description={dashboardScope}
        meta={
          <span className="rounded-md border border-[#d8e1d5] bg-[#f6f8f5] px-3 py-2 text-sm font-extrabold text-[#394c42]">
            {totalSolicitacoes} registros
          </span>
        }
        actions={
          canCreateSolicitacao ? (
            <Button
              type="button"
              variant="primary"
              icon={<Plus size={18} />}
              className="w-full sm:w-auto"
              onClick={onCreateClick}
            >
              Nova solicitação
            </Button>
          ) : null
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total" value={totalSolicitacoes} icon={<ClipboardList />} />
        <SummaryCard label="Pendentes" value={statusCounts.ABERTA + statusCounts.EM_ANALISE} icon={<FileText />} />
        <SummaryCard
          label="Em vistoria"
          value={statusCounts.ENCAMINHADA_FISCAL + statusCounts.EM_VISTORIA}
          icon={<CalendarClock />}
        />
        <SummaryCard label="Concluídas" value={statusCounts.APROVADA + statusCounts.REPROVADA} icon={<CheckCircle2 />} />
      </div>

      <section className="overflow-hidden rounded-lg border border-[#d8e1d5] bg-white shadow-[0_12px_32px_rgba(28,45,36,0.06)]">
        <div className="grid gap-3 border-b border-[#d8e1d5] bg-white p-3 sm:p-4 lg:grid-cols-[minmax(260px,1fr)_220px]">
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
                placeholder="Protocolo, endereço ou solicitante"
                className="pl-9"
              />
            </div>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-extrabold uppercase text-[#647169]">Status</span>
            <div className="relative">
              <select
                className="min-h-10 w-full appearance-none rounded-md border border-[#cbd7cf] bg-white px-2.5 py-2 pr-8 font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
                value={statusFilter}
                onChange={(event) => onStatusFilterChange(event.target.value as SolicitacaoStatusFilter)}
              >
                <option value="TODAS">Todos</option>
                {Object.entries(statusInfo).map(([status, info]) => (
                  <option key={status} value={status}>
                    {info.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
            </div>
          </label>
        </div>

        <div className="hidden grid-cols-[110px_minmax(220px,1fr)_minmax(160px,0.8fr)_minmax(150px,0.7fr)_160px_96px] gap-3 border-b border-[#d8e1d5] bg-[#f6f8f5] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.06em] text-[#647169] xl:grid">
          <span>Protocolo</span>
          <span>Endereço</span>
          <span>Solicitante</span>
          <span>Fiscal</span>
          <span>Status</span>
          <span className="text-right">Ações</span>
        </div>

        <div className="divide-y divide-[#e3ebe1]">
          {solicitacoes.map((solicitacao) => (
            <SolicitacaoRow
              key={solicitacao.id_solicitacao}
              solicitacao={solicitacao}
              selected={selectedId === solicitacao.id_solicitacao}
              canEdit={canEditSolicitacao?.(solicitacao) ?? false}
              canCancel={canCancelSolicitacao?.(solicitacao) ?? false}
              onOpenDetails={onOpenDetails}
              onEdit={onEditSolicitacao}
              onCancel={onCancelSolicitacao}
            />
          ))}
        </div>

        {solicitacoes.length === 0 ? (
          <div className="grid place-items-center gap-2 px-4 py-12 text-center">
            <ClipboardList size={30} className="text-[#647169]" aria-hidden="true" />
            <strong className="text-[#17231d]">Nenhuma solicitação encontrada</strong>
            <span className="text-sm font-semibold text-[#647169]">
              Ajuste os filtros ou registre uma nova solicitação.
            </span>
          </div>
        ) : null}
      </section>
    </section>
  )
}

export function CreateSolicitacaoModal({
  open,
  loading,
  onClose,
  onSubmit,
}: CreateSolicitacaoModalProps) {
  return (
    <Modal
      open={open}
      title="Nova solicitação"
      description="Registre o pedido de autorização de poda e adicione anexos quando necessário."
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Endereço" name="endereco" required minLength={3} />
          <Field label="Número" name="numero" />
          <Field label="Bairro" name="bairro" />
          <Field label="Cidade" name="cidade" defaultValue="Araçatuba" />
          <Field label="UF" name="uf" defaultValue="SP" maxLength={2} />
          <Field label="Ponto de referência" name="pontoReferencia" />
        </div>
        <Field label="Motivo" name="motivo" required minLength={5} />
        <TextareaField label="Observação" name="observacao" rows={4} />
        <FileUpload name="anexos" multiple />
        <div className="modal-footer inline-footer">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" icon={<Save size={18} />} loading={loading}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function SolicitacaoDetailModal({
  open,
  onClose,
  solicitacao,
  details,
  canEdit,
  canForwardToFiscal,
  canRegisterVistoria,
  isFinal,
  fiscais,
  loading,
  onEdit,
  onForward,
  onVistoria,
}: SolicitacaoDetailModalProps) {
  return (
    <Modal
      open={open}
      title="Detalhes da solicitação"
      description={solicitacao ? `Protocolo #${solicitacao.id_solicitacao}` : 'Carregando dados do processo.'}
      onClose={onClose}
    >
      {solicitacao ? (
        <SolicitacaoDetail
          solicitacao={solicitacao}
          details={details}
          canEdit={canEdit}
          canForwardToFiscal={canForwardToFiscal}
          canRegisterVistoria={canRegisterVistoria}
          isFinal={isFinal}
          fiscais={fiscais}
          loading={loading}
          onEdit={onEdit}
          onForward={onForward}
          onVistoria={onVistoria}
        />
      ) : (
        <div className="rounded-lg border border-[#d8e1d5] bg-[#f6f8f5] p-4 text-sm font-semibold text-[#647169]">
          Carregando solicitação...
        </div>
      )}
    </Modal>
  )
}

export function EditSolicitacaoModal({
  solicitacao,
  loading,
  onClose,
  onSubmit,
}: EditSolicitacaoModalProps) {
  return (
    <Modal
      open={Boolean(solicitacao)}
      title="Editar solicitação"
      description="Atualize os dados permitidos para esta etapa do processo."
      onClose={onClose}
    >
      {solicitacao ? (
        <form className="modal-form" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Endereço" name="endereco" defaultValue={solicitacao.endereco} required />
            <Field label="Número" name="numero" defaultValue={solicitacao.numero || ''} />
            <Field label="Bairro" name="bairro" defaultValue={solicitacao.bairro || ''} />
            <Field label="Cidade" name="cidade" defaultValue={solicitacao.cidade} />
            <Field label="UF" name="uf" defaultValue={solicitacao.uf} maxLength={2} />
            <Field
              label="Ponto de referência"
              name="pontoReferencia"
              defaultValue={solicitacao.ponto_referencia || ''}
            />
          </div>
          <Field label="Motivo" name="motivo" defaultValue={solicitacao.motivo} required />
          <TextareaField label="Observação" name="observacao" rows={4} defaultValue={solicitacao.observacao || ''} />
          <div className="modal-footer inline-footer">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" icon={<Save size={18} />} loading={loading}>
              Salvar
            </Button>
          </div>
        </form>
      ) : null}
    </Modal>
  )
}

function SummaryCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <article className="flex min-h-24 items-center gap-3 rounded-lg border border-[#d8e1d5] bg-white p-4 shadow-[0_12px_32px_rgba(28,45,36,0.06)]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#dcfce7] text-[#14532d]" aria-hidden="true">
        {icon}
      </span>
      <div>
        <strong className="block text-2xl leading-none text-[#17231d]">{value}</strong>
        <small className="font-extrabold text-[#647169]">{label}</small>
      </div>
    </article>
  )
}

function SolicitacaoRow({
  solicitacao,
  selected,
  canEdit,
  canCancel,
  onOpenDetails,
  onEdit,
  onCancel,
}: {
  solicitacao: Solicitacao
  selected: boolean
  canEdit: boolean
  canCancel: boolean
  onOpenDetails: (solicitacao: Solicitacao) => void
  onEdit?: (solicitacao: Solicitacao) => void
  onCancel?: (solicitacao: Solicitacao) => void
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpenDetails(solicitacao)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'grid w-full cursor-pointer gap-3 px-4 py-2.5 text-left transition hover:bg-[#f6f8f5] focus:bg-[#f6f8f5] focus:outline-none focus:ring-2 focus:ring-blue-600/20 sm:px-4 xl:grid-cols-[110px_minmax(220px,1fr)_minmax(160px,0.8fr)_minmax(150px,0.7fr)_160px_96px] xl:items-center',
        selected ? 'bg-[#eef3ec]' : 'bg-white',
      )}
      onClick={() => onOpenDetails(solicitacao)}
      onKeyDown={handleKeyDown}
    >
      <span className="grid gap-1">
        <small className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#647169] xl:hidden">
          Protocolo
        </small>
        <strong className="text-sm font-extrabold text-[#14532d]">#{solicitacao.id_solicitacao}</strong>
      </span>
      <span className="min-w-0">
        <small className="block text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#647169] xl:hidden">
          Endereço
        </small>
        <strong className="block wrap-break-word text-sm text-[#17231d] xl:truncate">{buildEndereco(solicitacao)}</strong>
        <small className="mt-1 block text-xs font-bold text-[#647169]">
          {formatDate(solicitacao.data_solicitacao)}
        </small>
      </span>
      <span className="grid min-w-0 gap-1">
        <small className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#647169] xl:hidden">
          Solicitante
        </small>
        <span className="truncate text-sm font-semibold text-[#394c42]">{solicitacao.nome_solicitante}</span>
      </span>
      <span className="grid min-w-0 gap-1">
        <small className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#647169] xl:hidden">
          Fiscal
        </small>
        <span className="truncate text-sm font-semibold text-[#647169]">
          {solicitacao.nome_fiscal_responsavel || '-'}
        </span>
      </span>
      <span className="grid gap-1">
        <small className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#647169] xl:hidden">
          Status
        </small>
        <StatusBadge status={solicitacao.status} />
      </span>
      <span className="flex justify-start gap-1 xl:justify-end">
        {canEdit && onEdit ? (
          <IconButton
            label="Editar"
            icon={<Pencil size={16} />}
            onClick={(event) => {
              event.stopPropagation()
              onEdit(solicitacao)
            }}
          />
        ) : null}
        <IconButton
          label="Ver detalhes"
          icon={<Eye size={16} />}
          onClick={(event) => {
            event.stopPropagation()
            onOpenDetails(solicitacao)
          }}
        />
        {canCancel && onCancel ? (
          <IconButton
            label="Cancelar solicitação"
            icon={<Trash2 size={16} />}
            tone="danger"
            onClick={(event) => {
              event.stopPropagation()
              onCancel(solicitacao)
            }}
          />
        ) : null}
      </span>
    </div>
  )
}

function AnexoViewerModal({
  anexo,
  onClose,
}: {
  anexo: Anexo | null
  onClose: () => void
}) {
  const [imgError, setImgError] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [anexo])

  const url = anexo ? getAttachmentUrl(anexo.caminho_arquivo) : ''
  const ext = (anexo?.nome_arquivo.split('.').pop() ?? '').toLowerCase()
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)
  const isPdf = ext === 'pdf'

  const handleDownload = async () => {
    if (!anexo) return
    setDownloading(true)
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Falha ao baixar')
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = anexo.nome_arquivo
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      toast.error('Não foi possível baixar o arquivo.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Modal
      open={Boolean(anexo)}
      title={anexo?.nome_arquivo ?? 'Visualizar arquivo'}
      onClose={onClose}
    >
      <div className="grid gap-4">
        {imgError ? (
          <div className="grid place-items-center gap-3 rounded-lg border border-[#d8e1d5] bg-[#f6f8f5] py-12 text-center">
            <FileText size={40} className="text-[#647169]" aria-hidden />
            <div>
              <strong className="block text-[#17231d]">Arquivo não encontrado</strong>
              <span className="block text-sm font-semibold text-[#647169]">
                O arquivo pode ter sido removido do servidor.
              </span>
            </div>
          </div>
        ) : isImage ? (
          <img
            src={url}
            alt={anexo?.nome_arquivo ?? ''}
            className="max-w-full rounded-lg"
            onError={() => setImgError(true)}
          />
        ) : isPdf ? (
          <iframe
            src={url}
            title={anexo?.nome_arquivo ?? 'PDF'}
            className="h-[65vh] min-h-64 w-full rounded-lg border border-[#d8e1d5]"
          />
        ) : (
          <div className="grid place-items-center gap-3 rounded-lg border border-[#d8e1d5] bg-[#f6f8f5] py-12 text-center">
            <FileText size={40} className="text-[#14532d]" aria-hidden />
            <div>
              <strong className="block text-[#17231d]">{anexo?.nome_arquivo}</strong>
              <span className="block text-sm font-semibold text-[#647169]">
                Clique em Baixar para salvar o arquivo.
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          {!imgError ? (
            <Button
              type="button"
              variant="primary"
              icon={<Download size={16} />}
              loading={downloading}
              onClick={() => void handleDownload()}
            >
              Baixar
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}

function SolicitacaoDetail({
  solicitacao,
  details,
  canEdit,
  canForwardToFiscal,
  canRegisterVistoria,
  isFinal,
  fiscais,
  loading,
  onEdit,
  onForward,
  onVistoria,
}: SolicitacaoDetailProps) {
  const [selectedFiscalId, setSelectedFiscalId] = useState<number | null>(null)
  const [fiscalModalOpen, setFiscalModalOpen] = useState(false)
  const [viewingAttachment, setViewingAttachment] = useState<Anexo | null>(null)
  const selectedFiscal = fiscais.find((f) => f.id_usuario === selectedFiscalId) ?? null

  const openAttachment = async (anexo: Anexo) => {
    const url = getAttachmentUrl(anexo.caminho_arquivo)
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (!response.ok) {
        toast.error('Arquivo não encontrado no servidor.')
        return
      }
    } catch {
      toast.error('Falha ao acessar o arquivo. Verifique a conexão.')
      return
    }
    setViewingAttachment(anexo)
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-[#d8e1d5] bg-[#f6f8f5] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <StatusBadge status={solicitacao.status} />
          <h2 className="mt-2 text-xl font-extrabold text-[#17231d]">
            Solicitação #{solicitacao.id_solicitacao}
          </h2>
          <span className="text-sm font-semibold text-[#647169]">
            Aberta em {formatDate(solicitacao.data_solicitacao)}
          </span>
        </div>
        {canEdit ? (
          <Button type="button" variant="secondary" icon={<Save size={18} />} onClick={onEdit}>
            Editar
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Info label="Solicitante" value={solicitacao.nome_solicitante} icon={<User />} />
        <Info label="Fiscal" value={solicitacao.nome_fiscal_responsavel || '-'} icon={<ShieldCheck />} />
        <Info label="Endereço" value={buildEndereco(solicitacao)} icon={<MapPin />} />
        <Info label="Motivo" value={solicitacao.motivo} icon={<ClipboardList />} />
        <Info label="Referência" value={solicitacao.ponto_referencia || '-'} icon={<MapPin />} />
        <Info label="Observação" value={solicitacao.observacao || '-'} icon={<FileText />} />
      </div>

      {details?.anexos.length ? (
        <Card title="Anexos" eyebrow="Arquivos enviados">
          <div className="flex flex-wrap gap-2">
            {details.anexos.map((anexo) => (
              <button
                key={anexo.id_anexo}
                type="button"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#cbd7cf] bg-white px-2.5 text-sm font-extrabold text-[#14532d] transition hover:bg-[#f6f8f5] sm:min-h-9"
                onClick={() => void openAttachment(anexo)}
              >
                <FileText size={16} aria-hidden="true" />
                {anexo.nome_arquivo}
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {canForwardToFiscal && !isFinal ? (
        <Card title="Encaminhar" eyebrow="Ação administrativa">
          <form className="grid gap-3" onSubmit={onForward}>
            <input type="hidden" name="idFiscal" value={selectedFiscalId ?? ''} readOnly />
            <div className="grid gap-1.5">
              <span className="text-xs font-extrabold uppercase text-[#647169]">Fiscal responsável</span>
              <div className="flex flex-wrap items-center gap-3">
                {selectedFiscal ? (
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#17231d]">
                    <ShieldCheck size={14} className="text-[#166534]" aria-hidden />
                    {selectedFiscal.nome}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-[#647169]">Nenhum fiscal selecionado</span>
                )}
                <Button type="button" variant="secondary" onClick={() => setFiscalModalOpen(true)}>
                  {selectedFiscal ? 'Trocar fiscal' : 'Selecionar fiscal'}
                </Button>
              </div>
            </div>
            <Field label="Observação" name="observacao" />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" icon={<Send size={18} />} loading={loading} disabled={!selectedFiscalId}>
                Encaminhar
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Modal open={fiscalModalOpen} title="Selecionar fiscal" onClose={() => setFiscalModalOpen(false)}>
        {fiscais.length === 0 ? (
          <p className="py-4 text-center text-sm font-semibold text-[#647169]">Nenhum fiscal disponível.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[#d8e1d5]">
            <div className="hidden grid-cols-2 gap-3 border-b border-[#d8e1d5] bg-[#f6f8f5] px-4 py-2.5 text-xs font-extrabold uppercase tracking-[0.06em] text-[#647169] sm:grid">
              <span>Nome</span>
              <span>E-mail</span>
            </div>
            <div className="divide-y divide-[#e3ebe1]">
              {fiscais.map((fiscal) => (
                <div
                  key={fiscal.id_usuario}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'grid cursor-pointer gap-1 px-4 py-2.5 transition hover:bg-[#f6f8f5] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600/20 sm:grid-cols-2 sm:items-center sm:gap-3',
                    selectedFiscalId === fiscal.id_usuario ? 'bg-[#eef3ec]' : '',
                  )}
                  onClick={() => { setSelectedFiscalId(fiscal.id_usuario); setFiscalModalOpen(false) }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedFiscalId(fiscal.id_usuario)
                      setFiscalModalOpen(false)
                    }
                  }}
                >
                  <strong className="block truncate text-sm text-[#17231d]">{fiscal.nome}</strong>
                  <span className="truncate text-sm font-semibold text-[#647169]">{fiscal.email}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {canRegisterVistoria && !isFinal ? (
        <Card title="Vistoria" eyebrow="Parecer técnico">
          <form className="grid gap-3" onSubmit={onVistoria}>
            <TextareaField label="Parecer técnico" name="parecerTecnico" rows={4} required />
            <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-end">
              <SelectField label="Resultado" name="resultado" required defaultValue="">
                <option value="" disabled>
                  Selecione
                </option>
                <option value="APROVADA">Aprovar</option>
                <option value="REPROVADA">Reprovar</option>
              </SelectField>
              <Field label="Observação" name="observacao" />
              <Button type="submit" variant="primary" icon={<CheckCircle2 size={18} />} loading={loading}>
                Registrar vistoria
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card title="Histórico" eyebrow="Andamento">
        <ol className="grid gap-3">
          {details?.historico.map((item) => (
            <li key={item.id_historico} className="grid grid-cols-[14px_minmax(0,1fr)] gap-3">
              <span className={cn('mt-2 h-2.5 w-2.5 rounded-full', statusInfo[item.status].className)} />
              <div className="grid gap-1">
                <strong className="text-sm text-[#17231d]">{statusInfo[item.status].label}</strong>
                <span className="text-sm font-semibold text-[#647169]">{item.observacao || '-'}</span>
                <small className="text-xs font-bold text-[#647169]">
                  {formatDate(item.data_evento)}
                  {item.nome_responsavel ? ` - ${item.nome_responsavel}` : ''}
                </small>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {details?.vistorias.length ? (
        <Card title="Vistorias" eyebrow="Pareceres registrados">
          <div className="grid gap-2">
            {details.vistorias.map((vistoria) => (
              <article
                key={vistoria.id_vistoria}
                className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 rounded-lg border border-[#d8e1d5] bg-white p-3"
              >
                {vistoria.resultado === 'APROVADA' ? (
                  <CheckCircle2 className="text-[#166534]" aria-hidden="true" />
                ) : (
                  <XCircle className="text-[#991b1b]" aria-hidden="true" />
                )}
                <div>
                  <strong className="text-[#17231d]">
                    {vistoria.resultado === 'APROVADA' ? 'Aprovada' : 'Reprovada'}
                  </strong>
                  <p className="my-1 text-sm font-semibold text-[#394c42]">{vistoria.parecer_tecnico}</p>
                  <small className="text-xs font-bold text-[#647169]">
                    {formatDate(vistoria.data_vistoria)} - {vistoria.nome_fiscal}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </Card>
      ) : null}

      <AnexoViewerModal
        anexo={viewingAttachment}
        onClose={() => setViewingAttachment(null)}
      />
    </div>
  )
}

function Info({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 rounded-lg border border-[#d8e1d5] bg-white p-3">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-[#eef3ec] text-[#14532d]" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <small className="block text-xs font-extrabold uppercase text-[#647169]">{label}</small>
        <strong className="block wrap-break-word text-sm text-[#17231d]">{value}</strong>
      </div>
    </div>
  )
}
