"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertPermission } from "@/lib/auth/permissions"
import type { DocStatus, DocumentInput, UIDocument } from "@/lib/data/documents.types"

const UI_TO_DB_STATUS: Record<DocStatus, "pending" | "approved" | "rejected"> = {
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected",
}

function dbToUiStatus(s: string): DocStatus {
  if (s === "approved") return "Approved"
  if (s === "rejected") return "Rejected"
  return "Pending" // pending / flagged
}

function parseSize(s: string): number | null {
  const m = /([\d.]+)\s*(B|KB|MB|GB)?/i.exec(s.trim())
  if (!m) return null
  const n = parseFloat(m[1])
  const unit = (m[2] || "MB").toUpperCase()
  const mult: Record<string, number> = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 }
  return Math.round(n * (mult[unit] ?? 1))
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return "—"
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(1)} GB`
}

function formatRole(r: string | null): string {
  if (!r) return ""
  return r
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

type DocRow = {
  id: string
  name: string
  category: string | null
  file_type: string | null
  size_bytes: number | null
  description: string | null
  status: string
  source_role: string | null
  created_at: string | null
  owner: { full_name: string | null; email: string | null } | null
}

export async function listDocuments(): Promise<UIDocument[]> {
  await assertPermission("documents.view")
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("documents")
    // documents has two FKs to profiles (owner_id, reviewed_by) → hint owner_id.
    .select(
      "id, name, category, file_type, size_bytes, description, status, source_role, created_at, owner:profiles!documents_owner_id_fkey ( full_name, email )",
    )
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as DocRow[]).map((d) => ({
    id: d.id,
    name: d.name,
    uploader: d.owner?.full_name ?? "",
    uploaderEmail: d.owner?.email ?? "",
    category: d.category ?? "",
    type: d.file_type ?? "",
    size: formatSize(d.size_bytes),
    date: d.created_at ? d.created_at.slice(0, 10) : "",
    status: dbToUiStatus(d.status),
    description: d.description ?? "",
    role: formatRole(d.source_role),
    source: d.source_role === "mentor" ? "mentor" : "admin",
  }))
}

export async function createDocument(
  input: DocumentInput,
): Promise<{ id?: string; error?: string }> {
  let me
  try {
    me = await assertPermission("documents.manage")
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  // Uploader's role → source_role (for the "role" column / mentor-uploads tab).
  const { data: prof } = await admin
    .from("profiles")
    .select("role")
    .eq("id", me.userId)
    .single()

  const { data, error } = await admin
    .from("documents")
    .insert({
      name: input.name.trim() || "New Document",
      category: input.category.trim() || null,
      file_type: input.type.trim() || null,
      size_bytes: parseSize(input.size),
      description: input.description.trim() || null,
      status: "pending",
      owner_id: me.userId,
      source_role: prof?.role ?? null,
      // No storage wired yet — placeholder until real file upload exists.
      file_url: "",
    })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data.id }
}

export async function setDocumentStatus(
  id: string,
  status: DocStatus,
): Promise<{ error?: string }> {
  let me
  try {
    me = await assertPermission("documents.manage")
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const { error } = await admin
    .from("documents")
    .update({
      status: UI_TO_DB_STATUS[status],
      reviewed_by: me.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
  if (error) return { error: error.message }
  return {}
}

export async function deleteDocument(id: string): Promise<{ error?: string }> {
  try {
    await assertPermission("documents.manage")
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  const { error } = await admin.from("documents").delete().eq("id", id)
  if (error) return { error: error.message }
  return {}
}
