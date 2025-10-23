import { Card } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"

const projects = [
  {
    title: "E-Commerce Platform",
    category: "Web Development",
    image: "/modern-ecommerce-interface.png",
  },
  {
    title: "AI Analytics Dashboard",
    category: "AI Integration",
    image: "/analytics-dashboard.png",
  },
  {
    title: "Brand Identity System",
    category: "Brand Design",
    image: "/brand-identity-design-mockup.jpg",
  },
  {
    title: "Mobile Banking App",
    category: "App Development",
    image: "/mobile-banking-app.png",
  },
]

export function Portfolio() {
  return (
    <section id="portfolio" className="py-20 lg:py-32 relative z-20 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white/75 mb-4 text-balance">Featured Work</h2>
          <p className="text-lg text-white/50 text-pretty leading-relaxed">
            Explore our portfolio of successful projects that showcase our commitment to excellence and innovation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <Card
              key={index}
              className="group overflow-hidden border-2 border-[#252525]/50 hover:shadow-xl transition-all cursor-pointer bg-card/25 backdrop-blur-md"
            >
              <div className="relative overflow-hidden aspect-[3/2]">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 right-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-5 h-5 text-primary-primary" />
                </div>
              </div>
              <div className="p-6 bg-card/25 backdrop-blur-md">
                <p className="text-sm text-muted-foreground font-medium mb-2">{project.category}</p>
                <h3 className="text-xl font-semibold text-card-primary">{project.title}</h3>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
