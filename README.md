# Margin Master — Frontend

## Getting started in 5 steps

### 1. Create Next.js project
```bash
npx create-next-app@latest margin-master --typescript --app --no-tailwind
cd margin-master
```

### 2. Install dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs stripe @stripe/stripe-js @stripe/react-stripe-js resend
```

### 3. Copy files from this package
Copy these folders into your project root:
```
src/app/globals.css         → replace default
src/app/layout.tsx          → replace default
src/app/page.tsx            → landing page
src/app/dashboard/page.tsx  → main pick interface
src/app/leaderboard/page.tsx → season standings
src/app/auth/AuthPages.tsx  → login + signup components
src/lib/supabase.ts         → supabase client
src/hooks/useAuth.tsx       → auth state
src/hooks/usePicks.ts       → picks data layer
```

Also copy all files from the previous backend packages:
```
lib/scoring.ts
lib/fetcher.ts
api/routes/     → app/api/
cron/           → app/api/cron/
```

### 4. Set up .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
ODDS_API_KEY=xxxx
CRON_SECRET=any-random-string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run locally
```bash
npm run dev
```

Open http://localhost:3000

---

## Pages built

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Landing page | ✓ Built |
| `/auth/login` | Sign in | ✓ Built |
| `/auth/signup` | Create account | ✓ Built |
| `/dashboard` | Weekly picks + scoring | ✓ Built |
| `/leaderboard` | Season + weekly standings | ✓ Built |
| `/league` | Create/join leagues | Next |
| `/profile` | Stats + referral code | Next |
| `/admin` | Set designated games | Next |

---

## Still to build

- League creation and join flow (`/league`)
- Profile page with season history (`/profile`)  
- Admin panel for designated games (`/admin`)
- Subscription/upgrade flow (Stripe embedded forms)
- Connect Stripe payment components to upgrade buttons
- Wire up auth page exports to `/auth/login` and `/auth/signup` routes
- Add `AuthProvider` wrapper to `layout.tsx`
- Mobile responsive pass (currently desktop-optimized)

---

## Deploying to Vercel
```bash
npm install -g vercel
vercel
```

Add all env vars in Vercel dashboard → Settings → Environment Variables.

Add `vercel.json` for cron jobs:
```json
{
  "crons": [
    { "path": "/api/cron/sync-scores", "schedule": "0 * * * *" },
    { "path": "/api/cron/process-prizes", "schedule": "0 4 * * 2" }
  ]
}
```
