import Sidebarmentor from "@/components/Sidebarmentor"
import Navbarmentor from "@/components/Navbarmentor"
import Mentorshippanel from "@/components/Mentorshippanel"


export default function mentorshippanelPage() {
  return (
   <main className="flex h-screen overflow-hidden">
  
  <Sidebarmentor />

  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
    
   <Navbarmentor />

    <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
      <Mentorshippanel />
       
    </div>

  </div>

</main>
  )
}