import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-20 lg:py-32 relative z-20 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-muted/20 backdrop-blur-md text-secondary-foreground rounded-2xl p-12 lg:p-16 border-2 border-[#ada67c]/50">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance">Ready to Start Your Project?</h2>
          <p className="text-lg text-secondary-foreground/80 mb-8 max-w-2xl mx-auto text-pretty leading-relaxed">
            Let&apos;s collaborate to bring your vision to life. Get in touch today and discover how we can help transform
            your digital presence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
              Schedule a Consultation
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10 bg-transparent"
            >
              View Our Process
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
