"use client";

// Opens a direct chat from a "Send Message" link: /…/message?to=<profile id>.
// Those buttons (on a student in Student Management, on a mentor's student
// view) either did nothing or dropped you in the inbox with no chat open.
import { useEffect, useRef } from "react";
import { openDirectConversationWith } from "@/lib/data/messaging";

/** Build the link for a portal's messages page that opens a chat with `userId`. */
export const chatLink = (messagesPath: string, userId: string) =>
  `${messagesPath}?to=${encodeURIComponent(userId)}`;

/**
 * On mount, if the URL carries ?to=<id>, find-or-create that conversation and
 * hand its id to `onOpen` (which should refresh the list and select it).
 * Reads window.location directly so pages don't need a Suspense boundary.
 */
export function useChatDeepLink(onOpen: (conversationId: string) => void | Promise<void>, onError?: (msg: string) => void) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const params = new URLSearchParams(window.location.search);
    const to = params.get("to");
    if (!to) return;
    // Drop the parameter so a refresh doesn't re-open / re-create the chat.
    params.delete("to");
    const rest = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (rest ? `?${rest}` : ""));
    openDirectConversationWith(to)
      .then(async (res) => {
        if (res.error || !res.id) onError?.(res.error ?? "Could not open that conversation.");
        else await onOpen(res.id);
      })
      .catch((e) => onError?.((e as Error).message));
    // Runs once on mount by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
