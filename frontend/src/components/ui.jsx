import { Icon } from './Icon.jsx'

export function Avatar({ initials, color = 'bg-violet-100 text-violet-700', size = 'h-10 w-10' }) {
  return <div className={`flex shrink-0 items-center justify-center rounded-full text-xs font-semibold ${color} ${size}`}>{initials}</div>
}

export function PageHeader({ eyebrow, title, description, action, onAction }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-violet-700"><span className="h-1.5 w-1.5 rounded-full bg-violet-500" />{eyebrow}</div>}
        <h1 className="text-[25px] font-semibold tracking-[-0.045em] text-slate-900 sm:text-[30px]">{title}</h1>
        <p className="mt-1.5 text-[13px] text-slate-500">{description}</p>
      </div>
      {action && <button className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-violet-600 px-4 text-xs font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 sm:self-auto" onClick={onAction}><Icon name="plus" size={16} />{action}</button>}
    </div>
  )
}

export function StatCard({ label, value, change, icon = 'overview', color = 'violet' }) {
  const colors = {
    violet: 'bg-violet-50 text-violet-600',
    blue: 'bg-sky-50 text-sky-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:p-5">
      <div className="flex items-start justify-between"><p className="text-[11px] font-medium text-slate-500">{label}</p><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors[color]}`}><Icon name={icon} size={16} /></span></div>
      <p className="mt-3 text-[25px] font-semibold tracking-[-0.045em] text-slate-900">{value}</p>
      <p className="mt-1 text-[10px] font-medium text-emerald-600">{change}</p>
    </article>
  )
}

export function StatusBadge({ status }) {
  const styles = {
    'In progress': 'bg-violet-50 text-violet-700',
    Reviewing: 'bg-amber-50 text-amber-700',
    Draft: 'bg-slate-100 text-slate-600',
    Completed: 'bg-emerald-50 text-emerald-700',
    Invited: 'bg-sky-50 text-sky-700',
    'Needs review': 'bg-amber-50 text-amber-700',
    Healthy: 'bg-emerald-50 text-emerald-700',
  }
  return <span className={`whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-medium ${styles[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>
}

export function SectionHeading({ title, description, action, onAction }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h2>{description && <p className="mt-1 text-[11px] text-slate-500">{description}</p>}</div>
      {action && <button onClick={onAction} className="text-[11px] font-semibold text-violet-700 hover:text-violet-900">{action}</button>}
    </div>
  )
}

export function EmptyState({ title, description }) {
  return <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-600"><Icon name="sparkles" size={18} /></div><p className="mt-3 text-sm font-semibold text-slate-800">{title}</p><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">{description}</p></div>
}
