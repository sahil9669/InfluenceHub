import { useMemo, useState } from 'react'
import { RoleContext } from './RoleContext.js'

const availableRoles = ['Brand', 'Creator', 'Admin']

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => {
    const savedRole = window.localStorage.getItem('influencehub-role')
    return availableRoles.includes(savedRole) ? savedRole : 'Brand'
  })

  function selectRole(nextRole) {
    if (!availableRoles.includes(nextRole)) {
      throw new Error(`Unsupported InfluenceHub role: ${nextRole}`)
    }
    window.localStorage.setItem('influencehub-role', nextRole)
    setRole(nextRole)
  }

  const value = useMemo(() => ({ role, setRole: selectRole }), [role])

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}
