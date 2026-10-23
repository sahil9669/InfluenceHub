import { useRole } from '../context/useRole.js'
import { EmptyState, PageHeader } from '../components/ui.jsx'

export function ReviewsPage() {
  const { role } = useRole()
  return <>
    <PageHeader eyebrow="Trust & reputation" title="Reviews & ratings" description="Verified feedback can be added after a real collaboration is completed." />
    <EmptyState title="No reviews yet" description={`There are no verified reviews for this ${role === 'Creator' ? 'creator' : role === 'Brand' ? 'brand' : 'platform'} account. Reviews will be available when collaboration and review records are stored by the backend.`} />
  </>
}
