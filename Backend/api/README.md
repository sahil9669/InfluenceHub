# InfluenceHub API

Node.js and Express API for the MERN application. MongoDB is accessed through Mongoose. The two-tower recommender remains a separate Python service under `Backend/recommender`.

## Local setup

1. Use Node.js 20 or later and start MongoDB locally, or provide a MongoDB Atlas URI.
2. From this folder, run `npm install`.
3. Copy `.env.example` to `.env` if you have not already created `.env`.
4. Set `JWT_SECRET` to a private random value with at least 32 characters. For example, run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and paste the output into `.env`.
5. Start the API with `npm run dev`.
6. Open `http://localhost:5000/api/health`; the response reports API and database status.

The frontend origin defaults to `http://localhost:5173`. Change `CLIENT_ORIGINS` if Vite uses another origin.

## Authentication API

All auth responses except logout use `{ "user": { "id", "name", "email", "role" } }`. The password is hashed with bcrypt and never returned. A signed JWT is stored in an HttpOnly cookie.

- `POST /api/auth/register` — JSON `{ "name", "email", "password", "role" }`; public roles are `Brand` and `Creator` only. Passwords must contain at least 8 characters.
- `POST /api/auth/login` — JSON `{ "email", "password" }`.
- `POST /api/auth/logout` — clears the auth cookie.
- `GET /api/auth/me` — returns the signed-in account; requires the auth cookie.

The cookie is sent cross-origin only when the frontend request uses credentials. The Admin role cannot be created through registration. To provision the private Admin account, set `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` of at least 12 characters in `.env`, then run `npm run seed:admin`. The seed script does not overwrite an existing account.

## Profile API

Profile routes require the signed-in JWT cookie and use the account role to select the profile type. Admin accounts cannot access marketplace profile routes.

- GET /api/profiles/me — returns a null profile until the account has saved one.
- PUT /api/profiles/me — creates or updates the signed-in account's profile.
- GET /api/profiles/creators — Brand only; lists saved Creator marketplace profiles, without account emails.
- GET /api/profiles/:userId — returns the requested Brand or Creator marketplace profile, without account emails.

Creator profile fields: creatorName, influencerType, instagramUsername, website, and bio. Creator type must be one of the supported marketplace categories. Instagram usernames are stored without the @ symbol. Follower counts are read-only and remain empty until Instagram integration is implemented.

Brand profile fields: organizationName, website, and bio. The profile is associated with the authenticated account; clients cannot choose a different account ID.

## Campaign API

Campaign routes require the signed-in JWT cookie. Brands can create campaigns and change their own campaign status. Creators can list open campaigns. Admin accounts can list all campaigns.

- GET /api/campaigns — lists campaigns visible to the signed-in role.
- POST /api/campaigns — Brand only; creates a Draft campaign. Send name, productCategory, objective, minFollowers, maxFollowers, and optional budget.
- PATCH /api/campaigns/:id/status — Brand owner only; publishes a Draft or Paused campaign, or pauses an Open campaign.

The API calculates creatorType from productCategory; clients cannot submit or override the target creator type.

## Recommendation API

The Express API calls the separate Python service at `RECOMMENDER_URL` (defaults to `http://127.0.0.1:8100`). Start the recommender service before using these endpoints.

- `GET /api/recommendations/creators?campaignId=:id` — Brand only; ranks saved Creator profiles for a campaign owned by that Brand.
- `GET /api/recommendations/campaigns` — Creator only; ranks open campaigns for the signed-in Creator profile.

Responses include a `source` of `cold_start` or `two_tower`. Missing follower counts remain `null`; cold-start ranking uses category fit and treats unknown audience size neutrally.

## Application API

Applications require authentication. Creators can apply once to an Open campaign after saving a Creator profile. The campaign owner Brand can review each Pending application; Admin can read marketplace applications.

- `GET /api/applications` — returns applications visible to the signed-in role.
- `POST /api/applications` — Creator only; JSON `{ "campaignId", "message" }`.
- `PATCH /api/applications/:id/status` — owning Brand only; JSON `{ "status": "Accepted" }` or `{ "status": "Declined" }`.

An application can only be reviewed once, and duplicate applications to the same campaign are rejected.

Accepting an application creates one collaboration record for that application. The collaboration list also fills in missing records for older accepted applications. The Creator and owning Brand can view their collaborations; Admin can view all of them.

## Collaboration API

- `GET /api/collaborations` — returns collaborations visible to the signed-in role.

Collaborations currently track the campaign, participating Brand and Creator, start date, and `In progress` status. Messaging, milestones, and completion controls are future work.

## Messaging API

Messages are available only to the Brand and Creator who belong to an active collaboration. Admin accounts cannot read participant conversations.

- `GET /api/collaborations/:id/messages` — returns up to the latest 100 messages in chronological order.
- `POST /api/collaborations/:id/messages` — JSON `{ "content": "..." }`; message text is limited to 2,000 characters.

The frontend refreshes the open thread periodically. Real-time socket delivery and read receipts are not configured.
## Current scope

The API supports health checks, account registration and login, JWT-cookie sessions, private Admin seeding, authenticated Creator/Brand profile storage, Brand-owned campaigns, Creator campaign applications with Brand review, collaboration records from accepted applications, participant messaging within active collaborations, and two-way recommendations through the Python service. Subscriptions and recommendation-impression logging are still to be implemented. The Python recommender has no trained weights because the platform has no labeled interactions yet.


