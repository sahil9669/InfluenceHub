// Frontend-only sample records. Replace this module with API-backed repositories later.
export const creatorProfiles = [
  { id: 'creator-1', name: 'Sofia Chen', handle: '@sofiamakes', niche: 'Fashion', location: 'New York, US', followers: 84200, engagement: 7.2, score: 98, avatar: 'SC', color: 'bg-rose-100 text-rose-700', bio: 'Conscious style, everyday rituals, and outfits that feel like you.' },
  { id: 'creator-2', name: 'Marcus Cole', handle: '@marcuscreates', niche: 'Lifestyle', location: 'Los Angeles, US', followers: 126000, engagement: 6.4, score: 95, avatar: 'MC', color: 'bg-sky-100 text-sky-700', bio: 'Good design, slow living, and the stories behind the things we keep.' },
  { id: 'creator-3', name: 'Amara Okafor', handle: '@amara.daily', niche: 'Beauty', location: 'London, UK', followers: 58600, engagement: 8.1, score: 92, avatar: 'AO', color: 'bg-amber-100 text-amber-800', bio: 'Honest beauty reviews and small moments of self-care.' },
  { id: 'creator-4', name: 'Noah Williams', handle: '@noahoutside', niche: 'Travel', location: 'Austin, US', followers: 94300, engagement: 5.8, score: 89, avatar: 'NW', color: 'bg-emerald-100 text-emerald-700', bio: 'Weekend escapes, useful guides, and the outdoors close to home.' },
  { id: 'creator-5', name: 'Priya Kapoor', handle: '@withpriya', niche: 'Wellness', location: 'Toronto, CA', followers: 71500, engagement: 7.6, score: 87, avatar: 'PK', color: 'bg-fuchsia-100 text-fuchsia-700', bio: 'Approachable wellness, nourishing food, and a balanced routine.' },
  { id: 'creator-6', name: 'Leo Martin', handle: '@leomakes', niche: 'Technology', location: 'Berlin, DE', followers: 153000, engagement: 4.9, score: 84, avatar: 'LM', color: 'bg-indigo-100 text-indigo-700', bio: 'Thoughtful tech reviews for products made to last.' },
]

export const brandProfiles = [
  { id: 'brand-1', name: 'Studio North', handle: '@studionorth', niche: 'Fashion', location: 'New York, US', followers: 'Conscious style', engagement: 0, score: 98, avatar: 'SN', color: 'bg-violet-100 text-violet-700', bio: 'Independent essentials designed for people who buy less and choose well.' },
  { id: 'brand-2', name: 'Sunday Supply', handle: '@sundaysupply', niche: 'Lifestyle', location: 'Los Angeles, US', followers: 'Home & living', engagement: 0, score: 95, avatar: 'SS', color: 'bg-emerald-100 text-emerald-700', bio: 'Thoughtful objects and rituals for slower, more intentional Sundays.' },
  { id: 'brand-3', name: 'Form & Field', handle: '@formandfield', niche: 'Beauty', location: 'London, UK', followers: 'Clean beauty', engagement: 0, score: 92, avatar: 'FF', color: 'bg-orange-100 text-orange-700', bio: 'Plant-forward skincare made with transparent ingredients and real results.' },
  { id: 'brand-4', name: 'Roam Collective', handle: '@roamcollective', niche: 'Travel', location: 'Austin, US', followers: 'Outdoor gear', engagement: 0, score: 89, avatar: 'RC', color: 'bg-emerald-100 text-emerald-700', bio: 'Durable gear and practical guides for the trips that start close to home.' },
]

export const applications = [
  { id: 'app-1', name: 'Sofia Chen', handle: '@sofiamakes', avatar: 'SC', color: 'bg-rose-100 text-rose-700', campaign: 'Summer Edit', niche: 'Fashion · Lifestyle', audience: '84.2K', fit: 98, status: 'Pending', direction: 'creator' },
  { id: 'app-2', name: 'Marcus Cole', handle: '@marcuscreates', avatar: 'MC', color: 'bg-sky-100 text-sky-700', campaign: 'Everyday Essentials', niche: 'Style · Culture', audience: '126K', fit: 95, status: 'Pending', direction: 'creator' },
  { id: 'app-3', name: 'Amara Okafor', handle: '@amara.daily', avatar: 'AO', color: 'bg-amber-100 text-amber-800', campaign: 'Summer Edit', niche: 'Beauty · Lifestyle', audience: '58.6K', fit: 92, status: 'Reviewing', direction: 'creator' },
  { id: 'app-4', name: 'Sunday Supply', handle: '@sundaysupply', avatar: 'SS', color: 'bg-emerald-100 text-emerald-700', campaign: 'Sunday Reset', niche: 'Lifestyle · Home', audience: 'Brand partner', fit: 95, status: 'Pending', direction: 'brand' },
]

