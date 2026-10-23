import { Navigate } from 'react-router-dom'
import { useRole } from '../context/useRole.js'
import { EmptyState, PageHeader } from '../components/ui.jsx'

export function MembersPage() {
  const { role } = useRole()
  if (role !== 'Admin') return <Navigate replace to="/" />
  return <>
    <PageHeader eyebrow="Administration" title="Member management" description="Account lists and access controls require an admin-only members API." />
    <EmptyState title="Member records are not available yet" description="The current API does not expose member listing, verification, or access-management endpoints. No example accounts are shown here." />
  </>
}
