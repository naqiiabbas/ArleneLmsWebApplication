"use server"

// Public, kiosk-facing attendance check-in. There is NO login here — the 4-digit
// attendance code IS the credential (matching the iPad kiosk design). All calls
// use the service-role admin client and are gated only by the code.

import { randomUUID } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { APP_TIMEZONE, formatTimeInZone, ymdInZone } from "@/lib/time"

type Admin = ReturnType<typeof createAdminClient>

const ATTENDANCE_BUCKET = "attendance"
/** Check-in opens this long before a session starts. */
const OPEN_BEFORE_MIN = 60
/** Defaults when the admin settings rows are missing. */
const DEFAULT_GRACE_MIN = 10
const DEFAULT_REQUIRE_PHOTO = true
/** Downscaled JPEG selfies are ~50–150 KB; anything far larger is not a kiosk photo. */
const MAX_PHOTO_BYTES = 5 * 1024 * 1024

type StudentRow = { id: string; profile: { full_name: string | null; status: string } | null }
type Session = {
  id: string
  class_id: string
  title: string | null
  start_at: string
  end_at: string
  class: { name: string | null; timezone: string | null } | null
}
type Existing = { status: string; marked_at: string }

type KioskStatus = "present" | "late"

async function resolveStudent(admin: Admin, code: string): Promise<StudentRow | null> {
  const { data } = await admin
    .from("students")
    .select("id, profile:profiles ( full_name, status )")
    .eq("attendance_code", code)
    .maybeSingle()
  return (data as unknown as StudentRow) ?? null
}

/** Admin-editable settings (Settings page): late grace minutes + photo requirement. */
async function kioskSettings(admin: Admin): Promise<{ graceMin: number; requirePhoto: boolean }> {
  const { data } = await admin
    .from("system_settings")
    .select("key, value")
    .in("key", ["attendance.late_grace_minutes", "attendance.require_photo"])
  const get = (k: string) => data?.find((r) => r.key === k)?.value
  const grace = Number(get("attendance.late_grace_minutes"))
  const photo = get("attendance.require_photo")
  return {
    graceMin: Number.isFinite(grace) && grace >= 0 ? grace : DEFAULT_GRACE_MIN,
    requirePhoto: photo === undefined || photo === null ? DEFAULT_REQUIRE_PHOTO : photo === true || photo === "true",
  }
}

/** Day-of-week (0 = Sun) and "HH:MM:SS" of `at` in `tz`. */
function wallClock(at: Date, tz: string): { dow: number; hms: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ""
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"))
  return { dow, hms: `${get("hour")}:${get("minute")}:${get("second")}` }
}

type Eligibility =
  | { ok: true; student: StudentRow; session: Session; existing: Existing | null }
  | { ok: false; error: string }

/**
 * Who is checking in, and into which session. Shared by the code step and the
 * final submit so a student learns about a problem BEFORE the camera step.
 */
async function eligibility(admin: Admin, code: string, now: Date): Promise<Eligibility> {
  if (!/^\d{4}$/.test(code)) return { ok: false, error: "Please enter a valid 4-digit code." }
  const student = await resolveStudent(admin, code)
  if (!student) return { ok: false, error: "Invalid code. Please try again." }
  if (student.profile && student.profile.status !== "active") {
    return { ok: false, error: "This student account is not active. Please see a staff member." }
  }

  const { data: enr } = await admin
    .from("enrollments")
    .select("class_id")
    .eq("student_id", student.id)
    .eq("status", "active")
  const classIds = (enr ?? []).map((e) => e.class_id).filter(Boolean) as string[]
  if (!classIds.length) {
    return { ok: false, error: "You're not enrolled in a class yet. Please see a staff member." }
  }

  const today = ymdInZone(now)
  const { data: sess } = await admin
    .from("class_sessions")
    .select("id, class_id, title, start_at, end_at, class:classes ( name, timezone )")
    .in("class_id", classIds)
    .eq("session_date", today)
    .neq("status", "cancelled") // a called-off session takes no check-ins
    .order("start_at", { ascending: true })
  const sessions = (sess ?? []) as unknown as Session[]
  if (!sessions.length) return { ok: false, error: "No class session is scheduled for you today." }

  // The session still running or coming up next — not simply the day's first,
  // which marked an evening arrival late against a finished morning session.
  const t = now.getTime()
  const session = sessions.find((s) => new Date(s.end_at).getTime() > t)
  if (!session) return { ok: false, error: "Today's session has already ended." }

  const tz = session.class?.timezone || APP_TIMEZONE
  const opensAt = new Date(session.start_at).getTime() - OPEN_BEFORE_MIN * 60_000
  if (t < opensAt) {
    return {
      ok: false,
      error: `Check-in for "${session.title || "your session"}" opens at ${formatTimeInZone(new Date(opensAt).toISOString(), tz)}.`,
    }
  }

  // Optional weekly windows on the class, evaluated in the CLASS's timezone
  // (the server clock is UTC in Docker). No windows defined → allowed.
  const { data: windows } = await admin
    .from("class_schedules")
    .select("day_of_week, start_time, end_time")
    .eq("class_id", session.class_id)
    .eq("active", true)
  if (windows && windows.length) {
    const { dow, hms } = wallClock(now, tz)
    const open = windows.some((w) => w.day_of_week === dow && String(w.start_time) <= hms && hms <= String(w.end_time))
    if (!open) return { ok: false, error: "Attendance isn't open right now. Please check in during your scheduled class time." }
  }

  const { data: existing } = await admin
    .from("attendance_records")
    .select("status, marked_at")
    .eq("student_id", student.id)
    .eq("session_id", session.id)
    .maybeSingle()

  return { ok: true, student, session, existing: (existing as Existing | null) ?? null }
}

