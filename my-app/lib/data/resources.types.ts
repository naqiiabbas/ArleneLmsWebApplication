// UI-facing types for the admin Resources module.
export type ResourceStatus = "pending" | "approved" | "rejected"

export type UIResource = {
  id: string
  title: string
  description: string
  uploader: string
  role: string
  course: string
  size: string
  date: string
  status: ResourceStatus
  tags: string[]
  category: string
  type: string
  downloads: number
  rating?: string
  difficulty?: string
  estimatedTime?: string
  featured?: boolean
  iconType?: "file" | "link" | "image"
}
