"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/data/guards"
import type { NoteStatus, UINote } from "@/lib/data/notes.types"

function snippet(content: string | null, len = 120): string {
  const t = (content ?? "").replace(/\s+/g, " ").trim()
  return t.length > len ? `${t.slice(0, len)}...` : t
}

function formatDateTime(iso: string | null): string {
  if (!iso) return ""
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

type NoteRow = {
  id: string
  title: string
  content: string | null
  category: string | null
  status: string
  author_role: string | null
  created_at: string | null
  author: { full_name: string | null } | null
  session: { title: string | null } | null
}

export async function listNotes(): Promise<UINote[]> {
  await assertAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("notes")
    // notes → profiles only via author_id (student_id→students, session_id→class_sessions).
    .select(
      "id, title, content, category, status, author_role, created_at, author:profiles ( full_name ), session:class_sessions ( title )",
    )
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as NoteRow[]).map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content ?? "",
    snippet: snippet(n.content),
    author: n.author?.full_name ?? "Unknown",
    role: n.author_role ?? "",
    session: n.session?.title ?? "General",
    createdAt: formatDateTime(n.created_at),
    status: (["pending", "approved", "rejected", "flagged"].includes(n.status)
      ? n.status
      : "pending") as NoteStatus,
    category: n.category ?? "",
  }))
}

export async function setNoteStatus(
  id: string,
  status: NoteStatus,
): Promise<{ error?: string }> {
  try {
    await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  const { error } = await admin.from("notes").update({ status }).eq("id", id)
  if (error) return { error: error.message }
  return {}
}
