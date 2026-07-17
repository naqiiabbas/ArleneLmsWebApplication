import Profile from "@/components/Profile"
import Sidebar from "@/components/Sidebar"
import Navbarpanel from "@/components/Navbarpanel"

export default function profilePage() {
  return (
    <main className="flex h-screen overflow-hidden bg-[#f5f5f5]">
  
  <Sidebar />

  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
    
   <Navbarpanel />

    <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
      <Profile />
    </div>

  </div>

</main>
  )
}