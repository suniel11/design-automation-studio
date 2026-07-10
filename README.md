# Design Automation Studio

AI-powered tool that generates branded marketing design concepts (Instagram, LinkedIn, email headers, web banners) from a brand name, colors, and a headline.

**Live URLs:** _pending deploy — filled in once frontend/backend are live._

## What this is

MVP flow: sign up → fill in brand + headline → AI (Anthropic) drafts headline/subheadline/body copy per format → results show in a gallery with mock Canva view/edit links. Real Genmax image generation and real Canva design creation are deferred to a later phase — see `services/anthropic.ts` in the backend for where that swap happens.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind — deployed to Vercel
- **Backend:** Node 20, Express, TypeScript — deployed to Railway
- **DB:** MongoDB Atlas
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

See `backend/.env.example` and `frontend/.env.example` for the full list. The only one required for the AI generation step to actually work is `ANTHROPIC_API_KEY` (backend) and `MONGODB_URI` (backend, Atlas connection string).

## Deployment

- **Frontend → Vercel:** `vercel --prod` from `frontend/`, with `NEXT_PUBLIC_API_URL` set to the backend's Railway URL.
- **Backend → Railway:** `railway up` from `backend/`, with `MONGODB_URI`, `JWT_SECRET`, `ANTHROPIC_API_KEY`, and `FRONTEND_URL` set as Railway environment variables.

## Not built yet (intentionally, MVP scope)

- Real Genmax / Canva API integration
- Stripe webhooks, live billing
- Admin dashboard
- Team/collaboration features
- Transactional email
