import Asignst from "@/components/Asignst"
import Sidebarmentor from "@/components/Sidebarmentor"
import Navbarmentor from "@/components/Navbarmentor"

export default function asignstudentPage() {
  return (
    <main className="flex h-screen overflow-hidden">
  
  <Sidebarmentor />

  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
    
   <Navbarmentor />

    <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
      <Asignst />
    </div>

  </div>

</main>
  )
}

