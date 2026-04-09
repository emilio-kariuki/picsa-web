import type { ComponentType } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function ClientPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-accent/80">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-serif text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

export function ClientSurface({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border/60 bg-card p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] sm:p-6',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function ClientMetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string
  value: string
  helper?: string
  icon?: ComponentType<{ className?: string }>
}) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
          {label}
        </p>
        {Icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Icon className="h-4.5 w-4.5" />
          </div>
        ) : null}
      </div>
      <div className="mt-3">
        <p className="font-serif text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        {helper ? (
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{helper}</p>
        ) : null}
      </div>
    </div>
  )
}

export function ClientSectionHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  )
}
