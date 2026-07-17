// UI-facing types for the admin Blog module.
export type BlogStatus = "published" | "draft"

export type UIBlogPost = {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  image: string | null
  status: BlogStatus
  date: string
  author: string
}
