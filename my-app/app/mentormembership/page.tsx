import Navbar from "@/components/Navbar"
import Mentor from "@/components/Mentor"
import Mentorship from "@/components/Mentorship"
import Mentorship1 from "@/components/Mentorship1"
import Footer from "@/components/Footer"


export default function mentormembershipPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Mentor />
    <Mentorship />
     <Mentorship1 />
      <Footer />
    </main>
  )
}