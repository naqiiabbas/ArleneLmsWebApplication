import Blogsmen from "@/components/Blogsmen"
import Sidebar from "@/components/Sidebar"
import Navbarpanel from "@/components/Navbarpanel"

export default function blogsPage() {
  return (
    <main className="flex h-screen overflow-hidden">
  
  <Sidebar />

  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
    
   <Navbarpanel />

    <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
      <Blogsmen />
    </div>

  </div>

</main>
  )
}
