import Sidebaradmin from "@/components/Sidebaradmin"
import Navbaradmin from "@/components/Navbaradmin"
import Messagesadmin from "@/components/Messagesadmin"


export default function messagesPage() {
  return (
   <main className="flex h-screen overflow-hidden">
  
  <Sidebaradmin />

  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
    
   <Navbaradmin />

    <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
      <Messagesadmin />
       
    </div>

  </div>

</main>
  )
}