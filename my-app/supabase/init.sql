-- =============================================================================
-- Arlene LMS / Mentorship Platform — CANONICAL DATABASE SCHEMA (init.sql)
-- 100 Black Men of Orange County — Supabase (PostgreSQL)
--
-- This file is the single source of truth for the full database schema.
-- It MUST stay in sync with every migration and the live Supabase database.
-- Running it on an empty database rebuilds everything from scratch.
-- It is written to be safely re-runnable (guarded enums / IF NOT EXISTS /
-- drop-then-create policies).
--
-- Sections:
--   0. Extensions
--   1. Enums (guarded)
--   2. Utility: updated_at trigger function
--   3. Identity & Access: profiles, roles, permissions
--   4. RBAC helper functions (used by RLS)
--   5. Organizations
--   6. Programs, Classes, Schedules, Sessions, Enrollments
--   7. Students (goals, guardians, activities, mentor assignments)
--   8. Mentors
--   9. Attendance (records + absence reports)
--  10. Messaging (conversations, messages, attachments, escalations)
--  11. Notifications (+ preferences + deliveries)
--  12. Calendar & Events
--  13. Documents, Forms & E-Signatures
--  14. Notes / Reports
--  15. Resources
--  16. Blog / Newsletter & Gallery
--  17. Sponsors, Sponsorships, Requests
--  18. Billing: Invoices, Payments, Plans, Subscriptions
--  19. Audit & System: activity_logs, settings, backups
--  20. Helpful views
--  21. Indexes
--  22. Row Level Security (enable + policies)
--  23. Seed data (roles, permissions, plans, document categories, settings)
-- =============================================================================


-- =========================================================
-- 0. EXTENSIONS
-- =========================================================
create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "citext";         -- case-insensitive email


-- =========================================================
-- 1. ENUMS (guarded so the file is re-runnable)
-- =========================================================
do $$ begin create type user_role as enum
  ('super_admin','admin','manager','mentor','student','sponsor','parent');
exception when duplicate_object then null; end $$;

do $$ begin create type user_status as enum
  ('active','inactive','suspended','pending','invited');
exception when duplicate_object then null; end $$;

do $$ begin create type organization_type as enum
  ('university','company','nonprofit','government','school','other');
exception when duplicate_object then null; end $$;

do $$ begin create type availability_status as enum
  ('available','limited','full','unavailable');
exception when duplicate_object then null; end $$;

do $$ begin create type program_status as enum
  ('active','pending','completed','archived');
exception when duplicate_object then null; end $$;

do $$ begin create type enrollment_status as enum
  ('active','completed','withdrawn','pending');
exception when duplicate_object then null; end $$;

