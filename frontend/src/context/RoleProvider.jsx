import { useEffect, useMemo, useState } from 'react'
import { RoleContext } from './RoleContext.js'
import { apiRequest } from '../api/client.js'

export function RoleProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    apiRequest('/auth/me')
      .then(({ user: currentUser }) => { if (active) setUser(currentUser) })
      .catch(() => { if (active) setUser(null) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function login(credentials) {
    const result = await apiRequest('/auth/login', { method: 'POST', body: credentials })
    setUser(result.user)
    return result.user
  }

  async function register(details) {
    const result = await apiRequest('/auth/register', { method: 'POST', body: details })
    setUser(result.user)
    return result.user
  }

  async function logout() {
    try { await apiRequest('/auth/logout', { method: 'POST' }) }
    finally { setUser(null) }
  }

  const value = useMemo(() => ({ user, role: user?.role || null, loading, login, register, logout }), [user, loading])
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}
