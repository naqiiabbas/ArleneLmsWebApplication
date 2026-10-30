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

/** Fire after the user changes their own name or photo so the header updates at once. */
export const PROFILE_CHANGED = "lms:profile-changed";
export const notifyProfileChanged = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(PROFILE_CHANGED));
};

/** Fire after a conversation is read or a message is sent so the Messages badge updates at once. */
export const MESSAGES_CHANGED = "lms:messages-changed";
export const notifyMessagesChanged = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(MESSAGES_CHANGED));
};

// Short enough that a new message shows up on the sidebar badge within seconds.
const REFRESH_MS = 20_000;

// One shared poll per tab: the header and the sidebar both read this, so the
// badge never costs a second round of requests.
let shared: HeaderInfo | null = null;
const subscribers = new Set<(i: HeaderInfo | null) => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let inFlight = false;

const load = () => {
  if (inFlight) return;
  inFlight = true;
  getHeaderInfo()
    .then((i) => {
      shared = i;
      subscribers.forEach((fn) => fn(i));
    })
    .catch(() => {
      /* keep the last known value; the header must never break the page */
    })
    .finally(() => {
      inFlight = false;
    });
};

const EVENTS = ["focus", NOTIFICATIONS_CHANGED, PROFILE_CHANGED, MESSAGES_CHANGED] as const;

export function useHeaderInfo(): HeaderInfo | null {
  const [info, setInfo] = useState<HeaderInfo | null>(shared);

  useEffect(() => {
    subscribers.add(setInfo);
    if (subscribers.size === 1) {
      // First subscriber on this page starts the poll + listeners.
      load();
      timer = setInterval(load, REFRESH_MS);
      EVENTS.forEach((e) => window.addEventListener(e, load));
    } else if (shared) {
      setInfo(shared);
    }
    return () => {
      subscribers.delete(setInfo);
      if (subscribers.size === 0) {
        if (timer) clearInterval(timer);
        timer = null;
        EVENTS.forEach((e) => window.removeEventListener(e, load));
      }
    };
  }, []);

  return info;
}

/**
 * Unread-message count next to "Messages" in a sidebar: 1, 2 … 99+. Hidden at
 * zero; it updates with the shared poll and as soon as a chat is read.
 */
export function UnreadMessagesBadge({ className = "" }: { className?: string }) {
  const info = useHeaderInfo();
  const n = info?.unreadMessages ?? 0;
  if (!n) return null;
  return (
    <span
      className={`ml-auto inline-flex h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-full bg-red-500 px-[6px] text-[11px] font-semibold leading-none text-white ${className}`}
      aria-label={`${n} unread message${n === 1 ? "" : "s"}`}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
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
