import Sidebaradmin from "@/components/Sidebaradmin";
import Navbaradmin from "@/components/Navbaradmin";
import Reports from "@/components/Reports";

export default function ReportsPage() {
  return (
    <main className="flex h-screen overflow-hidden bg-[#f7f7fb]">
      <Sidebaradmin />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbaradmin />
        <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6">
          <Reports />
        </div>
      </div>
    </main>
  );
}
