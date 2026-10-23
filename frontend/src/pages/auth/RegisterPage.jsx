import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRole } from '../../context/useRole.js'

const accountTypes = [
  { value: 'Creator', title: 'Creator', description: 'Find campaigns that fit your content and audience.' },
  { value: 'Brand', title: 'Brand', description: 'Create campaigns and discover relevant creators.' },
]

export function RegisterPage() {
  const { register } = useRole()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Creator')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) return setError('Passwords do not match.')
    setBusy(true)
    try {
      await register({ name, email, password, role })
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className="min-h-screen bg-[#f7f8fc] px-5 py-10"><div className="mx-auto max-w-xl"><Link to="/login" className="text-lg font-bold tracking-tight text-slate-900">influence<span className="text-violet-600">hub</span></Link><div className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-700">Create your account</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Join the marketplace</h1><p className="mt-2 text-xs leading-5 text-slate-500">Choose Creator or Brand. Admin accounts are created privately and cannot register here.</p>
      <form onSubmit={submit} className="mt-6 space-y-4"><fieldset><legend className="text-[11px] font-medium text-slate-700">I am joining as a</legend><div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">{accountTypes.map((item) => <button key={item.value} type="button" role="radio" aria-checked={role === item.value} onClick={() => setRole(item.value)} className={`rounded-xl border p-4 text-left transition ${role === item.value ? 'border-violet-300 bg-violet-50/70 ring-1 ring-violet-200' : 'border-slate-200 hover:border-violet-200'}`}><span className="block text-xs font-semibold text-slate-800">{item.title}</span><span className="mt-1 block text-[10px] leading-4 text-slate-500">{item.description}</span></button>)}</div></fieldset>
        <label className="block text-[11px] font-medium text-slate-700">Full name<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-violet-400" placeholder="Your name" /></label>
        <label className="block text-[11px] font-medium text-slate-700">Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-violet-400" placeholder="you@example.com" /></label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="block text-[11px] font-medium text-slate-700">Password<input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-violet-400" /></label><label className="block text-[11px] font-medium text-slate-700">Confirm password<input required type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-violet-400" /></label></div>
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}<button disabled={busy} className="h-11 w-full rounded-lg bg-violet-600 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60">{busy ? 'Creating account...' : `Create ${role} account`}</button>
      </form><p className="mt-6 text-center text-xs text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-violet-700 hover:text-violet-900">Sign in</Link></p>
    </div></div></main>
}
