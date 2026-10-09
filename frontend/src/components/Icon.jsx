const paths = {
  overview: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  discover: ['m21 21-4.35-4.35', 'M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z'],
  campaigns: ['M3 7h18', 'M5 7V4h14v3', 'M5 7v13h14V7', 'M9 12h6', 'M9 16h4'],
  inbox: ['M4 4h16v16H4z', 'm4 13 4 0 2 3h4l2-3h4'],
  analytics: ['M3 3v18h18', 'm7 14 4-4 4 4 6-7'],
  settings: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.8 3.12-.08-.02a1.7 1.7 0 0 0-1.76.4l-.06.06h-3.6l-.05-.07a1.7 1.7 0 0 0-1.76-.4l-.08.03-1.8-3.13.06-.06A1.7 1.7 0 0 0 9.2 15l-.08-.03v-3.6l.08-.04a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.8-3.12.08.02a1.7 1.7 0 0 0 1.76-.4l.06-.06h3.6l.05.07a1.7 1.7 0 0 0 1.76.4l.08-.03 1.8 3.13-.06.06a1.7 1.7 0 0 0-.34 1.88l.08.03v3.6l-.08.03Z'],
  sparkles: ['m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z', 'm19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  arrow: ['M7 17 17 7', 'M7 7h10v10'],
  plus: ['M12 5v14', 'M5 12h14'],
  check: ['m5 12 4 4L19 6'],
  clock: ['M12 8v4l3 2', 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  filter: ['M4 7h16', 'M7 12h10', 'M10 17h4'],
  send: ['m22 2-7 20-4-9-9-4 20-7Z', 'M22 2 11 13'],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
  more: ['M12 5h.01', 'M12 12h.01', 'M12 19h.01'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  search: ['m21 21-4.35-4.35', 'M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z'],
  calendar: ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z'],
}

export function Icon({ name, size = 18, className = '' }) {
  return (
    <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]?.map((path) => <path d={path} key={path} />)}
    </svg>
  )
}
