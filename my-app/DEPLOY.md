# Deploying to a server (Docker + Caddy)

The app is a **Next.js** server (App Router) that talks to **self-hosted Supabase**
(Postgres, Auth, Storage) running on the **same EC2 instance** as a second compose
project in `~/supabase/docker` — see [Self-hosted Supabase](#self-hosted-supabase).
A **Caddy** container in front terminates TLS for `admin.100bmoc.org` and routes
`/auth/v1`, `/rest/v1`, `/storage/v1` to Supabase and everything else to the app.

## What you need on the server
- Docker Engine + the Docker Compose plugin (`docker compose version` should work).
- The self-hosted Supabase stack running (its `.env` holds the keys below):
  - `NEXT_PUBLIC_SUPABASE_URL` — the LMS's own public URL (`https://admin.100bmoc.org`)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — `ANON_KEY` from `~/supabase/docker/.env`
  - `SUPABASE_SERVICE_ROLE_KEY` — `SERVICE_ROLE_KEY` from the same file (**secret**)

## Key env facts
- `NEXT_PUBLIC_*` are **baked into the browser bundle at build time** → they are
  passed as **build args**. Changing them means rebuilding the image.
- `SUPABASE_SERVICE_ROLE_KEY` is read **at runtime on the server only** and is
  never in the browser bundle. Keep it secret.

---

## Option A — build on the server with Docker Compose (recommended)

```bash
# 1. Get the code onto the server (git clone or scp/rsync).
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

The stack starts two containers: `arlene-web` (the app, bound to `127.0.0.1:3000`)
and `arlene-caddy` (ports 80/443, public). Once the cert is issued the site is live
at `https://$APP_DOMAIN`. On the box itself, `curl -I http://127.0.0.1:3000` checks
the app directly, bypassing the proxy.

To update after a code change: `git pull && docker compose up -d --build`.
To stop: `docker compose down`.

> If you change any `NEXT_PUBLIC_*` value in `.env`, you must rebuild
> (`docker compose up -d --build`) — a plain restart won't re-inline them.

---

## Option B — build locally, ship a tar (no build on the server)

On your machine (Docker Desktop), with `.env.local` filled in:

```powershell
npm run export-docker-image
# builds arlene-lms-web:latest and writes dist/docker/arlene-lms-web-latest-<ts>.tar
```

Copy the tar to the server and load it. Note this path runs the app container only —
if you use it, keep the compose stack for Caddy or run your own reverse proxy:

```bash
docker load -i arlene-lms-web-latest-<ts>.tar

docker run -d --name arlene-web --restart unless-stopped \
  -p 127.0.0.1:3000:3000 \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret" \
  -e NEXT_PUBLIC_SITE_URL="https://100bmoc.org" \
  arlene-lms-web:latest
```

(The `NEXT_PUBLIC_*` values are already baked in from your local `.env.local`;
only the runtime secret + site URL need passing here.)

---

## Putting it behind the domain + HTTPS (production)

The compose stack includes a **Caddy** service that terminates TLS and proxies to
the app. Caddy requests and renews the Let's Encrypt certificate itself — there is
no certbot step and no renewal cron to add.

**Prerequisites (all already true for `100bmoc.org`):**
- The domain's A record points at the server's public IP, and `www` is a CNAME to it.
- Security group allows inbound **80** and **443** from anywhere (port 80 is required
  for the ACME HTTP-01 challenge, not just for the redirect).
- Port **3000 is NOT open to the internet** — the app binds to `127.0.0.1` only.

**Config:** `APP_DOMAIN`, `ACME_EMAIL` and `NEXT_PUBLIC_SITE_URL` in `.env` drive
both Caddy (`./Caddyfile`) and the app. Keep them consistent; `NEXT_PUBLIC_SITE_URL`
must be `https://<APP_DOMAIN>` with no trailing slash.

> Certificates live in the `caddy_data` named volume. Never delete that volume
> casually — re-issuing repeatedly will hit Let's Encrypt rate limits (5 per
> domain per week).

