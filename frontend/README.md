# InfluenceHub frontend

InfluenceHub connects brands and creators through discovery, applications, collaboration management, messaging, and reviews. This frontend is a multi-page React application built with Vite, React Router, and Tailwind CSS.

## Run locally

```sh
npm install
npm run dev
```

Use `npm run build` for a production build and `npm run lint` for lint checks.

## Application pages

| Route | Page |
| --- | --- |
| `/` | Role-specific dashboard |
| `/discover` | Creator discovery or brand opportunities |
| `/applications` | Brand applications and creator invitations |
| `/campaigns` | Campaign creation and management |
| `/collaborations` | Milestones, deliverables, and completion |
| `/inbox` | Collaboration conversations |
| `/analytics` | Performance and audience analytics |
| `/reviews` | Two-way ratings and reviews |
| `/subscription` | Plans and subscription usage |
| `/members` | Admin member management |
| `/settings` | Profile and account preferences |

The Brand/Creator/Admin selector in the header is a development role preview. It is not authentication or authorization.

## Frontend structure

- `src/pages/` contains one page component per route.
- `src/components/` contains shared layout, icons, and UI primitives.
- `src/context/` contains role-preview and notification state.
- `src/data/demoData.js` contains illustrative frontend data used until API services are implemented.

Buttons that update applications, campaigns, deliverables, messages, profiles, or member status currently update frontend state only. The sample metrics, profiles, reviews, subscription values, and dates are not production data.

## Backend integration

When backend development begins, replace reads from `src/data/demoData.js` and local page state with API/service modules. Keep authentication and role authorization on the server; frontend role selection is only for designing and checking each workspace. Persist application decisions, collaboration milestones, messages, reviews, subscriptions, and member actions through authenticated backend endpoints. Connect analytics to trusted platform data and recommendations to the recommendation service before presenting results as real.
