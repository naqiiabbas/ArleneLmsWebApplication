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
> **Schema:** full DB design at `my-app/supabase/init.sql` (52 tables, RLS on) — see
> [§8a](#8a-implemented-schema--my-appsupabaseinitsql). ✅ **APPLIED to live Supabase**
> (project `tzvhbymxssiuebafhypk`) via MCP in 4 migrations; advisor clean of errors.

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

## 5b. Mentor Panel (COMPLETE — except iPad check-in kiosk)

Making the platform usable for mentors. Guard: **`assertMentor()`** (`lib/data/guards.ts`,
role='mentor'; middleware already restricts `/mentorshippanel` to mentors). Data scoped to the
mentor's `mentor_student_assignments`.
- **Assigned Students** (`Asignst.tsx`) — WIRED & verified: **`lib/data/mentor.ts`**
  (`getAssignedStudents` = the mentor's active-assignment students + attendance %/sessions from
  `student_attendance_summary` + risk derived from attendance; `getStudentDetail(studentId)` =
  attendance history + notes for one assigned student, ownership-checked). Profile view loads
  detail on open. `academicProgress` empty (no grades-over-time source).
- **Dashboard** (`Mentorshippanel.tsx`) — WIRED & verified: `getMentorDashboard()` — welcome name,
  stats (activeStudents = assignment count, sessionsToday = `class_sessions` for mentor+today,
  pendingNotes = mentor's pending `notes`, alerts = assigned students <70% attendance), today's
  sessions, Mon–Fri weekly attendance (present+late vs absent), recent activity (recent attendance +
  notes, nested `student→profiles`/`class` embeds). Trends dropped (no historical source).
- **Attendance marking** (`Attendancemen.tsx`) — WIRED & verified: `getMentorAttendance()` lists the
  mentor's assigned-students' `attendance_records` (session = `class_sessions.title` ?? `classes.name`);
  `updateMentorAttendance(id, status, notes)` — ownership-checked, writes status/notes/method='manual'/
  marked_by/marked_at. UI edit modal (Present/Absent/Late/Pending) + inline notes persist on blur.
- **Notes & Reports** (`Notesreport.tsx`) — WIRED & verified: `getMentorNotes()` = the mentor's own
  authored `notes` + assigned-student dropdown options; `createMentorNote(input)` inserts with
  `author_role='mentor'` and `status='pending'` (enters the admin Notes Moderation queue);
  `updateMentorNote(id, input)` edits own note (ownership-checked) and resets to pending. Both guard
  that the target student is an active assignment. Each card shows a moderation-status pill.
  **Attachments are UI-only (not persisted)** — follow-up (needs a notes bucket + `note_attachments`).
- **Messaging** (`Messagesmen.tsx`) — WIRED & verified: **reuses `messaging.ts` unchanged** (already
  user-scoped via `currentUserId()`, not admin-gated). Component mirrors the admin `Messagesadmin`
  pattern (load + 5s poll + mark-read + scroll); new-chat modal uses `getAssignedStudentOptions()`
  (new mentor.ts export) → `createDirectConversation(name)` + initial message. Attachments UI-only.
- **Notifications** (`Notificationmentor.tsx`) — WIRED & verified: **reuses `notifications.ts`
  unchanged** (already per-user). Maps DB `type` → icon/colour; mark-read / mark-all / delete.
- **Calendar** (`Calendarmen.tsx`) — WIRED & verified: `getMentorCalendar()` (mentor's `class_sessions`
  + classes for the dropdown) + `createMentorSession(input)` (inserts a `class_sessions` row with
  mentor_id=me). Read grid/upcoming/details; create picks a class. Session notes not persisted
  (no column).
- **Documents** (`Documentmen.tsx`) — WIRED & verified: owner-scoped `getMentorDocuments` +
  `uploadMentorDocument` (real file → `documents` bucket, status pending → admin approval) +
  `getMentorDocumentUrl` (signed) + `deleteMentorDocument`.
- **Resources** (`Resourcemen.tsx`) — WIRED & verified: owner-scoped get/create/update/delete;
  **link-based** (kind='link'); UI "type" round-trips via `tags[0]`; status pending → admin
  moderation. File-upload UI-only (no resources bucket) — follow-up.
- **Blog** (`Blogsmen.tsx`) — WIRED & verified: owner-scoped `getMentorBlogPosts` +
  `saveMentorBlogPost` (create/update own, real image → `blog` bucket, publish/draft) +
  `deleteMentorBlogPost`. blog_posts has no moderation state, so mentor posts publish live
  (matches the "Publish Now" UI).
- **Settings** — the mentor route renders the admin `Settings` component, already wired & self-scoped.
- **Remaining:** only the **iPad attendance check-in** kiosk (student-facing, separate build).
  Cross-cutting follow-ups: attachments for notes & messaging, a resources storage bucket,
  event-driven notification writers.

## 5c. Student Panel (in progress)

The student-facing side of everything above. Guard: **`assertStudent()`** (`lib/data/guards.ts`,
role='student'; returns userId = `students.id` = `profiles.id`; middleware already restricts
`/studentpanel`). Data scoped to **self**. Seeded student login: **student@arlene.com** ("Alex",
enrolled in "Computer Science").
- **Dashboard** (`Studentpanel.tsx`) — WIRED & verified: **`lib/data/student.ts`** —
  `getStudentDashboard()` (stats: attendance % + attended/total from `student_attendance_summary`,
  upcoming sessions within 7d, pending tasks = pending `absence_reports` + pending owned `documents`;
  today's session from enrolled `class_sessions`; recent messages reuse `listConversations()`;
  calendar dots from enrolled sessions — classes via `enrollments`) and `submitAbsenceReport(input)`
  (inserts `absence_reports` pending + notifies the student's active mentor(s) via `createNotification`).
  Removed fabricated agenda/materials from the session modal.
- **My Attendance** (`Attendance.tsx`) — WIRED & verified: `getStudentAttendance()` — stats
  (total/attended/missed/rate/late from `student_attendance_summary`) + history from
  `attendance_records` (session/mentor/time embeds); month + status filters.
- **Still to wire:** the **iPad check-in kiosk** (`attendancewrk`, MediaPipe selfie +
  4-digit code + schedule window → `attendance_records`), Mentor Notes (read own), Messages/
  Notifications (reuse), Calendar/Documents/Resources/Blog (read), Profile, and the student **auth
  flow** (`studentverify`/`createpass`/`forgetpassword` — verify code → set password).

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
- **Role-row sync trigger:** `ensure_role_row` (on `profiles` insert / role-update) auto-creates
  the `mentors`/`students` child row for mentor/student profiles (students get a unique 4-digit
  `attendance_code`). So a mentor/student created from **User Management** (or the signup
  trigger) shows up in Mentor/Student Management without needing the dedicated "Add" flow. Edge
  case: changing a role away from mentor/student leaves the old child row (they may appear in
  both lists) — not auto-cleaned.
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
public read for approved sponsors / published blog / public gallery / public calendar.

**Applied to live Supabase** (project `tzvhbymxssiuebafhypk`) in 4 migrations:
`arlene_init_schema`, `arlene_rls_policies`, `arlene_seed_data`, `arlene_advisor_fixes` (+
`arlene_function_grants_hardening`). Verified: 52 tables, 2 views, 35 enums, 108 policies, 24
triggers, seed rows present. Security advisor: **0 errors**; remaining WARNs are intentional/
accepted — `citext` in public schema (cosmetic), `sponsorship_requests` public-insert policy
(the "Become a Sponsor" form is meant to accept anon submissions), and the RLS helper functions
being executable by anon/authenticated (**required** — RLS policies reference them; revoking
would break RLS).

> **Project note:** the DB has a pre-existing **event trigger `rls_auto_enable`** (not created
> by us) that auto-enables RLS on every new `public` table. So any new table we add gets RLS on
> automatically — still add explicit policies for it.

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

### 9c. Data Layer (Next.js ↔ Supabase)

Scaffolded in `my-app/`. Packages: `@supabase/supabase-js`, `@supabase/ssr`, `server-only`.

- **`lib/database.types.ts`** — TypeScript types auto-generated from the live DB. Regenerate
  after every schema change (via Supabase MCP `generate_typescript_types`, or `npm run
  types:gen` if the Supabase CLI is authed). Do not hand-edit.
- **`lib/supabase/client.ts`** — `createClient()` browser client (publishable key, RLS-scoped).
- **`lib/supabase/server.ts`** — `createClient()` server client (cookie-based session, RLS as
  the signed-in user). Use in Server Components / Route Handlers / Server Actions.
- **`lib/supabase/admin.ts`** — `createAdminClient()` **service-role, SERVER ONLY, bypasses
  RLS** (guarded by `import "server-only"`). Use for trusted/privileged backend ops.
- **`lib/supabase/auth.ts`** — `getUser()`, `getCurrentProfile()`, `isStaffRole()` helpers.
  Always authorize on the server with `getUser()` (revalidates JWT), never `getSession()`.
- **`lib/supabase/middleware.ts`** + **`middleware.ts`** — refresh the auth session cookies on
  every request.
- **Env** (`.env.local`, gitignored; template in `.env.example`):
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key set),
  `SUPABASE_SERVICE_ROLE_KEY` (**placeholder — user must paste from Dashboard → Settings → API**;
  required before admin-client / privileged routes work).

### 9d. Authentication (Supabase Auth)

Real email+password auth replaces the mock logins. Verified end-to-end (create user →
`handle_new_user` trigger → profile role → sign-in → RLS self-read).

- **`lib/auth/config.ts`** — portal→roles map, portal/role home routes (`PORTAL_ROLES`,
  `PORTAL_HOME`, `LOGIN_ROUTE`, `ROLE_HOME`, `homeForRole`).
- **`lib/auth/actions.ts`** — server actions: `signIn(portal,email,password)` (verifies the DB
  role is allowed for that portal, stamps `last_login_at`, redirects to the portal home),
  `signOut(portal?)`, `sendPasswordReset(email)`, `updatePassword(newPassword)`.
- **Login wiring:** `Loginadmin` (admin), `Loginmentor` (mentor), `Sponsorlogin` (sponsor),
  `Studentlogin` (student, Email tab) call `signIn`; their Forgot views call
  `sendPasswordReset`. `Studentforget` too.
- **Logout:** all four sidebars (`Sidebaradmin/mentor/spon` + student `Sidebar`) call
  `signOut(portal)`.
- **Password reset:** email link → **`app/auth/callback/route.ts`** exchanges the code for a
  session → **`app/auth/reset-password/page.tsx`** form calls `updatePassword`.
- **Route protection:** `middleware.ts` gates every `/adminpanel`, `/mentorshippanel`,
  `/sponsorshippanel`, `/studentpanel` route — unauthenticated → portal login; wrong role →
  the user's own home; signed-in users on a login page → their home. Panel login/verify routes
  are exempt. Role is looked up per request in `lib/supabase/middleware.ts`.
- **Env:** `NEXT_PUBLIC_SITE_URL` (reset-email redirect base).

**Not yet wired (deferred):** the Student **"Student ID"** login tab and the
`studentverify → createpass → passsuccessful` OTP/invite flow (still routes-only); admin-driven
**user provisioning** (creating student/mentor/sponsor accounts) — needs the admin API via the
service-role client. **Initial admin seeded:** a Super Admin account `admin@arlene.com` (role `super_admin`, active)
exists for logging into the admin panel — its password is temporary and should be changed after
first login. Other accounts are created via `admin.auth.admin.createUser` with
`user_metadata.role` (or the Supabase dashboard).

### 9g. File Storage (Supabase Storage)

Real file upload/download is wired (verified live). Buckets (in `storage.buckets`, also in
`init.sql` §24): **`documents`** (private, signed-URL access) and **`avatars`** (public, for later).
- Files flow through **server actions using the service-role client** (bypasses storage RLS), so
  no `storage.objects` policies are needed for now.
- **`lib/data/documents.ts`**: `uploadDocument(FormData)` — reads the `file`, uploads to
  `documents/<userId>/<uuid>.<ext>`, stores that **path** in `documents.file_url`, inserts the row
  (rolls back the object if the insert fails); `getDocumentDownloadUrl(id)` — returns a 120s signed
  URL; `deleteDocument` also removes the stored object. `file_type`/`size_bytes` derived from the
  real file.
- **`components/Documentadmin.tsx`**: the upload modal now has a real `<input type="file">`;
  submit posts `FormData` to `uploadDocument`; download opens the signed URL. (The old dummy-blob
  download is gone.)
- **`next.config.mjs`**: `experimental.serverActions.bodySizeLimit = "15mb"` so uploads aren't
  capped at the 1MB default.
- **Reuse pattern** for future file features (avatars, attendance photos, resources): upload via a
  service-role server action to the right bucket, store the object path, serve via signed URL
  (private) or public URL (public bucket).

### 9f. Permission Enforcement (RBAC now governs access)

The role→permission grid is now **enforced**, not just displayed.
- **`lib/auth/permissions.ts`** (`"use server"`) — `getMyPermissions()` (keys + role, for client UI),
  `assertPermission(key)` (throws unless the current user holds `key`; returns `{userId}`).
  Resolver: `super_admin`/`admin` implicitly get **all** permissions; others resolve via
  `profiles.custom_role_id` or, failing that, the `custom_roles` row whose name maps to their role
  enum (manager→Manager, mentor→Mentor, student→Student), then `role_permissions`→keys.
- **Server (the real boundary — admin client bypasses RLS):** each admin data action now calls
  `assertPermission(...)` instead of `assertAdmin`: users→`users.view`/`users.manage`,
  mentors→`mentors.view`/`mentors.manage`, students→`students.view`/`students.manage`,
  documents→`documents.view`/`documents.manage`, roles→`roles.manage`. **Organizations & Calendar
  keep `assertAdmin`** (no matching permission exists in the catalog — see gap below).
- **Client UX:** `components/PermissionsProvider.tsx` (`usePermissions()`, `<Can>`), mounted via
  **`app/adminpanel/layout.tsx`**; the admin sidebar (`Sidebaradmin`) hides nav items the user
  lacks (`permission` per item; `adminOnly` for permission-less modules → super_admin/admin only).
- **Effect:** Managers can now actually use the admin panel (previously `assertAdmin` blocked them);
  they get Users/Students/Mentors/Documents/Attendance/Reports but not Billing/Roles/Activity or the
  admin-only modules. Verified live: Manager users/students/documents=ALLOW, billing/roles=DENY;
  Mentor all admin actions=DENY.
- **Catalog gap:** the 16-permission catalog has no entries for Organizations, Calendar, Messaging,
  Notes, Resource, Blog, Settings — those stay admin-tier (super_admin/admin). Expanding the catalog
  to cover them is a future step.

### 9e. Modules Wired to Real Data

First vertical slice complete — **Admin → User Management** (pattern to follow for other modules):
- **`lib/data/users.types.ts`** — UI-facing types (`AdminUser`, `UIRole`, `UIStatus`, `UserInput`).
- **`lib/data/users.ts`** (`"use server"`) — `listUsers`, `createUser` (admin API + trigger fills
  profile; auto-generates a temp password if none given), `updateUser` (never downgrades a
  `super_admin`; syncs auth email on change), `deleteUser` (cascade via FK; blocks self-delete).
  All guarded by `assertCanManageUsers()` (role ∈ super_admin/admin) as defense-in-depth on top
  of middleware. Uses the **service-role admin client**.
- **`components/Usermanage.tsx`** — mock arrays removed; loads via `listUsers` on mount, mutates
  via the actions + refetches, shows a success/error notice (incl. the generated temp password)
  and loading/empty states. Verified CRUD end-to-end against the live DB.
- UI↔DB role map: Admin↔admin (super_admin also shows as "Admin"), Manager↔manager,
  Mentor↔mentor, Student↔student. Sponsors/parents excluded (own panels).

**Admin → Mentor Management** (2nd slice, verified live):
- **`lib/data/guards.ts`** — shared `assertAdmin()` (role ∈ super_admin/admin) reused by modules.
- **`lib/data/mentors.types.ts`** / **`lib/data/mentors.ts`** (`"use server"`) — `listMentors`
  (joins `mentors` + embedded `profiles`, derives `sessions` from `class_sessions` and
  `students` from active `mentor_student_assignments`, computes avg/month), `createMentor`
  (auth user role=mentor → trigger profile → fills profile + upserts `mentors` row; auto temp
  password), `updateMentor`, `deleteMentor` (cascade auth→profiles→mentors).
- **`components/Mentormanagement.tsx`** — mock removed; loads/mutates via actions + refetch,
  notice/loading/empty states, keeps its PDF report export. UI status Active/Inactive ↔
  profile+mentor `active/inactive` (Inactive also blocks login via `profiles.status`).

**Admin → Student Management** (3rd slice, verified live):
- **`lib/data/students.types.ts`** / **`lib/data/students.ts`** (`"use server"`) — `listStudents`
  (joins `students` + embedded `profiles`; primary mentor name from
  `mentor_student_assignments`; attendance % from the `student_attendance_summary` view; grade
  derived from `gpa`), `createStudent` (auth user role=student → profile → `students` row +
  **auto-assigns a unique 4-digit `attendance_code`**; resolves the typed mentor name to a real
  mentor and sets a single primary assignment; auto temp password), `updateStudent`,
  `deleteStudent` (cascade).
- Mentor field is free-text resolved by case-insensitive `full_name` against role=mentor
  profiles; unmatched names save the student unassigned and report it in the notice.
- **`components/Studentmanagement.tsx`** — mock removed; load/mutate + refetch, notice + inline
  form error + loading/empty states; keeps PDF export.
- **Gotcha (important for all modules):** `mentor_student_assignments` has **two** FKs to
  `profiles` (`mentor_id`, `assigned_by`), so a plain `profiles(...)` embed is ambiguous and
  errors — must hint the FK, e.g. `profiles!mentor_student_assignments_mentor_id_fkey(...)`.

**Admin → Organizations** (4th slice, verified live): **`lib/data/organizations.types.ts`** /
**`lib/data/organizations.ts`** (`"use server"`) — plain single-table CRUD on `organizations`
(no auth user); `listOrganizations` merges the `organization_stats` view for
students/mentors/programs counts (currently 0 until orgs are linked to profiles/students/programs
via `organization_id`). `deleteOrganization` is safe — FKs from profiles/students/programs are
`ON DELETE SET NULL`. **`components/Organization.tsx`** — mock removed, load/mutate + refetch,
notice + inline form error + loading/empty states. UI type↔DB enum
(University/Company/Nonprofit/Government ↔ lowercase), status Active/Inactive ↔ active/inactive.

**Admin → Roles & Permissions** (5th slice, verified live): **`lib/data/roles.types.ts`** /
**`lib/data/roles.ts`** (`"use server"`) over `custom_roles` + `permissions` + `role_permissions`
— `listPermissionGroups` (permission catalog grouped by `group_name`, canonical order),
`listRoles` (roles + assigned permission keys + card group-chips + **user counts** by mapping
role name→profile enum and counting profiles, plus `custom_role_id`), `createRole`/`updateRole`
(replace `role_permissions` set), `deleteRole` (**blocks `is_system` roles**). **`components/Roles.tsx`**
substantially reworked: the previously-static `RoleForm`/`PermissionEditor` are now **controlled**
— name/description/color(→icon) inputs and per-permission checkboxes driven by the DB catalog and
persisted. Delete icon hidden on system roles. Note: `profiles.custom_role_id` isn't assigned by
any UI yet, so custom-role user counts are 0 until a role-assignment flow exists.

**Admin → Calendar** (6th slice, verified live): **`lib/data/events.types.ts`** /
**`lib/data/events.ts`** (`"use server"`) — `listEvents`, `createEvent`, `deleteEvent` on the
`events` table. Since the UI uses a free-text time range and free-text participant labels
("All Students", "+1") that don't map to timestamps / structured `event_participants`, added two
columns **`events.time_label text`** and **`events.participant_labels text[]`** (migration +
init.sql + regenerated `database.types.ts`); the event date is stored in `start_at` at midnight
UTC and read back as its UTC date. **`components/Calendaradmin.tsx`** — mock removed; loads real
events, uses the real "today" (via a mount effect to avoid hydration mismatch), persists new
events, and now **renders event dots on day cells** (was empty before) + upcoming/loading/notice
states. Uses `assertAdmin`.

**Admin → Documents** (7th slice, verified live): **`lib/data/documents.types.ts`** /
**`lib/data/documents.ts`** (`"use server"`) — `listDocuments` (embeds owner via the FK hint
`profiles!documents_owner_id_fkey` — documents has two profiles FKs: owner_id + reviewed_by),
`createDocument`, `setDocumentStatus` (approve/reject → sets `status` + `reviewed_by`/`reviewed_at`),
`deleteDocument`. Size stored as `size_bytes` (parsed from/formatted to a human string). The
**approve/reject review workflow is the core value and persists**. **`components/Documentadmin.tsx`**
— mock removed; loads real docs, approve/reject via actions + refetch, upload creates a metadata
row, notice/loading/empty states. **Storage: WIRED** — see [§9g](#9g-file-storage-supabase-storage).

**Admin → Notifications** (8th slice, verified live) — **per-user** (not admin-management):
**`lib/data/notifications.types.ts`** / **`lib/data/notifications.ts`** (`"use server"`) — scoped to
the current user (no permission gate; every user sees their own). `listMyNotifications` (embeds
sender via FK hint `profiles!notifications_sender_id_fkey` — notifications has two profiles FKs:
recipient_id + sender_id), `markNotificationRead`, `markAllNotificationsRead`, `deleteNotification`
(all filtered by `recipient_id = current user`), and `createNotification` — a **reusable utility
for other modules to generate notifications** (e.g. notify admins on document upload; not yet
wired to events). **`components/Notificationadmin.tsx`** — mock removed; loads real notifications,
icons derived from `type`, mark-read / mark-all / delete persist, loading/empty states. Uses
service-role client with explicit recipient filter (consistent w/ other modules; also resolves
sender names across panels). Seeded 3 sample notifications for `admin@arlene.com` (deletable).

**Admin → Messaging** (9th slice, verified live) — **per-user** (real user-to-user chat):
**`lib/data/messaging.types.ts`** / **`lib/data/messaging.ts`** (`"use server"`) scoped to the
current user's `conversation_participants`. `listConversations` (per convo: other participant
name/role via embed, last message, relative time, **unread count** = messages after my
`last_read_at` from others), `getMessages(convId)` (returns `myId` + messages; verifies
participation), `sendMessage(convId, text)` (inserts message + bumps `conversations.last_message_at`),
`markConversationRead` (**marks read up to the latest message's DB timestamp — not the app clock —
to avoid clock-skew leaving the last message "unread"**), `createDirectConversation(name)`
(resolves the name to a real user, find-or-creates a `direct` conversation). **`components/Messagesadmin.tsx`**
— mock removed + fake auto-reply gone; loads conversations/messages, send persists, "Add New Chat"
resolves a real user by name, marks read on open, and **polls every 5s** for near-real-time updates.
Attachments not wired (paperclip only sets a text placeholder). Presence (online/offline) not
tracked → shown offline.

**Admin → Blog** (10th slice, verified live): **`lib/data/blog.types.ts`** / **`lib/data/blog.ts`**
(`"use server"`, `assertAdmin` — no catalog permission for Blog) over `blog_posts`. `listBlogPosts`
(author via `author:profiles(...)` embed; resolves `image_url` — storage path→public URL, external/
local passthrough), `saveBlogPost(FormData)` (create/update; uploads the featured image to the
**public `blog` bucket** and stores the object path; generates a unique slug; sets `published_at`
on publish; deletes the old image on replace/remove), `deleteBlogPost` (removes image + row).
**`components/Blogsadmin.tsx`** — mock removed; loads real posts, rich-text write/preview,
publish/draft, real featured-image upload (tracks the File separately from the preview object-URL),
list filters, edit, delete, notice/loading/empty. Added the **`blog` public storage bucket**
(migration + init.sql §24). Note: inner `Header`/`SidebarControls` components are defined inside
the render (pre-existing) — can cause tag-input focus loss; not refactored.

**Admin → Reports & Analytics** (11th slice, verified live) — read-only aggregates:
**`lib/data/reports.types.ts`** / **`lib/data/reports.ts`** (`"use server"`, gated by
**`assertPermission("reports.view")`**). `getReportData()` computes everything from real rows
(fetches attendance_records, class_sessions, students, profiles, mentors and aggregates in JS):
stats (avg attendance %, total sessions, active students, avg mentor rating), monthly attendance
trend, cumulative student/mentor growth (last 6 months), monthly session activity, course
distribution (top-4 + Other %), and GPA→grade performance distribution. **`components/Reports.tsx`**
— mock `DASHBOARD_DATA` removed; loads real data, recharts render live aggregates, JSON export uses
real data, loading/notice states. Data is currently sparse (little attendance/session data) → charts
populate as the platform is used, which is correct.

**Admin → Notes Moderation** (12th slice, verified live): **`lib/data/notes.types.ts`** /
**`lib/data/notes.ts`** (`"use server"`, `assertAdmin` — admin-tier, no catalog permission).
`listNotes` (embeds author via `author:profiles(...)` — notes→profiles only via author_id — and
`session:class_sessions(title)`; snippet derived from content; status pending/approved/rejected/
flagged), `setNoteStatus(id, status)` (approve/reject/flag transitions). **`components/Notesmode.tsx`**
— mock removed; loads real notes, moderation actions persist + refetch, wired the previously-dead
"Flag for Review" button, null-guarded the detail panel/modals, loading/empty/notice states. Seeded
2 sample notes. Notes are created by mentors/students elsewhere (not yet wired) — this is the admin
moderation view.

**Admin → Billing** (13th slice, verified live): **`lib/data/billing.types.ts`** /
**`lib/data/billing.ts`** (`"use server"`, gated by **`assertPermission("billing.manage")`** —
super_admin/admin only). `getBillingData()` reads `invoices` (org label via `org:organizations(name)`
+ `sponsor:sponsors(company_name)` embeds, fallback description), `billing_plans` (the 3 seeded
plans), and the active `subscriptions` row (current plan); computes revenue/pending/overdue totals
+ counts. Read-only + client-side PDF export (jspdf). **`components/Billings.tsx`** — mock removed;
Overview/Invoices/Plans tabs render real data (stat cards, invoice table, plan cards with current-
plan detection), loading/empty/notice; simplified the legacy `Amount` special-casing. Seeded 3
sample invoices. No subscription seeded → shows "No active plan". No invoice create/edit UI in the
mock (view-only); payments gateway still record-keeping (per §9 open item).

**Admin → Resources** (14th slice, verified live): **`lib/data/resources.types.ts`** /
**`lib/data/resources.ts`** (`"use server"`, `assertAdmin` — admin-tier, no catalog permission).
`listResources` (embeds `uploader:profiles(full_name)` — resources→profiles only via uploaded_by;
size formatted from `size_bytes`; `type` derived from file_url/link_url extension or `kind`;
iconType from kind; rating "X.X / 5.0"; status flagged→pending for the 3-value UI),
`setResourceStatus(id, status)` (approve/reject). **`components/Resourceadmin.tsx`** — mock removed;
loads real resources, moderation persists + refetch, filters (search/status/category/type),
detail/approve/reject modals, loading/empty/notice. Reject reason field kept but not persisted (no
column). Seeded 2 sample resources. Resources are uploaded by mentors elsewhere (not wired) — this
is the admin review view.

> **supabase-js gotcha (seed scripts):** a multi-row `.insert([a, b])` where objects have DIFFERENT
> keys sends NULL for keys missing in some rows (overriding column defaults) → NOT-NULL violation.
> Insert rows individually, or give every object the same keys.

**Admin → Settings** (15th slice, verified live): **`lib/data/settings.types.ts`** /
**`lib/data/settings.ts`** (`"use server"`, `assertAdmin`). Four tabs map to different stores:
**General** + **Security** → `system_settings` (jsonb key/value: site.name/email/timezone/language,
registration.allow_new/require_approval, security.two_factor_enabled/session_timeout_minutes);
**Notifications** → the current user's `notification_preferences` (email_enabled/in_app_enabled +
type_overrides jsonb weekly/monthly); **Profile** → the current admin's `profiles` row (full_name
from first+last, email w/ auth sync, phone, **bio** [new column], avatar → **first real use of the
`avatars` public bucket**, stores the public URL). `getSettings` loads all four; `saveGeneral/
saveSecurity/saveNotifications/saveProfile` persist per-tab. **`components/Settingsadmin.tsx`** —
mock removed; loads on mount, per-tab save routed by `activeTab`, real avatar upload (tracks File
separately), notice banner (replaces the old alert). **Schema:** added `profiles.bio` (migration +
init.sql + regenerated types). Note: 2FA + session-timeout are stored settings, **not yet enforced**
(2FA would need Supabase MFA).

