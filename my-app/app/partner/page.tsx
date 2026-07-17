import Navbar from "@/components/Navbar"
import Partner from "@/components/Partner"
import Partner1 from "@/components/Partner1"
import Partner2 from "@/components/Partner2"
import Ourpartner from "@/components/Ourpartner"
import Footer from "@/components/Footer"


export default function partnerPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Partner />
      <Partner1 />
      <Partner2 />
      <Ourpartner />
      <Footer />
    </main>
  )
}