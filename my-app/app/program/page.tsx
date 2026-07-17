import Navbar from "@/components/Navbar"
import Programs from "@/components/Programs"
import Program2 from "@/components/Program2"
import Program4 from "@/components/Program4"
import Footer from "@/components/Footer"


export default function programPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Programs />
      <Program2 />
      <Program4 />
      <Footer />
    </main>
  )
}