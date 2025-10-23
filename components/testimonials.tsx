import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO, TechStart",
    content:
      "Working with this team transformed our digital presence. Their attention to detail and innovative approach exceeded all expectations.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Founder, InnovateCo",
    content:
      "The AI integration they delivered has revolutionized our workflow. Highly professional and results-driven team.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Director, BrandHub",
    content: "Exceptional design work and seamless execution. They truly understand how to bring a vision to life.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-20 lg:py-32 relative z-20 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white/75 mb-4 text-balance">
            Client Success Stories
          </h2>
          <p className="text-lg text-white/50 text-pretty leading-relaxed">
            Don't just take our word for it. Here's what our clients have to say about working with us.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-card/25 backdrop-blur-md border-2 border-[#252525]/50">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-card-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