---

## Production deploy — AWS EC2 + 100bmoc.org

### 1. Server prep (once)

```bash
ssh -i arlene-ec2-key.pem ubuntu@3.101.143.234

# Docker Engine + Compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
exit    # log back in so the group membership takes effect
```

### 2. Clone + configure

```bash
ssh -i arlene-ec2-key.pem ubuntu@3.101.143.234
git clone <repo-url> ~/arlene
cd ~/arlene/my-app

cp .env.production.example .env
nano .env     # fill in the Supabase keys; domain values are pre-filled
```

### 3. Build + start

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f caddy    # watch the certificate get issued
```

First boot takes a few minutes: the app image builds, then Caddy completes the ACME
challenge. Once the Caddy log shows `certificate obtained successfully`, the site is
live at **https://100bmoc.org** (and `www` 301-redirects to it).

### 4. Supabase

Supabase runs on this server — set it up per [Self-hosted Supabase](#self-hosted-supabase).
Auth's Site URL / redirect allow-list live in `~/supabase/docker/.env`
(`SITE_URL`, `ADDITIONAL_REDIRECT_URLS`), not in a dashboard.

### 5. Lock down the security group

Once HTTPS is confirmed working, **remove the inbound rule for port 3000**. It was
only needed for pre-domain testing; the app no longer listens on a public port.

---

## Routine operations

```bash
cd ~/arlene/my-app

# Deploy a code change
git pull && docker compose up -d --build

# Logs
docker compose logs -f web
docker compose logs -f caddy

