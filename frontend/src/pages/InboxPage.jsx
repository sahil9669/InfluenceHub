import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiRequest } from '../api/client.js'
import { useRole } from '../context/useRole.js'
import { EmptyState, PageHeader } from '../components/ui.jsx'
import { Icon } from '../components/Icon.jsx'

export function InboxPage() {
  const { role, user } = useRole()
  const [searchParams, setSearchParams] = useSearchParams()
  const [collaborations, setCollaborations] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(role !== 'Admin')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState('')
  const chatScrollRef = useRef(null)
  const selectedId = searchParams.get('collaboration')
  const selected = useMemo(() => collaborations.find((item) => item.id === selectedId) || null, [collaborations, selectedId])
  const isCreator = role === 'Creator'
  const currentUserId = user?.id

  useEffect(() => {
    if (role === 'Admin') return undefined
    let active = true
    apiRequest('/collaborations')
      .then(({ collaborations: items }) => { if (active) setCollaborations(items) })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load conversations.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [role])

  useEffect(() => {
    if (loading || role === 'Admin') return
    const selectedExists = collaborations.some((item) => item.id === selectedId)
    if (!selectedId && collaborations.length) {
      setSearchParams({ collaboration: collaborations[0].id }, { replace: true })
    } else if (selectedId && !selectedExists) {
      setSearchParams(collaborations.length ? { collaboration: collaborations[0].id } : {}, { replace: true })
    }
  }, [collaborations, loading, role, selectedId, setSearchParams])

  useEffect(() => {
    if (!selectedId || !selected) {
      setMessages([])
      return undefined
    }
    let active = true
    let firstLoad = true
    const loadMessages = async () => {
      try {
        const result = await apiRequest(`/collaborations/${selectedId}/messages`)
        if (!active) return
        setMessages(result.messages)
        setError('')
        if (firstLoad) {
          requestAnimationFrame(() => {
            const element = chatScrollRef.current
            if (element) element.scrollTop = element.scrollHeight
          })
          firstLoad = false
        }
      } catch (requestError) {
        if (active) setError(requestError.message || 'Could not load messages.')
      } finally {
        if (active) setLoadingMessages(false)
      }
    }
    setLoadingMessages(true)
    loadMessages()
    const intervalId = window.setInterval(loadMessages, 5000)
    return () => { active = false; window.clearInterval(intervalId) }
  }, [selected, selectedId])

  async function sendMessage(event) {
    event.preventDefault()
    if (!selected || !draft.trim()) return
    setError('')
    setSending(true)
    try {
      const { message } = await apiRequest(`/collaborations/${selected.id}/messages`, {
        method: 'POST',
        body: { content: draft },
      })
      setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message])
      setDraft('')
      requestAnimationFrame(() => {
        const element = chatScrollRef.current
        if (element) element.scrollTop = element.scrollHeight
      })
    } catch (requestError) {
      setError(requestError.message || 'Could not send your message.')
    } finally {
      setSending(false)
    }
  }

  const otherParty = selected ? (isCreator ? selected.brand : selected.creator) : null

  return <>
    <PageHeader eyebrow="Messages" title={role === 'Admin' ? 'Support inbox' : 'Inbox'} description={role === 'Admin' ? 'Campaign conversations are private to their Brand and Creator participants.' : 'Talk directly with the other participant in an active collaboration.'} />
    {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</p>}
    {role === 'Admin'
      ? <EmptyState title="Participant conversations are private" description="Admin support conversations are not part of the campaign messaging workflow." />
      : loading
        ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading your conversations...</div>
        : collaborations.length === 0
          ? <EmptyState title="No conversations yet" description="A conversation becomes available when a Brand accepts your campaign application and the collaboration starts." />
          : <section className="grid min-h-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="border-b border-slate-100 bg-[#fffefa] p-3 lg:border-b-0 lg:border-r">
                <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Collaborations</p>
                <nav className="space-y-1">{collaborations.map((item) => {
                  const person = isCreator ? item.brand : item.creator
                  const active = item.id === selectedId
                  return <button key={item.id} onClick={() => { setError(''); setSearchParams({ collaboration: item.id }) }} className={`w-full rounded-xl px-3 py-3 text-left transition ${active ? 'bg-violet-50 text-violet-950' : 'text-slate-700 hover:bg-slate-50'}`}>
                    <span className="block truncate text-xs font-semibold">{person?.name || 'Conversation'}</span>
                    <span className="mt-1 block truncate text-[11px] text-slate-500">{item.campaign?.name || 'Campaign'}</span>
                  </button>
                })}</nav>
              </aside>
              {selected ? <div className="flex min-h-[620px] min-w-0 flex-col">
                <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{otherParty?.name || 'Conversation'}</p><p className="mt-1 truncate text-xs text-slate-500">{selected.campaign?.name}</p></div>{otherParty?.id && <Link to={`/profiles/${otherParty.id}`} className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-violet-700 hover:bg-violet-50">View profile</Link>}</header>
                <div ref={chatScrollRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-[#faf9fc] px-4 py-5 sm:px-6">
                  {loadingMessages && messages.length === 0 ? <p className="py-10 text-center text-xs text-slate-400">Loading messages...</p> : messages.length === 0 ? <p className="py-10 text-center text-xs text-slate-400">This is the start of your conversation. Say hello!</p> : messages.map((message) => {
                    const mine = message.sender?.id === currentUserId
                    return <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[72%] ${mine ? 'rounded-br-md bg-violet-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'}`}><p className={`mb-1 text-[10px] font-semibold ${mine ? 'text-violet-100' : 'text-violet-700'}`}>{mine ? 'You' : message.sender?.name || otherParty?.name}</p><p className="whitespace-pre-wrap break-words text-sm leading-5">{message.content}</p><p className={`mt-2 text-right text-[9px] ${mine ? 'text-violet-200' : 'text-slate-400'}`}>{new Date(message.createdAt).toLocaleString()}</p></div></div>
                  })}
                </div>
                <form onSubmit={sendMessage} className="border-t border-slate-100 bg-white p-3 sm:p-4"><label className="sr-only" htmlFor="chat-message">Write a message</label><div className="flex items-end gap-2"><textarea id="chat-message" rows="2" maxLength="2000" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message..." className="max-h-36 min-h-12 flex-1 resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-5" /><button disabled={sending || !draft.trim() || selected.status !== 'In progress'} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"><Icon name="send" size={17} /></button></div><p className="mt-2 px-1 text-[10px] text-slate-400">Messages refresh automatically every few seconds.</p></form>
              </div> : <div className="grid min-h-[620px] place-items-center text-sm text-slate-400">Select a conversation</div>}
            </section>}
  </>
}
