import { useMemo, useState } from 'react'
import { campaigns as initialCampaigns } from '../data/demoData.js'
import { useRole } from '../context/useRole.js'
import { useToast } from '../context/useToast.js'
import { PageHeader, StatusBadge } from '../components/ui.jsx'
import { Icon } from '../components/Icon.jsx'

const filters = ['All campaigns', 'In progress', 'Reviewing', 'Draft', 'Completed']

export function CampaignsPage() {
  const { role } = useRole()
  const { notify } = useToast()
  const [campaignList, setCampaignList] = useState(initialCampaigns)
  const [filter, setFilter] = useState('All campaigns')
  const [showForm, setShowForm] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const [objective, setObjective] = useState('')
  const [budget, setBudget] = useState('')

  const visibleCampaigns = useMemo(() => filter === 'All campaigns' ? campaignList : campaignList.filter((campaign) => campaign.status === filter), [campaignList, filter])

  function createCampaign(event) {
    event.preventDefault()
    const created = {
      id: `camp-${Date.now()}`,
      name: campaignName.trim(),
      objective,
      creators: 0,
      reach: '—',
      budget: budget ? `$${Number(budget).toLocaleString()}` : '$0',
      status: 'Draft',
      progress: 0,
      due: 'Not set',
      color: 'slate',
    }
    setCampaignList((current) => [created, ...current])
    setCampaignName('')
    setObjective('')
    setBudget('')
    setShowForm(false)
    setFilter('All campaigns')
    notify('Campaign draft created in this session.')
  }

  return (
    <>
      <PageHeader eyebrow={role === 'Creator' ? 'Your partnerships' : 'Campaign management'} title={role === 'Creator' ? 'Collaborations' : 'Campaigns'} description={role === 'Creator' ? 'Track invitations, briefs, deliverables, and completed work.' : 'Create campaigns and manage creator partnerships from brief to completion.'} action={role === 'Creator' ? undefined : 'Create campaign'} onAction={() => setShowForm(true)} />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['Total campaigns', campaignList.length], ['In progress', campaignList.filter((item) => item.status === 'In progress').length], ['Creators engaged', campaignList.reduce((total, item) => total + item.creators, 0)], ['Total investment', '$40,400']].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200/80 bg-white p-4"><p className="text-[10px] font-medium text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{value}</p></div>)}
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.025)]">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:px-5">
          <div className="flex flex-wrap gap-1.5">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-lg px-3 py-2 text-[10px] font-semibold transition ${filter === item ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-50'}`}>{item}</button>)}</div>
          <button className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-medium text-slate-600 hover:bg-slate-50 sm:self-auto" onClick={() => notify('Date range filtering will use campaign API data.') }><Icon name="calendar" size={14} />Date range</button>
        </div>
        {visibleCampaigns.length === 0 ? <div className="p-10 text-center text-xs text-slate-500">No campaigns match this status.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[770px] text-left">
          <thead><tr className="bg-slate-50/70 text-[9px] font-semibold uppercase tracking-[0.11em] text-slate-400"><th className="px-5 py-3">Campaign</th><th className="px-4 py-3">Progress</th><th className="px-4 py-3">Creators</th><th className="px-4 py-3">Reach</th><th className="px-4 py-3">Budget</th><th className="px-4 py-3">Status</th><th className="px-5 py-3">Due date</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{visibleCampaigns.map((campaign) => <tr key={campaign.id} className="hover:bg-slate-50/60">
            <td className="px-5 py-4"><p className="text-[11px] font-semibold text-slate-800">{campaign.name}</p><p className="mt-1 text-[9px] text-slate-400">{campaign.objective}</p></td>
            <td className="px-4 py-4"><div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-500" style={{ width: `${campaign.progress}%` }} /></div><span className="text-[9px] text-slate-500">{campaign.progress}%</span></div></td>
            <td className="px-4 py-4 text-[10px] text-slate-600">{campaign.creators}</td><td className="px-4 py-4 text-[10px] text-slate-600">{campaign.reach}</td><td className="px-4 py-4 text-[10px] font-medium text-slate-700">{campaign.budget}</td><td className="px-4 py-4"><StatusBadge status={campaign.status} /></td><td className="px-5 py-4 text-[10px] text-slate-500">{campaign.due}</td>
          </tr>)}</tbody>
        </table></div>}
        <div className="border-t border-slate-100 px-5 py-3 text-[10px] text-slate-400">Showing {visibleCampaigns.length} of {campaignList.length} campaigns</div>
      </div>

      {showForm && <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4" onClick={(event) => { if (event.target === event.currentTarget) setShowForm(false) }}>
        <form onSubmit={createCampaign} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between"><div><h2 className="text-base font-semibold text-slate-900">Create campaign</h2><p className="mt-1 text-xs text-slate-500">Start a draft and add collaboration details later.</p></div><button type="button" aria-label="Close form" className="rounded-md p-1 text-slate-400 hover:bg-slate-100" onClick={() => setShowForm(false)}><Icon name="close" size={17} /></button></div>
          <label className="mt-5 block text-[11px] font-medium text-slate-700">Campaign name<input required maxLength={80} value={campaignName} onChange={(event) => setCampaignName(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-violet-400" placeholder="e.g. Autumn collection" /></label>
          <label className="mt-4 block text-[11px] font-medium text-slate-700">Objective<select required value={objective} onChange={(event) => setObjective(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-violet-400"><option value="">Choose an objective</option><option>Product launch</option><option>Brand awareness</option><option>UGC campaign</option><option>Seasonal collection</option><option>Community stories</option></select></label>
          <label className="mt-4 block text-[11px] font-medium text-slate-700">Planned budget (USD)<input min="0" step="1" type="number" value={budget} onChange={(event) => setBudget(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-violet-400" placeholder="5000" /></label>
          <div className="mt-6 flex justify-end gap-2"><button type="button" className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600" onClick={() => setShowForm(false)}>Cancel</button><button className="rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-700">Save draft</button></div>
        </form>
      </div>}
      <p className="mt-5 text-center text-[10px] text-slate-400">Campaign changes are kept in browser memory for now; persistent storage and APIs will be added with the backend.</p>
    </>
  )
}
