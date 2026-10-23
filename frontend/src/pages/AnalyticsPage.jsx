import { useRole } from '../context/useRole.js'
import { EmptyState, PageHeader } from '../components/ui.jsx'

export function AnalyticsPage() {
  const { role } = useRole()
  return <>
    <PageHeader eyebrow="Performance" title={role === 'Creator' ? 'My analytics' : role === 'Admin' ? 'Platform analytics' : 'Analytics'} description="Performance reports will use real campaign and Instagram insights when those data sources are connected." />
    <EmptyState title="No analytics data available" description="No impressions, engagement, audience demographics, or campaign results are being reported yet. This page will show verified records after analytics integration." />
  </>
}
