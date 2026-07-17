import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import Vision from "@/components/Vision"
import Program from "@/components/Program"
import Community from "@/components/Community"
import Testimonials from "@/components/Testimonials"
import FAQ from "@/components/FAQ"
import Articles from "@/components/Articles"
import Contact from "@/components/Contact"
import Events from "@/components/Events"
import Footer from "@/components/Footer"


export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Vision />
      <Program />
      <Community />
      <Testimonials />
      <FAQ />
      <Articles />
      <Contact />
      <Events />
      <Footer />
    </main>
  )
}
