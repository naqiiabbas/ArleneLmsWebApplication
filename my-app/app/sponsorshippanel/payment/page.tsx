import Payment from "@/components/Payment"
import Sidebarspon from "@/components/Sidebarspon"
import Navbarspon from "@/components/Navbarspon"

export default function paymentPage() {
  return (
    <main className="flex h-screen overflow-hidden bg-[#F4F4F5]">
      <Sidebarspon />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F4F4F5]">
        <Navbarspon />
        <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Payment />
        </div>
      </div>
    </main>
  );
}
