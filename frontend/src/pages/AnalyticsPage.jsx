import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { weeklyReach, campaigns } from '../data/demoData.js'
import { useRole } from '../context/useRole.js'
import { useToast } from '../context/useToast.js'
import { PageHeader, SectionHeading, StatCard, StatusBadge } from '../components/ui.jsx'
import { Icon } from '../components/Icon.jsx'

const analytics = {
  Brand: {
    metrics: [
      { label: 'Total impressions', value: '2.4M', change: '+18.6% vs last month', icon: 'analytics', color: 'violet' },
      { label: 'Engagements', value: '164.8K', change: '+12.2% vs last month', icon: 'sparkles', color: 'blue' },
      { label: 'Average engagement', value: '6.8%', change: '+0.8% vs last month', icon: 'overview', color: 'green' },
      { label: 'Cost per engagement', value: '$0.11', change: '-8.4% vs last month', icon: 'campaigns', color: 'amber' },
    ],
    title: 'Campaign reach',
    description: 'Estimated campaign impressions over the last 7 days.',
  },
  Creator: {
    metrics: [
      { label: 'Profile impressions', value: '84.2K', change: '+12.4% vs last month', icon: 'analytics', color: 'violet' },
      { label: 'Content engagements', value: '6,058', change: '+9.8% vs last month', icon: 'sparkles', color: 'blue' },
      { label: 'Average engagement', value: '7.2%', change: 'Top 8% in your niche', icon: 'overview', color: 'green' },
      { label: 'Collaboration earnings', value: '$4,850', change: 'Across 4 partnerships', icon: 'campaigns', color: 'amber' },
    ],
    title: 'Audience reach',
    description: 'Estimated content reach over the last 7 days.',
  },
  Admin: {
    metrics: [
      { label: 'Total impressions', value: '28.4M', change: '+18.6% vs last month', icon: 'analytics', color: 'violet' },
      { label: 'Completed collaborations', value: '486', change: '+24% vs last month', icon: 'campaigns', color: 'blue' },
      { label: 'Match success rate', value: '92.4%', change: '+3.1% vs last month', icon: 'sparkles', color: 'green' },
      { label: 'Subscription revenue', value: '$84,250', change: '+11.8% vs last month', icon: 'overview', color: 'amber' },
    ],
    title: 'Marketplace activity',
    description: 'Estimated platform-wide activity over the last 7 days.',
  },
}

export function AnalyticsPage() {
  const { role } = useRole()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [period, setPeriod] = useState('Last 7 days')
  const data = analytics[role]
  const max = Math.max(...weeklyReach.map((item) => item.value))

  return (
    <>
      <PageHeader eyebrow="Performance" title={role === 'Creator' ? 'My analytics' : role === 'Admin' ? 'Platform analytics' : 'Analytics'} description="Understand performance and make informed partnership decisions." action="Export report" onAction={() => notify('Reports can be exported once connected to analytics data.')} />
      <section aria-label="Performance metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{data.metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}</section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
        <article className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-sm font-semibold text-slate-900">{data.title}</h2><p className="mt-1 text-[10px] text-slate-500">{data.description}</p></div><select aria-label="Analytics reporting period" value={period} onChange={(event) => setPeriod(event.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] text-slate-600 outline-none"><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option></select></div>
          <div className="mt-7 flex h-52 items-end gap-3 border-b border-slate-100 px-1 sm:gap-5">{weeklyReach.map((item) => <div key={item.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="relative flex w-full flex-1 items-end"><div title={`${item.value}K reach`} className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-violet-400 transition hover:from-violet-700 hover:to-violet-500" style={{ height: `${(item.value / max) * 100}%` }} /></div><span className="pb-2 text-[9px] text-slate-400">{item.day}</span></div>)}</div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500"><span>Reporting period: {period.toLowerCase()}</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-violet-500" />{role === 'Creator' ? 'Estimated reach' : 'Impressions'}</span></div>
        </article>
        <article className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <SectionHeading title="Audience quality" description="Signals to help measure partnership fit." />
          {[['Audience location', 'United States', '68%'], ['Audience age', '25–34', '42%'], ['Audience interests', 'Fashion & lifestyle', '76%'], ['Authentic engagement', 'High confidence', '94%']].map(([label, value, percent]) => <div key={label} className="border-b border-slate-100 py-3 last:border-0"><div className="flex items-center justify-between gap-2"><div><p className="text-[10px] text-slate-500">{label}</p><p className="mt-1 text-[11px] font-semibold text-slate-800">{value}</p></div><span className="text-[11px] font-semibold text-violet-700">{percent}</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-400" style={{ width: percent }} /></div></div>)}
        </article>
      </section>

      <section className="mt-5 rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
        <SectionHeading title={role === 'Creator' ? 'Collaboration performance' : 'Top campaigns'} description="Compare partnership reach and completion status." action="View campaigns" onAction={() => navigate('/campaigns')} />
        <div className="overflow-x-auto"><table className="w-full min-w-[570px] text-left"><thead><tr className="border-b border-slate-100 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400"><th className="py-3">Campaign</th><th className="py-3">Objective</th><th className="py-3">Creator partners</th><th className="py-3">Reach</th><th className="py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{campaigns.slice(0, 4).map((campaign) => <tr key={campaign.id}><td className="py-3.5 text-[11px] font-semibold text-slate-800">{campaign.name}</td><td className="py-3.5 text-[10px] text-slate-500">{campaign.objective}</td><td className="py-3.5 text-[10px] text-slate-600">{campaign.creators}</td><td className="py-3.5 text-[10px] text-slate-600">{campaign.reach}</td><td className="py-3.5"><StatusBadge status={campaign.status} /></td></tr>)}</tbody></table></div>
        <p className="mt-4 flex items-center gap-2 text-[10px] text-slate-400"><Icon name="sparkles" size={13} /> Illustrative development metrics; connect analytics and social-platform APIs before using for decisions.</p>
      </section>
    </>
  )
}
