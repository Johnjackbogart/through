import { Header } from "&/header"
import { Hero } from "&/hero"
import { Services } from "&/services"
import { Portfolio } from "&/portfolio"
import { Testimonials } from "&/testimonials"
import { CTA } from "&/cta"
import { Contact } from "&/contact"
import { Footer } from "&/footer"

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <Header />
      <Hero />
      <Services />
      <Portfolio />
      <Testimonials />
      <CTA />
      <Contact />
      <Footer />
    </main>
  )
}
