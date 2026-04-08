# Deploy on Vercel

This app is **Next.js** (see `vercel.json`). Environment variables live in the **Vercel dashboard**, not in a single committed `.env` file. For local development, use **`.env.local`** (gitignored); copy names from **`.env.example`**.

## 1. Create the project

1. Push this repo to GitHub, GitLab, or Bitbucket.
2. In [Vercel](https://vercel.com): **Add New… → Project** → import the repository.
3. Framework: **Next.js** (install: `npm install`, build: `npm run build`).
4. Deploy. The first build may fail until required env vars are set—that is expected.

## 2. Set the public URL

After you have a deployment URL (e.g. `https://your-app.vercel.app`):

| Variable | Environment | Value |
|----------|---------------|--------|
| `NEXT_PUBLIC_APP_URL` | **Production** (and **Preview** if you use preview deployments) | Your full site URL |

Use **HTTPS** and no stray slash issues. This value is used for app links and OAuth-style redirects (e.g. Unipile).

## 3. Environment variables on Vercel

Vercel supports **Production**, **Preview**, and **Development**. For a stable demo, configure at least **Production**; duplicate into **Preview** if testers use PR previews (optionally use separate Supabase/test keys for Preview).

Add variables with the **same names** as in **`.env.example`**. Suggested grouping:

### App

- `NEXT_PUBLIC_APP_URL`

### Supabase (auth + ERP data)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Apply the SQL in `supabase/migrations/` to the Supabase project that matches these keys.

### Redis (optional; cache / locks)

- `REDIS_URL`

### Global search (optional)

- `BONSAI_URL`
- `HUB_ADMIN_SETUP_SECRET` (for admin setup routes, e.g. indexes)

### Unipile (Communication / messaging)

- `UNIPILE_API_URL` (must end with `/api/v1` per your dashboard)
- `UNIPILE_ACCESS_TOKEN`
- `UNIPILE_DSN` (if your connect/OAuth flow needs it)

### AI (summarize / smart reply)

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `AI_MODEL`

### Hub dev / safety (production)

- `NEXT_PUBLIC_ENABLE_PERSONA_SIMULATOR` — set `false` or omit for production.
- **`HUB_BYPASS_AUTH`** — keep **`0`** (or unset) on real production; it skips auth only when combined with other dev vars and is unsafe for public demos.

## 4. After deploy — smoke checks

1. Open the production URL → sign in (Supabase auth) → browse `/hub/...`.
2. Optional: `GET /api/ai/health` if you rely on AI routes.
3. If using Unipile: **Communication** → **Connect** → confirm accounts load and messaging works.

## 5. Serverless limits (AI)

Long-running AI calls can hit **Vercel Hobby** function time limits. If summaries time out, use a faster model, shorter prompts, or a **Vercel Pro** plan with higher `maxDuration`. See also **`DEPLOYMENT.md`** for broader hosting notes.

## 6. What to share with testers

- **URL:** the Production deployment link.
- **Access:** how they get accounts (Supabase invite, etc.).
- **Scope:** which features work depends on which variables you set (e.g. no Unipile keys → messaging won’t work; no Bonsai → global search may be degraded).

---

**Reference:** full variable list and comments → **`.env.example`**.
