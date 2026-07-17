import Adminpanel from "@/components/Adminpanel"
import Adminpanel2 from "@/components/Adminpanel2"
import Adminpanel3 from "@/components/Adminpanel3"
import Sidebaradmin from "@/components/Sidebaradmin"
import Navbaradmin from "@/components/Navbaradmin"

export default function asignstudentPage() {
  return (
    <main className="flex h-screen overflow-hidden">
  
  <Sidebaradmin />

  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
    
   <Navbaradmin />

    <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
      <Adminpanel />
      <Adminpanel2 />
      <Adminpanel3 />
      <div className="mx-4 mb-6 rounded-[8px] bg-white py-[20px] text-center font-[Poppins] text-[15px] font-normal leading-none text-[#666666] md:mx-6">
        Support <span className="mx-[14px]">•</span> Privacy <span className="mx-[14px]">•</span> Terms
      </div>
    </div>

  </div>

</main>
  )
}

