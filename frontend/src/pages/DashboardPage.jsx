import { useNavigate } from 'react-router-dom'
import { creatorProfiles, campaigns } from '../data/demoData.js'
import { useRole } from '../context/useRole.js'
import { useToast } from '../context/useToast.js'
import { Avatar, PageHeader, SectionHeading, StatCard, StatusBadge } from '../components/ui.jsx'
import { Icon } from '../components/Icon.jsx'

const metrics = {
  Brand: [
    { label: 'Active collaborations', value: '12', change: '+2 this month', icon: 'campaigns', color: 'violet' },
    { label: 'Total creator reach', value: '2.4M', change: '+18.6% this month', icon: 'analytics', color: 'blue' },
    { label: 'Avg. engagement rate', value: '6.8%', change: '+0.8% this month', icon: 'sparkles', color: 'green' },
    { label: 'Campaign investment', value: '$18,450', change: 'Across 8 campaigns', icon: 'overview', color: 'amber' },
  ],
  Creator: [
    { label: 'Active collaborations', value: '4', change: '2 due this week', icon: 'campaigns', color: 'violet' },
    { label: 'Profile reach', value: '84.2K', change: '+12.4% this month', icon: 'analytics', color: 'blue' },
    { label: 'Engagement rate', value: '7.2%', change: 'Top 8% in your niche', icon: 'sparkles', color: 'green' },
    { label: 'Pending invitations', value: '6', change: '3 are a great fit', icon: 'inbox', color: 'amber' },
  ],
  Admin: [
    { label: 'Total members', value: '18,492', change: '+8.2% this month', icon: 'overview', color: 'violet' },
    { label: 'Active collaborations', value: '1,284', change: '+14.6% this month', icon: 'campaigns', color: 'blue' },
    { label: 'Successful matches', value: '92.4%', change: '+3.1% this month', icon: 'sparkles', color: 'green' },
    { label: 'Open support cases', value: '24', change: '8 need attention', icon: 'inbox', color: 'amber' },
  ],
}

const greeting = {
  Brand: ['Good morning, Olivia', "Here's what's happening with your creator partnerships."],
  Creator: ['Your creator space, Sofia', 'A snapshot of your opportunities and active collaborations.'],
  Admin: ['Platform overview', 'Monitor marketplace health, activity, and member growth.'],
}

