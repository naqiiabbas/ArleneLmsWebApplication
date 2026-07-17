import Navbar from "@/components/Navbar"
import Aboutus from "@/components/Aboutus"
import Aboutcommunity from "@/components/Aboutcommunity"
import Aboutvolu from "@/components/Aboutvolu"
import Aboutteam from "@/components/Aboutteam"
import Aboutdonate from "@/components/Aboutdonate"
import Footer from "@/components/Footer"


export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Aboutus />
      <Aboutcommunity />
      <Aboutvolu />
      <Aboutteam />
      <Aboutdonate />
      <Footer />
    </main>
  )
}