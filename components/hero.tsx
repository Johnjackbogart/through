import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import Metaball3D from "./metaball3d";
import { MeshGradient } from "@paper-design/shaders-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter
            id="glass-effect"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter
            id="gooey-filter"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="fixed inset-0 z-0">
        <MeshGradient
          colors={["#252525", "#ada67c", "#e1e0d6", "#252525", "#ada67c"]}
          speed={0.25}
          className="w-full h-full"
        />
        <MeshGradient
          colors={["#252525", "#e1e0d6", "#ada67c", "#252525"]}
          speed={0.125}
          className="absolute inset-0 w-full h-full opacity-60"
        />
      </div>

      <div className="fixed inset-0 z-10">
        <Metaball3D />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-20 pointer-events-none">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="text-xs font-medium text-primary uppercase tracking-wider px-3 py-1 bg-primary/10 rounded-full">
              AI-Powered Solutions
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white/90 mb-6 text-balance leading-tight">
            Transform Your Vision Into Digital Excellence
          </h1>

          <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
            We craft exceptional digital experiences that elevate your brand and
            drive meaningful results through innovative AI-powered solutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 group"
            >
              Start Your Project
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-muted group bg-transparent"
            >
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
