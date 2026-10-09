import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collaborations as initialCollaborations } from '../data/demoData.js'
import { useRole } from '../context/useRole.js'
import { useToast } from '../context/useToast.js'
import { Avatar, PageHeader, StatusBadge } from '../components/ui.jsx'
import { Icon } from '../components/Icon.jsx'

export function CollaborationsPage() {
  const { role } = useRole()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [items, setItems] = useState(initialCollaborations)
  const [activeId, setActiveId] = useState(initialCollaborations[0].id)
  const active = items.find((item) => item.id === activeId)
  const doneCount = active?.deliverables.filter((deliverable) => deliverable.done).length || 0
  const progress = active ? Math.round((doneCount / active.deliverables.length) * 100) : 0

  function toggleDeliverable(collaborationId, deliverableId) {
    setItems((current) => current.map((collaboration) => collaboration.id === collaborationId
      ? { ...collaboration, deliverables: collaboration.deliverables.map((deliverable) => deliverable.id === deliverableId ? { ...deliverable, done: !deliverable.done } : deliverable) }
      : collaboration))
  }

  function completeCollaboration() {
    if (progress !== 100) {
      notify('Complete all deliverables before closing a collaboration.')
      return
    }
    setItems((current) => current.map((item) => item.id === activeId ? { ...item, status: 'Completed' } : item))
    notify('Collaboration marked complete. Leave a review to close the loop.')
  }

  return (
    <>
      <PageHeader eyebrow="Partnership workspace" title={role === 'Creator' ? 'My collaborations' : role === 'Admin' ? 'Collaboration oversight' : 'Collaborations'} description="Manage agreements, milestones, deliverables, feedback, and completion in one place." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-slate-200/80 bg-white p-4">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-xs font-semibold text-slate-800">Active partnerships</h2><span className="text-[9px] text-slate-400">{items.length} total</span></div>
          <div className="space-y-2">{items.map((item) => <button key={item.id} onClick={() => setActiveId(item.id)} className={`w-full rounded-lg border p-3 text-left transition ${item.id === activeId ? 'border-violet-200 bg-violet-50/60' : 'border-transparent hover:bg-slate-50'}`}><div className="flex items-center gap-2.5"><Avatar initials={item.avatar} color={item.color} size="h-9 w-9" /><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold text-slate-800">{item.name}</p><p className="mt-0.5 truncate text-[9px] text-slate-500">{role === 'Creator' ? 'Brand' : 'Creator'} · {item.partner}</p></div></div><div className="mt-3 flex items-center justify-between"><StatusBadge status={item.status} /><span className="text-[9px] text-slate-400">Due {item.due}</span></div></button>)}</div>
        </aside>

        {active && <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><div className="flex items-center gap-3"><Avatar initials={active.avatar} color={active.color} size="h-10 w-10" /><div><h2 className="text-sm font-semibold text-slate-900">{active.name}</h2><p className="mt-1 text-[10px] text-slate-500">{active.partner} · {active.partnerHandle}</p></div></div><StatusBadge status={active.status} /></header>
          <div className="border-b border-slate-100 bg-slate-50/50 p-5"><div className="flex justify-between text-[10px]"><span className="font-semibold text-slate-700">Milestone progress</span><span className="font-semibold text-violet-700">{progress}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${progress}%` }} /></div><div className="mt-2 flex justify-between text-[9px] text-slate-400"><span>{doneCount} of {active.deliverables.length} milestones complete</span><span>Final due {active.due}</span></div></div>
          <div className="p-5"><div className="mb-4 flex items-end justify-between"><div><h3 className="text-xs font-semibold text-slate-800">Milestones & deliverables</h3><p className="mt-1 text-[10px] text-slate-500">Track work against the agreed campaign timeline.</p></div><button className="text-[10px] font-semibold text-violet-700" onClick={() => navigate('/inbox')}>Open chat →</button></div>
            <ol className="space-y-2">{active.deliverables.map((deliverable, index) => <li key={deliverable.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"><button aria-label={`${deliverable.done ? 'Reopen' : 'Complete'} ${deliverable.title}`} aria-pressed={deliverable.done} onClick={() => toggleDeliverable(active.id, deliverable.id)} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${deliverable.done ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-slate-200 text-transparent hover:border-violet-300'}`}><Icon name="check" size={13} /></button><div className="min-w-0 flex-1"><p className={`text-[11px] font-medium ${deliverable.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{deliverable.title}</p><p className="mt-1 text-[9px] text-slate-400">Milestone {index + 1} · Due {deliverable.due}</p></div><StatusBadge status={deliverable.done ? 'Completed' : 'In progress'} /></li>)}</ol>
          </div>
          <footer className="flex flex-col justify-between gap-3 border-t border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:px-5"><p className="text-[10px] text-slate-500">Both partners should confirm deliverables before completion.</p>{active.status === 'Completed' ? <button onClick={() => navigate('/reviews')} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-emerald-700">Leave a review</button> : <button onClick={completeCollaboration} className="rounded-lg bg-violet-600 px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-violet-700">Mark collaboration complete</button>}</footer>
        </section>}
      </div>
      <p className="mt-4 text-center text-[10px] text-slate-400">Milestone changes are session-only in this frontend. Backend work will add collaborator permissions, file uploads, history, and persistence.</p>
    </>
  )
}
