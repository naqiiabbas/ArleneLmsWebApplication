// UI-facing types for the admin Roles & Permissions module.
export type UIPermissionItem = {
  id: string
  key: string
  title: string
  description: string
}

export type UIPermissionGroup = {
  title: string
  items: UIPermissionItem[]
}

export type UIRole = {
  id: string
  name: string
  description: string
  icon: string
  isSystem: boolean
  users: number
  permissionKeys: string[] // every permission key assigned to the role
  permissions: string[] // group-name chips shown on the card (first few)
  remaining: number // group chips not shown
}

export type RoleInput = {
  name: string
  description: string
  icon: string
  permissionKeys: string[]
}
