import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api/client.js'
import { useRole } from '../context/useRole.js'
import { EmptyState, PageHeader, StatusBadge } from '../components/ui.jsx'

export function CollaborationsPage() {
  const { role } = useRole()
  const [collaborations, setCollaborations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const creator = role === 'Creator'
  const admin = role === 'Admin'

  useEffect(() => {
    let active = true
    apiRequest('/collaborations')
      .then(({ collaborations: items }) => { if (active) setCollaborations(items) })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load collaborations.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return <>
    <PageHeader
      eyebrow="Partnership workspace"
      title={creator ? 'My collaborations' : admin ? 'Collaboration oversight' : 'Collaborations'}
      description={creator
        ? 'Partnerships begin here when a Brand accepts one of your applications.'
        : admin
          ? 'View active partnerships created from accepted campaign applications.'
          : 'Accepted creator applications become active partnerships here.'}
    />
    {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</p>}
    {loading
      ? <p className="rounded-xl border border-slate-200/80 bg-white p-10 text-center text-xs text-slate-500">Loading collaborations...</p>
      : collaborations.length === 0
        ? <EmptyState title="No collaborations yet" description="When a Brand accepts a Creator’s campaign application, the partnership will appear here." />
        : <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{collaborations.map((collaboration) => {
            const otherParty = creator ? collaboration.brand : collaboration.creator
            const otherRole = creator ? 'Brand' : 'Creator'
            return <article key={collaboration.id} className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wide text-violet-700">{collaboration.campaign?.productCategory || 'Campaign partnership'}</p><h2 className="mt-1 truncate text-base font-bold text-slate-900">{collaboration.campaign?.name || 'Campaign unavailable'}</h2></div><StatusBadge status={collaboration.status} /></div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><div><p className="text-[10px] text-slate-500">{admin ? 'Creator' : otherRole}</p>{otherParty ? <Link to={`/profiles/${otherParty.id}`} className="mt-1 inline-block text-sm font-semibold text-violet-700 hover:underline">{otherParty.name}</Link> : <p className="mt-1 text-sm font-semibold text-slate-700">Account unavailable</p>}</div><div className="text-right"><p className="text-[10px] text-slate-500">Started</p><p className="mt-1 text-xs font-medium text-slate-700">{new Date(collaboration.createdAt).toLocaleDateString()}</p></div></div>
              {admin && collaboration.brand && <p className="mt-3 text-xs text-slate-500">Brand: <Link to={`/profiles/${collaboration.brand.id}`} className="font-medium text-violet-700 hover:underline">{collaboration.brand.name}</Link></p>}
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#f7f5f1] px-4 py-3"><p className="text-xs leading-5 text-slate-600">This partnership began when the Brand accepted the application.</p><Link to={`/inbox?collaboration=${collaboration.id}`} className="shrink-0 text-xs font-semibold text-violet-700 hover:underline">Open chat →</Link></div>
            </article>
          })}</div>}
  </>
}
