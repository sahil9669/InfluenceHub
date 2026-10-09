import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout.jsx'
import { AnalyticsPage } from './pages/AnalyticsPage.jsx'
import { CampaignsPage } from './pages/CampaignsPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { DiscoverPage } from './pages/DiscoverPage.jsx'
import { InboxPage } from './pages/InboxPage.jsx'
import { SettingsPage } from './pages/SettingsPage.jsx'
import { RoleProvider } from './context/RoleProvider.jsx'
import { ToastProvider } from './context/ToastProvider.jsx'
import { ReviewsPage } from './pages/ReviewsPage.jsx'
import { SubscriptionPage } from './pages/SubscriptionPage.jsx'
import { ApplicationsPage } from './pages/ApplicationsPage.jsx'
import { CollaborationsPage } from './pages/CollaborationsPage.jsx'
import { MembersPage } from './pages/MembersPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
        <ToastProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="discover" element={<DiscoverPage />} />
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
          </Routes>
        </ToastProvider>
      </RoleProvider>
    </BrowserRouter>
  )
}
