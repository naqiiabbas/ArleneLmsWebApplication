import Sidebar from "@/components/Sidebar"
import Navbarpanel from "@/components/Navbarpanel"
import Studentpanel from "@/components/Studentpanel"

export default function StudentpanelPage() {
  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-[#f5f5f5] lg:flex-row">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbarpanel />

        <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Studentpanel />
        </div>
      </div>
    </main>
  )
}
