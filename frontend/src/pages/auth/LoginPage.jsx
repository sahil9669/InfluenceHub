import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useRole } from '../../context/useRole.js'

export function LoginPage() {
  const { login } = useRole()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login({ email, password })
      navigate(location.state?.from || '/', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className="grid min-h-screen bg-[#f7f8fc] lg:grid-cols-[1fr_0.9fr]">
    <section className="hidden flex-col justify-between bg-gradient-to-br from-[#21183b] via-[#38226b] to-violet-700 p-10 text-white lg:flex"><Link to="/login" className="text-xl font-bold tracking-tight">influence<span className="text-violet-300">hub</span></Link><div className="max-w-lg"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">Creator partnerships</p><h1 className="mt-4 text-4xl font-semibold leading-tight">Find the right people for the right campaign.</h1><p className="mt-4 text-sm leading-6 text-violet-100">Campaign categories, creator types, and audience size come together in one workspace.</p></div><p className="text-[10px] text-violet-200">INFLUENCEHUB · CONNECT BETTER</p></section>
    <section className="flex items-center justify-center px-5 py-12"><div className="w-full max-w-md"><Link to="/login" className="text-lg font-bold tracking-tight text-slate-900 lg:hidden">influence<span className="text-violet-600">hub</span></Link><div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 lg:mt-0"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-700">Welcome back</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Sign in to InfluenceHub</h2><p className="mt-2 text-xs leading-5 text-slate-500">Brand, Creator, and private Admin accounts use this sign-in form.</p>
      <form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-[11px] font-medium text-slate-700">Email address<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-violet-400" placeholder="you@example.com" /></label><label className="block text-[11px] font-medium text-slate-700">Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-violet-400" placeholder="Your password" /></label>{error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}<button disabled={busy} className="h-11 w-full rounded-lg bg-violet-600 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60">{busy ? 'Signing in...' : 'Sign in'}</button></form>
      <p className="mt-6 text-center text-xs text-slate-500">New to InfluenceHub? <Link to="/register" className="font-semibold text-violet-700 hover:text-violet-900">Create an account</Link></p>
    </div></div></section>
  </main>
}
