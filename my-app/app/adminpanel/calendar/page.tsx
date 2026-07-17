import Calendaradmin from "@/components/Calendaradmin";
import Sidebaradmin from "@/components/Sidebaradmin";
import Navbaradmin from "@/components/Navbaradmin";

export default function calendarPage() {
  return (
    <main className="flex h-screen overflow-hidden bg-[#F4F4F5]">
      <Sidebaradmin />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F4F4F5]">
        <Navbaradmin />
        <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Calendaradmin />
        </div>
      </div>
    </main>
  );
}
