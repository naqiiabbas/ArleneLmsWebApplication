# Deploying to a VPS (Docker) — client testing

The app is a **Next.js** server (App Router) that talks to **hosted Supabase**
(DB, Auth, Storage). Only the Next.js app is containerized; Supabase stays in the
cloud, so there is no database to run on the VPS.

## What you need on the VPS
- Docker Engine + the Docker Compose plugin (`docker compose version` should work).
- The Supabase project's API values (Dashboard → Project Settings → API):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable / anon key)
  - `SUPABASE_SERVICE_ROLE_KEY` (**secret** — server only)

## Key env facts
- `NEXT_PUBLIC_*` are **baked into the browser bundle at build time** → they are
  passed as **build args**. Changing them means rebuilding the image.
- `SUPABASE_SERVICE_ROLE_KEY` is read **at runtime on the server only** and is
  never in the browser bundle. Keep it secret.

---

## Option A — build on the VPS with Docker Compose (simplest)

```bash
# 1. Copy the my-app/ folder to the VPS (git clone or scp/rsync).
cd my-app

# 2. Create the env file (compose auto-loads ./.env).
cp .env.production.example .env
nano .env            # fill in the 4 values; set NEXT_PUBLIC_SITE_URL to your URL

# 3. Build + run.
docker compose up -d --build

# 4. Check it.
docker compose ps
docker compose logs -f web
```

The app now listens on port **3000**. Test at `http://YOUR_VPS_IP:3000`.

To update after a code change: `git pull && docker compose up -d --build`.
To stop: `docker compose down`.

> If you change any `NEXT_PUBLIC_*` value in `.env`, you must rebuild
> (`docker compose up -d --build`) — a plain restart won't re-inline them.

---

## Option B — build locally, ship a tar (no build on the VPS)

On your machine (Docker Desktop), with `.env.local` filled in:

```powershell
npm run export-docker-image
# builds arlene-lms-web:latest and writes dist/docker/arlene-lms-web-latest-<ts>.tar
```

Copy the tar to the VPS and load it:

```bash
docker load -i arlene-lms-web-latest-<ts>.tar

docker run -d --name arlene-web --restart unless-stopped \
  -p 3000:3000 \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret" \
  -e NEXT_PUBLIC_SITE_URL="https://app.yourclientdomain.com" \
  arlene-lms-web:latest
```

(The `NEXT_PUBLIC_*` values are already baked in from your local `.env.local`;
only the runtime secret + site URL need passing here.)

---

## Putting it behind a domain + HTTPS (recommended for client testing)
Run a reverse proxy (Caddy or Nginx) in front of port 3000 to terminate TLS:

Caddy example (`/etc/caddy/Caddyfile`):
```
app.yourclientdomain.com {
    reverse_proxy 127.0.0.1:3000
}
```

Then set `NEXT_PUBLIC_SITE_URL=https://app.yourclientdomain.com` and rebuild so
password-reset email links point at the right host.

## Supabase side (once)
- Add your public URL to **Auth → URL Configuration → Redirect URLs** so
  email/password + reset flows work from the deployed origin.
