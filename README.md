# Design Automation Studio

AI-powered tool that generates branded marketing design concepts (Instagram, LinkedIn, email headers, web banners) from a brand name, colors, and a headline.

**Live:**
- Frontend: https://design-automation-studio.vercel.app
- Backend: https://design-automation-backend-production.up.railway.app (health check: `/api/health`)
- Repo: https://github.com/suniel11/design-automation-studio

**Status:** signup → login → generate-design → view-gallery flow is verified working end to end against the live backend and a real MongoDB instance. The one remaining step is adding a real `ANTHROPIC_API_KEY` in Railway's dashboard (Variables tab, `design-automation-backend` service) — without it, generated designs fall into `error` status instead of producing copy.

## What this is

MVP flow: sign up → fill in brand + headline → AI (Anthropic) drafts headline/subheadline/body copy per format → results show in a gallery with mock Canva view/edit links. Real Genmax image generation and real Canva design creation are deferred to a later phase — see `services/anthropic.ts` in the backend for where that swap happens.

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind — deployed to Vercel
- **Backend:** Node 20, Express, TypeScript — deployed to Railway
- **DB:** MongoDB, hosted as a Railway-managed service in the same project (not Atlas — see note below)
- **Auth:** JWT + bcrypt
- **AI:** Anthropic API (design copy generation)
- **Payments:** Stripe, test mode only — `/api/billing/subscribe` exists but isn't wired to any UI yet

## Project structure

```
frontend/    Next.js app (landing, login, signup, dashboard, pricing)
backend/     Express API (auth, users, designs, billing)
```

## Local development

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, ANTHROPIC_API_KEY
npm run dev             # http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev                   # http://localhost:3000
```

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list. The only one still missing on the live deployment is `ANTHROPIC_API_KEY` (backend) — add it directly in Railway's dashboard.

## Deployment

- **Frontend → Vercel:** `vercel --prod` from `frontend/`, with `NEXT_PUBLIC_API_URL` set to the backend's Railway URL. Already deployed and aliased to the production domain above.
- **Backend → Railway:** `railway up` from `backend/`. `MONGODB_URI` points at the Railway-managed MongoDB service via a variable reference (`${{MongoDB-8D6t.MONGO_URL}}/design-automation?authSource=admin`); `JWT_SECRET`, `STRIPE_SECRET_KEY` (mock), and `FRONTEND_URL` are also set as Railway environment variables.

### Note on MongoDB Atlas vs Railway

The original plan called for MongoDB Atlas. Atlas needs its own account/cluster created through a browser signup that couldn't be completed in this session, so the database was provisioned as a Railway-managed MongoDB service instead — same project, connected over Railway's private network, zero extra accounts. Functionally equivalent for this MVP; swap `MONGODB_URI` to an Atlas connection string later if you want that instead.

## Not built yet (intentionally, MVP scope)

- Real Genmax / Canva API integration
- Stripe webhooks, live billing
- Admin dashboard
- Team/collaboration features
- Transactional email
