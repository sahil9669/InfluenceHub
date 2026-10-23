import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client.js'
import { useRole } from '../context/useRole.js'
import { campaignCategories, categoryToCreatorType } from '../data/marketplaceOptions.js'
import { EmptyState, PageHeader, StatusBadge } from '../components/ui.jsx'

const initialForm = {
  name: '',
  productCategory: '',
  objective: '',
  minFollowers: '',
  maxFollowers: '',
  budget: '',
}

export function CampaignsPage() {
  const { role } = useRole()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyCampaignId, setBusyCampaignId] = useState('')

  useEffect(() => {
    let active = true
    apiRequest('/campaigns')
      .then(({ campaigns: items }) => {
        if (active) setCampaigns(items)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load campaigns.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const creatorType = categoryToCreatorType[form.productCategory]
  const isBrand = role === 'Brand'
  const title = role === 'Admin' ? 'Platform campaigns' : role === 'Creator' ? 'Open campaigns' : 'Campaigns'

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function createCampaign(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    const body = {
      ...form,
      minFollowers: Number(form.minFollowers),
      maxFollowers: Number(form.maxFollowers),
      budget: form.budget === '' ? null : Number(form.budget),
    }
    try {
      const { campaign } = await apiRequest('/campaigns', { method: 'POST', body })
      setCampaigns((current) => [campaign, ...current])
      setForm(initialForm)
      setShowForm(false)
    } catch (requestError) {
      setError(requestError.message || 'Could not create the campaign.')
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(campaign, status) {
    setError('')
    setBusyCampaignId(campaign.id)
    try {
      const { campaign: updated } = await apiRequest('/campaigns/' + campaign.id + '/status', {
        method: 'PATCH',
        body: { status },
      })
      setCampaigns((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch (requestError) {
      setError(requestError.message || 'Could not update campaign status.')
    } finally {
      setBusyCampaignId('')
    }
  }

  return <>
    <PageHeader
      eyebrow={role === 'Admin' ? 'Administration' : role === 'Creator' ? 'Marketplace' : 'Brand workspace'}
      title={title}
      description={role === 'Creator'
        ? 'Open campaigns are published by brands and ready for creator matching.'
        : role === 'Admin'
          ? 'Review campaigns stored in the marketplace.'
          : 'Create a campaign brief and set its product category and target follower range.'}
      action={isBrand ? 'Create campaign' : undefined}
      onAction={() => { setError(''); setShowForm(true) }}
    />

    {error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}

    {loading
      ? <p className="rounded-xl border border-slate-200/80 bg-white p-10 text-center text-xs text-slate-500">Loading campaigns...</p>
      : campaigns.length === 0
        ? <EmptyState
            title={role === 'Creator' ? 'No open campaigns yet' : 'No campaigns yet'}
            description={role === 'Brand' ? 'Create your first campaign. It will start as a draft, and you can publish it when it is ready.' : 'Campaigns will appear here after brands create them.'}
          />
        : <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">{campaigns.map((campaign) => <article key={campaign.id} className="rounded-xl border border-slate-200/80 bg-white p-5">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-sm font-semibold text-slate-900">{campaign.name}</h2>{role !== 'Brand' && campaign.brandName && <p className="mt-1 text-[10px] text-slate-500">{campaign.brandName}</p>}</div><StatusBadge status={campaign.status} /></div>
              <p className="mt-4 min-h-10 text-xs leading-5 text-slate-600">{campaign.objective}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div><dt className="text-[9px] text-slate-400">Product</dt><dd className="mt-1 text-[10px] font-medium text-slate-700">{campaign.productCategory}</dd></div>
                <div><dt className="text-[9px] text-slate-400">Creator type</dt><dd className="mt-1 text-[10px] font-medium text-violet-700">{campaign.creatorType}</dd></div>
                <div><dt className="text-[9px] text-slate-400">Follower range</dt><dd className="mt-1 text-[10px] font-medium text-slate-700">{campaign.minFollowers.toLocaleString()}–{campaign.maxFollowers.toLocaleString()}</dd></div>
                <div><dt className="text-[9px] text-slate-400">Budget</dt><dd className="mt-1 text-[10px] font-medium text-slate-700">{campaign.budget == null ? 'Not set' : campaign.budget.toLocaleString()}</dd></div>
              </dl>
              {isBrand && <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">{campaign.status === 'Draft' || campaign.status === 'Paused'
                ? <button disabled={busyCampaignId === campaign.id} onClick={() => changeStatus(campaign, 'Open')} className="rounded-lg bg-violet-50 px-3 py-2 text-[10px] font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50">Publish campaign</button>
                : <button disabled={busyCampaignId === campaign.id} onClick={() => changeStatus(campaign, 'Paused')} className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Pause campaign</button>}</div>}
            </article>)}</div>
            <p className="mt-4 px-1 text-[10px] text-slate-400">{campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'}</p>
          </>}

    {showForm && <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4" onClick={(event) => { if (event.target === event.currentTarget && !saving) setShowForm(false) }}>
      <form onSubmit={createCampaign} className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between"><div><h2 className="text-base font-semibold">Create campaign</h2><p className="mt-1 text-xs text-slate-500">The product category determines the target creator type.</p></div><button type="button" aria-label="Close form" disabled={saving} className="rounded-md p-1 text-slate-400 hover:bg-slate-100" onClick={() => setShowForm(false)}>×</button></div>
        <label className="mt-5 block text-[11px] font-medium">Campaign name<input name="name" required minLength="2" maxLength="100" value={form.name} onChange={updateForm} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs" /></label>
        <label className="mt-4 block text-[11px] font-medium">Product category<select name="productCategory" required value={form.productCategory} onChange={updateForm} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs"><option value="">Choose category</option>{campaignCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        {creatorType && <p className="mt-2 rounded-lg bg-violet-50 px-3 py-2 text-[10px] text-violet-800">Target creator type: <strong>{creatorType}</strong></p>}
        <label className="mt-4 block text-[11px] font-medium">Campaign brief<textarea name="objective" required minLength="2" maxLength="500" rows="3" value={form.objective} onChange={updateForm} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" /></label>
        <div className="mt-4 grid grid-cols-2 gap-3"><label className="text-[11px] font-medium">Minimum followers<input name="minFollowers" required min="0" step="1" type="number" value={form.minFollowers} onChange={updateForm} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs" /></label><label className="text-[11px] font-medium">Maximum followers<input name="maxFollowers" required min="0" step="1" type="number" value={form.maxFollowers} onChange={updateForm} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs" /></label></div>
        <label className="mt-4 block text-[11px] font-medium">Budget amount (optional)<input name="budget" min="0" step="0.01" type="number" value={form.budget} onChange={updateForm} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs" /></label>
        {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={saving} className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs" onClick={() => setShowForm(false)}>Cancel</button><button disabled={saving} className="rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save draft'}</button></div>
      </form>
    </div>}
  </>
}
