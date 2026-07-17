import Notifispon from "@/components/Notifispon"
import Sidebarspon from "@/components/Sidebarspon"
import Navbarspon from "@/components/Navbarspon"

export default function notificationPage() {
  return (
    <main className="flex h-screen overflow-hidden">
  
  <Sidebarspon />

  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
    
   <Navbarspon/>

    <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
      <Notifispon />
    </div>

  </div>

</main>
  )
}