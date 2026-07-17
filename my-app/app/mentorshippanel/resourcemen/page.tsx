import Resourcemen from "@/components/Resourcemen"
import Sidebarmentor from "@/components/Sidebarmentor"
import Navbarmentor from "@/components/Navbarmentor"

export default function resourcemenPage() {
  return (
    <main className="flex h-screen overflow-hidden">
  
  <Sidebarmentor />

  <div className="flex-1 flex min-w-0 flex-col">
    
   <Navbarmentor />

    <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#f3f3f3]">
      <Resourcemen />
    </div>

  </div>

</main>
  )
}
