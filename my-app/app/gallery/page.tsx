import Navbar from "@/components/Navbar"
import Gallery from "@/components/Gallery"
import Gallery2 from "@/components/Gallery2"
import Footer from "@/components/Footer"


export default function galleryPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Gallery />
      <Gallery2 />
      <Footer />
    </main>
  )
}