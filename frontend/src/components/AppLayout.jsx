import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useRole } from '../context/useRole.js'
import { useToast } from '../context/useToast.js'
import { Avatar } from './ui.jsx'
import { Icon } from './Icon.jsx'

const navigation = {
  Brand: [
    ['Overview', '/', 'overview'],
    ['Discover creators', '/discover', 'discover'],
    ['Applications', '/applications', 'inbox'],
    ['Campaigns', '/campaigns', 'campaigns'],
    ['Collaborations', '/collaborations', 'check'],
    ['Inbox', '/inbox', 'inbox'],
    ['Analytics', '/analytics', 'analytics'],
    ['Reviews & ratings', '/reviews', 'sparkles'],
    ['Subscription', '/subscription', 'overview'],
  ],
  Creator: [
    ['Overview', '/', 'overview'],
    ['Brand matches', '/discover', 'discover'],
    ['Applications', '/applications', 'inbox'],
    ['Collaborations', '/collaborations', 'campaigns'],
    ['Inbox', '/inbox', 'inbox'],
    ['My analytics', '/analytics', 'analytics'],
    ['Reviews & ratings', '/reviews', 'sparkles'],
  ],
  Admin: [
    ['Overview', '/', 'overview'],
    ['Members', '/members', 'discover'],
    ['Campaigns', '/campaigns', 'campaigns'],
    ['Collaborations', '/collaborations', 'check'],
    ['Support inbox', '/inbox', 'inbox'],
    ['Platform analytics', '/analytics', 'analytics'],
    ['Reviews & ratings', '/reviews', 'sparkles'],
  ],
}

const profile = {
  Brand: { name: 'Olivia Rhye', workspace: 'Studio North', initials: 'OR' },
  Creator: { name: 'Sofia Chen', workspace: 'Creator account', initials: 'SC' },
  Admin: { name: 'Jordan Lee', workspace: 'Platform administration', initials: 'JL' },
}

export function AppLayout() {
  const { role, setRole } = useRole()
  const { notify } = useToast()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const user = profile[role] || profile.Brand
  const activeLink = navigation[role] || navigation.Brand
  const pageNames = { '/reviews': 'Reviews & ratings', '/subscription': role === 'Creator' ? 'Creator plan' : role === 'Admin' ? 'Plans & billing' : 'Subscription', '/settings': 'Settings', '/members': 'Members', '/applications': 'Applications', '/collaborations': role === 'Creator' ? 'Deliverables' : 'Collaborations' }
  const pageName = activeLink.find(([, path]) => path === location.pathname)?.[0] || pageNames[location.pathname] || 'Overview'

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[252px] flex-col overflow-y-auto border-r border-slate-200/80 bg-white px-5 transition-transform duration-200 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <NavLink className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-1" to="/" onClick={() => setMobileMenuOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-base font-bold text-white shadow-lg shadow-violet-200">i</span>
          <span className="text-[17px] font-bold tracking-[-0.04em]">influence<span className="text-violet-600">hub</span></span>
        </NavLink>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center gap-3">
            <Avatar initials={role === 'Brand' ? 'SN' : user.initials} color="bg-white text-slate-700 shadow-sm ring-1 ring-slate-200" size="h-9 w-9" />
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{user.workspace}</p><p className="mt-0.5 text-[11px] text-slate-500">{role} workspace</p></div>
            <span className="text-slate-400">⌄</span>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
          <nav className="space-y-1">
            {activeLink.map(([label, path, icon]) => (
              <NavLink key={path} end={path === '/'} to={path} onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <Icon name={icon} size={17} /><span className="flex-1">{label}</span>
                {path === '/inbox' && <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">4</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-8">
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Account</p>
          <NavLink to="/settings" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'}`}><Icon name="settings" size={17} />Settings</NavLink>
          {role !== 'Brand' && <NavLink to="/subscription" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'}`}><Icon name="overview" size={17} />{role === 'Admin' ? 'Plans & billing' : 'Creator plan'}</NavLink>}
        </div>

        {role === 'Brand' && <div className="mt-auto mb-5 rounded-2xl bg-gradient-to-br from-[#21183b] to-[#38226b] p-4 text-white">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-violet-200"><Icon name="sparkles" size={15} /> PRO PLAN</div>
          <p className="mt-3 text-sm font-semibold">Make every match count.</p>
          <p className="mt-1 text-[11px] leading-5 text-violet-200/80">You have 8 of 10 creator slots available this month.</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-1/5 rounded-full bg-violet-300" /></div>
          <button className="mt-4 text-[11px] font-semibold text-white hover:text-violet-200" onClick={() => notify('Subscription settings will be connected to the backend.')}>Manage subscription <span aria-hidden="true">→</span></button>
        </div>}
        <div className="mb-4 border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400">INFLUENCEHUB · CONNECT BETTER</div>
      </aside>

      {mobileMenuOpen && <button aria-label="Close navigation" className="fixed inset-0 z-20 bg-slate-950/30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}

      <main className="min-h-screen lg:pl-[252px]">
        <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
            <button aria-label="Open navigation" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMobileMenuOpen(true)}><Icon name="menu" /></button>
            <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex"><span>Workspace</span><span>/</span><span className="font-medium text-slate-700">{pageName}</span></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <label className="hidden h-9 w-56 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 md:flex">
              <Icon name="search" size={15} className="text-slate-400" /><input aria-label="Search" className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400" placeholder="Search anything..." />
              <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 text-[9px] text-slate-400">⌘ K</kbd>
            </label>
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5" aria-label="Choose demo role">
              {['Brand', 'Creator', 'Admin'].map((item) => <button key={item} onClick={() => setRole(item)} className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition sm:px-3 sm:text-[11px] ${role === item ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{item}</button>)}
            </div>
            <button aria-label="Notifications" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => notify('You’re all caught up.')}><Icon name="bell" size={18} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 ring-2 ring-white" /></button>
            <Avatar initials={user.initials} color="bg-[#eee9ff] text-violet-700" size="h-8 w-8" />
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9 lg:px-9"><Outlet key={role} /></div>
      </main>
    </div>
  )
}
