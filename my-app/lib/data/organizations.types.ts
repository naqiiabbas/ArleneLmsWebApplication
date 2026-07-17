// UI-facing types for the admin Organizations module.
export type OrgType = "University" | "Company" | "Nonprofit" | "Government"
export type OrgStatus = "Active" | "Inactive"

export type UIOrganization = {
  id: string
  name: string
  type: OrgType
  contactPerson: string
  email: string
  phone: string
  students: number
  mentors: number
  programs: number
  status: OrgStatus
  createdAt: string
}

export type OrgInput = {
  name: string
  type: OrgType
  contactPerson: string
  email: string
  phone: string
  status: OrgStatus
}
