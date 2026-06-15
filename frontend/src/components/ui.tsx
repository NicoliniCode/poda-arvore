import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Paperclip, UploadCloud, X } from 'lucide-react'
import type { StatusSolicitacao } from '../types/domain'
import { statusInfo } from '../constants/status'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'border-[#166534] bg-[#166534] text-white hover:brightness-95',
  secondary: 'border-[#cbd7cf] bg-white text-[#14532d] hover:bg-[#f6f8f5]',
  danger: 'border-[#991b1b] bg-[#991b1b] text-white hover:brightness-95',
  ghost: 'border-transparent bg-transparent text-[#14532d] hover:bg-[#eef3ec]',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  icon?: ReactNode
  loading?: boolean
}

type IconButtonTone = 'neutral' | 'danger' | 'success'

const iconButtonTones: Record<IconButtonTone, string> = {
  neutral: 'border-[#cbd7cf] bg-white text-[#14532d] hover:bg-[#eef3ec]',
  danger: 'border-[#f1c7c7] bg-white text-[#991b1b] hover:bg-[#fef2f2]',
  success: 'border-[#bbd7c4] bg-white text-[#166534] hover:bg-[#eefbf2]',
}

export function Button({
  variant = 'secondary',
  icon,
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'ui-button inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3.5 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-55',
        `ui-button-${variant}`,
        buttonVariants[variant],
        className,
      ].join(' ').trim()}
      disabled={disabled || loading}
      {...props}
    >
      {icon ? <span className="ui-button-icon">{icon}</span> : null}
      <span>{loading ? 'Processando...' : children}</span>
    </button>
  )
}

export function IconButton({
  label,
  icon,
  tone = 'neutral',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  icon: ReactNode
  tone?: IconButtonTone
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={[
        'inline-grid h-9 w-9 place-items-center rounded-md border text-sm transition focus:outline-none focus:ring-3 focus:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-55',
        iconButtonTones[tone],
        className,
      ].join(' ').trim()}
      {...props}
    >
      {icon}
    </button>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  meta?: ReactNode
  actions?: ReactNode
}) {
  return (
    <section className="grid gap-4 rounded-lg border border-[#d8e1d5] bg-white p-4 shadow-[0_12px_32px_rgba(28,45,36,0.06)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div>
        {eyebrow ? (
          <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#647169]">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-1 text-2xl font-extrabold text-[#17231d]">{title}</h1>
        {description ? <p className="mt-1 text-sm font-semibold text-[#647169]">{description}</p> : null}
      </div>
      {meta || actions ? (
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {meta}
          {actions}
        </div>
      ) : null}
    </section>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={[
        'min-h-10 w-full rounded-md border border-[#cbd7cf] bg-white px-2.5 py-2 text-[#17231d] outline-none transition focus:border-[#166534] focus:ring-3 focus:ring-blue-600/30',
        className,
      ].join(' ').trim()}
      {...props}
    />
  )
}

export function FileUpload({
  label = 'Anexos',
  helper = 'Envie fotos, documentos ou laudos relacionados à solicitação.',
  name,
  id,
  multiple = true,
  onChange,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
  helper?: string
}) {
  const [files, setFiles] = useState<File[]>([])
  const fieldId = id || name

  return (
    <label
      className="grid cursor-pointer gap-3 rounded-lg border border-dashed border-[#8cab96] bg-[#f6f8f5] p-4 transition hover:border-[#166534] hover:bg-[#eef3ec]"
      htmlFor={fieldId}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#dcfce7] text-[#14532d]">
          <UploadCloud size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <strong className="block text-sm text-[#17231d]">{label}</strong>
          <span className="block text-sm font-semibold text-[#647169]">{helper}</span>
        </div>
      </div>
      <input
        id={fieldId}
        name={name}
        type="file"
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          setFiles(Array.from(event.target.files || []))
          onChange?.(event)
        }}
        {...props}
      />
      <div className="flex flex-wrap gap-2">
        {files.length ? (
          files.map((file) => (
            <span
              key={`${file.name}-${file.lastModified}`}
              className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-md border border-[#cbd7cf] bg-white px-2.5 text-xs font-extrabold text-[#394c42]"
            >
              <Paperclip size={14} aria-hidden="true" />
              <span className="truncate">{file.name}</span>
            </span>
          ))
        ) : (
          <span className="inline-flex min-h-8 items-center rounded-md border border-[#cbd7cf] bg-white px-2.5 text-xs font-extrabold text-[#647169]">
            Clique para selecionar arquivos
          </span>
        )}
      </div>
    </label>
  )
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  helper?: string
  error?: string
}

export function Field({ label, helper, error, id, ...props }: FieldProps) {
  const fieldId = id || props.name

  return (
    <label className="form-field" htmlFor={fieldId}>
      <span>{label}</span>
      <Input id={fieldId} {...props} />
      {helper ? <small>{helper}</small> : null}
      {error ? <strong className="field-error">{error}</strong> : null}
    </label>
  )
}

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  helper?: string
}

export function TextareaField({ label, helper, id, ...props }: TextareaFieldProps) {
  const fieldId = id || props.name

  return (
    <label className="form-field" htmlFor={fieldId}>
      <span>{label}</span>
      <textarea id={fieldId} {...props} />
      {helper ? <small>{helper}</small> : null}
    </label>
  )
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  children: ReactNode
}

export function SelectField({ label, id, children, ...props }: SelectFieldProps) {
  const fieldId = id || props.name

  return (
    <label className="form-field" htmlFor={fieldId}>
      <span>{label}</span>
      <select id={fieldId} {...props}>
        {children}
      </select>
    </label>
  )
}

export function Card({
  title,
  eyebrow,
  actions,
  children,
  className = '',
}: {
  title?: string
  eyebrow?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={[
        'ui-card grid gap-3.5 rounded-lg border border-[#d8e1d5] bg-white p-4',
        className,
      ].join(' ').trim()}
    >
      {title || eyebrow || actions ? (
        <div className="ui-card-header">
          <div>
            {eyebrow ? <span className="ui-eyebrow">{eyebrow}</span> : null}
            {title ? <h2>{title}</h2> : null}
          </div>
          {actions ? <div className="ui-card-actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function StatusBadge({ status }: { status: StatusSolicitacao }) {
  return <span className={`status-pill ${statusInfo[status].className}`}>{statusInfo[status].label}</span>
}

export function Feedback({
  type,
  children,
}: {
  type: 'success' | 'error' | 'warning'
  children: ReactNode
}) {
  return (
    <p className={`feedback ${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="empty-state">{children}</p>
}

export function Modal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
}: {
  open: boolean
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  onClose: () => void
}) {
  if (!open) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar modal">
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        {children ? <div className="modal-body">{children}</div> : null}
        {footer ? <footer className="modal-footer">{footer}</footer> : null}
      </section>
    </div>
  )
}
