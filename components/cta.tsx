import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-20 lg:py-32 relative z-20 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-card/60 backdrop-blur-md rounded-2xl p-12 lg:p-16 border-2 border-primary/40">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty leading-relaxed">
            Let&apos;s collaborate to bring your vision to life. Get in touch today and discover how we can help transform
            your digital presence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 group"
            >
              <a href="#contact">
                Schedule a Consultation
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-border text-foreground hover:bg-accent/50"
            >
              <a href="#services">View Our Process</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
