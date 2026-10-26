// Timezone-correct date/time helpers for class sessions.
//
// Sessions happen in the class's local time (classes.timezone; every class is
// America/Los_Angeles today), but the server runs in UTC in Docker and in
// whatever zone a dev machine uses. Anything built from the server clock —
// `new Date("2026-07-20T10:00")`, `toLocaleTimeString()`, "today" — is
// therefore wrong for these users. Use these helpers instead. Pure functions,
// safe on both server and client.

/** Zone used when a class has no timezone of its own. */
export const APP_TIMEZONE = "America/Los_Angeles"

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/
const HM_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export function isValidYmd(s: string): boolean {
  if (!YMD_RE.test(s)) return false
  const [y, m, d] = s.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

export function isValidHm(s: string): boolean {
  return HM_RE.test(s)
}

/** Wall-clock parts of instant `at` as seen in `tz`. */
function partsInZone(at: Date, tz: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  }
}

/** How far `tz`'s wall clock is ahead of UTC at instant `at`, in ms. */
function offsetMs(at: number, tz: string): number {
  const p = partsInZone(new Date(at), tz)
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - at
}

/**
 * The UTC instant for wall-clock `ymd` + `hm` in `tz`.
 * zonedTimeToUtc("2026-07-20", "10:00", "America/Los_Angeles") → 17:00Z.
 * Two passes so a time near a DST switch uses the offset in force at that time.
 */
export function zonedTimeToUtc(ymd: string, hm: string, tz: string = APP_TIMEZONE): Date {
  const [y, mo, d] = ymd.split("-").map(Number)
  const [h, mi] = hm.split(":").map(Number)
  const wall = Date.UTC(y, mo - 1, d, h, mi)
  let ts = wall - offsetMs(wall, tz)
  const second = offsetMs(ts, tz)
  if (second !== wall - ts) ts = wall - second
  return new Date(ts)
}

/** Calendar date ("yyyy-mm-dd") of instant `at` in `tz` — e.g. "today" there. */
export function ymdInZone(at: Date = new Date(), tz: string = APP_TIMEZONE): string {
  const p = partsInZone(at, tz)
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`
}

/** "HH:MM" (24h) of instant `iso` in `tz` — for prefilling <input type="time">. */
export function hmInZone(iso: string | null, tz: string = APP_TIMEZONE): string {
  if (!iso) return ""
  const p = partsInZone(new Date(iso), tz)
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`
}

/** Display time of instant `iso` in `tz`, e.g. "9:00 AM". */
export function formatTimeInZone(iso: string | null, tz: string = APP_TIMEZONE): string {
  if (!iso) return ""
  return new Date(iso).toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" })
}

/** `ymd` shifted by `days` calendar days (pure date math, no zone involved). */
export function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return dt.toISOString().slice(0, 10)
}

/** Monday of the week containing `ymd` (weeks run Mon–Sun). */
export function mondayOfWeek(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number)
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay() // 0 = Sunday
  return addDaysYmd(ymd, -((dow + 6) % 7))
}

/** Long display date for a "yyyy-mm-dd" calendar date, e.g. "Monday, July 20, 2026". */
export function formatLongDate(ymd: string): string {
  if (!isValidYmd(ymd)) return ymd
  const [y, m, d] = ymd.split("-").map(Number)
  // Noon UTC keeps the calendar date stable in any display zone.
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
