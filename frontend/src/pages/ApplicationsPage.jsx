import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../api/client.js'
import { useRole } from '../context/useRole.js'
import { EmptyState, PageHeader, StatusBadge } from '../components/ui.jsx'

export function ApplicationsPage() {
  const { role } = useRole()
  const navigate = useNavigate()
  const creator = role === 'Creator'
  const admin = role === 'Admin'
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  useEffect(() => {
    let active = true
    apiRequest('/applications')
      .then(({ applications: items }) => { if (active) setApplications(items) })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load applications.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function reviewApplication(application, status) {
    setError('')
    setBusyId(application.id)
    try {
      const { application: updated } = await apiRequest(`/applications/${application.id}/status`, {
        method: 'PATCH',
        body: { status },
      })
      setApplications((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch (requestError) {
      setError(requestError.message || 'Could not update the application.')
    } finally {
      setBusyId('')
    }
  }

  const title = creator ? 'My campaign applications' : admin ? 'Marketplace applications' : 'Creator applications'

  return <>
    <PageHeader
      eyebrow="Campaign workflow"
      title={title}
      description={creator
        ? 'Track the campaigns you have applied to and the Brand’s response.'
        : admin
          ? 'Review application activity across the marketplace.'
          : 'Review creator applications and choose who to work with.'}
      action={role === 'Brand' ? 'Discover creators' : undefined}
      onAction={() => navigate('/discover')}
    />
    {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</p>}
    {loading
      ? <p className="rounded-xl border border-slate-200/80 bg-white p-10 text-center text-xs text-slate-500">Loading applications...</p>
      : applications.length === 0
        ? <EmptyState
            title={creator ? 'No applications yet' : 'No creator applications yet'}
            description={creator ? 'When you apply to an open campaign, it will appear here.' : 'Creator applications to your campaigns will appear here.'}
          />
        : <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{applications.map((application) => {
            const creatorName = application.creator?.profile?.creatorName || application.creator?.name || 'Creator'
            return <article key={application.id} className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wide text-violet-700">{creator ? 'Applied to' : 'Campaign'}</p><h2 className="mt-1 truncate text-base font-bold text-slate-900">{application.campaign?.name || 'Campaign unavailable'}</h2><p className="mt-1 text-xs text-slate-500">{creator ? application.campaign?.brandName : creatorName}</p></div><StatusBadge status={application.status} /></div>
              {!creator && application.creator && <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-xs"><Link to={`/profiles/${application.creator.id}`} className="font-semibold text-violet-700 hover:underline">View creator profile →</Link>{application.creator.profile?.influencerType && <span className="text-slate-500">{application.creator.profile.influencerType}</span>}{application.creator.profile?.instagramFollowerCount != null && <span className="text-slate-500">{application.creator.profile.instagramFollowerCount.toLocaleString()} followers</span>}</div>}
              {application.creator?.profile?.instagramUsername && !creator && <p className="mt-2 text-xs text-slate-500">@{application.creator.profile.instagramUsername}</p>}
              <div className="mt-4 rounded-xl bg-[#f7f5f1] p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Application message</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{application.message}</p></div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-[11px] text-slate-400">Sent {new Date(application.createdAt).toLocaleDateString()}</p>
                {!creator && !admin && application.status === 'Pending' && <div className="flex gap-2"><button disabled={busyId === application.id} onClick={() => reviewApplication(application, 'Declined')} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Decline</button><button disabled={busyId === application.id} onClick={() => reviewApplication(application, 'Accepted')} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50">{busyId === application.id ? 'Saving…' : 'Accept creator'}</button></div>}
              </div>
            </article>
          })}</div>}
  </>
}
