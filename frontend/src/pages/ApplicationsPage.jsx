import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applications as initialApplications } from '../data/demoData.js'
import { useRole } from '../context/useRole.js'
import { useToast } from '../context/useToast.js'
import { Avatar, PageHeader, StatusBadge } from '../components/ui.jsx'

const applicationFilters = ['All', 'Pending', 'Reviewing', 'Accepted', 'Declined']

export function ApplicationsPage() {
  const { role } = useRole()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [items, setItems] = useState(() => initialApplications.filter((item) => role === 'Admin' || item.direction === (role === 'Creator' ? 'brand' : 'creator')))
  const [filter, setFilter] = useState('All')
  const filtered = useMemo(() => filter === 'All' ? items : items.filter((item) => item.status === filter), [items, filter])
  const creatorView = role === 'Creator'
  const title = role === 'Admin' ? 'Applications' : creatorView ? 'Brand invitations' : 'Creator applications'

  function updateStatus(id, status) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item))
    notify(`Application ${status.toLowerCase()}.`)
  }

  return (
    <>
      <PageHeader eyebrow="Application workflow" title={title} description={creatorView ? 'Review invitations, ask questions, and choose the partnerships that fit.' : role === 'Admin' ? 'Monitor application decisions across the marketplace.' : 'Review creator applications and invite suitable partners.'} action={role === 'Brand' ? 'Find creators' : undefined} onAction={() => navigate('/discover')} />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Total applications', items.length], ['Awaiting response', items.filter((item) => item.status === 'Pending').length], ['In review', items.filter((item) => item.status === 'Reviewing').length], ['Accepted', items.filter((item) => item.status === 'Accepted').length]].map(([label, value]) => <article key={label} className="rounded-xl border border-slate-200/80 bg-white p-4"><p className="text-[10px] text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold text-slate-900">{value}</p></article>)}</div>
      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 p-4">{applicationFilters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-lg px-3 py-2 text-[10px] font-semibold ${filter === item ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-50'}`}>{item}</button>)}</div>
        {filtered.length === 0 ? <div className="p-12 text-center"><p className="text-sm font-semibold text-slate-800">No applications here yet</p><p className="mt-1 text-xs text-slate-500">New partnership requests will appear in this list.</p></div> : <div className="divide-y divide-slate-100">{filtered.map((item) => <article key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          <Avatar initials={item.avatar} color={item.color} size="h-11 w-11" />
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-xs font-semibold text-slate-800">{item.name}</h2><span className="text-[10px] text-slate-400">{item.handle}</span><StatusBadge status={item.status} /></div><p className="mt-1.5 text-[10px] text-slate-500"><span className="font-medium text-slate-700">{item.campaign}</span> · {item.niche} · {item.audience}</p><p className="mt-1 text-[10px] text-slate-500">{creatorView ? 'Invited to collaborate' : 'Applied to campaign'} · Match score <span className="font-semibold text-violet-700">{item.fit}%</span></p></div>
          <div className="flex gap-2 sm:justify-end">{item.status === 'Pending' || item.status === 'Reviewing' ? <><button className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-50" onClick={() => updateStatus(item.id, 'Declined')}>{creatorView ? 'Decline' : 'Pass'}</button><button className="rounded-lg bg-violet-600 px-3 py-2 text-[10px] font-semibold text-white hover:bg-violet-700" onClick={() => updateStatus(item.id, 'Accepted')}>{creatorView ? 'Accept invitation' : 'Approve application'}</button></> : <button className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-50" onClick={() => notify(`Opening ${item.campaign} application details.`)}>View details</button>}</div>
        </article>)}</div>}
      </section>
      <p className="mt-4 text-center text-[10px] text-slate-400">Application actions update this frontend session only; authorization, notifications, and persisted status will be handled by backend services.</p>
    </>
  )
}
