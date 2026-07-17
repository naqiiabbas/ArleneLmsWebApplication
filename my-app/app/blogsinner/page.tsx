import Navbar from "@/components/Navbar"
import Blogsinner from "@/components/Blogsinner"
import Footer from "@/components/Footer"


export default function blogsinnerPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Blogsinner />
      <Footer />
    </main>
  )
}