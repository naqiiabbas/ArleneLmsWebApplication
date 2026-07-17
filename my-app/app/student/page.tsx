import Navbar from "@/components/Navbar"
import Students from "@/components/Students"
import Students1 from "@/components/Students1"
import Students2 from "@/components/Students2"
import Studentarticle from "@/components/Studentarticle"
import Footer from "@/components/Footer"


export default function studentPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Students />
       <Students1 />
       <Students2 />
       <Studentarticle />
      <Footer />
    </main>
  )
}