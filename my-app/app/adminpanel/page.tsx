import Adminpanel from "@/components/Adminpanel"
import Adminpanel2 from "@/components/Adminpanel2"
import Adminpanel3 from "@/components/Adminpanel3"
import Sidebaradmin from "@/components/Sidebaradmin"
import Navbaradmin from "@/components/Navbaradmin"
import { getAdminDashboard } from "@/lib/data/dashboard"
import { getReportData } from "@/lib/data/reports"

// Live numbers on every visit (and on router.refresh() after an edit).
export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  // Fetched once here and shared by the sections below. A section the viewer
  // lacks permission for (e.g. reports.view) is simply omitted.
  const [dash, report] = await Promise.allSettled([getAdminDashboard(), getReportData()])
  const data = dash.status === "fulfilled" ? dash.value : null
  const error = dash.status === "rejected" ? (dash.reason as Error)?.message ?? "Unknown error" : undefined

  return (
    <main className="flex h-screen overflow-hidden">
      <Sidebaradmin />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbaradmin />

        <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Adminpanel data={data} error={error} />
          <Adminpanel2 data={data} />
          <Adminpanel3 report={report.status === "fulfilled" ? report.value : null} />
          <div className="mx-4 mb-6 rounded-[8px] bg-white py-[20px] text-center font-[Poppins] text-[15px] font-normal leading-none text-[#666666] md:mx-6">
            Support <span className="mx-[14px]">•</span> Privacy <span className="mx-[14px]">•</span> Terms
          </div>
        </div>
      </div>
    </main>
  )
}
