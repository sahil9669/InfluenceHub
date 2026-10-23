import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './components/AppLayout.jsx'
import { AnalyticsPage } from './pages/AnalyticsPage.jsx'
import { CampaignsPage } from './pages/CampaignsPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { DiscoverPage } from './pages/DiscoverPage.jsx'
import { PublicProfilePage } from './pages/PublicProfilePage.jsx'
import { InboxPage } from './pages/InboxPage.jsx'
import { SettingsPage } from './pages/SettingsPage.jsx'
import { RoleProvider } from './context/RoleProvider.jsx'
import { ToastProvider } from './context/ToastProvider.jsx'
import { ReviewsPage } from './pages/ReviewsPage.jsx'
import { SubscriptionPage } from './pages/SubscriptionPage.jsx'
import { ApplicationsPage } from './pages/ApplicationsPage.jsx'
import { CollaborationsPage } from './pages/CollaborationsPage.jsx'
import { MembersPage } from './pages/MembersPage.jsx'
import { LoginPage } from './pages/auth/LoginPage.jsx'
import { RegisterPage } from './pages/auth/RegisterPage.jsx'
import { useRole } from './context/useRole.js'

function LoadingSession() {
  return <main className="grid min-h-screen place-items-center bg-[#f7f8fc] text-sm text-slate-500">Checking your session...</main>
}

function RequireAuth({ children }) {
  const { user, loading } = useRole()
  const location = useLocation()
  if (loading) return <LoadingSession />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

function GuestOnly({ children }) {
  const { user, loading } = useRole()
  if (loading) return <LoadingSession />
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return <BrowserRouter><RoleProvider><ToastProvider><Routes>
    <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
    <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
    <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
      <Route index element={<DashboardPage />} />
      <Route path="discover" element={<DiscoverPage />} />
      <Route path="profiles/:userId" element={<PublicProfilePage />} />
      <Route path="campaigns" element={<CampaignsPage />} />
      <Route path="applications" element={<ApplicationsPage />} />
      <Route path="collaborations" element={<CollaborationsPage />} />
      <Route path="members" element={<MembersPage />} />
      <Route path="inbox" element={<InboxPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="reviews" element={<ReviewsPage />} />
      <Route path="subscription" element={<SubscriptionPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Route>
  </Routes></ToastProvider></RoleProvider></BrowserRouter>
}

