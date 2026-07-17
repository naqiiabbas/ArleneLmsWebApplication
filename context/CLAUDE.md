# CLAUDE.md — Arlene LMS / Mentorship Platform

> **Single source of truth** for this project. This file and the project memory at
> `C:\Users\ZESTRO\.claude\projects\d--ArleneLmsWebApplication\memory\` are kept **in sync**
> (see [§14 Sync Protocol](#14-claudemd--memory-sync-protocol)). Update both together.
>
> Last updated: 2026-07-17 · Doc version basis: client docs v1.0 (Oct–Nov 2025)
>
> **Backend stack DECIDED: Next.js + Supabase** (see [§9](#9-backend-stack--decided)).
> **Workflow rules:** suggest commit titles (`what we did - where we did`), never commit —
> user commits. Keep `init.sql` synced with every migration + Supabase ([§9a](#9a-database--migration-workflow)).
>
> **Schema:** full DB design written at `my-app/supabase/init.sql` (~55 tables, RLS on) —
> see [§8a](#8a-implemented-schema--my-appsupabaseinitsql). Not yet applied to live Supabase.

---

## 1. Project at a Glance

| | |
|---|---|
| **Product** | 100 Black Men of Orange County – Mentorship Management Platform |
| **Internal name** | "Arlene project" / Arlene LMS |
| **Client** | Arlene Barshinger, Founder — 100 Black Men of Orange County (nonprofit) |
| **Built by** | Slicon Systems LLC |
| **What it is** | Cloud-hosted, multi-role web platform digitizing an educational mentorship program — student records, mentoring, attendance, scheduling, communication, documents, sponsor engagement, and payments. |
| **Current state** | **Frontend 100% built (static/mock). Backend NOT started — this is our job.** |
| **Database** | **Supabase** (Postgres + Auth + Storage + Realtime) — client already provisioned. |
| **Repo root** | `d:\ArleneLmsWebApplication` · app lives in `my-app/` · client docs in `my-app/doc/` |

**Goal of the engagement:** build the complete backend (database schema, auth, APIs, storage,
notifications, business logic) that powers the existing frontend, on Supabase.

---

## 2. Business Context & Objectives

Replaces manual/paper workflows for a mentorship nonprofit. Connects **students, mentors,
sponsors, parents, and admins** in one secure portal.

**Business objectives**
- Digital onboarding & management of students, mentors, parents.
- Secure portal for parent–student–mentor communication.
- Digital handling of documents, forms, attendance, permissions.
- Real-time updates, transparency, sponsor visibility.

**Operational objectives**
- Enrollment via digital forms + e-signatures.
- Detailed student profiles accessible by authorized mentors/parents.
- Attendance + absence reporting (incl. from a parent portal concept).
- Automated SMS/email notifications.

**Company info (confidential — do not publish/commit to public repos):**
EIN `38-4277690`, ITIN `901-50-3944`. Used for invoicing/compliance only.

---

## 3. User Roles

| Role | Access |
|---|---|
| **Student** | Own dashboard, attendance/absence reporting, document upload, mentor messaging, calendar, notes view, profile. |
| **Mentor** | Assigned students, student profiles, progress notes, session attendance, messaging, escalate-to-admin, resources, calendar. |
| **Super Admin** | Full control: user & role management, events/blog CMS, compliance & audit logs, backups/monitoring, absence excuse management, sponsor approval, billing. |
| **Sponsor** | Public sponsorship page (no login initially), online sponsor/donation form, own dashboard after approval: sponsorship programs, requests, payments/invoices, reports, messaging. |
| **(Manager)** | A secondary admin-tier role present in the frontend (Roles/Users seed). Treat as scoped admin. |
| **(Parent)** | Referenced in docs (visibility of attendance codes, absence reporting). Not yet a built panel — keep in mind for schema (guardian info on students). |

Auth requirements from docs: multi-role login, JWT-based sessions (→ Supabase Auth JWT),
role-based access control, optional MFA for admins, password reset, email/OTP verification.

---

## 4. Functional Modules (Requirements)

Derived from SRS/PRD, Application Flow, and Document of Understanding. Each maps to DB
tables and API endpoints (see [§8](#8-data-model--schema-map)).

1. **Authentication & RBAC** — multi-role login, JWT (Supabase), RBAC, optional admin MFA,
   email/OTP verification, password reset, first-login profile completion, account
   deactivate/lock.
2. **Student module** — dashboard (today's sessions, attendance summary Present/Absent/Late,
   pending tasks), report-absence flow (date+session+reason+proof upload → notifies mentor+admin),
   document upload (category-tagged, cloud-stored, linked to profile), mentor messaging,
   calendar, optional feedback forms with e-sign.
3. **Mentor module** — dashboard (assigned students, upcoming sessions, missing-notes alerts,
   recent messages), student profile view (info/attendance/docs/notes), add progress notes
   (session date, topic, observations, action items, goals; shared vs. private), session
   attendance marking (Present/Absent/Late → updates dashboards, guardian/admin alerts on
   repeated absence), messaging + "Escalate to Admin" (creates internal ticket/flag).
4. **Super Admin module** — user CRUD + role/permission assignment + deactivate; event &
   content management (events with type/date/location/materials; blog/news publish);
   compliance & audit (attendance compliance reports, audit logs of logins/data changes/file
   access, exports); system monitoring + backup status; absence excuse/unexcuse management.
5. **Sponsor module** — public sponsorship info page (tiers, program, impact stories), online
   sponsor form (company/person, contact, logo, tier, message, media links → status Pending),
   admin review/approve/reject → confirmation email → public listing of approved sponsors.
6. **Messaging** — internal 1:1 and 1:many (Student↔Mentor, Mentor↔Admin, Admin↔Sponsor,
   Admin↔All); threads stored/searchable/archivable; attachments; triggers notifications.
7. **Notifications** — in-app + email (SendGrid/SES) + SMS (Twilio); event-based configurable
   triggers: new message, event reminder, document/form deadline, sponsor status change,
   repeated absence.
8. **Calendar & Events** — public + private per-role calendars; event details (topic, time,
   location/map, description, attached materials, meal plans); role-tailored views.
9. **Documents & Forms** — upload/preview/download (role-based perms); categories; digital
   forms (enrollment, consent, field-trip permission, surveys) with **e-signatures**;
   deadline reminders; virus scanning on upload.
10. **Notes / Reports** — mentor progress notes (see mentor module) + admin note moderation
    (approve/reject/flag).
11. **Blog / Newsletter** — public news page; admin-curated rich content w/ images; draft vs.
    published; categories/tags.
12. **Gallery** — private gallery (public marketing site + panels).
13. **Resources** — shared learning resources (files/links) with approval workflow, tags,
    downloads, ratings.
14. **Sponsorships & Payments** — sponsorship programs (tiers Platinum/Gold/Silver/Bronze),
    sponsorship request wizard, invoices, payment history (Wire/ACH/Check), admin billing +
    plans (Basic/Professional/Enterprise), reports/exports.
15. **Automated Attendance Module** — see [§5](#5-automated-attendance-module-addendum).

---

## 5. Automated Attendance Module (Addendum)

Separate signed addendum. Classroom-mounted **iPad**, zero teacher involvement, photo-verified.

- On enrollment, system auto-generates a **permanent, unique, system-generated 4-digit
  attendance code** per student. Visible to student + parent via the LMS.
- Each class has a predefined **schedule**; attendance is auto-enabled **only within the class
  time window** (no manual enable/disable).
- **iPad flow:** tap "Mark Attendance" → enter 4-digit code → system validates
  (code + identity + time window) → **Picture 1 (preview, positioning only, discarded)** →
  **Picture 2 (final, stored as proof)** → mark success → screen resets. Only the final photo
  is stored.
- **Record fields:** student name+id, class/batch, date+time, status (**Present** or **Late**),
  device (Classroom iPad), final picture (proof). Full audit trail on all records.
- **Admin:** view daily + historical attendance, search by date/class/student, view photo
  proof, export **Excel / PDF / CSV**.
- **Absence mgmt (Super Admin only):** absent-by-default; Super Admin sets **Excused /
  Unexcused**; all changes logged in audit trail.

> Note: the current frontend student check-in (`Attendancewrk.tsx`) uses **MediaPipe face
> landmarks + geolocation + passcode** in-browser — align the backend attendance schema to
> support both the iPad-code flow and the selfie/geo flow (fields: `passcode/code`, `device`,
> `location/geo`, `photo_url`).

---

## 6. Frontend — Tech Stack & Structure

**The frontend is complete but entirely static/mock.** No backend wiring exists: no `app/api`,
no Supabase client, no `fetch`/`axios`/SWR/React Query, no `.env`, no `middleware.ts`. All data
is hardcoded TS arrays inside each `components/*.tsx`; all writes are local `useState` (lost on
refresh). Only `localStorage` is used (UI state + student auth-flow step data).

**Stack:**
- **Next.js 16.2.0** (App Router, heavy `"use client"`), **React 19.2.4**, **TypeScript 5.7.3**.
- **Tailwind CSS v4** + shadcn/ui style (full **Radix UI** suite), `class-variance-authority`,
  `clsx`+`tailwind-merge` via `cn()` in `lib/utils.ts`, `next-themes`, `lucide-react`,
  `react-icons`, `sonner` (toasts), `cmdk`, `vaul`, `input-otp`, `embla-carousel`.
- Forms: `react-hook-form` + `@hookform/resolvers` + **`zod`** (installed, barely used — login
  forms use manual `useState`). ← reuse `zod` for shared FE/BE validation.
- Charts: `recharts`. Dates/calendar: `date-fns` + `react-day-picker` (hand-built grids).
- Export: `jspdf` + `jspdf-autotable`, `html2canvas`, `html-to-image`, `modern-screenshot`
  (client-side PDF/CSV export from mock arrays).
- Attendance selfie: `@mediapipe/tasks-vision`. Analytics: `@vercel/analytics`.
- Config: `next.config.mjs` has `typescript.ignoreBuildErrors: true`, `images.unoptimized: true`.
  `tsconfig` path alias `@/*` → `./*`.

**Route map (`my-app/app/`):**
- **Public site:** `page.tsx` (home), `about`, `program`, `partner`, `blogs` + `blogsinner`,
  `gallery`, `faq`, `contact-us`, `mentormembership`, `student`.
- **`adminpanel/`:** dashboard, `usermanagment`, `studentmanagment`, `mentormanagment`,
  `organization`, `roles`, `attencont`, `documents`, `calendar`, `notesmod`, `reports`,
  `resource`, `blogsad`, `message`, `notification`, `billing`, `activity`, `settings`,
  `loginform`.
- **`mentorshippanel/`:** dashboard, `asignstudent`, `attendancemen`, `documentmen`,
  `calendarmen`, `notesandreport`, `resourcemen`, `blogsmen`, `message`, `notification`,
  `settings`, `loginform`.
- **`sponsorshippanel/`:** dashboard (`Dashspon`), `sponsorpro`, `request` (5-step wizard),
  `payment`, `reports`, `blogs`, `message`, `notification`, `setting`, `loginform`.
- **`studentpanel/`:** dashboard, `attendance` + `attendancewrk` (face/geo check-in),
  `document`, `calendar`, `resource`, `mentornotes` + `viewnotes/[id]` (only dynamic route),
  `messages`, `notification`, `blogs`, `profile`; auth flow `loginform` → `studentverify` →
  `createpass` → `passsuccessful`, plus `forgetpassword`.
- `sidebar/`, `navbarpanel/`, `navbar/` sub-routes are chrome preview pages.

**`lib/` & `hooks/`:** minimal, UI-only. `lib/utils.ts` (`cn()`), `hooks/use-mobile.ts`,
`hooks/use-toast.ts`, `components/exportPdf.ts`. **No `lib/supabase`, `lib/api`, `lib/db`,
`types/`, `data/`, or `services/` — clean slate for the backend.**

---

## 7. Auth — Current State

**Entirely fake.** No tokens, sessions, hashing, or route protection.
- Admin/Mentor/Sponsor login: manual `useState` validation → `setTimeout` → `alert("Login
  Successful!")`.
- Student login: `router.push('/studentpanel/studentverify')` with **no credential check** →
  verify → create-pass → success. `input-otp` present (OTP intended for verify step).
- **We design all real auth** on Supabase Auth (email/password + OTP, JWT, RBAC via
  custom claims / a `roles` table + RLS, optional admin MFA).

---

## 8. Data Model / Schema Map

Every mock array in the frontend = one table. Field names below are **load-bearing** (copy
into schema). File = source component under `my-app/components/`.

| Table | Source file | Key fields |
|---|---|---|
| `users` | Usermanage.tsx | id, name, email, phone, role(Admin/Mentor/Student/Manager), status(Active/Suspended), lastLogin, createdAt |
| `students` | Studentmanagement.tsx, Profile.tsx | id, name, email, phone, mentor, course, status, avatar, enrollmentDate, performance{attendance,grade}, address; profile: major, year, studentId, gpa, dob, about, expectedGraduation, guardian info |
| `student_goals` | Profile.tsx | id, title, status(In Progress/Completed/Not Started), dueDate, progress |
| `student_activities` | Profile.tsx | id, type(session/report/badge/goal), title, date |
| `mentors` | Mentormanagement.tsx, Profile.tsx | id, name, email, expertise, sessions, students, rating, status, phone, experience, address, joinDate, avatar, stats{totalSessions,studentsAssigned,avgPerMonth}, department, availability, tags[], education[] |
| `roles` | Roles.tsx | id, name, description, users, icon, permissions[], remaining |
| `permissions` / `permission_groups` | Roles.tsx | group title (Dashboard/Users/Students/Mentors/Attendance/Documents/Reports/Billing/System), items{title,description} |
| `organizations` | Organization.tsx | id, name, type(University/Company/Nonprofit/Government), contactPerson, email, phone, students, mentors, programs, status, createdAt |
| `attendance` | Attencon.tsx, Attendancemen.tsx, Attendancewrk.tsx | id, studentId, studentName, className, time, status(Present/Absent/Late/Pending), batch, date, device, location, photoUrl, session, notes, code/passcode, excuseStatus(Excused/Unexcused) |
| `conversations` | Messagesadmin.tsx | id, name, role, avatar, status(online/offline), lastMessage, time, unreadCount |
| `messages` | Messagesadmin.tsx | id, conversationId, senderId, text, time, attachments |
| `documents` | Documentadmin.tsx | id, name, uploader, uploaderEmail, category, type, size, date, status(Pending/Approved/Rejected), description, role, source(mentor/admin) |
| `events` | Calendaradmin.tsx | id, title, date, time, type(Session/Meeting/Deadline/Holiday), participants[], description, location, materials |
| `notes` | Notesmode.tsx, Notesreport.tsx | id, title, snippet/content, author, role, session, createdAt, status(pending/approved/rejected/flagged), category, student, attachments[] |
| `resources` | Resourceadmin.tsx | id, title, description, uploader, role, course, size, date, status, tags[], category, type, downloads, rating, difficulty, estimatedTime, featured |
| `blog_posts` | Blogsadmin.tsx | id, title, content, excerpt, category, tags[], image, status(published/draft), date, author |
| `notifications` | Notificationadmin.tsx | id, type(message/session/alert/document/student), title, description, time, sender, unread |
| `invoices` / `plans` | Billings.tsx | id(INV-YYYY-NNN), organization, amount, dueDate, paidDate, status(Paid/Pending/Overdue); plans Basic/Professional/Enterprise |
| `sponsor_invoices` / `payments` | Payment.tsx | invoice{id,program,amount,dateIssued,dueDate,status}; payment{date,amount,method(Wire/ACH/Check),program,status} |
| `sponsorships` | Sponpro.tsx | id, name, tier(Platinum/Gold/Silver/Bronze), amount, status, start, end, deliverables[], timeline[], impact[] |
| `sponsorship_requests` | Request.tsx | id(REQ-NNN), programName, tier, amount, status(Approved/Under review/Pending), submitted, companyName, contactName, email, phone, durationMonths, startDate, benefits[] |
| `activity_logs` | Activity.tsx | id, time, user, role, action, target, ip, status(Success/Failed) |

Additional entities implied by docs: `attendance_codes` (4-digit permanent), `class_schedules`
(time windows), `guardians/parents`, `form_submissions` + `signatures` (e-sign), `escalations`
(mentor→admin tickets), `sponsors` (public listing).

### 8a. Implemented Schema — `my-app/supabase/init.sql`

The full canonical schema is written and lives at **`my-app/supabase/init.sql`** (the
[§9a](#9a-database--migration-workflow) canonical snapshot). ~55 tables across these domains,
all with `updated_at` triggers, FK indexes, and RLS enabled:

- **Identity/RBAC:** `profiles` (1:1 `auth.users`, auto-created via `handle_new_user` trigger,
  `role` enum gate), `custom_roles`, `permissions`, `role_permissions`. Helper fns for RLS:
  `my_role()`, `is_admin()`, `is_super_admin()`, `is_staff()`, `has_role()`.
- **Org/Programs:** `organizations`, `programs`, `classes`, `class_schedules` (weekly windows),
  `class_sessions` (dated meetings), `enrollments`.
- **Students:** `students` (holds permanent 4-digit `attendance_code`), `guardians`,
  `mentor_student_assignments` (M:N), `student_goals`, `student_activities`.
- **Mentors:** `mentors` (tags[]/education[] as arrays).
- **Attendance:** `attendance_records` (both `ipad_code` & `selfie` methods; photo_url, geo,
  `excuse` status), `absence_reports`.
- **Messaging:** `conversations`, `conversation_participants`, `messages`,
  `message_attachments`, `escalations`.
- **Notifications:** `notifications`, `notification_preferences`, `notification_deliveries`
  (Twilio/SendGrid audit).
- **Calendar:** `events`, `event_participants`, `event_materials`.
- **Documents/Forms:** `document_categories`, `documents` (review workflow + virus-scan flags),
  `forms` (jsonb schema), `form_submissions`, `signatures` (e-sign).
- **Notes:** `notes` (moderation `status` + `shared/private` visibility), `note_attachments`.
- **Resources:** `resources`. **Content:** `blog_posts`, `gallery_albums`, `gallery_items`.
- **Sponsors/Billing:** `sponsors` (public listing), `sponsorship_programs`,
  `sponsorship_timeline`, `sponsorship_impact`, `sponsorship_requests` (public insert),
  `billing_plans`, `subscriptions`, `invoices`, `payments`.
- **Audit/System:** `activity_logs`, `system_settings`, `system_backups`.
- **Views:** `organization_stats`, `student_attendance_summary`.
- **Seed:** system roles, permission catalog, document categories, billing plans, settings.

**RLS model:** the Next.js backend uses the Supabase **service-role key (bypasses RLS)**;
policies protect any direct anon/authenticated access — admins full, owners manage own rows,
public read for approved sponsors / published blog / public gallery / public calendar. Not yet
applied to a live DB — will apply via Supabase MCP next.

---

## 9. Backend Stack — DECIDED

**Backend = Next.js** (Route Handlers / Server Actions in the existing `my-app` app) **+
Supabase as DB / Auth / Storage / Realtime.** ✅ Confirmed by user.

- One codebase + one deploy with the existing Next.js 16 frontend.
- Dedicated server-side API layer with Supabase service-role access; Supabase RLS enforces
  security underneath.
- Reuses the already-installed `zod` for shared front/back validation.
- Home for Twilio (SMS), SendGrid/SES (email), PDF/Excel/CSV exports, and scheduled jobs
  (attendance time windows, deadline reminders).

Rejected alternatives: Supabase-native only (Edge Functions get awkward for complex
flows/cron); standalone NestJS/Express (over-engineered for this scope).

**Cross-cutting decisions still to confirm with client/user:** RLS strategy, storage buckets +
virus scanning, notification providers (Twilio SMS, SendGrid/SES email), e-signature approach,
export generation (server vs. client), hosting (Vercel vs. AWS/Azure per docs), MFA for admins,
payments gateway (Stripe/ACH vs. record-keeping), iPad attendance client type.

### 9a. Database & Migration Workflow

- **`init.sql` is the canonical full schema snapshot.** It must stay **in sync with every
  migration and with the live Supabase database** at all times.
- Every schema change follows: write the migration → apply it to Supabase → **update `init.sql`
  to reflect the new full schema**. `init.sql` should always be able to rebuild the database
  from scratch. Never let `init.sql`, the migrations, and Supabase drift apart.

### 9b. Working Conventions (Git / Commits)

- **After every code change, provide a commit title** in the format
  **`what we did - where we did`** (e.g. `add users table migration - db/init.sql`,
  `wire login route to Supabase auth - app/api/auth`).
- **Never run git commit (or push) — the user commits everything themselves.** Only supply the
  suggested commit title; do not execute the commit.

---

## 10. Non-Functional Requirements

- **Security:** encrypted passwords/sessions, enforced HTTPS, RBAC (→ RLS), virus scanning on
  uploads, periodic pen-testing, GDPR-compliant handling, audit logs on sensitive actions.
- **Performance:** < 2s response for major actions.
- **Scalability:** cloud, containerized (Docker present in `my-app/Dockerfile`).
- **Reliability:** daily backups + redundancy/disaster recovery.
- **Maintainability:** modular architecture, CI/CD.

---

## 11. Integrations

Email: **SendGrid** or AWS SES · SMS: **Twilio** · File storage: **Supabase Storage** (docs
said S3/Firebase) · Auth: **Supabase Auth** (JWT, optional admin MFA) · Export: Excel/PDF/CSV.

---

## 12. Commercials & Timeline (reference)

- **Total project cost $5,000** — Upfront 50% ($2,500), Design & Architecture 25% ($1,250),
  Core Development 25% ($1,250).
- Phases: Requirement Gathering (1w) → UI/UX Design (6w) → Development (12w) → Testing/QA (2w) →
  Deployment (4w) → Post-launch support (60 days included).
- **Maintenance:** Gold $400/mo (24/7 monitoring, quarterly pen-testing, WAF/IDS/IPS, threat
  intel, rate-limiting) · Silver $200/mo (standard support, quarterly checks).
- Hosting per docs: AWS ($12–15/mo) or Azure ($20–25/mo). (Supabase now covers DB/Auth/Storage.)
- **Ownership:** all code/assets/docs become property of Arlene Barshinger / 100 Black Men OC on
  full payment.

---

## 13. Client Documents

In `my-app/doc/`:
1. `Arlene_Document_Of_Understanding__(2).pdf` — business overview, scope, roles, stack,
   modules, security, timeline, cost, hosting, company info.
2. `Arlene_SRS_PRD.docx` — formal SRS + PRD (functional/non-functional reqs, deliverables,
   security, maintenance plans, payment breakdown, IP).
3. `Application_Flow (1).docx` — role-wise user journeys + module flows + data-flow overview.
4. `Automated_Attendance_Application_Flow.docx` — the iPad automated-attendance addendum.

---

## 14. CLAUDE.md ↔ Memory Sync Protocol

This file and project memory (`C:\Users\ZESTRO\.claude\projects\d--ArleneLmsWebApplication\memory\`)
must always agree. **Whenever a durable project fact changes** (stack decisions, schema,
requirements, scope, milestones, client preferences):
1. Update the relevant section here.
2. Update/add the matching memory file + its `MEMORY.md` pointer.
3. Bump the "Last updated" date at the top.

Memory holds the compressed, recall-optimized facts; this file holds the full detail. If they
ever diverge, this file wins and memory is corrected to match.

---

## 15. Open Questions / To Confirm

- [x] Backend layer choice — **DECIDED: Next.js + Supabase (§9).**
- [ ] Notification providers: Twilio + SendGrid vs. SES? Accounts/keys available?
- [ ] E-signature: build in-house vs. third-party (e.g. DocuSign/embedded)?
- [ ] Hosting for API/frontend: Vercel vs. AWS/Azure (docs) — Supabase is the DB regardless.
- [ ] iPad automated-attendance client: native app, PWA, or web kiosk?
- [ ] Parent/guardian portal: in first release or later phase?
- [ ] Payments: real gateway (Stripe/ACH) or record-keeping only?
