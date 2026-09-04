# Irving Nepal FC — Member Portal

Membership, teams, and payments portal for Irving Nepal FC, built with
Next.js (App Router) and Supabase.

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind CSS)
- **Supabase** — Postgres database, Auth, Row-Level Security
- **Vercel** — hosting
- **Stripe** — payments (added in a later step)

## Step 1 status — Foundation

Done:

- Next.js app scaffolded with TypeScript + Tailwind
- Supabase browser/server clients (`src/lib/supabase/`)
- Auth middleware that refreshes sessions and protects `/dashboard` and
  `/admin` (`src/middleware.ts`)
- Email/password sign up, log in, log out, email confirmation
  (`src/app/login`, `src/app/signup`, `src/app/auth/confirm`)
- Initial DB migration: `profiles` table with `role` (member/admin) and
  `status` (pending/approved/rejected/suspended), auto-created on signup,
  with baseline RLS policies (`supabase/migrations/0001_init.sql`)

Still needed from you before this runs end-to-end:

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (org:
   whatever you use for the club).
2. **Run the migration**: either paste
   `supabase/migrations/0001_init.sql` into the Supabase SQL Editor, or install
   the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)
   and run `supabase link` + `supabase db push`.
3. **Copy your env vars**: in the Supabase dashboard, go to
   Project Settings → API, then copy `.env.local.example` to `.env.local` and
   fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY`.
4. **Create your own admin account**: sign up through `/signup` once running,
   then in the Supabase SQL Editor run:
   ```sql
   update public.profiles set role = 'admin', status = 'approved'
   where id = '<your-auth-user-id>';
   ```

## Local development

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, "Add New Project" → import the repo.
3. Add the same environment variables from `.env.local` in the Vercel
   project's Settings → Environment Variables (set `NEXT_PUBLIC_SITE_URL` to
   your production URL, e.g. `https://portal.irvingnepalfc.org`).
4. Deploy.
5. In your domain's DNS settings (IONOS), add a `CNAME` record:
   `portal` → `cname.vercel-dns.com` (Vercel will show the exact value once
   you add the domain in Project Settings → Domains). Once it resolves, add a
   "🔐 Member Login" button on the existing IONOS site linking to
   `https://portal.irvingnepalfc.org`.

## Roadmap

See the project plan for Steps 2–8 (security/RLS, member management,
soccer operations, club operations, payments via Stripe, admin dashboard,
and testing).
