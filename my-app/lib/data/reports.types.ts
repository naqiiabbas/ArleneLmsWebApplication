// UI-facing types for the admin Reports & Analytics dashboard.
export type ReportStat = {
  id: number
  label: string
  value: string
  trend: string
  icon: string
}

export type ReportData = {
  stats: ReportStat[]
  attendanceTrends: { month: string; value: number }[]
  growthData: { month: string; mentors: number; students: number }[]
  sessionActivity: { month: string; sessions: number }[]
  courseDistribution: { name: string; value: number; color: string }[]
  performanceDistribution: { grade: string; count: number }[]
}
