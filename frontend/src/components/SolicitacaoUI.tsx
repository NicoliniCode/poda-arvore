import type { FormEvent, KeyboardEvent, ReactNode } from 'react'
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  MapPin,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react'
import { statusInfo } from '../constants/status'
import type { Solicitacao, SolicitacaoDetails, StatusSolicitacao, Usuario } from '../types/domain'
import { buildEndereco, formatDate, getAttachmentUrl } from '../utils/formatters'
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
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: SolicitacaoStatusFilter) => void
  onCreateClick: () => void
  onOpenDetails: (solicitacao: Solicitacao) => void
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
  onSearchChange,
  onStatusFilterChange,
  onCreateClick,
  onOpenDetails,
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
            <select
              className="min-h-10 rounded-md border border-[#cbd7cf] bg-white px-2.5 py-2 text-[#17231d] outline-none transition focus:border-[#166534] focus:ring-3 focus:ring-blue-600/30"
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
              onOpenDetails={onOpenDetails}
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
  onOpenDetails,
}: {
  solicitacao: Solicitacao
  selected: boolean
  onOpenDetails: (solicitacao: Solicitacao) => void
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
      className={[
        'grid w-full cursor-pointer gap-3 px-3 py-4 text-left transition hover:bg-[#f6f8f5] focus:bg-[#f6f8f5] focus:outline-none focus:ring-3 focus:ring-blue-600/20 sm:px-4 xl:grid-cols-[110px_minmax(220px,1fr)_minmax(160px,0.8fr)_minmax(150px,0.7fr)_160px_96px] xl:items-center',
        selected ? 'bg-[#eef3ec]' : 'bg-white',
      ].join(' ')}
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
        <strong className="block break-words text-sm text-[#17231d] xl:truncate">{buildEndereco(solicitacao)}</strong>
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
      <span className="flex justify-start xl:justify-end">
        <IconButton
          label="Ver detalhes"
          icon={<Eye size={16} />}
          onClick={(event) => {
            event.stopPropagation()
            onOpenDetails(solicitacao)
          }}
        />
      </span>
    </div>
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
              <a
                key={anexo.id_anexo}
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#cbd7cf] bg-white px-2.5 text-sm font-extrabold text-[#14532d] no-underline transition hover:bg-[#f6f8f5]"
                href={getAttachmentUrl(anexo.caminho_arquivo)}
                target="_blank"
                rel="noreferrer"
              >
                <FileText size={16} aria-hidden="true" />
                {anexo.nome_arquivo}
              </a>
            ))}
          </div>
        </Card>
      ) : null}

      {canForwardToFiscal && !isFinal ? (
        <Card title="Encaminhar" eyebrow="Ação administrativa">
          <form className="grid gap-3 lg:grid-cols-[240px_minmax(0,1fr)_auto] lg:items-end" onSubmit={onForward}>
            <SelectField label="Fiscal responsável" name="idFiscal" required defaultValue="">
              <option value="" disabled>
                Selecione
              </option>
              {fiscais.map((fiscal) => (
                <option key={fiscal.id_usuario} value={fiscal.id_usuario}>
                  {fiscal.nome}
                </option>
              ))}
            </SelectField>
            <Field label="Observação" name="observacao" />
            <Button type="submit" variant="primary" icon={<Send size={18} />} loading={loading}>
              Encaminhar
            </Button>
          </form>
        </Card>
      ) : null}

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
              <span className={`mt-2 h-2.5 w-2.5 rounded-full ${statusInfo[item.status].className}`} />
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
        <strong className="block break-words text-sm text-[#17231d]">{value}</strong>
      </div>
    </div>
  )
}
