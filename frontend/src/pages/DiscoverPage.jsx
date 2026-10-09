import { useMemo, useState } from 'react'
import { brandProfiles, creatorProfiles } from '../data/demoData.js'
import { useRole } from '../context/useRole.js'
import { useToast } from '../context/useToast.js'
import { Avatar, PageHeader } from '../components/ui.jsx'
import { Icon } from '../components/Icon.jsx'

export function DiscoverPage() {
  const { role } = useRole()
  const { notify } = useToast()
  const [query, setQuery] = useState('')
  const [niche, setNiche] = useState('All categories')
  const [minFollowers, setMinFollowers] = useState('Any audience size')
  const [invited, setInvited] = useState([])
  const profiles = role === 'Creator' ? brandProfiles : creatorProfiles
  const isCreatorDiscovery = role === 'Creator'
  const categories = ['All categories', ...new Set(profiles.map((profile) => profile.niche))]

  const filtered = useMemo(() => profiles.filter((profile) => {
    const searchMatch = `${profile.name} ${profile.handle} ${profile.niche} ${profile.bio}`.toLowerCase().includes(query.toLowerCase())
    const categoryMatch = niche === 'All categories' || profile.niche === niche
    const followersMatch = isCreatorDiscovery || minFollowers === 'Any audience size' || profile.followers >= Number(minFollowers)
    return searchMatch && categoryMatch && followersMatch
  }), [profiles, query, niche, minFollowers, isCreatorDiscovery])

  function sendInvite(id, name) {
    setInvited((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    notify(`${isCreatorDiscovery ? 'Interest sent to' : 'Invitation sent to'} ${name}.`)
  }

  return (
    <>
      <PageHeader eyebrow={isCreatorDiscovery ? 'Creator opportunities' : 'AI-powered discovery'} title={isCreatorDiscovery ? 'Find your next brand partner' : 'Discover creators'} description={isCreatorDiscovery ? 'Explore brands that align with your audience, values, and content.' : 'Find creators who can bring your brand and campaigns to life.'} />
      <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-slate-200/80 bg-white p-4 sm:grid-cols-[1fr_190px_190px_auto] sm:items-center">
        <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3"><Icon name="search" size={15} className="text-slate-400" /><input aria-label="Search profiles" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names, niches, or keywords..." className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400" /></label>
        <select aria-label="Filter by category" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-violet-300" value={niche} onChange={(event) => setNiche(event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
        {!isCreatorDiscovery && <select aria-label="Filter by audience size" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-violet-300" value={minFollowers} onChange={(event) => setMinFollowers(event.target.value)}><option>Any audience size</option><option value="50000">50K+ followers</option><option value="100000">100K+ followers</option></select>}
        <div className="hidden items-center justify-center gap-1.5 px-2 text-[10px] font-medium text-violet-700 sm:flex"><Icon name="sparkles" size={14} /> AI ranked</div>
      </div>

      <div className="mb-4 flex items-center justify-between"><p className="text-xs text-slate-500"><span className="font-semibold text-slate-800">{filtered.length}</span> {isCreatorDiscovery ? 'brand opportunities' : 'creator matches'}</p><button className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800" onClick={() => { setQuery(''); setNiche('All categories'); setMinFollowers('Any audience size') }}><Icon name="filter" size={14} />Reset filters</button></div>

      {filtered.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center"><p className="text-sm font-semibold text-slate-800">No matches found</p><p className="mt-1 text-xs text-slate-500">Try a different search term or broaden your filters.</p></div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((person) => <article key={person.id} className="rounded-xl border border-slate-200/80 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md">
          <div className="flex items-start gap-3"><Avatar initials={person.avatar} color={person.color} size="h-12 w-12" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h2 className="truncate text-sm font-semibold text-slate-900">{person.name}</h2><span className="flex shrink-0 items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700"><Icon name="sparkles" size={12} />{person.score}%</span></div><p className="mt-1 text-[10px] text-slate-500">{person.handle} · {person.location}</p></div></div>
          <p className="mt-4 min-h-10 text-xs leading-5 text-slate-600">{person.bio}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 border-y border-slate-100 py-3">
            <div><p className="text-[9px] text-slate-400">{isCreatorDiscovery ? 'Focus' : 'Followers'}</p><p className="mt-1 text-[11px] font-semibold text-slate-700">{isCreatorDiscovery ? person.followers : `${(person.followers / 1000).toFixed(1)}K`}</p></div>
            <div><p className="text-[9px] text-slate-400">Category</p><p className="mt-1 text-[11px] font-semibold text-slate-700">{person.niche}</p></div>
            <div><p className="text-[9px] text-slate-400">{isCreatorDiscovery ? 'Partner fit' : 'Engagement'}</p><p className="mt-1 text-[11px] font-semibold text-slate-700">{isCreatorDiscovery ? 'Excellent' : `${person.engagement}%`}</p></div>
          </div>
          <div className="mt-4 flex gap-2"><button className="flex-1 rounded-lg border border-slate-200 py-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50" onClick={() => notify(`${person.name}'s full profile will be available when profile APIs are connected.`)}>View profile</button><button className={`flex-1 rounded-lg py-2.5 text-[11px] font-semibold transition ${invited.includes(person.id) ? 'bg-emerald-50 text-emerald-700' : 'bg-violet-600 text-white hover:bg-violet-700'}`} onClick={() => sendInvite(person.id, person.name)}>{invited.includes(person.id) ? 'Request sent' : isCreatorDiscovery ? 'Express interest' : 'Invite to campaign'}</button></div>
        </article>)}
      </div>}
      <p className="mt-6 text-center text-[10px] text-slate-400">Sample discovery profiles for frontend development. Match scores will be provided by the recommendation service.</p>
    </>
  )
}