export const collaborations = [
  { id: 'collab-1', name: 'Summer Edit', partner: 'Sofia Chen', partnerHandle: '@sofiamakes', avatar: 'SC', color: 'bg-rose-100 text-rose-700', due: 'Jun 28, 2026', status: 'In progress', deliverables: [{ id: 'del-1', title: 'Campaign brief approved', due: 'Jun 12', done: true }, { id: 'del-2', title: 'First content draft', due: 'Jun 20', done: true }, { id: 'del-3', title: 'Brand feedback & revisions', due: 'Jun 24', done: false }, { id: 'del-4', title: 'Publish & share insights', due: 'Jun 28', done: false }] },
  { id: 'collab-2', name: 'Everyday Essentials', partner: 'Marcus Cole', partnerHandle: '@marcuscreates', avatar: 'MC', color: 'bg-sky-100 text-sky-700', due: 'Jul 04, 2026', status: 'In progress', deliverables: [{ id: 'del-5', title: 'Campaign brief approved', due: 'Jun 16', done: true }, { id: 'del-6', title: 'Concept submission', due: 'Jun 25', done: false }, { id: 'del-7', title: 'Final content delivery', due: 'Jul 01', done: false }] },
  { id: 'collab-3', name: 'Sunday Reset', partner: 'Sunday Supply', partnerHandle: '@sundaysupply', avatar: 'SS', color: 'bg-emerald-100 text-emerald-700', due: 'Jun 22, 2026', status: 'Reviewing', deliverables: [{ id: 'del-8', title: 'Brief approved', due: 'Jun 08', done: true }, { id: 'del-9', title: 'Creator content submitted', due: 'Jun 18', done: true }, { id: 'del-10', title: 'Final approval', due: 'Jun 22', done: false }] },
]

export const members = [
  { id: 'member-1', name: 'Olivia Rhye', email: 'olivia@studionorth.example', type: 'Brand', joined: 'Jun 12, 2026', status: 'Active', initials: 'OR', color: 'bg-violet-100 text-violet-700' },
  { id: 'member-2', name: 'Sofia Chen', email: 'sofia.creator@example', type: 'Creator', joined: 'Jun 11, 2026', status: 'Active', initials: 'SC', color: 'bg-rose-100 text-rose-700' },
  { id: 'member-3', name: 'Marcus Cole', email: 'marcus.creator@example', type: 'Creator', joined: 'Jun 10, 2026', status: 'Pending verification', initials: 'MC', color: 'bg-sky-100 text-sky-700' },
  { id: 'member-4', name: 'Amara Okafor', email: 'amara.creator@example', type: 'Creator', joined: 'Jun 09, 2026', status: 'Active', initials: 'AO', color: 'bg-amber-100 text-amber-800' },
  { id: 'member-5', name: 'Sunday Supply', email: 'team@sundaysupply.example', type: 'Brand', joined: 'Jun 08, 2026', status: 'Active', initials: 'SS', color: 'bg-emerald-100 text-emerald-700' },
]

export const campaigns = [
  { id: 'camp-1', name: 'Summer Edit', objective: 'Product launch', creators: 8, reach: '482K', budget: '$8,400', status: 'In progress', progress: 68, due: 'Jun 28', color: 'violet' },
  { id: 'camp-2', name: 'Everyday Essentials', objective: 'Brand awareness', creators: 12, reach: '1.2M', budget: '$12,000', status: 'In progress', progress: 42, due: 'Jul 04', color: 'blue' },
  { id: 'camp-3', name: 'The Sunday Routine', objective: 'UGC campaign', creators: 6, reach: '96K', budget: '$4,800', status: 'Reviewing', progress: 88, due: 'Jun 24', color: 'amber' },
  { id: 'camp-4', name: 'Made to Move', objective: 'Seasonal collection', creators: 0, reach: '—', budget: '$6,000', status: 'Draft', progress: 15, due: 'Jul 18', color: 'slate' },
  { id: 'camp-5', name: 'Little Things', objective: 'Community stories', creators: 10, reach: '706K', budget: '$9,200', status: 'Completed', progress: 100, due: 'Jun 12', color: 'green' },
]

export const conversations = [
  { id: 'thread-1', name: 'Sofia Chen', handle: '@sofiamakes', avatar: 'SC', color: 'bg-rose-100 text-rose-700', campaign: 'Summer Edit', time: '10:42 AM', unread: 2, message: 'Just uploaded the first draft for you to review!' },
  { id: 'thread-2', name: 'Marcus Cole', handle: '@marcuscreates', avatar: 'MC', color: 'bg-sky-100 text-sky-700', campaign: 'Everyday Essentials', time: '9:18 AM', unread: 0, message: 'The updated brief looks great. I can get started today.' },
  { id: 'thread-3', name: 'Amara Okafor', handle: '@amara.daily', avatar: 'AO', color: 'bg-amber-100 text-amber-800', campaign: 'Summer Edit', time: 'Yesterday', unread: 1, message: 'Could you confirm the product delivery timeline?' },
  { id: 'thread-4', name: 'Sunday Supply Team', handle: 'Brand partner', avatar: 'SS', color: 'bg-emerald-100 text-emerald-700', campaign: 'Sunday Reset', time: 'Yesterday', unread: 0, message: 'Thanks so much! We are excited to get started.' },
]

export const weeklyReach = [
  { day: 'Mon', value: 42 },
  { day: 'Tue', value: 58 },
  { day: 'Wed', value: 48 },
  { day: 'Thu', value: 74 },
  { day: 'Fri', value: 62 },
  { day: 'Sat', value: 90 },
  { day: 'Sun', value: 70 },
]
