import { useRole } from '../context/useRole.js'
import { PageHeader } from '../components/ui.jsx'
import { Icon } from '../components/Icon.jsx'

const features = [
  ['Campaign and creator matching', 'Recommendations will use creator type, audience size, and the matching model.'],
  ['Campaign applications', 'Creators and brands will connect through campaign-specific applications.'],
  ['Brand and creator messaging', 'Campaign conversations will be available in a shared inbox.'],
]

export function SubscriptionPage() {
  const { role } = useRole()
  const isAdmin = role === 'Admin'
  return <>
    <PageHeader eyebrow={isAdmin ? 'Platform settings' : 'Plans & billing'} title={isAdmin ? 'Trial and plan settings' : 'Your subscription'} description={isAdmin ? 'Trial limits and subscription terms are not configured yet.' : 'Trial access and subscription plans are not configured yet.'} />
    <section className="rounded-xl border border-violet-200 bg-gradient-to-br from-[#21183b] to-[#38226b] p-6 text-white sm:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200">{isAdmin ? 'Platform billing' : 'Plan setup pending'}</p>
      <h2 className="mt-2 text-xl font-semibold">{isAdmin ? 'Configure trial rules' : 'Billing is not enabled'}</h2>
      <p className="mt-2 max-w-2xl text-xs leading-5 text-violet-100">{isAdmin ? 'Trial length, free-use limits, and subscription prices must be configured before launch.' : 'No free-trial allowance, subscription price, or payment flow is active yet.'}</p>
      <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-[10px] font-medium text-white"><Icon name="check" size={14} /> Billing setup pending</div>
    </section>
    <section className="mt-7"><h2 className="text-sm font-semibold text-slate-900">Planned platform features</h2><div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">{features.map(([title, detail]) => <article key={title} className="rounded-xl border border-slate-200/80 bg-white p-5"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700"><Icon name="check" size={16} /></span><h3 className="mt-4 text-xs font-semibold text-slate-800">{title}</h3><p className="mt-2 text-[10px] leading-5 text-slate-500">{detail}</p></article>)}</div></section>
  </>
}
