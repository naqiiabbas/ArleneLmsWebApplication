"use client";

// Live data for the panel headers (admin / mentor / student / sponsor): the
// signed-in user's name + photo and whether they have unread notifications.
import { useEffect, useState } from "react";
import { getHeaderInfo } from "@/lib/data/me";
import type { HeaderInfo } from "@/lib/data/me.types";

/** Fire after marking notifications read/deleted so the bell updates at once. */
export const NOTIFICATIONS_CHANGED = "lms:notifications-changed";
export const notifyNotificationsChanged = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
};

const REFRESH_MS = 60_000;

export function useHeaderInfo(): HeaderInfo | null {
  const [info, setInfo] = useState<HeaderInfo | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      getHeaderInfo()
        .then((i) => alive && setInfo(i))
        .catch(() => {
          /* keep the last known value; the header must never break the page */
        });

    load();
    const timer = setInterval(load, REFRESH_MS);
    window.addEventListener("focus", load);
    window.addEventListener(NOTIFICATIONS_CHANGED, load);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener("focus", load);
      window.removeEventListener(NOTIFICATIONS_CHANGED, load);
    };
  }, []);

  return info;
}

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

/**
 * The user's uploaded photo, or their initials — never a stock photo of
 * someone else. Fills its (relatively positioned, sized) parent.
 */
export function HeaderAvatar({ info, textClass = "text-[14px]" }: { info: HeaderInfo | null; textClass?: string }) {
  if (!info) return <span className="absolute inset-0 animate-pulse bg-white/25" />;
  if (info.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={info.avatarUrl} alt={info.name} className="absolute inset-0 h-full w-full object-cover" />;
  }
  return (
    <span className={`absolute inset-0 flex items-center justify-center bg-white/25 font-bold text-white ${textClass}`}>
      {initials(info.name)}
    </span>
  );
}

/** Red dot on the bell — only when there's something unread. */
export function NotificationDot({ info }: { info: HeaderInfo | null }) {
  if (!info?.unreadNotifications) return null;
  return (
    <span
      className="absolute right-2.5 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#F4A11D] bg-red-500"
      aria-label={`${info.unreadNotifications} unread notification${info.unreadNotifications === 1 ? "" : "s"}`}
    />
  );
}

/** Name line: real name, or a placeholder bar while loading. */
export function HeaderName({ info, className }: { info: HeaderInfo | null; className: string }) {
  if (!info) return <span className={`block h-[13px] w-[96px] animate-pulse rounded bg-white/30 ${className}`} />;
  return (
    <p className={`max-w-[160px] truncate ${className}`} title={info.email}>
      {info.name}
    </p>
  );
}
