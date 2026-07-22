"use server"

import { randomUUID } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { assertPermission } from "@/lib/auth/permissions"
import { logActivity, notifyAdmins, notifyUsers } from "@/lib/data/audit"
import type { DocStatus, DocumentInput, UIDocument } from "@/lib/data/documents.types"

const DOCUMENTS_BUCKET = "documents"

function fileTypeLabel(mime: string, ext: string): string {
  const e = ext.toLowerCase()
  if (e === "pdf" || mime === "application/pdf") return "PDF"
  if (["xls", "xlsx", "csv"].includes(e)) return "Excel"
  if (["doc", "docx"].includes(e)) return "Word"
  if (["ppt", "pptx"].includes(e)) return "PowerPoint"
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(e)) return "Image"
  return e ? e.toUpperCase() : "File"
}

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

/**
 * Upload a real file to the `documents` bucket and create its document row.
 * `formData` must contain: file (File), name (string), category (string).
 */
export async function uploadDocument(
  formData: FormData,
): Promise<{ id?: string; error?: string }> {
  let me
  try {
    me = await assertPermission("documents.manage")
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const file = formData.get("file")
  const name = (formData.get("name") as string | null)?.trim() || ""
  const category = (formData.get("category") as string | null)?.trim() || ""
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." }
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop()! : ""
  const path = `${me.userId}/${randomUUID()}${ext ? "." + ext : ""}`
  const bytes = new Uint8Array(await file.arrayBuffer())

  const { error: upErr } = await admin.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, bytes, { contentType: file.type || "application/octet-stream", upsert: false })
  if (upErr) return { error: upErr.message }

  const { data: prof } = await admin
    .from("profiles")
    .select("role")
    .eq("id", me.userId)
    .single()

  const { data, error } = await admin
    .from("documents")
    .insert({
      name: name || file.name,
      category: category || null,
      file_type: fileTypeLabel(file.type, ext),
      size_bytes: file.size,
      description: (formData.get("description") as string | null)?.trim() || null,
      status: "pending",
      owner_id: me.userId,
      source_role: prof?.role ?? null,
      file_url: path, // storage object path (private bucket)
    })
    .select("id")
    .single()
  if (error) {
    // Roll back the uploaded object if the row insert failed.
    await admin.storage.from(DOCUMENTS_BUCKET).remove([path])
    return { error: error.message }
  }

  await notifyAdmins({ type: "document", title: "New document uploaded", body: `${name || file.name} was uploaded for review.`, senderId: me.userId, entityType: "document", entityId: data.id }, admin)
  await logActivity({ actorId: me.userId, actorRole: prof?.role ?? null, action: "Uploaded document", targetType: "document", targetId: data.id, description: name || file.name }, admin)
  return { id: data.id }
}

/** Short-lived signed URL to view/download a document's stored file. */
export async function getDocumentDownloadUrl(
  id: string,
): Promise<{ url?: string; name?: string; error?: string }> {
  try {
    await assertPermission("documents.view")
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const { data: doc } = await admin
    .from("documents")
    .select("file_url, name")
    .eq("id", id)
    .single()
  if (!doc?.file_url) {
    return { error: "No file is attached to this document." }
  }

  const { data, error } = await admin.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(doc.file_url, 120)
  if (error) return { error: error.message }
  return { url: data.signedUrl, name: doc.name }
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

  const { data: doc } = await admin.from("documents").select("owner_id, name").eq("id", id).single()
  if (doc?.owner_id) {
    await notifyUsers([doc.owner_id], { type: "document", title: `Document ${status.toLowerCase()}`, body: `"${doc.name}" was ${status.toLowerCase()} by an administrator.`, senderId: me.userId, entityType: "document", entityId: id }, admin)
  }
  await logActivity({ actorId: me.userId, action: `${status} document`, targetType: "document", targetId: id, description: doc?.name ?? undefined }, admin)
  return {}
}

export async function deleteDocument(id: string): Promise<{ error?: string }> {
  try {
    await assertPermission("documents.manage")
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  // Remove the stored file (if any) before deleting the row.
  const { data: doc } = await admin
    .from("documents")
    .select("file_url")
    .eq("id", id)
    .single()
  if (doc?.file_url) {
    await admin.storage.from(DOCUMENTS_BUCKET).remove([doc.file_url])
  }

  const { error } = await admin.from("documents").delete().eq("id", id)
  if (error) return { error: error.message }
  return {}
}
