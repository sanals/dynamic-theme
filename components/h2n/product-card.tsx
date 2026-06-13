import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface H2NProductCardProps {
  title: string
  price: string
  colors: { name: string; hex: string }[]
  imageUrl?: string
  featured?: boolean
  className?: string
}

export function H2NProductCard({
  title,
  price,
  colors,
  imageUrl,
  featured = false,
  className,
}: H2NProductCardProps) {
  return (
    <div className={cn("group flex flex-col relative", className)}>
      <div className={cn(
        "bg-card rounded-md w-full relative overflow-hidden flex items-center justify-center transition-colors",
        featured ? "aspect-square md:aspect-[4/5] p-8" : "aspect-[3/4] p-6"
      )}>
        {/* Subtle shadow block in background to emulate the lighting */}
        <div className="absolute inset-0 bg-gradient-to-tr from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Product Image Placeholder */}
        <div className="w-full h-full relative z-10">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-contain drop-shadow-[4px_6px_8px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-border/20 rounded drop-shadow-xl" />
          )}
        </div>

        {/* Featured Overlay */}
        {featured && (
          <div className="absolute inset-0 p-8 flex flex-col justify-center items-end z-20 pointer-events-none">
            <div className="text-right">
              <h3 className="text-3xl font-black tracking-tighter mb-4">{title}™</h3>
              <div className="flex items-center gap-4 justify-end">
                <button className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background/50 backdrop-blur pointer-events-auto hover:bg-foreground hover:text-background transition-colors">
                  <ArrowUpRight className="size-4" />
                </button>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">ADD TO CART</span>
                  <span className="text-sm font-medium">{price}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Standard Card Details (Below Image) */}
      {!featured && (
        <div className="flex justify-between items-start mt-4">
          <div className="flex flex-col gap-1.5">
            <h4 className="text-sm font-bold tracking-tight uppercase">{title}</h4>
            <div className="flex items-center gap-3 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              {colors.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div 
                    className="w-2.5 h-2.5 rounded-full border border-border/50"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
            <span className="text-xs font-medium text-muted-foreground mt-1">{price}</span>
          </div>
        </div>
      )}
    </div>
  )
}