const alreadyMessage = (e: Existing, s: Session) =>
  `You're already checked in (${e.status === "late" ? "late" : "present"} at ${formatTimeInZone(e.marked_at, s.class?.timezone || APP_TIMEZONE)}).`

/** Step 1: validate the code and that a check-in is possible right now. */
export async function verifyAttendanceCode(
  code: string,
): Promise<{ studentId?: string; name?: string; sessionTitle?: string; error?: string }> {
  const admin = createAdminClient()
  const e = await eligibility(admin, code.trim(), new Date())
  if (!e.ok) return { error: e.error }
  if (e.existing && e.existing.status !== "absent") return { error: alreadyMessage(e.existing, e.session) }
  return {
    studentId: e.student.id,
    name: e.student.profile?.full_name ?? "Student",
    sessionTitle: e.session.title || e.session.class?.name || "your session",
  }
}

/**
 * Step 2: record the check-in with the selfie proof. Never overwrites an
 * existing check-in: re-entering a code later used to flip "present" to "late".
 */
export async function markKioskAttendance(
  code: string,
  photoDataUrl: string,
): Promise<{ error?: string; name?: string; status?: KioskStatus; time?: string }> {
  const c = code.trim()
  const admin = createAdminClient()
  const now = new Date()

  const e = await eligibility(admin, c, now)
  if (!e.ok) return { error: e.error }
  const { student, session, existing } = e
  const name = student.profile?.full_name ?? "Student"
  const tz = session.class?.timezone || APP_TIMEZONE
  // An "absent" placeholder (session completed early) may be corrected by a real
  // check-in; any other existing record stands.
  if (existing && existing.status !== "absent") return { error: alreadyMessage(existing, session) }

  const settings = await kioskSettings(admin)

  // Photo proof → private bucket. Required unless an admin turned it off.
  let photoPath: string | null = null
  const m = /^data:(image\/(?:jpeg|png));base64,(.+)$/.exec(photoDataUrl ?? "")
  if (m) {
    const bytes = Buffer.from(m[2], "base64")
    if (bytes.length > MAX_PHOTO_BYTES) return { error: "The photo is too large. Please try again." }
    const ext = m[1] === "image/png" ? "png" : "jpg"
    const path = `${student.id}/${ymdInZone(now, tz)}-${randomUUID()}.${ext}`
    const { error: upErr } = await admin.storage
      .from(ATTENDANCE_BUCKET)
      .upload(path, bytes, { contentType: m[1], upsert: false })
    if (!upErr) photoPath = path
    else if (settings.requirePhoto) return { error: "Your photo couldn't be saved. Please try again." }
  } else if (settings.requirePhoto) {
    return { error: "A photo is required to check in. Please try again." }
  }

  // Present vs late: session start + the admin-configured grace period.
  const cutoff = new Date(session.start_at).getTime() + settings.graceMin * 60_000
  const status: KioskStatus = now.getTime() > cutoff ? "late" : "present"

  const row = {
    student_id: student.id,
    session_id: session.id,
    class_id: session.class_id,
    attendance_date: ymdInZone(now, tz),
    marked_at: now.toISOString(),
    status,
    method: "selfie" as const,
    code_used: c,
    photo_url: photoPath,
  }

  const { error } = existing
    ? await admin.from("attendance_records").update(row).eq("student_id", student.id).eq("session_id", session.id)
    : await admin.from("attendance_records").insert(row)
  if (error) {
    if (photoPath) await admin.storage.from(ATTENDANCE_BUCKET).remove([photoPath])
    // Two taps racing on the same code: the first insert won — report it.
    if (error.code === "23505") return { error: "You're already checked in for this session." }
    return { error: "Attendance couldn't be saved. Please try again." }
  }

  return { name, status, time: formatTimeInZone(row.marked_at, tz) }
}