# Restart / stop
docker compose restart web
docker compose down          # keeps the cert volume
```

> Changing any `NEXT_PUBLIC_*` value (including `NEXT_PUBLIC_SITE_URL`) requires
> `--build`. A plain restart will not re-inline them into the browser bundle.

---

## Self-hosted Supabase

The official Supabase Docker stack (upstream `supabase/supabase` → `docker/`),
trimmed for the 4 GB instance by [supabase/selfhost/docker-compose.arlene.yml](supabase/selfhost/docker-compose.arlene.yml):
Studio, Envoy gateway, Postgres 17, Auth, PostgREST, Storage, postgres-meta run;
Realtime, Edge Functions, Supavisor and imgproxy are off (the LMS uses none of them).

| Path on server | What |
|---|---|
| `~/supabase/docker/` | upstream compose + our override; `docker compose …` from here |
| `~/supabase/docker/.env` | all secrets (Postgres password, JWT secret, anon/service keys, Studio login). `chmod 600`, never commit |
| `~/supabase/docker/volumes/db/data` | Postgres data |
| `~/supabase/docker/volumes/storage` | uploaded files |

**Networking.** Nothing is published publicly. The gateway joins the LMS's
`arlene-lms_default` network as `supabase-envoy`; Caddy forwards only
`/auth/v1/*`, `/rest/v1/*`, `/storage/v1/*` to it. Port 8000 is bound to
`127.0.0.1` for Studio. Postgres is not exposed at all.

**Fresh install** (what was done on 2026-10-27):

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/supabase/supabase ~/supabase
cd ~/supabase && git sparse-checkout set docker && cd docker
cp ~/ArleneLmsWebApplication/my-app/supabase/selfhost/docker-compose.arlene.yml .
cp .env.example .env && chmod 600 .env
sh utils/generate-keys.sh --update-env      # fresh secrets
# then set in .env:
#   COMPOSE_FILE=docker-compose.yml:docker-compose.arlene.yml
#   SUPABASE_PUBLIC_URL=https://admin.100bmoc.org
#   API_EXTERNAL_URL=https://admin.100bmoc.org/auth/v1
#   SITE_URL=https://admin.100bmoc.org
#   ADDITIONAL_REDIRECT_URLS=https://admin.100bmoc.org/**
#   DISABLE_SIGNUP=true   ENABLE_PHONE_SIGNUP=false   (accounts are created by admins only)
docker compose up -d --wait

# schema (one transaction; all-or-nothing)
docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
  --single-transaction < ~/ArleneLmsWebApplication/my-app/supabase/init.sql
```

Then copy `ANON_KEY` / `SERVICE_ROLE_KEY` into the LMS `.env` and rebuild the app.

> `DISABLE_SIGNUP=true` matters: `handle_new_user` takes the role from user
> metadata, so open sign-up would let anyone register as `super_admin`.

**Studio (DB dashboard).** From your machine:
`ssh -i arlene-ec2-key.pem -L 8000:127.0.0.1:8000 ubuntu@3.101.143.234`, then open
<http://localhost:8000> — login is `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` from
the stack's `.env`.

**Schema changes.** Write the migration, apply it with
`docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 --single-transaction < migration.sql`,
update `init.sql`, then `npm run types:gen` locally.

**Email (SMTP) — not configured yet.** Self-hosted Auth has no built-in mailer, so
password-reset and student-OTP emails do not send until `SMTP_*` in the stack's
`.env` are filled in (then `docker compose up -d auth`). The student OTP flow also
needs a custom recovery template containing `{{ .Token }}`, set via
`GOTRUE_MAILER_TEMPLATES_RECOVERY` (a URL to the HTML template). Admin-created
accounts and normal password logins work without SMTP.

**Backups.** [supabase/selfhost/backup.sh](supabase/selfhost/backup.sh) dumps the
database (incl. auth users) and archives stored files to `~/backups`, keeping 14 days.
Install it on the server:

```bash
cp ~/ArleneLmsWebApplication/my-app/supabase/selfhost/backup.sh ~/supabase/ && chmod 700 ~/supabase/backup.sh
(crontab -l 2>/dev/null; echo "15 3 * * * /home/ubuntu/supabase/backup.sh >> /home/ubuntu/backups/backup.log 2>&1") | crontab -
```

Those copies live on the same disk — also take EBS snapshots or copy `~/backups` to S3.

**Updating Supabase.** Back up first, then from `~/supabase/docker`:
`sh update.sh --dry-run`, `sh update.sh`, `docker compose pull && docker compose up -d`.

---

## Troubleshooting TLS

| Symptom | Cause / fix |
|---|---|
| Caddy log: `no such host` / challenge fails | DNS not propagated, or A record wrong. Check `dig +short 100bmoc.org`. |
| Challenge times out | Port 80 blocked in the security group. ACME needs it inbound. |
| `too many certificates already issued` | Let's Encrypt rate limit — wait it out, and stop deleting `caddy_data`. |
| Site loads but login redirects to localhost | `NEXT_PUBLIC_SITE_URL` wrong, or image not rebuilt after changing it. |
| iPad kiosk camera does nothing | Page opened over `http://` or the bare IP. Camera only works on the HTTPS domain. |

---

## AWS EC2 Instance Specifications (Configured)

- **Instance Name**: `arlene-lms-production`
- **Public IP**: `3.101.143.234`
- **Domain**: `admin.100bmoc.org` (A record → this IP), DNS managed by the client.
  The apex `100bmoc.org` is a separate WordPress site on another instance.
- **Swap**: 2 GiB `/swapfile` (`vm.swappiness=10`) — headroom for the Supabase stack
- **OS / AMI**: Canonical Ubuntu 24.04 LTS, 64-bit amd64 (`ami-032cd1a6d943449a4`)
- **Instance Type**: `t2.medium` (2 vCPU, 4.0 GiB RAM)
- **Root Storage**: 30 GiB (gp3 SSD)
- **Key Pair**: `arlene-ec2-key` (RSA, `.pem`)
- **Security Group**: `arlene-lms-sg`
  - `SSH (22)`: Admin terminal access
  - `HTTP (80)`: ACME challenge + redirect to HTTPS
  - `HTTPS (443)`: Public traffic & kiosk camera access (`getUserMedia`)
  - ~~`Custom TCP (3000)`~~: remove once HTTPS is verified — app is loopback-only
