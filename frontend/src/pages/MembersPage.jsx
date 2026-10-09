import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { members as initialMembers } from '../data/demoData.js'
import { useRole } from '../context/useRole.js'
import { useToast } from '../context/useToast.js'
import { Avatar, PageHeader, StatusBadge } from '../components/ui.jsx'

export function MembersPage() {
  const { role } = useRole()
  const { notify } = useToast()
  const [items, setItems] = useState(initialMembers)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All members')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  const filtered = useMemo(() => items.filter((member) => {
    const matchesQuery = `${member.name} ${member.email}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (type === 'All members' || member.type === type)
  }), [items, query, type])

  if (role !== 'Admin') return <Navigate replace to="/" />

  function toggleStatus(id) {
    setItems((current) => current.map((member) => member.id === id ? { ...member, status: member.status === 'Suspended' ? 'Active' : 'Suspended' } : member))
    notify('Member access status updated for this session.')
  }

  function inviteMember(event) {
    event.preventDefault()
    notify(`Invitation prepared for ${inviteEmail}; email delivery will be connected to the backend.`)
    setInviteEmail('')
    setShowInvite(false)
  }

  return (
    <>
      <PageHeader eyebrow="Administration" title="Member management" description="Review marketplace accounts, onboarding status, and platform access." action="Invite member" onAction={() => setShowInvite(true)} />
      <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Total members', items.length], ['Brands', items.filter((member) => member.type === 'Brand').length], ['Creators', items.filter((member) => member.type === 'Creator').length], ['Need verification', items.filter((member) => member.status === 'Pending verification').length]].map(([label, value]) => <article key={label} className="rounded-xl border border-slate-200/80 bg-white p-4"><p className="text-[10px] text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold text-slate-900">{value}</p></article>)}</section>
      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 sm:w-72"><span aria-hidden="true" className="text-slate-400">⌕</span><input aria-label="Search members" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email..." className="w-full bg-transparent text-[11px] outline-none" /></label>
          <select aria-label="Filter member type" value={type} onChange={(event) => setType(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[10px] text-slate-600 outline-none"><option>All members</option><option>Brand</option><option>Creator</option></select>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left">
          <thead><tr className="bg-slate-50/70 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400"><th className="px-5 py-3">Member</th><th className="px-4 py-3">Account type</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Access</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{filtered.map((member) => <tr key={member.id} className="hover:bg-slate-50/60"><td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><Avatar initials={member.initials} color={member.color} size="h-9 w-9" /><div><p className="text-[11px] font-semibold text-slate-800">{member.name}</p><p className="mt-1 text-[9px] text-slate-400">{member.email}</p></div></div></td><td className="px-4 py-3.5 text-[10px] text-slate-600">{member.type}</td><td className="px-4 py-3.5 text-[10px] text-slate-500">{member.joined}</td><td className="px-4 py-3.5"><StatusBadge status={member.status === 'Pending verification' ? 'Reviewing' : member.status === 'Suspended' ? 'Needs review' : 'Healthy'} /></td><td className="px-5 py-3.5 text-right"><button onClick={() => toggleStatus(member.id)} className={`rounded-lg border px-3 py-2 text-[9px] font-semibold ${member.status === 'Suspended' ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{member.status === 'Suspended' ? 'Restore access' : 'Suspend access'}</button></td></tr>)}</tbody>
        </table></div>
        {filtered.length === 0 && <p className="p-10 text-center text-xs text-slate-500">No members match your search.</p>}
        <div className="border-t border-slate-100 px-5 py-3 text-[10px] text-slate-400">Showing {filtered.length} of {items.length} members</div>
      </section>
      <p className="mt-4 text-center text-[10px] text-slate-400">Member records and access updates are development data. Real admin permissions, verification, and audit logs require backend authorization.</p>

      {showInvite && <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4" onClick={(event) => { if (event.target === event.currentTarget) setShowInvite(false) }}><form onSubmit={inviteMember} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-sm font-semibold text-slate-900">Invite a member</h2><p className="mt-1 text-[10px] text-slate-500">Prepare an invitation for a brand or creator account.</p><label className="mt-5 block text-[10px] font-medium text-slate-700">Email address<input required type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-violet-400" placeholder="name@example.com" /></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setShowInvite(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600">Cancel</button><button className="rounded-lg bg-violet-600 px-3 py-2 text-[10px] font-semibold text-white hover:bg-violet-700">Prepare invite</button></div></form></div>}
    </>
  )
}
