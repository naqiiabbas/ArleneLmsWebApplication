import Attencon from "@/components/Attencon";
import Sidebaradmin from "@/components/Sidebaradmin"
import Navbaradmin from "@/components/Navbaradmin"

export default function notificationPage() {
  return (
    <main className="flex h-screen overflow-hidden bg-[#F4F4F5]">
  
  <Sidebaradmin />

  <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F4F4F5]">
    
   <Navbaradmin />

    <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
      <Attencon />
    </div>

  </div>

</main>
  )
}
