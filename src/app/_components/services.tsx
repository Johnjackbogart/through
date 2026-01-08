import { Card } from "#/card";
import { Sparkles, Code, Palette, GlobeLock } from "lucide-react";
import { bbhBartle } from "@/lib/fonts";

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
    icon: GlobeLock,
    title: "Security",
    description:
      "Maximize speed and efficiency with expert optimization techniques that deliver lightning-fast experiences across all devices.",
  },
];

export function Services() {
  return (
    <section
      id="services"
      className="scroll-mt-24 py-20 lg:py-32 relative z-20 bg-muted/20"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-block mb-6">
            <span className="text-xs font-medium text-primary uppercase tracking-wider px-3 py-1 bg-primary/10 rounded-full border border-border/60">
              An AI powered tech consultancy
            </span>
          </div>
          <h2
            className={`${bbhBartle.className} text-3xl md:text-4xl lg:text-5xl font-normal text-primary mb-4 text-balance tracking-tight`}
            style={{
              WebkitTextStroke: "1px var(--card)",
              textShadow:
                "0 1px 0 var(--card), 1px 0 0 var(--card), 0 -1px 0 var(--card), -1px 0 0 var(--card)",
            }}
          >
            Offerings from <br />
            A <br />
            through
            <br />Z
          </h2>
          <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
            If it involves a computer, we can help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="p-6 bg-card/60 backdrop-blur-md border-2 border-border/60 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </Card>
          ))}
        </div>
{/*        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
            Add COPY HERE
          </p>
        </div> */}
      </div>
    </section>
  );
}
