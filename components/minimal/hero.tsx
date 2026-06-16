import { heroContent } from "@/lib/products"
import { ChevronRight } from "lucide-react"

export function MinimalHero({ brandName }: { brandName?: string }) {
  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-12 flex flex-col items-center text-center">
      <div className="relative w-full aspect-square max-h-[600px] flex justify-center items-center rounded-3xl bg-card border border-border/50 shadow-2xl shadow-foreground/5 overflow-hidden">
        
        {/* Floating Typography behind image */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-0">
          <h1 className="text-[12vw] sm:text-[8rem] font-bold tracking-tighter leading-[0.8] text-foreground/5 uppercase break-words w-full px-4">
            ENTER TO FUTURE
          </h1>
        </div>
        
        <img 
          src={heroContent.image} 
          alt={heroContent.title}
          className="w-full h-full object-contain max-w-[80%] max-h-[80%] drop-shadow-2xl z-10"
        />

        {/* Floating button */}
        <button className="absolute bottom-8 right-8 z-20 flex items-center justify-center size-16 rounded-full bg-background/80 backdrop-blur border border-border shadow-lg hover:scale-105 transition-transform">
          <ChevronRight className="size-6 text-foreground" />
        </button>
      </div>
      
      <div className="mt-12 max-w-md space-y-4">
        <h2 className="text-xl font-medium tracking-widest uppercase">{heroContent.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {heroContent.description}
        </p>
      </div>
    </section>
  )
}
