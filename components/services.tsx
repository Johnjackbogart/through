import { Card } from "@/components/ui/card"
import { Sparkles, Code, Palette, Zap } from "lucide-react"

const services = [
  {
    icon: Sparkles,
    title: "AI Integration",
    description:
      "Harness the power of artificial intelligence to automate workflows and enhance user experiences with cutting-edge machine learning solutions.",
  },
  {
    icon: Code,
    title: "Web Development",
    description:
      "Build fast, scalable, and responsive web applications using modern frameworks and best practices for optimal performance.",
  },
  {
    icon: Palette,
    title: "Brand Design",
    description:
      "Create memorable brand identities with sophisticated visual design that resonates with your target audience and stands out.",
  },
  {
    icon: Zap,
    title: "Performance Optimization",
    description:
      "Maximize speed and efficiency with expert optimization techniques that deliver lightning-fast experiences across all devices.",
  },
]

export function Services() {
  return (
    <section id="services" className="py-20 lg:py-32 relative z-20 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 text-balance">
            Services That Drive Results
          </h2>
          <p className="text-lg text-white/50 text-pretty leading-relaxed">
            Comprehensive solutions tailored to your unique needs, powered by the latest technology and creative
            expertise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="p-6 bg-card/25 backdrop-blur-md border-2 border-[#252525]/50 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <service.icon className="w-6 h-6 text-white/75" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
