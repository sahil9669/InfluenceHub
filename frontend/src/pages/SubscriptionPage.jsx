import { useState } from 'react'
import { useRole } from '../context/useRole.js'
import { useToast } from '../context/useToast.js'
import { PageHeader } from '../components/ui.jsx'
import { Icon } from '../components/Icon.jsx'

const planDetails = {
  Starter: { price: '$0', cadence: 'forever', description: 'Explore creator partnerships and build your profile.', features: ['1 active campaign', 'Basic creator discovery', 'Standard support'] },
  Growth: { price: '$49', cadence: 'per month', description: 'Build a consistent creator program with more room to grow.', features: ['10 active campaigns', 'AI-powered creator recommendations', 'Campaign analytics', 'Priority support'] },
  Scale: { price: '$149', cadence: 'per month', description: 'Manage larger programs and multiple teams in one workspace.', features: ['Unlimited campaigns', 'Advanced audience insights', 'Team collaboration', 'Dedicated support'] },
}

export function SubscriptionPage() {
  const { role } = useRole()
  const { notify } = useToast()
  const [billing, setBilling] = useState('Monthly')
  const currentPlan = role === 'Admin' ? 'Platform administration' : 'Growth'
  const usage = [['Active campaigns', 2, 10], ['Creator invitations this month', 8, 50], ['Team seats', 3, 5]]

  return (
    <>
      <PageHeader eyebrow="Plans & billing" title={role === 'Creator' ? 'Creator plan' : 'Subscription'} description={role === 'Admin' ? 'Review the subscription plans available to marketplace members.' : 'Manage your plan, billing period, and current usage.'} action={role === 'Admin' ? undefined : 'Manage billing'} onAction={() => notify('Billing portal will be connected to a payment provider in the backend.')} />
      <section className="rounded-xl border border-violet-200 bg-gradient-to-br from-[#21183b] to-[#38226b] p-5 text-white sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200">{role === 'Admin' ? 'Platform tools' : 'Current plan'}</p><h2 className="mt-2 text-xl font-semibold">{currentPlan}</h2><p className="mt-1 text-xs text-violet-200/80">{role === 'Admin' ? 'Administrative subscription oversight' : 'Renews on July 12, 2026'}</p></div>{role !== 'Admin' && <div className="sm:text-right"><p className="text-2xl font-semibold">$49<span className="text-xs font-normal text-violet-200"> / month</span></p><p className="mt-1 text-[10px] text-violet-200">Next invoice: July 12, 2026</p></div>}</div>
        {role !== 'Admin' && <div className="mt-5 grid grid-cols-1 gap-3 border-t border-white/15 pt-4 sm:grid-cols-3">{usage.map(([label, used, total]) => <div key={label}><div className="flex justify-between text-[10px]"><span className="text-violet-100">{label}</span><span className="font-semibold">{used} / {total}</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-violet-300" style={{ width: `${(used / total) * 100}%` }} /></div></div>)}</div>}
      </section>

      <section className="mt-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-sm font-semibold text-slate-900">{role === 'Admin' ? 'Available plans' : 'Plans that grow with you'}</h2><p className="mt-1 text-[10px] text-slate-500">Choose features that fit your partnership workflow.</p></div><div className="flex rounded-lg border border-slate-200 bg-white p-1">{['Monthly', 'Annual'].map((option) => <button key={option} onClick={() => setBilling(option)} className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${billing === option ? 'bg-violet-50 text-violet-700' : 'text-slate-500'}`}>{option}{option === 'Annual' && <span className="ml-1 text-emerald-600">-15%</span>}</button>)}</div></div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">{Object.entries(planDetails).map(([name, plan]) => <article key={name} className={`rounded-xl border bg-white p-5 ${name === 'Growth' ? 'border-violet-300 shadow-md shadow-violet-100' : 'border-slate-200/80'}`}><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-900">{name}</h3>{name === 'Growth' && <span className="rounded-full bg-violet-50 px-2 py-1 text-[9px] font-semibold text-violet-700">POPULAR</span>}</div><p className="mt-2 text-[10px] leading-5 text-slate-500">{plan.description}</p><p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{billing === 'Annual' && name !== 'Starter' ? `$${Math.round(Number(plan.price.slice(1)) * 0.85)}` : plan.price}<span className="ml-1 text-[10px] font-normal text-slate-400">/ {name === 'Starter' ? plan.cadence : billing === 'Annual' ? 'month, billed annually' : plan.cadence}</span></p><ul className="mt-5 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex items-center gap-2 text-[10px] text-slate-600"><Icon name="check" size={13} className="text-emerald-600" />{feature}</li>)}</ul><button className={`mt-6 w-full rounded-lg py-2.5 text-[10px] font-semibold transition ${name === 'Growth' ? 'bg-violet-600 text-white hover:bg-violet-700' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`} onClick={() => notify(role === 'Admin' ? `${name} plan details opened.` : name === 'Growth' ? 'This is your current plan.' : `Plan changes will be handled through billing integration.`)}>{role === 'Admin' ? 'View plan' : name === 'Growth' ? 'Current plan' : name === 'Starter' ? 'Downgrade plan' : 'Upgrade plan'}</button></article>)}</div>
      </section>
      <p className="mt-5 text-center text-[10px] text-slate-400">Plan prices, usage, billing actions, and dates are illustrative. Payment and subscription management will be implemented in the backend.</p>
    </>
  )
}
