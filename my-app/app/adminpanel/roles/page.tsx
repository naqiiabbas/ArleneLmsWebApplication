import Roles from "@/components/Roles"
import Sidebaradmin from "@/components/Sidebaradmin"
import Navbaradmin from "@/components/Navbaradmin"

export default function RolesPage() {
  return (
    <main className="flex h-screen overflow-hidden">
  
  <Sidebaradmin />

  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
    
   <Navbaradmin />

    <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
      <Roles />
    </div>

  </div>

</main>
  )
}