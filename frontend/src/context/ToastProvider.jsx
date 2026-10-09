import { useCallback, useMemo, useRef, useState } from 'react'
import { ToastContext } from './ToastContext.js'

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('')
  const timer = useRef(null)

  const notify = useCallback((nextMessage) => {
    setMessage(nextMessage)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(''), 2600)
  }, [])

  const value = useMemo(() => ({ notify }), [notify])
  return (
    <ToastContext.Provider value={value}>
      {children}
      {message && <div role="status" className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl">{message}</div>}
    </ToastContext.Provider>
  )
}