**Admin → Activity Logs** (16th slice, verified live) — read-only audit:
**`lib/data/activity.types.ts`** / **`lib/data/activity.ts`** (`"use server"`, gated by
**`assertPermission("activity.view")`** — super_admin/admin only). `listActivityLogs()` reads
`activity_logs` (embeds `actor:profiles(full_name)` — only FK to profiles is actor_id; target =
description ?? target_type; actionIcon derived from the action keyword; status success/failed →
Success/Failed; limit 200, newest first). **`components/Activity.tsx`** — mock removed; loads real
logs, stats computed live (total/success/failed/active users), filters (search/action/role/status),
loading/notice, jspdf export of filtered rows. Seeded 5 sample logs. **NOTE:** no code writes to
`activity_logs` yet — like `createNotification`, actually recording actions from the data modules is
a follow-up (add an `logActivity()` helper called on create/update/delete/login).

**Admin → Attendance Control** (17th slice, verified live) — **completes the admin panel**:
**`lib/data/attendance.types.ts`** / **`lib/data/attendance.ts`** (`"use server"`). `getAttendanceData()`
(gated `assertPermission("attendance.view")`) reads `attendance_records` with a **nested embed**
`student:students ( student_code, profile:profiles ( full_name ) )` + `class:classes ( name, batch )`
(attendance→students→profiles; attendance→classes via class_id) and computes stats (this-week
present/absent/late/rate), weekly Mon–Fri breakdown, and 4-week trend. `setAttendanceExcuse(id, excused|
unexcused)` (gated `attendance.manage`) — the **Super-Admin absence excuse workflow** (sets
`excuse`/`excused_by`/`excused_at`). `getAttendancePhotoUrl(id)` — signed URL from the new **private
`attendance` bucket** (ready for the iPad photo-proof flow). **`components/Attencon.tsx`** — mock
removed; real records/stats/recharts, detail modal loads the photo via signed URL + adds
**Mark Excused / Mark Unexcused** buttons for absences, loading/empty/notice. Seeded a sample class
+ 5 attendance records. **iPad check-in flow** (4-digit code entry + photo capture on the kiosk) +
mentor marking are the student/mentor-side pieces, still to build.

**Pattern for the next modules:** `lib/data/<module>.ts` (`"use server"` + `assertAdmin()` from
`lib/data/guards.ts` + service role for privileged ops, or the RLS server client for user-scoped
reads) → wire the existing `components/*.tsx` (load on mount, mutate + refetch, notice/loading
states). When embedding a table with multiple FKs to the same target, disambiguate with the FK
constraint-name hint.

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
