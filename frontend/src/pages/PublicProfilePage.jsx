import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiRequest } from '../api/client.js'
import { Avatar, EmptyState, PageHeader } from '../components/ui.jsx'

export function PublicProfilePage() {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    apiRequest('/profiles/' + userId)
      .then(({ profile: result }) => {
        if (active) setProfile(result)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load this profile.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [userId])

  if (loading) return <p className="rounded-xl border border-slate-200/80 bg-white p-10 text-center text-xs text-slate-500">Loading profile...</p>
  if (error || !profile) return <><PageHeader eyebrow="Marketplace profile" title="Profile unavailable" description={error || 'This profile could not be found.'} /><Link to="/discover" className="text-xs font-semibold text-violet-700 hover:underline">Back to Discover</Link></>

  const details = profile.profile
  const isCreator = profile.role === 'Creator'
  const displayName = isCreator
    ? details?.creatorName || profile.accountName
    : details?.organizationName || profile.accountName
  const initials = displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const website = details?.website

  return <>
    <PageHeader eyebrow={profile.role + ' profile'} title={displayName} description={isCreator ? 'Creator marketplace profile' : 'Brand marketplace profile'} />
    <section className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-7">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-5"><Avatar initials={initials} size="h-14 w-14" /><div><h2 className="text-sm font-semibold text-slate-900">{displayName}</h2><p className="mt-1 text-[10px] text-slate-500">{profile.role}{isCreator && details?.instagramUsername ? ' · @' + details.instagramUsername : ''}</p></div></div>
      {!details
        ? <div className="mt-5"><EmptyState title="Profile details haven’t been added" description="This account has not saved its marketplace profile yet." /></div>
        : <>
            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {isCreator
                ? <>
                    <div><dt className="text-[10px] text-slate-400">Creator type</dt><dd className="mt-1 text-xs font-medium text-slate-800">{details.influencerType}</dd></div>
                    <div><dt className="text-[10px] text-slate-400">Instagram followers</dt><dd className="mt-1 text-xs font-medium text-slate-800">{details.instagramFollowerCount == null ? 'Not synced' : details.instagramFollowerCount.toLocaleString()}</dd></div>
                  </>
                : <div><dt className="text-[10px] text-slate-400">Organization</dt><dd className="mt-1 text-xs font-medium text-slate-800">{details.organizationName}</dd></div>}
              {website && <div><dt className="text-[10px] text-slate-400">Website</dt><dd className="mt-1 text-xs"><a href={website} target="_blank" rel="noreferrer" className="font-medium text-violet-700 hover:underline">{website}</a></dd></div>}
              {isCreator && details.instagramUsername && <div><dt className="text-[10px] text-slate-400">Instagram</dt><dd className="mt-1 text-xs"><a href={'https://www.instagram.com/' + details.instagramUsername + '/'} target="_blank" rel="noreferrer" className="font-medium text-violet-700 hover:underline">@{details.instagramUsername}</a></dd></div>}
            </dl>
            {details.bio && <div className="mt-6 border-t border-slate-100 pt-5"><h3 className="text-[10px] font-semibold text-slate-500">About</h3><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-700">{details.bio}</p></div>}
          </>}
    </section>
    <Link to="/discover" className="mt-5 inline-block text-xs font-semibold text-violet-700 hover:underline">Back to Discover</Link>
  </>
}