export function DashboardPage() {
  const { role } = useRole()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [title, description] = greeting[role]
  const recommended = creatorProfiles.slice(0, 3)

  return (
    <>
      <PageHeader eyebrow={`${role} dashboard`} title={title} description={description} action={role === 'Creator' ? 'Share profile' : role === 'Admin' ? 'Invite member' : 'Create campaign'} onAction={() => role === 'Creator' ? notify('Profile sharing will be connected to your account.') : role === 'Admin' ? notify('Member invitations will be connected to the backend.') : navigate('/campaigns')} />
      <section aria-label="Key metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics[role].map((metric) => <StatCard key={metric.label} {...metric} />)}</section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
        <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:p-6">
          <SectionHeading title={role === 'Creator' ? 'Brands that get your vibe' : role === 'Admin' ? 'Marketplace pulse' : 'Creators picked for you'} description={role === 'Creator' ? 'Recommended brand partnerships based on your creator profile.' : role === 'Admin' ? 'A snapshot of recent platform activity.' : 'AI match scores tailored to your campaign and audience.'} action="Explore all" onAction={() => navigate('/discover')} />
          <div className="divide-y divide-slate-100">
            {recommended.map((person) => <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" key={person.id}>
              <Avatar initials={person.avatar} color={person.color} />
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline gap-x-2"><p className="text-xs font-semibold text-slate-800">{person.name}</p><span className="text-[10px] text-slate-400">{person.handle}</span></div><p className="mt-1 text-[10px] text-slate-500">{person.niche} <span className="mx-1 text-slate-300">·</span>{person.followers.toLocaleString()} followers</p></div>
              <div className="text-right"><p className="text-xs font-semibold text-slate-800">{person.score}%</p><p className="mt-0.5 text-[9px] font-medium text-emerald-600">match</p></div>
              <button aria-label={`View ${person.name}`} className="ml-1 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-violet-700" onClick={() => navigate('/discover')}><Icon name="arrow" size={14} /></button>
            </div>)}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-violet-50/70 px-3 py-2.5 text-[10px] text-violet-800"><Icon name="sparkles" size={14} className="shrink-0 text-violet-600" /><span><strong className="font-semibold">AI-powered recommendations.</strong> Match scores can later be supplied by your recommendation service.</span></div>
        </article>

        <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:p-6">
          <SectionHeading title="Collaboration progress" description="Follow work from match through deliverables." action="View all" onAction={() => navigate(role === 'Creator' ? '/collaborations' : '/campaigns')} />
          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3.5"><div className="flex items-center justify-between text-[10px]"><span className="font-semibold text-slate-700">{role === 'Creator' ? 'Summer Edit · Studio North' : 'Summer Edit campaign'}</span><span className="font-semibold text-violet-700">68%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-[68%] rounded-full bg-violet-500" /></div></div>
          <ol className="mt-4 space-y-4">{[['Campaign brief', 'Completed', true], ['Creator matching', 'Completed', true], ['Content in progress', '3 creators working', false], ['Review & publish', 'Up next', false]].map(([step, status, complete], index) => <li key={step} className="relative flex gap-3"><span className={`flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full ${complete ? 'bg-emerald-100 text-emerald-700' : index === 2 ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-400'}`}><Icon name={complete ? 'check' : 'clock'} size={12} /></span><div className="flex flex-1 items-center justify-between gap-2 pt-0.5"><p className="text-[11px] font-medium text-slate-700">{step}</p><p className={`text-right text-[10px] ${complete ? 'text-emerald-600' : 'text-slate-400'}`}>{status}</p></div></li>)}</ol>
        </article>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
        <article className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.025)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-sm font-semibold tracking-tight">{role === 'Creator' ? 'Recent collaborations' : role === 'Admin' ? 'Platform campaigns' : 'Recent campaigns'}</h2><p className="mt-1 text-[10px] text-slate-500">Campaign status, creator participation, and reach.</p></div><button className="text-[10px] font-semibold text-violet-700" onClick={() => navigate(role === 'Creator' ? '/collaborations' : '/campaigns')}>{role === 'Creator' ? 'All collaborations' : 'All campaigns'} →</button></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left"><thead><tr className="bg-slate-50/70 text-[9px] font-semibold uppercase tracking-[0.11em] text-slate-400"><th className="px-6 py-3">Campaign</th><th className="px-4 py-3">Creators</th><th className="px-4 py-3">Reach</th><th className="px-6 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{campaigns.slice(0, 3).map((campaign) => <tr key={campaign.id} className="hover:bg-slate-50/60"><td className="px-6 py-3.5"><p className="text-[11px] font-semibold text-slate-800">{campaign.name}</p><p className="mt-1 text-[9px] text-slate-400">{campaign.objective}</p></td><td className="px-4 py-3.5 text-[10px] text-slate-600">{campaign.creators}</td><td className="px-4 py-3.5 text-[10px] font-medium text-slate-700">{campaign.reach}</td><td className="px-6 py-3.5"><StatusBadge status={campaign.status} /></td></tr>)}</tbody></table></div>
        </article>
        <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:p-6">
          <SectionHeading title="Recent activity" description="The latest updates from your workspace." />
          <div className="space-y-4">{[['New creator application', 'Sofia Chen applied to Summer Edit', '12 min ago'], ['Milestone completed', 'First draft received from Marcus Cole', '1 hour ago'], ['New message', 'Amara sent you a message', '3 hours ago']].map(([titleText, detail, time], index) => <div key={titleText} className="flex gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${index === 1 ? 'bg-emerald-100 text-emerald-700' : index === 2 ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700'}`}><Icon name={index === 1 ? 'check' : 'inbox'} size={14} /></span><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-slate-700">{titleText}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">{detail}</p><p className="mt-1.5 text-[9px] text-slate-400">{time}</p></div></div>)}</div>
          <button className="mt-5 w-full rounded-lg border border-slate-200 py-2.5 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50" onClick={() => navigate('/inbox')}>Open inbox</button>
        </article>
      </section>
    </>
  )
}
