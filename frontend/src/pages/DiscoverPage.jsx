import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../api/client.js'
import { useRole } from '../context/useRole.js'
import { EmptyState, PageHeader } from '../components/ui.jsx'
import { Icon } from '../components/Icon.jsx'

export function DiscoverPage() {
  const { role } = useRole()
  const [campaigns, setCampaigns] = useState([])
  const [creators, setCreators] = useState([])
  const [applications, setApplications] = useState([])
  const [campaignId, setCampaignId] = useState('')
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(role !== 'Admin')
  const [error, setError] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [submittingApplication, setSubmittingApplication] = useState(false)
  const [applicationError, setApplicationError] = useState('')
  const isCreator = role === 'Creator'
  const isBrand = role === 'Brand'

  useEffect(() => {
    if (!isCreator && !isBrand) return undefined
    let active = true
    setLoading(true)
    setError('')
    if (isCreator) {
      Promise.all([apiRequest('/recommendations/campaigns'), apiRequest('/applications')])
        .then(([recommendationResult, applicationResult]) => {
          if (!active) return
          setCampaigns(recommendationResult.recommendations.map((item) => ({ ...item.campaign, matchScore: item.score })))
          setSource(recommendationResult.source)
          setApplications(applicationResult.applications)
        })
        .catch((requestError) => { if (active) setError(requestError.message || 'Could not load campaign recommendations.') })
        .finally(() => { if (active) setLoading(false) })
    } else {
      apiRequest('/campaigns')
        .then(({ campaigns: items }) => {
          if (!active) return
          setCampaigns(items)
          const initialCampaign = items.find((item) => item.status === 'Open') || items[0]
          setCampaignId(initialCampaign?.id || '')
          if (!initialCampaign) setLoading(false)
        })
        .catch((requestError) => { if (active) { setError(requestError.message || 'Could not load your campaigns.'); setLoading(false) } })
    }
    return () => { active = false }
  }, [isCreator, isBrand])

  useEffect(() => {
    if (!isBrand || !campaignId) return undefined
    let active = true
    setLoading(true)
    setError('')
    apiRequest(`/recommendations/creators?campaignId=${encodeURIComponent(campaignId)}`)
      .then(({ recommendations, source: resultSource }) => {
        if (!active) return
        setCreators(recommendations.map((item) => ({ ...item.creator, matchScore: item.score })))
        setSource(resultSource)
      })
      .catch((requestError) => { if (active) { setError(requestError.message || 'Could not load creator recommendations.'); setCreators([]) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [isBrand, campaignId])

  async function submitApplication(event) {
    event.preventDefault()
    setApplicationError('')
    setSubmittingApplication(true)
    try {
      const { application } = await apiRequest('/applications', {
        method: 'POST',
        body: { campaignId: selectedCampaign.id, message: applicationMessage },
      })
      setApplications((current) => [application, ...current])
      setSelectedCampaign(null)
      setApplicationMessage('')
    } catch (requestError) {
      setApplicationError(requestError.message || 'Could not send your application.')
    } finally {
      setSubmittingApplication(false)
    }
  }

  const applicationByCampaign = new Map(applications.map((application) => [application.campaign?.id, application]))

  return <>
    <PageHeader
      eyebrow={isCreator ? 'Two-tower recommendations' : isBrand ? 'Two-tower recommendations' : 'Administration'}
      title={isCreator ? 'Campaign matches' : isBrand ? 'Creator matches' : 'Marketplace recommendations'}
      description={isCreator
        ? 'Campaigns are ranked using your creator type and available audience details.'
        : isBrand
          ? 'Choose a campaign to see creators ranked for its category and target audience.'
          : 'Recommendations are available to Brand and Creator accounts.'}
    />
    {isBrand && campaigns.length > 0 && <label className="mb-5 block max-w-xl text-xs font-semibold text-slate-700">Campaign<select value={campaignId} onChange={(event) => setCampaignId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="" disabled>Select a campaign</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name} · {campaign.status}</option>)}</select></label>}
    {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}{isCreator && error.includes('Complete your creator profile') && <> <Link to="/settings" className="font-semibold underline">Complete your profile</Link>.</>}</p>}
    {source && <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[11px] font-medium text-violet-800"><Icon name="sparkles" size={14} />{source === 'two_tower' ? 'Ranked by the trained two-tower model' : 'Cold-start ranking · category and available audience fit'}</p>}
    {loading
      ? <p className="rounded-xl border border-slate-200/80 bg-white p-10 text-center text-xs text-slate-500">Finding your best matches...</p>
      : isCreator
        ? campaigns.length === 0
          ? <EmptyState title="No open campaigns yet" description="Published campaigns from brands will appear here when they match your marketplace profile." />
          : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">{campaigns.map((campaign) => {
              const existingApplication = applicationByCampaign.get(campaign.id)
              return <article key={campaign.id} className="rounded-xl border border-slate-200/80 bg-white p-5">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-sm font-semibold text-slate-900">{campaign.name}</h2><Link to={'/profiles/' + campaign.brandId} className="mt-1 inline-block text-[11px] text-violet-700 hover:underline">{campaign.brandName || 'View Brand profile'}</Link></div><span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-800">{Math.round(campaign.matchScore * 100)}% match</span></div>
                <p className="mt-4 min-h-10 text-xs leading-5 text-slate-600">{campaign.objective}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3"><div><dt className="text-[10px] text-slate-400">Product</dt><dd className="mt-1 text-[11px] font-medium text-slate-700">{campaign.productCategory}</dd></div><div><dt className="text-[10px] text-slate-400">Creator type</dt><dd className="mt-1 text-[11px] font-medium text-violet-700">{campaign.creatorType}</dd></div><div><dt className="text-[10px] text-slate-400">Follower range</dt><dd className="mt-1 text-[11px] font-medium text-slate-700">{campaign.minFollowers.toLocaleString()}–{campaign.maxFollowers.toLocaleString()}</dd></div><div><dt className="text-[10px] text-slate-400">Budget</dt><dd className="mt-1 text-[11px] font-medium text-slate-700">{campaign.budget == null ? 'Not set' : campaign.budget.toLocaleString()}</dd></div></dl>
                <div className="mt-4 border-t border-slate-100 pt-3">{existingApplication ? <div className="flex items-center justify-between"><span className="text-[11px] text-slate-500">Application sent</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">{existingApplication.status}</span></div> : <button onClick={() => { setSelectedCampaign(campaign); setApplicationError('') }} className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-700">Apply to campaign</button>}</div>
              </article>
            })}</div>
        : isBrand
          ? campaigns.length === 0
            ? <EmptyState title="Create a campaign to get matches" description="Once you create a campaign, InfluenceHub can rank creators for its target creator type and follower range." />
            : !loading && creators.length === 0 && !error
              ? <EmptyState title="No creator profiles available yet" description="Creators with saved marketplace profiles will appear here as candidates." />
              : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">{creators.map((creator) => <article key={creator.id} className="rounded-xl border border-slate-200/80 bg-white p-5">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-sm font-semibold text-slate-900">{creator.profile?.creatorName || creator.accountName}</h2><p className="mt-1 truncate text-[11px] text-slate-500">{creator.profile?.instagramUsername ? '@' + creator.profile.instagramUsername : creator.accountName}</p></div><span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-800">{Math.round(creator.matchScore * 100)}% match</span></div>
                  <p className="mt-4 min-h-10 text-xs leading-5 text-slate-600">{creator.profile?.bio || 'No creator bio added.'}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-[11px] text-slate-500">{creator.profile?.influencerType} · {creator.profile?.instagramFollowerCount == null ? 'Followers not synced' : creator.profile.instagramFollowerCount.toLocaleString() + ' followers'}</span><Link to={'/profiles/' + creator.id} className="shrink-0 text-[11px] font-semibold text-violet-700 hover:underline">View profile</Link></div>
                </article>)}</div>
          : <EmptyState title="Use a Brand or Creator account" description="Admin accounts do not participate in marketplace recommendations." />}

    {selectedCampaign && <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4" onClick={(event) => { if (event.target === event.currentTarget && !submittingApplication) setSelectedCampaign(null) }}>
      <form onSubmit={submitApplication} className="my-8 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">Campaign application</p><h2 className="mt-2 text-lg font-bold text-slate-900">{selectedCampaign.name}</h2><p className="mt-1 text-xs text-slate-500">Tell the Brand why you’re a good fit.</p></div><button type="button" disabled={submittingApplication} aria-label="Close application" onClick={() => setSelectedCampaign(null)} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">×</button></div>
        <label className="mt-5 block text-xs font-semibold text-slate-700">Your message<textarea autoFocus required minLength={2} maxLength={1000} rows={5} value={applicationMessage} onChange={(event) => setApplicationMessage(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal leading-6" placeholder="Share how your content and audience fit this campaign." /></label>
        <div className="mt-1 text-right text-[11px] text-slate-400">{applicationMessage.length}/1000</div>
        {applicationError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{applicationError}{applicationError.includes('Complete your creator profile') && <> <Link to="/settings" onClick={() => setSelectedCampaign(null)} className="font-semibold underline">Complete your profile</Link>.</>}</p>}
        <div className="mt-5 flex justify-end gap-2"><button type="button" disabled={submittingApplication} onClick={() => setSelectedCampaign(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600">Cancel</button><button disabled={submittingApplication || applicationMessage.trim().length < 2} className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{submittingApplication ? 'Sending...' : 'Send application'}</button></div>
      </form>
    </div>}
  </>
}
