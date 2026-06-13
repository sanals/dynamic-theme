import { ChevronLeft } from "lucide-react"

interface SynthesisProductCardProps {
  title: string
  price: string
  imageUrl: string
  featured?: boolean
}

export function SynthesisProductCard({ title, price, imageUrl, featured }: SynthesisProductCardProps) {
  // Use a shortened title for the large background text
  const bgText = title.split(' ')[0].toUpperCase()

  return (
    <div className="group relative bg-card rounded-[1.25rem] shadow-xl shadow-foreground/5 overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-1">
      
      {/* Top Navigation Bar inside the card */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2 z-10">
        <button className="hover:opacity-70 transition-opacity">
          <ChevronLeft className="size-5 stroke-[3]" />
        </button>
        {/* Simple geometric logo in center */}
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-foreground">
          <path d="M22 4.01c-1 .49-2.13.88-3.27 1.1A6.76 6.76 0 0 0 16.5 3c-3.1 0-5.63 2.53-5.63 5.63 0 .44.05.88.14 1.3-4.68-.23-8.83-2.47-11.6-5.87-.48.83-.76 1.8-.76 2.83 0 1.95 1 3.68 2.5 4.69a5.53 5.53 0 0 1-2.55-.7v.07c0 2.73 1.94 5 4.5 5.51-.47.13-.97.2-1.48.2-.36 0-.71-.03-1.05-.1.72 2.23 2.79 3.86 5.25 3.9A11.3 11.3 0 0 1 1.04 22 16 16 0 0 0 9.7 24c10.4 0 16.08-8.62 16.08-16.08 0-.25 0-.5-.01-.74 1.11-.8 2.07-1.8 2.83-2.91a10.84 10.84 0 0 1-3.2.88 5.68 5.68 0 0 0 2.45-3.08z"/>
        </svg>
        <div className="size-5" /> {/* Spacer for centering */}
      </div>

      {/* Title Section */}
      <div className="px-6 py-2 z-10 flex items-center gap-3">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-foreground/80">
          <path d="M21.71 11.29l-9-9c-.39-.39-1.02-.39-1.41 0l-9 9c-.39.39-.39 1.02 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9c.39-.39.39-1.02 0-1.41zM12 20.59L3.41 12 12 3.41 20.59 12 12 20.59z"/>
        </svg>
        <h3 className="text-sm sm:text-base font-bold tracking-widest uppercase">{title}</h3>
      </div>

      {/* Image Area with Faded Background Text */}
      <div className="relative flex-1 w-full flex items-center justify-center my-2 min-h-0">
        {/* Faded Background Typography */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0">
          <h2 className="text-[5rem] md:text-[6rem] font-black text-foreground/5 leading-none px-2 text-center break-words select-none">
            {bgText}
          </h2>
        </div>
        <img 
          src={imageUrl} 
          alt={title} 
          className="relative z-10 w-full max-w-[85%] max-h-[100%] object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal"
        />
      </div>

      {/* Bottom Gray Inner Box */}
      <div className="mx-3 mb-3 bg-secondary rounded-[1rem] p-4 sm:p-5 flex flex-col gap-4 z-10">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-foreground mb-1">
              <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z" />
            </svg>
            <span className="text-[10px] font-bold tracking-widest uppercase">SYNTTEKIS</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black tracking-tighter">{price}</span>
        </div>

        {/* Specs Text */}
        <div className="text-[9px] sm:text-[10px] font-mono leading-relaxed text-muted-foreground opacity-80 uppercase tracking-widest">
          <p>ID: {title.substring(0, 15).padEnd(15, '_')}...........</p>
          <p>MAT: SYNTHETIC_RESIN........</p>
          <p>EDT: LIMITED_RUN_2026.......</p>
        </div>

        {/* Add to Cart Button */}
        <button className="w-full bg-foreground/10 hover:bg-foreground hover:text-background transition-colors text-foreground font-bold text-[11px] sm:text-xs tracking-widest uppercase py-3.5 rounded-lg mt-2">
          Add to Cart
        </button>
      </div>

    </div>
  )
}