do $$ begin create type session_status as enum
  ('scheduled','in_progress','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin create type attendance_status as enum
  ('present','absent','late','pending','excused_absent');
exception when duplicate_object then null; end $$;

do $$ begin create type attendance_method as enum
  ('ipad_code','selfie','manual','import');
exception when duplicate_object then null; end $$;

do $$ begin create type excuse_status as enum
  ('none','excused','unexcused');
exception when duplicate_object then null; end $$;

do $$ begin create type absence_report_status as enum
  ('pending','reviewed','excused','unexcused','rejected');
exception when duplicate_object then null; end $$;

do $$ begin create type goal_status as enum
  ('not_started','in_progress','completed','on_hold');
exception when duplicate_object then null; end $$;

do $$ begin create type activity_type as enum
  ('session','report','badge','goal','document','note','system');
exception when duplicate_object then null; end $$;

do $$ begin create type conversation_type as enum
  ('direct','group');
exception when duplicate_object then null; end $$;

do $$ begin create type escalation_status as enum
  ('open','in_progress','resolved','dismissed');
exception when duplicate_object then null; end $$;

do $$ begin create type notification_type as enum
  ('message','session','alert','document','student','event','sponsor','billing','system');
exception when duplicate_object then null; end $$;

do $$ begin create type notification_channel as enum
  ('in_app','email','sms');
exception when duplicate_object then null; end $$;

do $$ begin create type delivery_status as enum
  ('queued','sent','delivered','failed','skipped');
exception when duplicate_object then null; end $$;

do $$ begin create type event_type as enum
  ('session','meeting','deadline','holiday','workshop','fundraiser','other');
exception when duplicate_object then null; end $$;

do $$ begin create type visibility as enum
  ('public','private','role_based');
exception when duplicate_object then null; end $$;

do $$ begin create type review_status as enum
  ('pending','approved','rejected','flagged');
exception when duplicate_object then null; end $$;

do $$ begin create type note_visibility as enum
  ('shared','private');
exception when duplicate_object then null; end $$;

do $$ begin create type resource_kind as enum
  ('file','link','image','video');
exception when duplicate_object then null; end $$;

do $$ begin create type content_status as enum
  ('draft','published','archived');
exception when duplicate_object then null; end $$;

do $$ begin create type form_type as enum
  ('enrollment','consent','permission','survey','feedback','agreement','other');
exception when duplicate_object then null; end $$;

do $$ begin create type form_submission_status as enum
  ('draft','submitted','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin create type sponsor_status as enum
  ('pending','approved','rejected','inactive');
exception when duplicate_object then null; end $$;

do $$ begin create type sponsorship_tier as enum
  ('platinum','gold','silver','bronze');
exception when duplicate_object then null; end $$;

do $$ begin create type request_status as enum
  ('pending','under_review','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin create type timeline_state as enum
  ('done','in_progress','pending');
exception when duplicate_object then null; end $$;

do $$ begin create type invoice_status as enum
  ('draft','pending','paid','overdue','outstanding','void');
exception when duplicate_object then null; end $$;

do $$ begin create type payment_method as enum
  ('wire_transfer','ach','check','card','cash','other');
exception when duplicate_object then null; end $$;

do $$ begin create type payment_status as enum
  ('pending','completed','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin create type subscription_status as enum
  ('active','trialing','past_due','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin create type log_status as enum
  ('success','failed');
exception when duplicate_object then null; end $$;


-- =========================================================
-- 2. UTILITY: updated_at trigger
-- =========================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end $$;


-- =========================================================
-- 3. IDENTITY & ACCESS
-- =========================================================

-- Admin-configurable roles (powers the Roles screen). The core access gate is
-- profiles.role (enum); custom_roles add granular, editable permission sets.
create table if not exists public.custom_roles (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  description  text,
  icon         text,
  is_system    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.permissions (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,          -- e.g. 'students.create'
  group_name   text not null,                 -- Dashboard/Users/Students/...
  title        text not null,
  description  text
);

create table if not exists public.role_permissions (
  role_id       uuid not null references public.custom_roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- One row per authenticated user; 1:1 with auth.users.
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  full_name         text,
  email             citext,
  phone             text,
  avatar_url        text,
  role              user_role not null default 'student',
  custom_role_id    uuid references public.custom_roles(id) on delete set null,
  status            user_status not null default 'active',
  bio               text,
  organization_id   uuid,   -- FK added after organizations table
  last_login_at     timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_custom_roles_updated before update on public.custom_roles
  for each row execute function public.set_updated_at();


-- =========================================================
-- 4. RBAC HELPER FUNCTIONS (security definer → bypass RLS to avoid recursion)
-- =========================================================
create or replace function public.my_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and role = 'super_admin');
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and role in ('super_admin','admin','manager'));
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and role in ('super_admin','admin','manager','mentor'));
$$;

create or replace function public.has_role(target user_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and role = target);
$$;

-- Auto-create a profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- handle_new_user is trigger-only: keep it off the public PostgREST RPC surface.
revoke execute on function public.handle_new_user() from public, anon, authenticated;


-- =========================================================
-- 5. ORGANIZATIONS
-- =========================================================
create table if not exists public.organizations (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  type           organization_type not null default 'other',
  contact_person text,
  email          citext,
  phone          text,
  address        text,
  logo_url       text,
  status         user_status not null default 'active',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_org_updated before update on public.organizations
  for each row execute function public.set_updated_at();

-- deferred FK from profiles → organizations
do $$ begin
  alter table public.profiles
    add constraint profiles_organization_fk
    foreign key (organization_id) references public.organizations(id) on delete set null;
exception when duplicate_object then null; end $$;


-- =========================================================
-- 6. PROGRAMS, CLASSES, SCHEDULES, SESSIONS, ENROLLMENTS
-- =========================================================
create table if not exists public.programs (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  organization_id uuid references public.organizations(id) on delete set null,
  status       program_status not null default 'active',
  start_date   date,
  end_date     date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_programs_updated before update on public.programs
  for each row execute function public.set_updated_at();

-- A class / batch (recurring group of students that meets on a schedule).
create table if not exists public.classes (
  id           uuid primary key default gen_random_uuid(),
  program_id   uuid references public.programs(id) on delete set null,
  name         text not null,
  batch        text,
  description  text,
  location     text,
  timezone     text not null default 'America/Los_Angeles',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_classes_updated before update on public.classes
  for each row execute function public.set_updated_at();

-- Recurring weekly time windows during which attendance auto-enables.
create table if not exists public.class_schedules (
  id           uuid primary key default gen_random_uuid(),
  class_id     uuid not null references public.classes(id) on delete cascade,
  day_of_week  smallint check (day_of_week between 0 and 6), -- 0=Sun
  start_time   time not null,
  end_time     time not null,
  location     text,
  active       boolean not null default true
);

-- A concrete dated meeting of a class; attendance is marked against a session.
create table if not exists public.class_sessions (
  id           uuid primary key default gen_random_uuid(),
  class_id     uuid not null references public.classes(id) on delete cascade,
  mentor_id    uuid references public.profiles(id) on delete set null,
  title        text,
  session_date date not null,
  start_at     timestamptz not null,
  end_at       timestamptz not null,
  location     text,
  status       session_status not null default 'scheduled',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_sessions_updated before update on public.class_sessions
  for each row execute function public.set_updated_at();


-- =========================================================
-- 7. STUDENTS
-- =========================================================
create table if not exists public.students (
  id                  uuid primary key references public.profiles(id) on delete cascade,
  student_code        text unique,                 -- human-facing ID
  attendance_code     char(4) unique,              -- permanent 4-digit iPad code
  organization_id     uuid references public.organizations(id) on delete set null,
  course              text,                         -- major/course
  academic_year       text,                         -- grade/year
  gpa                 numeric(3,2),
  school              text,
  date_of_birth       date,
  address             text,
  about               text,
  enrollment_date     date,
  expected_graduation date,
  status              user_status not null default 'active',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger trg_students_updated before update on public.students
  for each row execute function public.set_updated_at();

-- Parent / guardian info (also drives the parent visibility of attendance codes).
create table if not exists public.guardians (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students(id) on delete cascade,
  profile_id   uuid references public.profiles(id) on delete set null, -- if parent logs in
  full_name    text not null,
  relationship text,
  email        citext,
  phone        text,
  address      text,
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Student ↔ Mentor assignments (many-to-many; is_primary = current main mentor).
create table if not exists public.mentor_student_assignments (
  id           uuid primary key default gen_random_uuid(),
  mentor_id    uuid not null references public.profiles(id) on delete cascade,
  student_id   uuid not null references public.students(id) on delete cascade,
  is_primary   boolean not null default true,
  status       enrollment_status not null default 'active',
  assigned_by  uuid references public.profiles(id) on delete set null,
  assigned_at  timestamptz not null default now(),
  unique (mentor_id, student_id)
);

-- Enrollment of a student into a class/program (triggers attendance-code use).
create table if not exists public.enrollments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students(id) on delete cascade,
  class_id     uuid references public.classes(id) on delete cascade,
  program_id   uuid references public.programs(id) on delete set null,
  status       enrollment_status not null default 'active',
  enrolled_at  timestamptz not null default now(),
  unique (student_id, class_id)
);

create table if not exists public.student_goals (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students(id) on delete cascade,
  title        text not null,
  status       goal_status not null default 'not_started',
  due_date     date,
  progress     smallint not null default 0 check (progress between 0 and 100),
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_goals_updated before update on public.student_goals
  for each row execute function public.set_updated_at();

-- Activity feed / achievements (badges use type='badge').
create table if not exists public.student_activities (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students(id) on delete cascade,
  type         activity_type not null,
  title        text not null,
  description  text,
  occurred_at  timestamptz not null default now()
);


-- =========================================================
-- 8. MENTORS
-- =========================================================
create table if not exists public.mentors (
  id               uuid primary key references public.profiles(id) on delete cascade,
  expertise        text,
  department       text,
  experience_years integer,
  rating           numeric(2,1) check (rating between 0 and 5),
  availability     availability_status not null default 'available',
  about            text,
  address          text,
  tags             text[] not null default '{}',
  education        text[] not null default '{}',
  join_date        date,
  status           user_status not null default 'active',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger trg_mentors_updated before update on public.mentors
  for each row execute function public.set_updated_at();

-- Auto-create the role-specific child row (mentors/students) whenever a
-- profile's role is (or becomes) mentor/student — keeps every creation path
-- (User Management, the signup trigger, the dedicated modules) consistent so a
-- mentor/student profile always appears in its management screen.
create or replace function public.ensure_role_row()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  code char(4);
  tries int := 0;
begin
  if new.role = 'mentor' then
    insert into public.mentors (id) values (new.id) on conflict (id) do nothing;
  elsif new.role = 'student' then
    if not exists (select 1 from public.students where id = new.id) then
      loop
        code := lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
        exit when not exists (select 1 from public.students where attendance_code = code);
        tries := tries + 1;
        if tries > 50 then code := null; exit; end if;
      end loop;
      insert into public.students (id, attendance_code) values (new.id, code)
      on conflict (id) do nothing;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_role_row on public.profiles;
create trigger trg_profiles_role_row
after insert or update of role on public.profiles
for each row execute function public.ensure_role_row();


-- =========================================================
-- 9. ATTENDANCE
-- =========================================================
create table if not exists public.attendance_records (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.students(id) on delete cascade,
  session_id     uuid references public.class_sessions(id) on delete set null,
  class_id       uuid references public.classes(id) on delete set null,
  attendance_date date not null default current_date,
  marked_at      timestamptz not null default now(),
  status         attendance_status not null default 'pending',
  method         attendance_method not null default 'manual',
  device         text,                          -- e.g. 'Classroom iPad'
  code_used      char(4),
  location       text,                          -- freeform / address
  latitude       numeric(9,6),
  longitude      numeric(9,6),
  photo_url      text,                          -- final proof photo (Storage)
  excuse         excuse_status not null default 'none',
  notes          text,
  marked_by      uuid references public.profiles(id) on delete set null,
  excused_by     uuid references public.profiles(id) on delete set null,
  excused_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (student_id, session_id)
);
create trigger trg_attendance_updated before update on public.attendance_records
  for each row execute function public.set_updated_at();

-- Student-submitted absence reports (with proof), reviewed by mentor/admin.
create table if not exists public.absence_reports (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.students(id) on delete cascade,
  session_id     uuid references public.class_sessions(id) on delete set null,
  absence_date   date not null,
  reason         text not null,
  proof_url      text,
  status         absence_report_status not null default 'pending',
  reviewed_by    uuid references public.profiles(id) on delete set null,
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_absence_updated before update on public.absence_reports
  for each row execute function public.set_updated_at();


-- =========================================================
-- 10. MESSAGING
-- =========================================================
create table if not exists public.conversations (
  id           uuid primary key default gen_random_uuid(),
  type         conversation_type not null default 'direct',
  title        text,
  created_by   uuid references public.profiles(id) on delete set null,
  last_message_at timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  last_read_at    timestamptz,
  joined_at       timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid references public.profiles(id) on delete set null,
  body            text,
  created_at      timestamptz not null default now()
);

create table if not exists public.message_attachments (
  id           uuid primary key default gen_random_uuid(),
  message_id   uuid not null references public.messages(id) on delete cascade,
  file_url     text not null,
  file_name    text,
  file_type    text,
  size_bytes   bigint
);

-- Mentor → Admin escalation (internal ticket/flag).
create table if not exists public.escalations (
  id              uuid primary key default gen_random_uuid(),
  raised_by       uuid references public.profiles(id) on delete set null,
  student_id      uuid references public.students(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  subject         text not null,
  notes           text,
  status          escalation_status not null default 'open',
  assigned_to     uuid references public.profiles(id) on delete set null,
  resolved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_escalations_updated before update on public.escalations
  for each row execute function public.set_updated_at();


-- =========================================================
-- 11. NOTIFICATIONS
-- =========================================================
create table if not exists public.notifications (
  id            uuid primary key default gen_random_uuid(),
  recipient_id  uuid not null references public.profiles(id) on delete cascade,
  type          notification_type not null default 'system',
  title         text not null,
  body          text,
  sender_id     uuid references public.profiles(id) on delete set null,
  is_read       boolean not null default false,
  entity_type   text,      -- polymorphic link, e.g. 'message','event'
  entity_id     uuid,
  created_at    timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  profile_id       uuid primary key references public.profiles(id) on delete cascade,
  in_app_enabled   boolean not null default true,
  email_enabled    boolean not null default true,
  sms_enabled      boolean not null default false,
  type_overrides   jsonb not null default '{}'::jsonb,  -- per-type channel toggles
  updated_at       timestamptz not null default now()
);
create trigger trg_notif_pref_updated before update on public.notification_preferences
  for each row execute function public.set_updated_at();

-- Delivery audit for external providers (Twilio / SendGrid).
create table if not exists public.notification_deliveries (
  id              uuid primary key default gen_random_uuid(),
  notification_id uuid references public.notifications(id) on delete cascade,
  channel         notification_channel not null,
  provider        text,
  status          delivery_status not null default 'queued',
  provider_ref    text,
  error           text,
  sent_at         timestamptz,
  created_at      timestamptz not null default now()
);


-- =========================================================
-- 12. CALENDAR & EVENTS
-- =========================================================
create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  type         event_type not null default 'session',
  visibility   visibility not null default 'role_based',
  start_at     timestamptz not null,
  end_at       timestamptz,
  location     text,
  meal_plan    text,
  time_label   text,                                    -- free-text display time
  participant_labels text[] not null default '{}',      -- free-text participant tags
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_events_updated before update on public.events
  for each row execute function public.set_updated_at();

-- Invited roles and/or specific participants.
create table if not exists public.event_participants (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events(id) on delete cascade,
  profile_id   uuid references public.profiles(id) on delete cascade,
  invited_role user_role,
  rsvp         text,   -- 'yes' | 'no' | 'maybe' | null
  check (profile_id is not null or invited_role is not null)
);

create table if not exists public.event_materials (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events(id) on delete cascade,
  file_url     text not null,
  name         text,
  file_type    text
);


-- =========================================================
-- 13. DOCUMENTS, FORMS & E-SIGNATURES
-- =========================================================
create table if not exists public.document_categories (
  id     uuid primary key default gen_random_uuid(),
  name   text not null unique
);

create table if not exists public.documents (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  owner_id          uuid references public.profiles(id) on delete set null, -- uploader
  category_id       uuid references public.document_categories(id) on delete set null,
  category          text,           -- denormalized label for convenience
  file_url          text not null,
  file_type         text,
  size_bytes        bigint,
  description       text,
  status            review_status not null default 'pending',
  source_role       user_role,      -- role of uploader
  related_student_id uuid references public.students(id) on delete set null,
  related_event_id  uuid references public.events(id) on delete set null,
  reviewed_by       uuid references public.profiles(id) on delete set null,
  reviewed_at       timestamptz,
  virus_scanned     boolean not null default false,
  virus_clean       boolean,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create trigger trg_documents_updated before update on public.documents
  for each row execute function public.set_updated_at();

-- Digital form templates (schema in jsonb).
create table if not exists public.forms (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  description        text,
  type               form_type not null default 'other',
  schema             jsonb not null default '[]'::jsonb, -- field definitions
  requires_signature boolean not null default false,
  status             content_status not null default 'published',
  created_by         uuid references public.profiles(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger trg_forms_updated before update on public.forms
  for each row execute function public.set_updated_at();

create table if not exists public.form_submissions (
  id           uuid primary key default gen_random_uuid(),
  form_id      uuid not null references public.forms(id) on delete cascade,
  submitted_by uuid references public.profiles(id) on delete set null,
  data         jsonb not null default '{}'::jsonb,
  status       form_submission_status not null default 'submitted',
  submitted_at timestamptz not null default now(),
  reviewed_by  uuid references public.profiles(id) on delete set null,
  reviewed_at  timestamptz
);

create table if not exists public.signatures (
  id                 uuid primary key default gen_random_uuid(),
  form_submission_id uuid not null references public.form_submissions(id) on delete cascade,
  signer_id          uuid references public.profiles(id) on delete set null,
  signer_name        text,
  signature_url      text,      -- drawn signature image in Storage
  signature_data     text,      -- optional base64/typed
  ip_address         inet,
  signed_at          timestamptz not null default now()
);


-- =========================================================
-- 14. NOTES / REPORTS
-- =========================================================
create table if not exists public.notes (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid references public.students(id) on delete cascade,
  author_id    uuid references public.profiles(id) on delete set null,
  author_role  user_role,
  session_id   uuid references public.class_sessions(id) on delete set null,
  title        text not null,
  content      text,
  category     text,       -- Session/Feedback/Progress/Report/Academic/Career/Personal
  visibility   note_visibility not null default 'shared',
  status       review_status not null default 'approved',  -- moderation
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_notes_updated before update on public.notes
  for each row execute function public.set_updated_at();

create table if not exists public.note_attachments (
  id           uuid primary key default gen_random_uuid(),
  note_id      uuid not null references public.notes(id) on delete cascade,
  file_url     text not null,
  name         text
);


-- =========================================================
-- 15. RESOURCES
-- =========================================================
create table if not exists public.resources (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  uploaded_by    uuid references public.profiles(id) on delete set null,
  uploader_role  user_role,
  program_id     uuid references public.programs(id) on delete set null,
  course         text,
  kind           resource_kind not null default 'file',
  file_url       text,
  link_url       text,
  size_bytes     bigint,
  category       text,
  tags           text[] not null default '{}',
  difficulty     text,
  estimated_time text,
  downloads      integer not null default 0,
  rating         numeric(2,1),
  featured       boolean not null default false,
  status         review_status not null default 'pending',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_resources_updated before update on public.resources
  for each row execute function public.set_updated_at();


-- =========================================================
-- 16. BLOG / NEWSLETTER & GALLERY
-- =========================================================
create table if not exists public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text unique,
  content      text,
  excerpt      text,
  category     text,
  tags         text[] not null default '{}',
  image_url    text,
  status       content_status not null default 'draft',
  author_id    uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_blog_updated before update on public.blog_posts
  for each row execute function public.set_updated_at();

create table if not exists public.gallery_albums (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  visibility   visibility not null default 'public',
  cover_url    text,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id           uuid primary key default gen_random_uuid(),
  album_id     uuid references public.gallery_albums(id) on delete cascade,
  image_url    text not null,
  caption      text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);


-- =========================================================
-- 17. SPONSORS, SPONSORSHIPS, REQUESTS
-- =========================================================
create table if not exists public.sponsors (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid references public.profiles(id) on delete set null, -- if they log in
  company_name text not null,
  contact_name text,
  email        citext,
  phone        text,
  logo_url     text,
  website      text,
  tier         sponsorship_tier,
  message      text,
  media_links  text[] not null default '{}',
  status       sponsor_status not null default 'pending',
  is_public    boolean not null default false,   -- show on public listing
  industry     text,
  company_size text,
  address      text,
  city         text,
  state        text,
  zip_code     text,
  approved_by  uuid references public.profiles(id) on delete set null,
  approved_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Sponsor portal team members (Settings → Team Members).
create table if not exists public.sponsor_team_members (
  id           uuid primary key default gen_random_uuid(),
  sponsor_id   uuid not null references public.sponsors(id) on delete cascade,
  name         text not null,
  email        citext,
  role         text,
  access_level text not null default 'Full Access',
  can_remove   boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists idx_sponsor_team_sponsor on public.sponsor_team_members(sponsor_id);
create trigger trg_sponsors_updated before update on public.sponsors
  for each row execute function public.set_updated_at();

create table if not exists public.sponsorship_programs (
  id           uuid primary key default gen_random_uuid(),
  sponsor_id   uuid references public.sponsors(id) on delete cascade,
  name         text not null,
  tier         sponsorship_tier,
  amount       numeric(12,2),
  status       program_status not null default 'pending',
  start_date   date,
  end_date     date,
  deliverables text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_sponpro_updated before update on public.sponsorship_programs
  for each row execute function public.set_updated_at();

create table if not exists public.sponsorship_timeline (
  id           uuid primary key default gen_random_uuid(),
  program_id   uuid not null references public.sponsorship_programs(id) on delete cascade,
  label        text not null,
  due_date     date,
  state        timeline_state not null default 'pending',
  sort_order   integer not null default 0
);

create table if not exists public.sponsorship_impact (
  id           uuid primary key default gen_random_uuid(),
  program_id   uuid not null references public.sponsorship_programs(id) on delete cascade,
  label        text not null,       -- e.g. 'Students Reached'
  value        text not null
);

-- Public "Become a Sponsor" / donation request wizard submissions.
create table if not exists public.sponsorship_requests (
  id              uuid primary key default gen_random_uuid(),
  sponsor_id      uuid references public.sponsors(id) on delete set null,
  program_name    text,
  tier            sponsorship_tier,
  amount          numeric(12,2),
  duration_months integer,
  start_date      date,
  company_name    text,
  contact_name    text,
  email           citext,
  phone           text,
  benefits        text[] not null default '{}',
  status          request_status not null default 'pending',
  reviewed_by     uuid references public.profiles(id) on delete set null,
  reviewed_at     timestamptz,
  submitted_at    timestamptz not null default now()
);


-- =========================================================
-- 18. BILLING: INVOICES, PAYMENTS, PLANS, SUBSCRIPTIONS
-- =========================================================
create table if not exists public.billing_plans (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,   -- Basic / Professional / Enterprise
  price_monthly numeric(10,2) not null,
  features      text[] not null default '{}',
  active        boolean not null default true
);

create table if not exists public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  organization_id    uuid references public.organizations(id) on delete cascade,
  plan_id            uuid references public.billing_plans(id) on delete set null,
  status             subscription_status not null default 'active',
  started_at         timestamptz not null default now(),
  current_period_end timestamptz,
  created_at         timestamptz not null default now()
);

-- Invoices — billed to an organization (admin billing) OR a sponsor.
create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  invoice_number  text unique,                 -- e.g. INV-2025-001
  organization_id uuid references public.organizations(id) on delete set null,
  sponsor_id      uuid references public.sponsors(id) on delete set null,
  program_id      uuid references public.sponsorship_programs(id) on delete set null,
  description     text,
  amount          numeric(12,2) not null,
  currency        char(3) not null default 'USD',
  issued_date     date not null default current_date,
  due_date        date,
  paid_date       date,
  status          invoice_status not null default 'pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_invoices_updated before update on public.invoices
  for each row execute function public.set_updated_at();

create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  invoice_id   uuid references public.invoices(id) on delete set null,
  sponsor_id   uuid references public.sponsors(id) on delete set null,
  program_id   uuid references public.sponsorship_programs(id) on delete set null,
  amount       numeric(12,2) not null,
  method       payment_method not null default 'other',
  status       payment_status not null default 'completed',
  reference    text,
  paid_at      timestamptz not null default now(),
  recorded_by  uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);


-- =========================================================
-- 19. AUDIT & SYSTEM
-- =========================================================
create table if not exists public.activity_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references public.profiles(id) on delete set null,
  actor_role   user_role,
  action       text not null,
  target_type  text,
  target_id    uuid,
  description  text,
  ip_address   inet,
  user_agent   text,
  status       log_status not null default 'success',
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

create table if not exists public.system_settings (
  key          text primary key,
  value        jsonb not null,
  description  text,
  updated_by   uuid references public.profiles(id) on delete set null,
  updated_at   timestamptz not null default now()
);
create trigger trg_settings_updated before update on public.system_settings
  for each row execute function public.set_updated_at();

create table if not exists public.system_backups (
  id           uuid primary key default gen_random_uuid(),
  status       text not null,       -- success | failed | running
  size_bytes   bigint,
  location     text,
  started_at   timestamptz not null default now(),
  completed_at timestamptz
);


-- =========================================================
-- 20. HELPFUL VIEWS
-- =========================================================
-- Organization roll-up counts used by the Organizations screen.
create or replace view public.organization_stats as
select o.id,
       o.name,
       (select count(*) from public.students s where s.organization_id = o.id) as students,
       (select count(*) from public.profiles p
          where p.organization_id = o.id and p.role = 'mentor')                as mentors,
       (select count(*) from public.programs pr where pr.organization_id = o.id) as programs
from public.organizations o;

-- Per-student attendance summary (present/late/absent + %).
create or replace view public.student_attendance_summary as
select s.id as student_id,
       count(*) filter (where a.status = 'present')                    as present,
       count(*) filter (where a.status = 'late')                       as late,
       count(*) filter (where a.status in ('absent','excused_absent')) as absent,
       count(*)                                                        as total,
       round(100.0 * count(*) filter (where a.status in ('present','late'))
             / nullif(count(*),0), 1)                                  as attendance_pct
from public.students s
left join public.attendance_records a on a.student_id = s.id
group by s.id;

-- Views run with the querying user's permissions/RLS (not the creator's).
alter view public.organization_stats        set (security_invoker = on);
alter view public.student_attendance_summary set (security_invoker = on);


-- =========================================================
-- 21. INDEXES
-- =========================================================
create index if not exists idx_profiles_role            on public.profiles(role);
create index if not exists idx_profiles_org             on public.profiles(organization_id);
create index if not exists idx_students_org             on public.students(organization_id);
create index if not exists idx_msa_mentor               on public.mentor_student_assignments(mentor_id);
create index if not exists idx_msa_student              on public.mentor_student_assignments(student_id);
create index if not exists idx_enroll_student           on public.enrollments(student_id);
create index if not exists idx_enroll_class             on public.enrollments(class_id);
create index if not exists idx_sessions_class           on public.class_sessions(class_id);
create index if not exists idx_sessions_date            on public.class_sessions(session_date);
create index if not exists idx_att_student              on public.attendance_records(student_id);
create index if not exists idx_att_session              on public.attendance_records(session_id);
create index if not exists idx_att_date                 on public.attendance_records(attendance_date);
create index if not exists idx_att_status               on public.attendance_records(status);
create index if not exists idx_absence_student          on public.absence_reports(student_id);
create index if not exists idx_msg_conversation         on public.messages(conversation_id);
create index if not exists idx_msg_created              on public.messages(created_at);
create index if not exists idx_cp_profile               on public.conversation_participants(profile_id);
create index if not exists idx_notif_recipient          on public.notifications(recipient_id, is_read);
create index if not exists idx_events_start             on public.events(start_at);
create index if not exists idx_documents_owner          on public.documents(owner_id);
create index if not exists idx_documents_status         on public.documents(status);
create index if not exists idx_notes_student            on public.notes(student_id);
create index if not exists idx_notes_status             on public.notes(status);
create index if not exists idx_resources_status         on public.resources(status);
create index if not exists idx_blog_status              on public.blog_posts(status);
create index if not exists idx_sponsors_status          on public.sponsors(status, is_public);
create index if not exists idx_spr_status               on public.sponsorship_requests(status);
create index if not exists idx_invoices_status          on public.invoices(status);
create index if not exists idx_invoices_org             on public.invoices(organization_id);
create index if not exists idx_payments_invoice         on public.payments(invoice_id);
create index if not exists idx_activity_actor           on public.activity_logs(actor_id);
create index if not exists idx_activity_created         on public.activity_logs(created_at);


-- =========================================================
-- 22. ROW LEVEL SECURITY
-- Backend (Next.js) uses the service-role key, which BYPASSES RLS.
-- These policies protect any direct (anon/authenticated) access via the
-- Supabase client. Pattern: admins full access; owners manage own rows;
-- role-based / public read where appropriate.
-- =========================================================
alter table public.custom_roles              enable row level security;
alter table public.permissions               enable row level security;
alter table public.role_permissions          enable row level security;
alter table public.profiles                  enable row level security;
alter table public.organizations             enable row level security;
alter table public.programs                  enable row level security;
alter table public.classes                   enable row level security;
alter table public.class_schedules           enable row level security;
alter table public.class_sessions            enable row level security;
alter table public.students                  enable row level security;
alter table public.guardians                 enable row level security;
alter table public.mentor_student_assignments enable row level security;
alter table public.enrollments               enable row level security;
alter table public.student_goals             enable row level security;
alter table public.student_activities        enable row level security;
alter table public.mentors                   enable row level security;
alter table public.attendance_records        enable row level security;
alter table public.absence_reports           enable row level security;
alter table public.conversations             enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages                  enable row level security;
alter table public.message_attachments       enable row level security;
alter table public.escalations               enable row level security;
alter table public.notifications             enable row level security;
alter table public.notification_preferences  enable row level security;
alter table public.notification_deliveries   enable row level security;
alter table public.events                    enable row level security;
alter table public.event_participants        enable row level security;
alter table public.event_materials           enable row level security;
alter table public.document_categories       enable row level security;
alter table public.documents                 enable row level security;
alter table public.forms                     enable row level security;
alter table public.form_submissions          enable row level security;
alter table public.signatures                enable row level security;
alter table public.notes                     enable row level security;
alter table public.note_attachments          enable row level security;
alter table public.resources                 enable row level security;
alter table public.blog_posts                enable row level security;
alter table public.gallery_albums            enable row level security;
alter table public.gallery_items             enable row level security;
alter table public.sponsors                  enable row level security;
alter table public.sponsor_team_members      enable row level security;
alter table public.sponsorship_programs      enable row level security;
alter table public.sponsorship_timeline      enable row level security;
alter table public.sponsorship_impact        enable row level security;
alter table public.sponsorship_requests      enable row level security;
alter table public.billing_plans             enable row level security;
alter table public.subscriptions             enable row level security;
alter table public.invoices                  enable row level security;
alter table public.payments                  enable row level security;
alter table public.activity_logs             enable row level security;
alter table public.system_settings           enable row level security;
alter table public.system_backups            enable row level security;

-- ---- profiles ----
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (auth.uid() = id or public.is_staff());
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- ---- RBAC config tables: authenticated read, admin write ----
drop policy if exists custom_roles_rw on public.custom_roles;
create policy custom_roles_rw on public.custom_roles for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists custom_roles_read on public.custom_roles;
create policy custom_roles_read on public.custom_roles for select
  using (auth.role() = 'authenticated');

drop policy if exists permissions_read on public.permissions;
create policy permissions_read on public.permissions for select
  using (auth.role() = 'authenticated');
drop policy if exists permissions_admin on public.permissions;
create policy permissions_admin on public.permissions for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists role_perms_read on public.role_permissions;
create policy role_perms_read on public.role_permissions for select
  using (auth.role() = 'authenticated');
drop policy if exists role_perms_admin on public.role_permissions;
create policy role_perms_admin on public.role_permissions for all
  using (public.is_admin()) with check (public.is_admin());

-- ---- Generic helper macros expressed inline per table ----
-- Staff-managed, staff-readable directory tables
drop policy if exists organizations_admin on public.organizations;
create policy organizations_admin on public.organizations for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists organizations_read on public.organizations;
create policy organizations_read on public.organizations for select
  using (public.is_staff());

drop policy if exists programs_admin on public.programs;
create policy programs_admin on public.programs for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists programs_read on public.programs;
create policy programs_read on public.programs for select
  using (auth.role() = 'authenticated');

drop policy if exists classes_staff on public.classes;
create policy classes_staff on public.classes for all
  using (public.is_staff()) with check (public.is_admin());
drop policy if exists classes_read on public.classes;
create policy classes_read on public.classes for select
  using (auth.role() = 'authenticated');

drop policy if exists schedules_staff on public.class_schedules;
create policy schedules_staff on public.class_schedules for all
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists schedules_read on public.class_schedules;
create policy schedules_read on public.class_schedules for select
  using (auth.role() = 'authenticated');

drop policy if exists sessions_staff on public.class_sessions;
create policy sessions_staff on public.class_sessions for all
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists sessions_read on public.class_sessions;
create policy sessions_read on public.class_sessions for select
  using (auth.role() = 'authenticated');

-- ---- students ----
drop policy if exists students_self on public.students;
create policy students_self on public.students for select
  using (id = auth.uid() or public.is_staff());
drop policy if exists students_self_update on public.students;
create policy students_self_update on public.students for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
drop policy if exists students_admin on public.students;
create policy students_admin on public.students for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists guardians_access on public.guardians;
create policy guardians_access on public.guardians for all
  using (public.is_staff() or profile_id = auth.uid()
         or student_id = auth.uid())
  with check (public.is_admin() or profile_id = auth.uid());

drop policy if exists msa_access on public.mentor_student_assignments;
create policy msa_access on public.mentor_student_assignments for select
  using (mentor_id = auth.uid() or student_id = auth.uid() or public.is_staff());
drop policy if exists msa_admin on public.mentor_student_assignments;
create policy msa_admin on public.mentor_student_assignments for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists enroll_read on public.enrollments;
create policy enroll_read on public.enrollments for select
  using (student_id = auth.uid() or public.is_staff());
drop policy if exists enroll_admin on public.enrollments;
create policy enroll_admin on public.enrollments for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists goals_read on public.student_goals;
create policy goals_read on public.student_goals for select
  using (student_id = auth.uid() or public.is_staff());
drop policy if exists goals_staff on public.student_goals;
create policy goals_staff on public.student_goals for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists activities_read on public.student_activities;
create policy activities_read on public.student_activities for select
  using (student_id = auth.uid() or public.is_staff());
drop policy if exists activities_staff on public.student_activities;
create policy activities_staff on public.student_activities for all
  using (public.is_staff()) with check (public.is_staff());

-- ---- mentors ----
drop policy if exists mentors_read on public.mentors;
create policy mentors_read on public.mentors for select
  using (auth.role() = 'authenticated');
drop policy if exists mentors_self_update on public.mentors;
create policy mentors_self_update on public.mentors for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
drop policy if exists mentors_admin on public.mentors;
create policy mentors_admin on public.mentors for all
  using (public.is_admin()) with check (public.is_admin());

-- ---- attendance ----
drop policy if exists attendance_read on public.attendance_records;
create policy attendance_read on public.attendance_records for select
  using (student_id = auth.uid() or public.is_staff());
drop policy if exists attendance_staff on public.attendance_records;
create policy attendance_staff on public.attendance_records for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists absence_owner on public.absence_reports;
create policy absence_owner on public.absence_reports for select
  using (student_id = auth.uid() or public.is_staff());
drop policy if exists absence_insert on public.absence_reports;
create policy absence_insert on public.absence_reports for insert
  with check (student_id = auth.uid() or public.is_staff());
drop policy if exists absence_staff on public.absence_reports;
create policy absence_staff on public.absence_reports for all
  using (public.is_staff()) with check (public.is_staff());

-- ---- messaging (participants only) ----
drop policy if exists conv_participant on public.conversations;
create policy conv_participant on public.conversations for select
  using (public.is_admin() or exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = id and cp.profile_id = auth.uid()));
drop policy if exists conv_insert on public.conversations;
create policy conv_insert on public.conversations for insert
  with check (created_by = auth.uid() or public.is_staff());

drop policy if exists cp_self on public.conversation_participants;
create policy cp_self on public.conversation_participants for select
  using (profile_id = auth.uid() or public.is_admin() or exists (
    select 1 from public.conversation_participants me
    where me.conversation_id = conversation_id and me.profile_id = auth.uid()));
drop policy if exists cp_manage on public.conversation_participants;
create policy cp_manage on public.conversation_participants for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists messages_participant on public.messages;
create policy messages_participant on public.messages for select
  using (public.is_admin() or exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id and cp.profile_id = auth.uid()));
drop policy if exists messages_send on public.messages;
create policy messages_send on public.messages for insert
  with check (sender_id = auth.uid() and exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id and cp.profile_id = auth.uid()));

drop policy if exists msg_att_read on public.message_attachments;
create policy msg_att_read on public.message_attachments for select
  using (exists (
    select 1 from public.messages m
    join public.conversation_participants cp on cp.conversation_id = m.conversation_id
    where m.id = message_attachments.message_id and cp.profile_id = auth.uid())
    or public.is_admin());
drop policy if exists msg_att_insert on public.message_attachments;
create policy msg_att_insert on public.message_attachments for insert
  with check (auth.role() = 'authenticated');

drop policy if exists escalations_access on public.escalations;
create policy escalations_access on public.escalations for select
  using (raised_by = auth.uid() or assigned_to = auth.uid() or public.is_admin());
drop policy if exists escalations_manage on public.escalations;
create policy escalations_manage on public.escalations for all
  using (public.is_staff()) with check (public.is_staff());

-- ---- notifications (recipient only) ----
drop policy if exists notif_own on public.notifications;
create policy notif_own on public.notifications for select
  using (recipient_id = auth.uid() or public.is_admin());
drop policy if exists notif_update_own on public.notifications;
create policy notif_update_own on public.notifications for update
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
drop policy if exists notif_admin on public.notifications;
create policy notif_admin on public.notifications for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists notif_pref_own on public.notification_preferences;
create policy notif_pref_own on public.notification_preferences for all
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

drop policy if exists notif_deliv_admin on public.notification_deliveries;
create policy notif_deliv_admin on public.notification_deliveries for all
  using (public.is_admin()) with check (public.is_admin());

-- ---- events (public visible; role_based/private for authenticated; staff manage) ----
drop policy if exists events_read on public.events;
create policy events_read on public.events for select
  using (visibility = 'public'
         or (auth.role() = 'authenticated' and visibility = 'role_based')
         or public.is_staff());
drop policy if exists events_staff on public.events;
create policy events_staff on public.events for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists event_part_read on public.event_participants;
create policy event_part_read on public.event_participants for select
  using (profile_id = auth.uid() or public.is_staff());
drop policy if exists event_part_staff on public.event_participants;
create policy event_part_staff on public.event_participants for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists event_mat_read on public.event_materials;
create policy event_mat_read on public.event_materials for select
  using (auth.role() = 'authenticated');
drop policy if exists event_mat_staff on public.event_materials;
create policy event_mat_staff on public.event_materials for all
  using (public.is_staff()) with check (public.is_staff());

-- ---- documents / forms / signatures ----
drop policy if exists doc_cat_read on public.document_categories;
create policy doc_cat_read on public.document_categories for select
  using (auth.role() = 'authenticated');
drop policy if exists doc_cat_admin on public.document_categories;
create policy doc_cat_admin on public.document_categories for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists documents_read on public.documents;
create policy documents_read on public.documents for select
  using (owner_id = auth.uid() or related_student_id = auth.uid() or public.is_staff());
drop policy if exists documents_insert on public.documents;
create policy documents_insert on public.documents for insert
  with check (owner_id = auth.uid() or public.is_staff());
drop policy if exists documents_manage on public.documents;
create policy documents_manage on public.documents for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists forms_read on public.forms;
create policy forms_read on public.forms for select
  using (auth.role() = 'authenticated');
drop policy if exists forms_admin on public.forms;
create policy forms_admin on public.forms for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists form_sub_owner on public.form_submissions;
create policy form_sub_owner on public.form_submissions for select
  using (submitted_by = auth.uid() or public.is_staff());
drop policy if exists form_sub_insert on public.form_submissions;
create policy form_sub_insert on public.form_submissions for insert
  with check (submitted_by = auth.uid() or public.is_staff());
drop policy if exists form_sub_staff on public.form_submissions;
create policy form_sub_staff on public.form_submissions for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists sign_owner on public.signatures;
create policy sign_owner on public.signatures for select
  using (signer_id = auth.uid() or public.is_staff());
drop policy if exists sign_insert on public.signatures;
create policy sign_insert on public.signatures for insert
  with check (signer_id = auth.uid());

-- ---- notes ----
drop policy if exists notes_read on public.notes;
create policy notes_read on public.notes for select
  using (public.is_staff()
         or (student_id = auth.uid() and visibility = 'shared' and status = 'approved'));
drop policy if exists notes_staff on public.notes;
create policy notes_staff on public.notes for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists note_att_read on public.note_attachments;
create policy note_att_read on public.note_attachments for select
  using (exists (select 1 from public.notes n
    where n.id = note_attachments.note_id
      and (public.is_staff() or (n.student_id = auth.uid() and n.visibility='shared'))));
drop policy if exists note_att_staff on public.note_attachments;
create policy note_att_staff on public.note_attachments for all
  using (public.is_staff()) with check (public.is_staff());

-- ---- resources (approved visible to all authenticated; staff manage) ----
drop policy if exists resources_read on public.resources;
create policy resources_read on public.resources for select
  using (status = 'approved' or uploaded_by = auth.uid() or public.is_staff());
drop policy if exists resources_insert on public.resources;
create policy resources_insert on public.resources for insert
  with check (uploaded_by = auth.uid() or public.is_staff());
drop policy if exists resources_staff on public.resources;
create policy resources_staff on public.resources for all
  using (public.is_staff()) with check (public.is_staff());

-- ---- blog (published public; staff manage) ----
drop policy if exists blog_public on public.blog_posts;
create policy blog_public on public.blog_posts for select
  using (status = 'published' or public.is_staff());
drop policy if exists blog_staff on public.blog_posts;
create policy blog_staff on public.blog_posts for all
  using (public.is_staff()) with check (public.is_staff());

-- ---- gallery (public albums anon-visible; staff manage) ----
drop policy if exists gallery_alb_read on public.gallery_albums;
create policy gallery_alb_read on public.gallery_albums for select
  using (visibility = 'public' or public.is_staff());
drop policy if exists gallery_alb_staff on public.gallery_albums;
create policy gallery_alb_staff on public.gallery_albums for all
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists gallery_item_read on public.gallery_items;
create policy gallery_item_read on public.gallery_items for select
  using (exists (select 1 from public.gallery_albums a
    where a.id = gallery_items.album_id
      and (a.visibility='public' or public.is_staff())));
drop policy if exists gallery_item_staff on public.gallery_items;
create policy gallery_item_staff on public.gallery_items for all
  using (public.is_staff()) with check (public.is_staff());

-- ---- sponsors: public listing readable by anyone; self + admin manage ----
drop policy if exists sponsors_public on public.sponsors;
create policy sponsors_public on public.sponsors for select
  using ((is_public and status = 'approved') or profile_id = auth.uid() or public.is_admin());
drop policy if exists sponsors_self on public.sponsors;
create policy sponsors_self on public.sponsors for update
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());
drop policy if exists sponsors_admin on public.sponsors;
create policy sponsors_admin on public.sponsors for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists sponsor_team_access on public.sponsor_team_members;
create policy sponsor_team_access on public.sponsor_team_members for all
  using (exists (select 1 from public.sponsors s where s.id = sponsor_id and s.profile_id = auth.uid()) or public.is_admin())
  with check (exists (select 1 from public.sponsors s where s.id = sponsor_id and s.profile_id = auth.uid()) or public.is_admin());

drop policy if exists sponpro_access on public.sponsorship_programs;
create policy sponpro_access on public.sponsorship_programs for select
  using (public.is_admin() or exists (
    select 1 from public.sponsors s
    where s.id = sponsorship_programs.sponsor_id and s.profile_id = auth.uid()));
drop policy if exists sponpro_admin on public.sponsorship_programs;
create policy sponpro_admin on public.sponsorship_programs for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists sptl_read on public.sponsorship_timeline;
create policy sptl_read on public.sponsorship_timeline for select
  using (public.is_admin() or exists (
    select 1 from public.sponsorship_programs p join public.sponsors s on s.id = p.sponsor_id
    where p.id = sponsorship_timeline.program_id and s.profile_id = auth.uid()));
drop policy if exists sptl_admin on public.sponsorship_timeline;
create policy sptl_admin on public.sponsorship_timeline for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists spim_read on public.sponsorship_impact;
create policy spim_read on public.sponsorship_impact for select
  using (public.is_admin() or exists (
    select 1 from public.sponsorship_programs p join public.sponsors s on s.id = p.sponsor_id
    where p.id = sponsorship_impact.program_id and s.profile_id = auth.uid()));
drop policy if exists spim_admin on public.sponsorship_impact;
create policy spim_admin on public.sponsorship_impact for all
  using (public.is_admin()) with check (public.is_admin());

-- Sponsorship requests: public may INSERT (become a sponsor); admin reviews.
drop policy if exists spr_insert on public.sponsorship_requests;
create policy spr_insert on public.sponsorship_requests for insert
  with check (true);
drop policy if exists spr_read on public.sponsorship_requests;
create policy spr_read on public.sponsorship_requests for select
  using (public.is_admin() or exists (
    select 1 from public.sponsors s
    where s.id = sponsorship_requests.sponsor_id and s.profile_id = auth.uid()));
drop policy if exists spr_admin on public.sponsorship_requests;
create policy spr_admin on public.sponsorship_requests for all
  using (public.is_admin()) with check (public.is_admin());

-- ---- billing ----
drop policy if exists plans_read on public.billing_plans;
create policy plans_read on public.billing_plans for select
  using (auth.role() = 'authenticated');
drop policy if exists plans_admin on public.billing_plans;
create policy plans_admin on public.billing_plans for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists subs_admin on public.subscriptions;
create policy subs_admin on public.subscriptions for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists invoices_access on public.invoices;
create policy invoices_access on public.invoices for select
  using (public.is_admin() or exists (
    select 1 from public.sponsors s
    where s.id = invoices.sponsor_id and s.profile_id = auth.uid()));
drop policy if exists invoices_admin on public.invoices;
create policy invoices_admin on public.invoices for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists payments_access on public.payments;
create policy payments_access on public.payments for select
  using (public.is_admin() or exists (
    select 1 from public.sponsors s
    where s.id = payments.sponsor_id and s.profile_id = auth.uid()));
drop policy if exists payments_admin on public.payments;
create policy payments_admin on public.payments for all
  using (public.is_admin()) with check (public.is_admin());

-- ---- audit & system (admin only; logs insertable by authenticated) ----
drop policy if exists activity_admin on public.activity_logs;
create policy activity_admin on public.activity_logs for select
  using (public.is_admin());
drop policy if exists activity_insert on public.activity_logs;
create policy activity_insert on public.activity_logs for insert
  with check (auth.role() = 'authenticated');

drop policy if exists settings_admin on public.system_settings;
create policy settings_admin on public.system_settings for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists backups_admin on public.system_backups;
create policy backups_admin on public.system_backups for all
  using (public.is_super_admin()) with check (public.is_super_admin());


-- =========================================================
-- 23. SEED DATA
-- =========================================================
insert into public.custom_roles (name, description, is_system) values
  ('Super Admin', 'Full system control', true),
  ('Manager',     'Scoped administrative access', true),
  ('Mentor',      'Mentors assigned students', true),
  ('Student',     'Program participant', true)
on conflict (name) do nothing;

-- Granular permission catalog (view/manage split) matching the frontend
-- permission editor and the client documents' role capabilities.
insert into public.permissions (key, group_name, title, description) values
  ('dashboard.view',    'Dashboard',  'View Dashboard',     'Access to main dashboard'),
  ('users.view',        'Users',      'View Users',         'View user list and details'),
  ('users.manage',      'Users',      'Manage Users',       'Create, edit, delete users'),
  ('students.view',     'Students',   'View Students',      'View student information'),
  ('students.manage',   'Students',   'Manage Students',    'Full student management'),
  ('mentors.view',      'Mentors',    'View Mentors',       'View mentor information'),
  ('mentors.manage',    'Mentors',    'Manage Mentors',     'Full mentor management'),
  ('attendance.view',   'Attendance', 'View Attendance',    'View attendance records'),
  ('attendance.manage', 'Attendance', 'Manage Attendance',  'Mark and edit attendance'),
  ('documents.view',    'Documents',  'View Documents',     'View and download documents'),
  ('documents.manage',  'Documents',  'Manage Documents',   'Upload, approve, delete documents'),
  ('reports.view',      'Reports',    'View Reports',       'View analytics and reports'),
  ('reports.generate',  'Reports',    'Generate Reports',   'Create and export reports'),
  ('billing.manage',    'Billing',    'Manage Billing',     'Handle billing and invoices'),
  ('roles.manage',      'System',     'Manage Roles',       'Create and edit roles'),
  ('activity.view',     'System',     'View Activity Logs', 'Access system logs')
on conflict (key) do update
  set group_name = excluded.group_name,
      title = excluded.title,
      description = excluded.description;

-- Default role → permission assignments (per client documents).
-- Super Admin: all permissions.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.custom_roles r cross join public.permissions p
where r.name = 'Super Admin'
on conflict do nothing;
-- Manager / Mentor / Student: scoped sets.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from (values
  ('Manager','dashboard.view'), ('Manager','users.view'), ('Manager','users.manage'),
  ('Manager','students.view'), ('Manager','students.manage'),
  ('Manager','mentors.view'), ('Manager','mentors.manage'),
  ('Manager','attendance.view'), ('Manager','attendance.manage'),
  ('Manager','documents.view'), ('Manager','documents.manage'),
  ('Manager','reports.view'), ('Manager','reports.generate'),
  ('Mentor','dashboard.view'), ('Mentor','students.view'),
  ('Mentor','attendance.view'), ('Mentor','attendance.manage'),
  ('Mentor','documents.view'), ('Mentor','reports.view'),
  ('Student','dashboard.view'), ('Student','attendance.view'), ('Student','documents.view')
) as m(role_name, perm_key)
join public.custom_roles r on r.name = m.role_name
join public.permissions p on p.key = m.perm_key
on conflict do nothing;

insert into public.document_categories (name) values
  ('Reports'),('Attendance'),('Feedback'),('Enrollment'),('Session Notes'),
  ('Certificates'),('Assignments'),('Course Materials'),('Other')
on conflict (name) do nothing;

insert into public.billing_plans (name, price_monthly, features) values
  ('Basic',        49.00,  array['Core LMS','Email support']),
  ('Professional', 99.00,  array['Everything in Basic','SMS notifications','Priority support']),
  ('Enterprise',   199.00, array['Everything in Professional','SSO','Dedicated engineer'])
on conflict (name) do nothing;

insert into public.system_settings (key, value, description) values
  ('attendance.late_grace_minutes', '10',   'Minutes after start still counted as present'),
  ('attendance.require_photo',      'true',  'Require final photo proof for iPad check-in'),
  ('notifications.default_channels','["in_app","email"]', 'Default notification channels')
on conflict (key) do nothing;

-- =========================================================
-- 24. STORAGE BUCKETS
-- Files are accessed via Next.js server actions using the service-role client
-- (bypasses storage RLS), so no storage.objects policies are needed for now.
--   documents: PRIVATE (served via signed URLs) · avatars: PUBLIC
-- =========================================================
insert into storage.buckets (id, name, public) values ('documents', 'documents', false)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('blog', 'blog', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('attendance', 'attendance', false)
on conflict (id) do nothing;

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
