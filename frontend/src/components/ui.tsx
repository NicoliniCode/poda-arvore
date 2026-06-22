import { useEffect, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { ChevronDown, Paperclip, UploadCloud, X } from 'lucide-react'
import type { StatusSolicitacao } from '../types/domain'
import { statusInfo } from '../constants/status'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'border-primary bg-primary text-primary-foreground hover:brightness-95',
  secondary: 'border-border bg-background text-foreground hover:bg-surface-muted',
  danger: 'border-destructive bg-destructive text-white hover:brightness-95',
  ghost: 'border-transparent bg-transparent text-foreground hover:bg-surface-muted',
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
      className={cn(
        'ui-button inline-flex items-center justify-center gap-2 rounded-md border px-3.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        `ui-button-${variant}`,
        buttonVariants[variant],
        className,
      )}
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
      className={cn(
        'inline-grid h-11 w-11 place-items-center rounded-md border text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:h-8 sm:w-8',
        iconButtonTones[tone],
        className,
      )}
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
    <section className="grid gap-4 rounded-lg border border-[#d8e1d5] bg-white p-3 shadow-[0_12px_32px_rgba(28,45,36,0.06)] sm:p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div>
        {eyebrow ? (
          <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#647169]">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-1 text-xl font-extrabold text-[#17231d] sm:text-2xl">{title}</h1>
        {description ? <p className="mt-1 text-sm font-semibold text-[#647169]">{description}</p> : null}
      </div>
      {meta || actions ? (
        <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center lg:justify-end">
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
      className={cn(
        'min-h-10 w-full rounded-md border border-[#cbd7cf] bg-white px-2.5 py-2 font-normal text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30 sm:text-sm',
        className,
      )}
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
  onChange: _onChange,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
  helper?: string
}) {
  const mainInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const fieldId = id || name

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`))
      const fresh = Array.from(incoming).filter((f) => !existing.has(`${f.name}-${f.size}`))
      return [...prev, ...fresh]
    })
  }

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  useEffect(() => {
    const input = mainInputRef.current
    if (!input) return
    try {
      const dt = new DataTransfer()
      files.forEach((f) => dt.items.add(f))
      input.files = dt.files
    } catch {
      // DataTransfer não suportado — fallback silencioso
    }
  }, [files])

  return (
    <div className="grid gap-2">
      {/* Drop zone — clique para escolher qualquer arquivo */}
      <label
        className="grid cursor-pointer gap-3 rounded-lg border border-dashed border-[#8cab96] bg-[#f6f8f5] p-3 transition hover:border-[#166534] hover:bg-[#eef3ec] sm:p-4"
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
          ref={mainInputRef}
          id={fieldId}
          name={name}
          type="file"
          multiple={multiple}
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
          {...props}
        />
      </label>

      {/* Preview acumulado com remoção */}
      <div className="flex flex-wrap gap-2">
        {files.length ? (
          files.map((file, idx) => (
            <span
              key={`${file.name}-${file.size}-${idx}`}
              className="inline-flex min-h-8 max-w-45 items-center gap-1.5 rounded-md border border-[#cbd7cf] bg-white px-2.5 text-xs font-extrabold text-[#394c42]"
            >
              <Paperclip size={12} aria-hidden="true" />
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                aria-label={`Remover ${file.name}`}
                className="ml-auto shrink-0 text-[#647169] transition hover:text-[#991b1b]"
                onClick={() => removeFile(idx)}
              >
                <X size={12} />
              </button>
            </span>
          ))
        ) : (
          <span className="inline-flex min-h-8 items-center rounded-md border border-[#cbd7cf] bg-white px-2.5 text-xs font-extrabold text-[#647169]">
            Nenhum arquivo selecionado
          </span>
        )}
      </div>
    </div>
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
  className?: string
}

export function TextareaField({ label, helper, id, className, ...props }: TextareaFieldProps) {
  const fieldId = id || props.name

  return (
    <label className="form-field" htmlFor={fieldId}>
      <span>{label}</span>
      <textarea
        id={fieldId}
        className={cn(
          'min-h-20 w-full resize-vertical rounded-md border border-[#cbd7cf] bg-white px-2.5 py-2 font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30',
          className,
        )}
        {...props}
      />
      {helper ? <small>{helper}</small> : null}
    </label>
  )
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  children: ReactNode
}

export function SelectField({ label, id, children, className, ...props }: SelectFieldProps) {
  const fieldId = id || props.name

  return (
    <label className="form-field" htmlFor={fieldId}>
      <span>{label}</span>
      <div className="relative">
        <select
          id={fieldId}
          className={cn(
            'min-h-10 w-full appearance-none rounded-md border border-[#cbd7cf] bg-white px-2.5 py-2 pr-8 font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
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
  const info = statusInfo[status]
  return (
    <span className={cn('inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset', info.badgeClass)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', info.className)} aria-hidden />
      {info.label}
    </span>
  )
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
  size,
  onClose,
}: {
  open: boolean
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm'
  onClose: () => void
}) {
  if (!open) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={size === 'sm' ? 'modal-panel modal-panel-sm' : 'modal-panel'}
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
