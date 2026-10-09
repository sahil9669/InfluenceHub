import { useState } from 'react'
import { useRole } from '../context/useRole.js'
import { useToast } from '../context/useToast.js'
import { Avatar, PageHeader } from '../components/ui.jsx'

const values = {
  Brand: { name: 'Olivia Rhye', email: 'olivia@studionorth.example', company: 'Studio North', website: 'https://studionorth.example', bio: 'Independent essentials designed for people who buy less and choose well.' },
  Creator: { name: 'Sofia Chen', email: 'sofia.creator@example', company: 'Sofia Makes', website: 'https://social.example/sofiamakes', bio: 'Conscious style, everyday rituals, and outfits that feel like you.' },
  Admin: { name: 'Jordan Lee', email: 'jordan.admin@example', company: 'InfluenceHub', website: 'https://influencehub.example', bio: 'Platform administration account.' },
}

export function SettingsPage() {
  const { role } = useRole()
  const { notify } = useToast()
  const profile = values[role]
  const [form, setForm] = useState(profile)
  const [emailUpdates, setEmailUpdates] = useState(true)
  const [messageAlerts, setMessageAlerts] = useState(true)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function saveSettings(event) {
    event.preventDefault()
    notify('Settings saved for this session. Profile persistence will be added with the backend.')
  }

  return (
    <>
      <PageHeader eyebrow="Account" title="Settings" description="Manage your profile, account preferences, and notifications." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200/80 bg-white p-2 xl:flex-col xl:self-start">
          {['Profile', 'Notifications', 'Privacy & account'].map((item, index) => <a key={item} href={`#${index === 0 ? 'profile' : index === 1 ? 'notifications' : 'privacy'}`} className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-[11px] font-medium ${index === 0 ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-50'}`}>{item}</a>)}
        </nav>
        <div className="space-y-5">
          <form id="profile" onSubmit={saveSettings} className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <div className="border-b border-slate-100 pb-4"><h2 className="text-sm font-semibold text-slate-900">Public profile</h2><p className="mt-1 text-[10px] text-slate-500">Information shown to potential collaboration partners.</p></div>
            <div className="flex items-center gap-3 py-5"><Avatar initials={role === 'Brand' ? 'SN' : role === 'Creator' ? 'SC' : 'JL'} size="h-12 w-12" /><div><p className="text-xs font-semibold text-slate-800">{form.name}</p><button type="button" className="mt-1 text-[10px] font-semibold text-violet-700" onClick={() => notify('Profile photo upload will be connected to file storage.')}>Change profile photo</button></div></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[['name', 'Full name'], ['email', 'Email address'], ['company', role === 'Creator' ? 'Creator / business name' : 'Organization'], ['website', 'Website or social profile']].map(([name, label]) => <label key={name} className="text-[10px] font-medium text-slate-600">{label}<input name={name} value={form[name]} onChange={updateField} type={name === 'email' ? 'email' : 'text'} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-800 outline-none focus:border-violet-400" /></label>)}
              <label className="text-[10px] font-medium text-slate-600 sm:col-span-2">About<textarea name="bio" rows="3" value={form.bio} onChange={updateField} maxLength="400" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs leading-5 text-slate-800 outline-none focus:border-violet-400" /><span className="mt-1 block text-right text-[9px] text-slate-400">{form.bio.length}/400</span></label>
            </div>
            <div className="mt-2 flex justify-end border-t border-slate-100 pt-4"><button className="rounded-lg bg-violet-600 px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-violet-700">Save changes</button></div>
          </form>

          <section id="notifications" className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6"><div className="border-b border-slate-100 pb-4"><h2 className="text-sm font-semibold text-slate-900">Notifications</h2><p className="mt-1 text-[10px] text-slate-500">Choose which updates you want to receive.</p></div>
            {[['Email updates', 'Campaigns, invitations, and important account activity.', emailUpdates, setEmailUpdates], ['Messages', 'When a brand or creator sends you a message.', messageAlerts, setMessageAlerts]].map(([label, help, checked, setter]) => <label key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0"><span><span className="block text-[11px] font-medium text-slate-800">{label}</span><span className="mt-1 block text-[10px] text-slate-500">{help}</span></span><input type="checkbox" checked={checked} onChange={(event) => setter(event.target.checked)} className="h-4 w-4 accent-violet-600" /></label>)}
          </section>

          <section id="privacy" className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6"><h2 className="text-sm font-semibold text-slate-900">Privacy & account</h2><p className="mt-1 text-[10px] text-slate-500">Account controls and data permissions will be connected to authentication and privacy services.</p><button className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-50" onClick={() => notify('Account export will be available after backend implementation.')}>Request my data</button></section>
        </div>
      </div>
    </>
  )
}
