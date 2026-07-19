"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/data/guards"
import type { ResourceStatus, UIResource } from "@/lib/data/resources.types"

function formatSize(bytes: number | null): string {
  if (bytes == null) return "-"
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function extOf(url: string | null): string | null {
  if (!url) return null
  const clean = url.split("?")[0]
  if (!clean.includes(".")) return null
  return clean.split(".").pop()!.toLowerCase()
}

function formatRole(r: string | null): string {
  if (!r) return ""
  return r
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
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

type ResourceRow = {
  id: string
  title: string
  description: string | null
  uploader_role: string | null
  course: string | null
  size_bytes: number | null
  kind: string
  file_url: string | null
  link_url: string | null
  category: string | null
  tags: string[] | null
  difficulty: string | null
  estimated_time: string | null
  downloads: number
  rating: number | string | null
  featured: boolean
  status: string
  created_at: string | null
  uploader: { full_name: string | null } | null
}

export async function listResources(): Promise<UIResource[]> {
  await assertAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("resources")
    // resources → profiles only via uploaded_by (program_id → programs).
    .select(
      "id, title, description, uploader_role, course, size_bytes, kind, file_url, link_url, category, tags, difficulty, estimated_time, downloads, rating, featured, status, created_at, uploader:profiles ( full_name )",
    )
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as ResourceRow[]).map((r) => {
    const iconType: UIResource["iconType"] =
      r.kind === "link" ? "link" : r.kind === "image" ? "image" : "file"
    const type = extOf(r.file_url) ?? extOf(r.link_url) ?? (r.kind === "link" ? "html" : r.kind)
    const rating = r.rating != null ? Number(r.rating) : null
    return {
      id: r.id,
      title: r.title,
      description: r.description ?? "",
      uploader: r.uploader?.full_name ?? "Unknown",
      role: formatRole(r.uploader_role),
      course: r.course ?? "—",
      size: formatSize(r.size_bytes),
      date: formatDateTime(r.created_at),
      status: (r.status === "approved" ? "approved" : r.status === "rejected" ? "rejected" : "pending") as ResourceStatus,
      tags: r.tags ?? [],
      category: r.category ?? "",
      type,
      downloads: r.downloads ?? 0,
      rating: rating != null ? `${rating.toFixed(1)} / 5.0` : undefined,
      difficulty: r.difficulty ?? undefined,
      estimatedTime: r.estimated_time ?? undefined,
      featured: r.featured,
      iconType,
    }
  })
}

export async function setResourceStatus(
  id: string,
  status: ResourceStatus,
): Promise<{ error?: string }> {
  try {
    await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()
  const { error } = await admin.from("resources").update({ status }).eq("id", id)
  if (error) return { error: error.message }
  return {}
}
