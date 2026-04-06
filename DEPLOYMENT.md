# Deployment guide — Vercel + Unipile + Ollama (Gemma)

This app is a **Next.js** project. The **UI and API routes** can run on **Vercel**. **Unipile** and **Ollama** are configured with environment variables so testers can point at **any** hosted services.

## 1. Deploy the Next.js app (free tier)

**Vercel** (recommended for Next.js):

1. Push the repo to GitHub/GitLab/Bitbucket.
2. Import the project in [Vercel](https://vercel.com) → Framework Preset: Next.js.
3. Add **Environment Variables** (see `.env.example` and sections below).
4. Deploy.

**Important:** Set `NEXT_PUBLIC_APP_URL` to your production URL (used for Unipile OAuth redirects if applicable).

**Function duration:** AI routes use `maxDuration = 60` (seconds). On **Vercel Hobby**, serverless functions are limited to **10s** — long Gemma runs may time out. Options:

- Upgrade to **Vercel Pro** for longer limits, or  
- Use a **smaller / faster** model (`AI_MODEL=gemma2:2b` etc.), or  
- Run the Next app on a **VPS** (Docker) next to Ollama so there is no tight serverless cap.

Check status: `GET /api/ai/health` after deploy.

### Contabo (or any VPS) — yes, it works

**[Contabo](https://contabo.com)** sells VPS and dedicated servers (affordable RAM/CPU). You can host **this entire stack on one machine**:

1. **OS:** Ubuntu LTS (or Debian).
2. **Node.js** 20+ — clone the repo, `npm ci`, `npm run build`, run production with **`pm2`** or **systemd**: `npm start` (or `node .next/standalone/server.js` if you enable [standalone output](https://nextjs.org/docs/pages/api-reference/next-config-js/output) in `next.config`).
3. **Reverse proxy:** **Caddy** or **nginx** in front of Node on port 3000, **HTTPS** (Let’s Encrypt).
4. **Environment:** Put the same variables as `.env.example` in a file on the server (or systemd `Environment=`), including `NEXT_PUBLIC_APP_URL=https://your-domain.com`.

**Ollama on the same VPS:** Install Ollama on that server and pull your model. Because the Next.js **API routes run on the same host**, you can set:

```bash
OLLAMA_URL=http://127.0.0.1:11434
```

No public Ollama URL is required unless the app is split across machines. Optionally expose Ollama only on localhost and keep the proxy serving only Next.js.

**RAM:** Pick a plan with enough memory for your Gemma/Ollama model (check [Ollama model sizes](https://ollama.com/library)); the Next.js process is light compared to the LLM.

---

## 2. Unipile (messaging)

Unipile runs in the **cloud**; your app only needs:

- `UNIPILE_API_URL`
- `UNIPILE_ACCESS_TOKEN`
- `UNIPILE_DSN` (as required by your connect flow)

Configure these in Vercel → Project → Settings → Environment Variables.  
Same keys work for local `.env.local` and production.

---

## 3. Ollama + Gemma — must be reachable from the internet

Vercel’s servers **cannot** call `http://localhost:11434` on your PC. For production you need **OLLAMA_URL** pointing to an Ollama HTTP API that is:

- Reachable from the public internet (or from Vercel’s regions), and  
- Ideally **not** exposed without TLS + auth (see below).

### Configuration (all environments)

| Variable        | Purpose |
|----------------|---------|
| `OLLAMA_URL`   | Base URL only, e.g. `https://ollama.example.com` (no `/api/chat` suffix). |
| `AI_MODEL`     | Tag from `ollama list` on that server, e.g. `gemma2:9b`, `gemma4:e4b`. |
| `OLLAMA_API_KEY` | Optional `Authorization: Bearer …` if you terminate TLS and auth in front of Ollama. |

Code reads these in **`src/app/lib/ai-ollama.ts`**; routes: `/api/ai/summarize`, `/api/ai/auto-reply`, `/api/ai/health`.

### Free or low-cost ways to host Ollama for demos

These are common patterns; availability/pricing change over time — verify on each provider’s site.

1. **Home / lab + tunnel (quickest for friends to test)**  
   - Run Ollama on a machine with a GPU or CPU.  
   - Expose **only** through a tunnel with HTTPS, not raw port 11434:  
     - [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) (free tier), or  
     - [ngrok](https://ngrok.com/) (free tier with limits).  
   - Put the **https** tunnel URL in `OLLAMA_URL`.

2. **Oracle Cloud “Always Free” ARM VM**  
   - Small Ampere instance, install Linux + Ollama, open firewall for your reverse proxy only.  
   - Use **Caddy** or **nginx** for HTTPS and optional Bearer token.

3. **Fly.io / Railway / Render**  
   - Run Ollama in a container with enough RAM for your model.  
   - Free tiers or credits are often enough for **small** models and light testing.

4. **Cheap VPS** (Hetzner, DigitalOcean, etc.)  
   - Predictable for team testing; use the smallest instance that fits the model in RAM.

**Security:** Do not leave Ollama **public on :11434 without a proxy + auth**. Prefer:

- TLS (HTTPS), and  
- Bearer token or IP allowlist, with `OLLAMA_API_KEY` set in Vercel to match.

### Smaller models for speed / free tiers

If inference is slow or times out, set e.g.:

```bash
AI_MODEL=gemma2:2b
```

(or another small tag you have pulled on the Ollama server.)

---

## 4. Checklist before sharing the app

- [ ] `OLLAMA_URL` is **https** and reachable from outside your LAN.  
- [ ] `ollama pull <AI_MODEL>` has been run on that server.  
- [ ] `GET /api/ai/health` returns `"status":"ready"`.  
- [ ] Unipile vars set and a test account connects.  
- [ ] If using OAuth redirects, `NEXT_PUBLIC_APP_URL` matches the deployed URL.

---

## 5. Local development

Copy `.env.example` → `.env.local`, fill secrets, run:

```bash
npm install && npm run dev
```

Default Ollama: `http://127.0.0.1:11434` with Ollama running locally.
