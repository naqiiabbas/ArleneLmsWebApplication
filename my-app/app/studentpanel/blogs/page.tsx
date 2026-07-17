import Blogsst from "@/components/Blogsst"
import Sidebar from "@/components/Sidebar"
import Navbarpanel from "@/components/Navbarpanel"

export default function blogsmenPage() {
  return (
    <main className="flex h-screen overflow-hidden bg-[#f5f5f5]">
  
  <Sidebar />

  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
    
   <Navbarpanel />

    <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
      <Blogsst />
    </div>

  </div>

</main>
  )
}
