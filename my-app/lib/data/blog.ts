"use server"

import { randomUUID } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/data/guards"
import type { BlogStatus, UIBlogPost } from "@/lib/data/blog.types"

const BLOG_BUCKET = "blog"

type Admin = ReturnType<typeof createAdminClient>

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "post"
  )
}

// A stored image_url may be a storage object path, an external URL, or a local
// asset path (seed data). Resolve to something an <img> can display.
function resolveImageUrl(admin: Admin, value: string | null): string | null {
  if (!value) return null
  if (value.startsWith("http") || value.startsWith("/")) return value
  return admin.storage.from(BLOG_BUCKET).getPublicUrl(value).data.publicUrl
}

// True when the stored value is one of our uploaded storage object paths.
function isStoragePath(value: string | null): value is string {
  return !!value && !value.startsWith("http") && !value.startsWith("/")
}

type BlogRow = {
  id: string
  title: string
  content: string | null
  excerpt: string | null
  category: string | null
  tags: string[] | null
  image_url: string | null
  status: string
  published_at: string | null
  created_at: string | null
  author: { full_name: string | null } | null
}

/**
 * Published posts only — readable by any authenticated user (student/mentor
 * blog readers). No admin guard; never exposes drafts.
 */
export async function listPublishedBlogPosts(): Promise<UIBlogPost[]> {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("blog_posts")
    .select(
      "id, title, content, excerpt, category, tags, image_url, status, published_at, created_at, author:profiles ( full_name )",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as BlogRow[]).map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content ?? "",
    excerpt: p.excerpt ?? "",
    category: p.category ?? "",
    tags: p.tags ?? [],
    image: resolveImageUrl(admin, p.image_url),
    status: "published",
    date: new Date(p.published_at ?? p.created_at ?? Date.now()).toLocaleDateString("en-US"),
    author: p.author?.full_name ?? "",
  }))
}

export async function listBlogPosts(): Promise<UIBlogPost[]> {
  await assertAdmin()
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("blog_posts")
    .select(
      "id, title, content, excerpt, category, tags, image_url, status, published_at, created_at, author:profiles ( full_name )",
    )
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as BlogRow[]).map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content ?? "",
    excerpt: p.excerpt ?? "",
    category: p.category ?? "",
    tags: p.tags ?? [],
    image: resolveImageUrl(admin, p.image_url),
    status: p.status === "published" ? "published" : "draft",
    date: new Date(p.published_at ?? p.created_at ?? Date.now()).toLocaleDateString("en-US"),
    author: p.author?.full_name ?? "",
  }))
}

/** Create or update a blog post. FormData carries the fields + optional image. */
export async function saveBlogPost(
  formData: FormData,
): Promise<{ id?: string; error?: string }> {
  let me
  try {
    me = await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const id = (formData.get("id") as string | null) || null
  const title = ((formData.get("title") as string) || "").trim()
  if (!title) return { error: "Please enter a title." }

  const content = (formData.get("content") as string) || ""
  const excerpt = ((formData.get("excerpt") as string) || "").trim()
  const category = ((formData.get("category") as string) || "").trim()
  const status = (formData.get("status") as BlogStatus) || "draft"
  let tags: string[] = []
  try {
    tags = JSON.parse((formData.get("tags") as string) || "[]")
  } catch {
    tags = []
  }

  // Resolve featured-image change: new upload, explicit removal, or unchanged.
  const file = formData.get("image")
  const removeImage = formData.get("removeImage") === "true"
  let imageUrl: string | null | undefined = undefined // undefined = leave unchanged
  if (file instanceof File && file.size > 0) {
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "png"
    const path = `${randomUUID()}.${ext}`
    const bytes = new Uint8Array(await file.arrayBuffer())
    const { error: upErr } = await admin.storage
      .from(BLOG_BUCKET)
      .upload(path, bytes, { contentType: file.type || "image/png", upsert: false })
    if (upErr) return { error: upErr.message }
    imageUrl = path
  } else if (removeImage) {
    imageUrl = null
  }

  if (id) {
    // Update existing.
    const { data: existing } = await admin
      .from("blog_posts")
      .select("published_at, image_url")
      .eq("id", id)
      .single()

    const publishedAt =
      status === "published" ? existing?.published_at ?? new Date().toISOString() : existing?.published_at ?? null

    const base = {
      title,
      content,
      excerpt: excerpt || null,
      category: category || null,
      tags,
      status,
      published_at: publishedAt,
    }
    const patch = imageUrl !== undefined ? { ...base, image_url: imageUrl } : base

    // If replacing/removing an uploaded image, delete the old object.
    if (imageUrl !== undefined && isStoragePath(existing?.image_url ?? null) && existing?.image_url !== imageUrl) {
      await admin.storage.from(BLOG_BUCKET).remove([existing!.image_url!])
    }

    const { error } = await admin.from("blog_posts").update(patch).eq("id", id)
    if (error) return { error: error.message }
    return { id }
  }

  // Create new.
  const { data, error } = await admin
    .from("blog_posts")
    .insert({
      title,
      slug: `${slugify(title)}-${randomUUID().slice(0, 6)}`,
      content,
      excerpt: excerpt || null,
      category: category || null,
      tags,
      image_url: imageUrl ?? null,
      status,
      author_id: me.userId,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single()
  if (error) return { error: error.message }
  return { id: data.id }
}

export async function deleteBlogPost(id: string): Promise<{ error?: string }> {
  try {
    await assertAdmin()
  } catch (e) {
    return { error: (e as Error).message }
  }
  const admin = createAdminClient()

  const { data: post } = await admin
    .from("blog_posts")
    .select("image_url")
    .eq("id", id)
    .single()
  if (isStoragePath(post?.image_url ?? null)) {
    await admin.storage.from(BLOG_BUCKET).remove([post!.image_url!])
  }

  const { error } = await admin.from("blog_posts").delete().eq("id", id)
  if (error) return { error: error.message }
  return {}
}
