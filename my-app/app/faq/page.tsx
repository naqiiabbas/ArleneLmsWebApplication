import Navbar from "@/components/Navbar"
import Faqpage from "@/components/Faqpage"
import Faqsupport from "@/components/Faqsupport"
import Footer from "@/components/Footer"


export default function FaqPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Faqpage />
      <Faqsupport />
      <Footer />
    </main>
  )
}