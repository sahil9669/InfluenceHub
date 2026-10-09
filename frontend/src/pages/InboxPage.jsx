import { useMemo, useState } from 'react'
import { conversations as initialConversations } from '../data/demoData.js'
import { useToast } from '../context/useToast.js'
import { Avatar, PageHeader } from '../components/ui.jsx'
import { Icon } from '../components/Icon.jsx'

const startingMessages = {
  'thread-1': [
    { id: 1, sender: 'them', text: 'Hi Olivia! I have the first look for the Summer Edit content ready. Would love your thoughts before I finalize the cut.', time: '10:31 AM' },
    { id: 2, sender: 'me', text: 'Excited to see it! Please make sure the product details are visible in the first few seconds.', time: '10:36 AM' },
    { id: 3, sender: 'them', text: 'Just uploaded the first draft for you to review!', time: '10:42 AM' },
  ],
  'thread-2': [
    { id: 1, sender: 'them', text: 'I reviewed the updated brief. The story angle feels like a natural fit for my audience.', time: '9:02 AM' },
    { id: 2, sender: 'them', text: 'The updated brief looks great. I can get started today.', time: '9:18 AM' },
  ],
  'thread-3': [
    { id: 1, sender: 'them', text: 'Could you confirm the product delivery timeline? I want to plan the shoot for next week.', time: 'Yesterday' },
  ],
  'thread-4': [
    { id: 1, sender: 'them', text: 'Thanks so much! We are excited to get started.', time: 'Yesterday' },
  ],
}

export function InboxPage() {
  const { notify } = useToast()
  const [threads, setThreads] = useState(initialConversations)
  const [selectedId, setSelectedId] = useState(initialConversations[0].id)
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [messagesByThread, setMessagesByThread] = useState(startingMessages)
  const selectedThread = threads.find((thread) => thread.id === selectedId)
  const visibleThreads = useMemo(() => threads.filter((thread) => `${thread.name} ${thread.campaign} ${thread.message}`.toLowerCase().includes(search.toLowerCase())), [threads, search])
  const messages = messagesByThread[selectedId] || []

  function selectThread(thread) {
    setSelectedId(thread.id)
    setThreads((current) => current.map((item) => item.id === thread.id ? { ...item, unread: 0 } : item))
  }

  function sendMessage(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !selectedThread) return
    const time = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date())
    setMessagesByThread((current) => ({ ...current, [selectedId]: [...(current[selectedId] || []), { id: Date.now(), sender: 'me', text, time }] }))
    setThreads((current) => current.map((thread) => thread.id === selectedId ? { ...thread, message: text, time: 'Now' } : thread))
    setDraft('')
  }

  return (
    <>
      <PageHeader eyebrow="Messages" title="Inbox" description="Keep brand and creator conversations connected to their collaborations." action="New message" onAction={() => notify('New conversations can be started from a matched profile.')} />
      <section className="grid min-h-[590px] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.025)] lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={`border-b border-slate-100 lg:border-b-0 lg:border-r ${selectedId ? 'hidden lg:block' : 'block'}`}>
          <div className="border-b border-slate-100 p-4"><h2 className="text-sm font-semibold text-slate-900">Conversations</h2><label className="mt-3 flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3"><Icon name="search" size={14} className="text-slate-400" /><input aria-label="Search conversations" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search messages..." className="w-full bg-transparent text-[11px] outline-none placeholder:text-slate-400" /></label></div>
          <div className="divide-y divide-slate-100">{visibleThreads.map((thread) => <button key={thread.id} onClick={() => selectThread(thread)} className={`flex w-full gap-3 px-4 py-4 text-left transition hover:bg-slate-50 ${selectedId === thread.id ? 'bg-violet-50/60' : ''}`}>
            <Avatar initials={thread.avatar} color={thread.color} size="h-10 w-10" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="truncate text-xs font-semibold text-slate-800">{thread.name}</p><span className="shrink-0 text-[9px] text-slate-400">{thread.time}</span></div><p className="mt-1 text-[9px] text-violet-700">{thread.campaign}</p><p className="mt-1 truncate text-[10px] text-slate-500">{thread.message}</p></div>{thread.unread > 0 && <span className="mt-5 h-2 w-2 shrink-0 rounded-full bg-violet-500" />}
          </button>)}</div>
          {visibleThreads.length === 0 && <p className="p-5 text-center text-xs text-slate-500">No conversations found.</p>}
        </aside>

        {selectedThread ? <div className={`flex min-h-[590px] flex-col ${selectedId ? 'flex' : 'hidden lg:flex'}`}>
          <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5"><button className="mr-1 rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Back to conversations" onClick={() => setSelectedId('')}><span aria-hidden="true">←</span></button><Avatar initials={selectedThread.avatar} color={selectedThread.color} size="h-9 w-9" /><div className="min-w-0 flex-1"><h2 className="text-xs font-semibold text-slate-800">{selectedThread.name}</h2><p className="mt-0.5 text-[10px] text-slate-500">{selectedThread.handle} · {selectedThread.campaign}</p></div><button aria-label="More conversation options" className="rounded-md p-2 text-slate-400 hover:bg-slate-100" onClick={() => notify('Conversation options are not connected yet.')}><Icon name="more" size={17} /></button></header>
          <div className="flex-1 space-y-4 overflow-y-auto bg-[#fcfcfe] p-4 sm:p-6">{messages.map((message) => <div key={message.id} className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${message.sender === 'me' ? 'rounded-br-md bg-violet-600 text-white' : 'rounded-bl-md border border-slate-100 bg-white text-slate-700'}`}><p className="text-xs leading-5">{message.text}</p><p className={`mt-1.5 text-right text-[9px] ${message.sender === 'me' ? 'text-violet-200' : 'text-slate-400'}`}>{message.time}</p></div></div>)}</div>
          <form className="border-t border-slate-100 bg-white p-3 sm:p-4" onSubmit={sendMessage}><div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-white p-2 focus-within:border-violet-300"><textarea aria-label="Message text" rows="2" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form.requestSubmit() } }} placeholder="Write a message..." className="max-h-28 min-h-10 flex-1 resize-y bg-transparent px-2 py-1 text-xs outline-none placeholder:text-slate-400" /><button aria-label="Send message" disabled={!draft.trim()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"><Icon name="send" size={16} /></button></div><p className="mt-2 px-1 text-[9px] text-slate-400">Enter to send · Shift + Enter for a new line</p></form>
        </div> : <div className="hidden items-center justify-center text-xs text-slate-400 lg:flex">Select a conversation to view messages.</div>}
      </section>
      <p className="mt-4 text-center text-[10px] text-slate-400">Messages are held in frontend state only. Real-time delivery and persistence require the messaging backend.</p>
    </>
  )
}
