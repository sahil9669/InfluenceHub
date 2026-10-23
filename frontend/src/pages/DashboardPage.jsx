import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../api/client.js'
import { useRole } from '../context/useRole.js'
import { Icon } from '../components/Icon.jsx'
import { Avatar, EmptyState, PageHeader } from '../components/ui.jsx'

export function DashboardPage() {
  const { role, user } = useRole()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const creator = role === 'Creator'
  const admin = role === 'Admin'
  const title = admin ? 'Platform overview' : creator ? 'Your creator workspace' : 'Your brand workspace'
  const description = admin
    ? 'A clear view of marketplace activity and your platform tools.'
    : creator
      ? 'Find campaigns that fit your content and keep your creator profile ready to be discovered.'
      : 'Build campaigns and find creators who fit your brand.'
  const action = admin ? 'Manage members' : creator ? 'Explore campaigns' : 'Create a campaign'
  const destination = admin ? '/members' : creator ? '/discover' : '/campaigns'
  const name = user?.name || 'there'
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  useEffect(() => {
    let active = true
    const requests = [apiRequest('/campaigns')]
    if (!admin) requests.push(apiRequest('/profiles/me'))
    Promise.all(requests)
      .then(([campaignResult, profileResult]) => {
        if (!active) return
        setCampaigns(campaignResult.campaigns || [])
        setProfile(profileResult?.profile || null)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load your workspace.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [admin])

  const profileLabel = admin ? 'Platform account' : profile ? 'Profile saved' : 'Finish your profile'
  const nextStep = admin
    ? 'Review marketplace activity and manage accounts from your admin tools.'
    : profile
      ? creator ? `Your profile is ready${profile.influencerType ? ` · ${profile.influencerType}` : ''}.` : `Your brand profile is ready${profile.organizationName ? ` · ${profile.organizationName}` : ''}.`
      : creator ? 'Add your creator type and public details so brands can learn about you.' : 'Add your organization details so creators can learn about your brand.'

  return <>
    <PageHeader eyebrow={`${role} dashboard`} title={title} description={description} action={action} onAction={() => navigate(destination)} />
    <section className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#282044] via-[#3c3067] to-[#6453b8] p-6 text-white shadow-xl shadow-violet-950/10 sm:p-9">
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/[0.04]" />
      <div aria-hidden="true" className="pointer-events-none absolute right-20 top-24 h-40 w-40 rounded-full border border-white/10" />
      <div className="relative grid gap-7 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
        <div><p className="text-xs font-semibold text-violet-200">Welcome back, {name}</p><h2 className="mt-3 max-w-xl font-display text-2xl font-semibold tracking-tight sm:text-3xl">{creator ? 'Make your next partnership count.' : admin ? 'The marketplace, at a glance.' : 'Great partnerships start with a great brief.'}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-violet-100/80">{creator ? 'Browse open campaigns and find a brief that feels right for your audience.' : admin ? 'Keep track of the campaigns and accounts using InfluenceHub.' : 'Create a campaign, set the audience you want to reach, and find creators who fit.'}</p>
          <Link to={destination} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#3d306b] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">{action}<Icon name="arrow" size={15} /></Link>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/[0.09] p-5 backdrop-blur-sm"><div className="flex items-center gap-3"><Avatar initials={initials} color="bg-white text-violet-800" size="h-11 w-11" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{name}</p><p className="mt-0.5 text-xs text-violet-200">{user?.email}</p></div></div><div className="mt-5 border-t border-white/15 pt-4"><div className="flex items-center justify-between gap-3"><span className="text-xs text-violet-100">{profileLabel}</span><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white">{loading ? 'Loading' : profile ? 'Ready' : admin ? 'Admin' : 'Action needed'}</span></div><p className="mt-2 text-xs leading-5 text-violet-100/75">{nextStep}</p>{!admin && <Link className="mt-3 inline-block text-xs font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white" to="/settings">{profile ? 'Edit profile' : 'Complete profile'} →</Link>}</div></div>
      </div>
    </section>

    {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</p>}

    <section className="mt-7 grid gap-4 sm:grid-cols-2">
      <article className="surface-card flex items-center gap-4 rounded-2xl border bg-white p-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><Icon name="campaigns" size={19} /></span><div><p className="text-xs text-slate-500">{creator ? 'Open campaigns' : admin ? 'Marketplace campaigns' : 'Your campaigns'}</p><p className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900">{loading ? '—' : campaigns.length}</p></div><Link to={creator ? '/discover' : '/campaigns'} className="ml-auto text-xs font-semibold text-violet-700 hover:text-violet-900">View <span aria-hidden="true">→</span></Link></article>
      {!admin && <article className="surface-card flex items-center gap-4 rounded-2xl border bg-white p-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Icon name="sparkles" size={19} /></span><div><p className="text-xs text-slate-500">Marketplace profile</p><p className="mt-1 font-display text-base font-bold tracking-tight text-slate-900">{loading ? 'Loading…' : profile ? 'Looking good' : 'Needs a little love'}</p></div><Link to="/settings" className="ml-auto text-xs font-semibold text-violet-700 hover:text-violet-900">{profile ? 'Edit' : 'Set up'} <span aria-hidden="true">→</span></Link></article>}
    </section>

    <div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="surface-card rounded-2xl border bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-display text-sm font-bold text-slate-900">{creator ? 'Campaigns to explore' : 'Campaign activity'}</h2><p className="mt-1 text-xs text-slate-500">{creator ? 'Published opportunities from brands.' : 'Your latest campaign workspace.'}</p></div><Link to={creator ? '/discover' : '/campaigns'} className="text-xs font-semibold text-violet-700">See all →</Link></div>
        {loading ? <p className="py-8 text-center text-xs text-slate-500">Loading your campaigns…</p> : campaigns.length ? <div className="mt-4 divide-y divide-slate-100">{campaigns.slice(0, 3).map((campaign) => <div key={campaign.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{campaign.name}</p><p className="mt-1 truncate text-[11px] text-slate-500">{creator ? campaign.brandName : campaign.productCategory}</p></div><span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">{campaign.status}</span></div>)}</div> : <div className="mt-4"><EmptyState title={creator ? 'No open campaigns yet' : 'No campaigns yet'} description={creator ? 'When a brand publishes a campaign, it will show up here.' : 'Create your first campaign and it will appear here.'} /></div>}
      </section>
      <section className="rounded-2xl border border-[#e8e4dc] bg-[#f0ede7] p-5 sm:p-6"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-violet-700">Quick start</p><h2 className="mt-2 font-display text-base font-bold text-slate-900">{creator ? 'Get discovered by brands' : 'Set up for better matches'}</h2><p className="mt-2 text-xs leading-5 text-slate-600">{creator ? 'Keep your category, bio, and Instagram username up to date.' : 'A clear campaign category and follower range help surface relevant creators.'}</p><Link to={creator ? '/settings' : '/campaigns'} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm hover:text-violet-700">{creator ? 'Review creator profile' : 'Open campaigns'}<Icon name="arrow" size={14} /></Link></section>
    </div>
  </>
}
