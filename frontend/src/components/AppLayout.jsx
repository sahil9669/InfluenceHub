import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useRole } from '../context/useRole.js'
import { useToast } from '../context/useToast.js'
import { Avatar } from './ui.jsx'
import { Icon } from './Icon.jsx'

const navigation = {
  Brand: [['Overview', '/', 'overview'], ['Discover creators', '/discover', 'discover'], ['Applications', '/applications', 'inbox'], ['Campaigns', '/campaigns', 'campaigns'], ['Collaborations', '/collaborations', 'check'], ['Inbox', '/inbox', 'inbox'], ['Analytics', '/analytics', 'analytics'], ['Reviews & ratings', '/reviews', 'sparkles'], ['Subscription', '/subscription', 'overview']],
  Creator: [['Overview', '/', 'overview'], ['Campaign matches', '/discover', 'discover'], ['Applications', '/applications', 'inbox'], ['Collaborations', '/collaborations', 'campaigns'], ['Inbox', '/inbox', 'inbox'], ['My analytics', '/analytics', 'analytics'], ['Reviews & ratings', '/reviews', 'sparkles'], ['Creator plan', '/subscription', 'overview']],
  Admin: [['Overview', '/', 'overview'], ['Members', '/members', 'discover'], ['Campaigns', '/campaigns', 'campaigns'], ['Collaborations', '/collaborations', 'check'], ['Support inbox', '/inbox', 'inbox'], ['Platform analytics', '/analytics', 'analytics']],
}

export function AppLayout() {
  const { role, user, logout } = useRole()
  const { notify } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const links = navigation[role] || navigation.Brand
  const name = user?.name || 'InfluenceHub user'
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const workspace = role === 'Admin' ? 'Platform administration' : role === 'Creator' ? 'Creator account' : 'Brand account'
  const pageNames = { '/reviews': 'Reviews & ratings', '/subscription': role === 'Creator' ? 'Creator plan' : 'Subscription', '/settings': 'Settings', '/members': 'Members', '/applications': 'Applications', '/collaborations': 'Collaborations' }
  const pageName = location.pathname.startsWith('/profiles/') ? 'Marketplace profile' : links.find(([, path]) => path === location.pathname)?.[0] || pageNames[location.pathname] || 'Overview'

  async function signOut() {
    try { await logout() } catch (error) { notify(error.message || 'Could not reach the API.') }
    navigate('/login', { replace: true })
  }

  return <div className="min-h-screen bg-[#f7f5f1] text-slate-900">
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-[252px] flex-col overflow-y-auto border-r border-[#ebe8e1] bg-[#fffefa] px-5 transition-transform duration-200 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <NavLink className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-1" to="/" onClick={() => setMobileMenuOpen(false)}><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7963e9] to-[#5140b4] text-base font-bold text-white shadow-lg shadow-violet-200">i</span><span className="text-[17px] font-bold tracking-[-0.04em]">influence<span className="text-violet-600">hub</span></span></NavLink>
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-3"><div className="flex items-center gap-3"><Avatar initials={initials} color="bg-white text-slate-700 shadow-sm ring-1 ring-slate-200" size="h-9 w-9" /><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{name}</p><p className="mt-0.5 text-[11px] text-slate-500">{workspace}</p></div></div></div>
      <div className="mt-8"><p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p><nav className="space-y-1">{links.map(([label, path, icon]) => <NavLink key={path} end={path === '/'} to={path} onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><Icon name={icon} size={17} /><span className="flex-1">{label}</span></NavLink>)}</nav></div>
      <div className="mt-8"><p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Account</p><NavLink to="/settings" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium ${isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'}`}><Icon name="settings" size={17} />Settings</NavLink></div>
      {role !== 'Admin' && <div className="mt-auto mb-5 rounded-2xl bg-gradient-to-br from-[#21183b] to-[#38226b] p-4 text-white"><div className="flex items-center gap-2 text-[11px] font-semibold text-violet-200"><Icon name="sparkles" size={15} /> PLANS</div><p className="mt-3 text-sm font-semibold">Plan details are coming soon.</p><p className="mt-1 text-[11px] leading-5 text-violet-200/80">Trial usage and subscription terms will be set before billing is enabled.</p><NavLink to="/subscription" className="mt-4 inline-block text-[11px] font-semibold text-white hover:text-violet-200">View plan details <span aria-hidden="true">→</span></NavLink></div>}
      <div className="mb-4 border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400">INFLUENCEHUB · CONNECT BETTER</div>
    </aside>
    {mobileMenuOpen && <button aria-label="Close navigation" className="fixed inset-0 z-20 bg-slate-950/30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
    <main className="min-h-screen lg:pl-[252px]"><header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-[#ebe8e1] bg-[#fffefa]/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9"><div className="flex items-center gap-3"><button aria-label="Open navigation" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMobileMenuOpen(true)}><Icon name="menu" /></button><div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex"><span>Workspace</span><span>/</span><span className="font-medium text-slate-700">{pageName}</span></div></div><div className="flex items-center gap-2 sm:gap-4"><label className="hidden h-9 w-56 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm md:flex"><Icon name="search" size={15} className="text-slate-400" /><input aria-label="Search" className="w-full bg-transparent text-xs outline-none" placeholder="Search campaigns and creators..." /></label><button aria-label="Notifications" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => notify('Notifications are not connected yet.')}><Icon name="bell" size={18} /></button><Avatar initials={initials} color="bg-[#eee9ff] text-violet-700" size="h-8 w-8" /><button onClick={signOut} className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">Sign out</button></div></header><div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9 lg:px-9"><div className="page-transition"><Outlet key={role} /></div></div></main>
  </div>
}



