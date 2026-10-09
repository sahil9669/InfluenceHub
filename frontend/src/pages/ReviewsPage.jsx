import { useState } from 'react'
import { useRole } from '../context/useRole.js'
import { useToast } from '../context/useToast.js'
import { Avatar, PageHeader, StatusBadge } from '../components/ui.jsx'

const reviews = [
  { id: 'review-1', name: 'Sofia Chen', handle: '@sofiamakes', avatar: 'SC', color: 'bg-rose-100 text-rose-700', campaign: 'Summer Edit', rating: 5, date: 'Jun 14, 2026', text: 'Sofia understood the brief immediately and created content that felt natural to her audience. Communication was thoughtful throughout.' },
  { id: 'review-2', name: 'Marcus Cole', handle: '@marcuscreates', avatar: 'MC', color: 'bg-sky-100 text-sky-700', campaign: 'Everyday Essentials', rating: 4, date: 'Jun 09, 2026', text: 'Great creative direction and reliable delivery. The collaboration was smooth from the first conversation.' },
  { id: 'review-3', name: 'Sunday Supply', handle: 'Brand partner', avatar: 'SS', color: 'bg-emerald-100 text-emerald-700', campaign: 'Sunday Reset', rating: 5, date: 'Jun 02, 2026', text: 'A lovely brand to work with. Clear expectations, kind feedback, and a product I genuinely use.' },
]

export function ReviewsPage() {
  const { role } = useRole()
  const { notify } = useToast()
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function submitReview(event) {
    event.preventDefault()
    if (!rating) {
      notify('Select a rating before submitting your review.')
      return
    }
    setSubmitted(true)
    setReviewText('')
    setRating(0)
    notify('Review submitted for this session.')
  }

  return (
    <>
      <PageHeader eyebrow="Trust & reputation" title="Reviews & ratings" description="Build trusted partnerships with two-way feedback after each collaboration." />
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[['Average rating', role === 'Creator' ? '4.9' : '4.8', 'Across completed partnerships'], ['Completed reviews', '28', 'From verified collaborations'], ['Response rate', '96%', 'Reviews answered on time']].map(([label, value, help]) => <article className="rounded-xl border border-slate-200/80 bg-white p-5" key={label}><p className="text-[10px] font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}{label === 'Average rating' && <span className="ml-1 text-base text-amber-400">★</span>}</p><p className="mt-1 text-[10px] text-slate-400">{help}</p></article>)}
      </section>
      {!submitted && <form onSubmit={submitReview} className="mt-5 rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
        <div className="border-b border-slate-100 pb-4"><h2 className="text-sm font-semibold text-slate-900">Leave a review</h2><p className="mt-1 text-[10px] text-slate-500">{role === 'Creator' ? 'Rate a brand you have completed a collaboration with.' : 'Rate a creator after the collaboration is complete.'}</p></div>
        <label className="mt-4 block text-[11px] font-medium text-slate-700">Collaboration<select required defaultValue="" className="mt-1.5 h-10 w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-violet-400"><option value="" disabled>Select a completed collaboration</option><option>Summer Edit · Studio North</option><option>Sunday Reset · Sunday Supply</option></select></label>
        <fieldset className="mt-4"><legend className="text-[11px] font-medium text-slate-700">Overall rating</legend><div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" aria-label={`${value} star${value > 1 ? 's' : ''}`} aria-pressed={rating === value} onClick={() => setRating(value)} className={`text-2xl transition ${value <= rating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}>★</button>)}</div></fieldset>
        <label className="mt-4 block max-w-2xl text-[11px] font-medium text-slate-700">Your review<textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} required minLength="12" maxLength="1000" rows="3" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs leading-5 outline-none focus:border-violet-400" placeholder="Share what went well and what future partners should know." /><span className="mt-1 block text-right text-[9px] text-slate-400">{reviewText.length}/1000</span></label>
        <div className="mt-3 flex justify-end"><button className="rounded-lg bg-violet-600 px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-violet-700">Submit review</button></div>
      </form>}
      <section className="mt-5 rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-end justify-between"><div><h2 className="text-sm font-semibold text-slate-900">Recent feedback</h2><p className="mt-1 text-[10px] text-slate-500">Reviews associated with completed collaborations.</p></div><StatusBadge status="Completed" /></div>
        <div className="divide-y divide-slate-100">{reviews.map((review) => <article key={review.id} className="flex gap-3 py-4 first:pt-0 last:pb-0"><Avatar initials={review.avatar} color={review.color} size="h-9 w-9" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-[11px] font-semibold text-slate-800">{review.name} <span className="ml-1 font-normal text-slate-400">{review.handle}</span></p><p className="mt-1 text-[9px] text-slate-400">{review.campaign} · {review.date}</p></div><span className="text-[11px] tracking-wide text-amber-400">{'★'.repeat(review.rating)}<span className="text-slate-200">{'★'.repeat(5 - review.rating)}</span></span></div><p className="mt-2 text-[11px] leading-5 text-slate-600">{review.text}</p></div></article>)}</div>
      </section>
      <p className="mt-4 text-center text-[10px] text-slate-400">Ratings and sample reviews are frontend development data and are not persisted.</p>
    </>
  )
}
