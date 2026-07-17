import Navbar from "@/components/Navbar"
import Blogs from "@/components/Blogs"
import Blogs1 from "@/components/Blogs1"
import Footer from "@/components/Footer"


export default function blogsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
       <Blogs />
      <Blogs1 />
      <Footer />
    </main>
  )
}