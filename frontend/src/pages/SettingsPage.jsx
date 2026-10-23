import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client.js'
import { useRole } from '../context/useRole.js'
import { EmptyState, PageHeader, Avatar } from '../components/ui.jsx'
import { creatorTypes } from '../data/marketplaceOptions.js'

const emptyCreatorProfile = {
  creatorName: '',
  influencerType: '',
  instagramUsername: '',
  website: '',
  bio: '',
}
const emptyBrandProfile = {
  organizationName: '',
  website: '',
  bio: '',
}

export function SettingsPage() {
  const { role, user } = useRole()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(role !== 'Admin')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const isCreator = role === 'Creator'
  const isAdmin = role === 'Admin'
  const values = profile || (isCreator ? emptyCreatorProfile : emptyBrandProfile)
  const name = user?.name || 'Account name unavailable'
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  useEffect(() => {
    if (isAdmin) return undefined
    let active = true
    apiRequest('/profiles/me')
      .then(({ profile: currentProfile }) => {
        if (active) setProfile(currentProfile)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load your profile.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [isAdmin])

  async function saveProfile(event) {
    event.preventDefault()
    setError('')
    setSaved(false)
    setSaving(true)
    const body = isCreator
      ? {
          creatorName: values.creatorName,
          influencerType: values.influencerType,
          instagramUsername: values.instagramUsername,
          website: values.website,
          bio: values.bio,
        }
      : {
          organizationName: values.organizationName,
          website: values.website,
          bio: values.bio,
        }

    try {
      const result = await apiRequest('/profiles/me', { method: 'PUT', body })
      setProfile(result.profile)
      setSaved(true)
    } catch (requestError) {
      setError(requestError.message || 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  function updateField(event) {
    setProfile((current) => ({
      ...(current || (isCreator ? emptyCreatorProfile : emptyBrandProfile)),
      [event.target.name]: event.target.value,
    }))
    setSaved(false)
  }

  return <>
    <PageHeader eyebrow="Account" title="Settings" description="Manage your marketplace profile. Your account identity is managed separately." />
    <section className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-slate-900">Account</h2>
      <div className="mt-5 flex items-center gap-3"><Avatar initials={initials} size="h-12 w-12" /><div><p className="text-xs font-semibold text-slate-800">{name}</p><p className="mt-1 text-[10px] text-slate-500">{role} account</p></div></div>
      <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <div><dt className="text-[10px] font-medium text-slate-500">Email address</dt><dd className="mt-1 text-xs text-slate-800">{user?.email || 'Unavailable'}</dd></div>
        <div><dt className="text-[10px] font-medium text-slate-500">Account type</dt><dd className="mt-1 text-xs text-slate-800">{role}</dd></div>
      </dl>
    </section>

    {isAdmin
      ? <div className="mt-5"><EmptyState title="No admin profile settings" description="Admin accounts manage the platform and do not have a Creator or Brand marketplace profile." /></div>
      : <form onSubmit={saveProfile} className="mt-5 rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <div className="border-b border-slate-100 pb-4"><h2 className="text-sm font-semibold text-slate-900">{isCreator ? 'Creator profile' : 'Brand profile'}</h2><p className="mt-1 text-[10px] text-slate-500">{isCreator ? 'Choose one main content category and add your public Instagram username.' : 'Add the organization information brands will use on the marketplace.'}</p></div>
          {loading ? <p className="py-8 text-center text-xs text-slate-500">Loading profile...</p> : <>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isCreator ? <>
                <label className="text-[10px] font-medium text-slate-600">Creator or business name<input name="creatorName" maxLength="100" value={values.creatorName || ''} onChange={updateField} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs" /></label>
                <label className="text-[10px] font-medium text-slate-600">Creator type<select name="influencerType" required value={values.influencerType || ''} onChange={updateField} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs"><option value="" disabled>Choose your main type</option>{creatorTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select><span className="mt-1 block text-[9px] text-slate-400">Choose one type. Gym and nutrition creators can select Fitness.</span></label>
                <label className="text-[10px] font-medium text-slate-600">Instagram username<input name="instagramUsername" maxLength="30" value={values.instagramUsername || ''} onChange={updateField} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs" placeholder="yourusername" /><span className="mt-1 block text-[9px] text-slate-400">Follower count will appear after Instagram integration is implemented.</span></label>
                <div className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-700">Instagram followers</p><p className="mt-1 text-[10px] text-slate-500">{profile?.instagramFollowerCount == null ? 'Not synced' : Number(profile.instagramFollowerCount).toLocaleString()}</p></div>
              </> : <label className="text-[10px] font-medium text-slate-600 sm:col-span-2">Organization name<input name="organizationName" required minLength="2" maxLength="120" value={values.organizationName || ''} onChange={updateField} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs" /></label>}
              <label className="text-[10px] font-medium text-slate-600">Website<input name="website" type="url" maxLength="200" value={values.website || ''} onChange={updateField} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs" placeholder="https://example.com" /></label>
              <label className="text-[10px] font-medium text-slate-600 sm:col-span-2">About<textarea name="bio" rows="4" maxLength="400" value={values.bio || ''} onChange={updateField} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs leading-5" /><span className="mt-1 block text-right text-[9px] text-slate-400">{(values.bio || '').length}/400</span></label>
            </div>
            {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
            {saved && <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">Profile saved.</p>}
            <div className="mt-4 flex justify-end border-t border-slate-100 pt-4"><button disabled={saving} className="rounded-lg bg-violet-600 px-4 py-2.5 text-[11px] font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save profile'}</button></div>
          </>}
        </form>}
  </>
}
