import { GalleryHeader } from "@/components/gallery/site-header"
import { GalleryProductGrid } from "@/components/gallery/product-grid"

export function GalleryShell({ brandName }: { brandName: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground pb-24">
      
      {/* Background ambient light */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <GalleryHeader brandName={brandName} />
      
      <main className="flex-1 flex flex-col items-center">
        <GalleryProductGrid brandName={brandName} />
      </main>

      {/* Footer / Bottom decorative star */}
      <footer className="w-full mt-12 flex flex-col items-center justify-center text-muted-foreground/60 gap-8">
        <div className="w-16 h-px bg-white/10" />
        <span className="text-sm font-mono tracking-widest uppercase">Scroll</span>
        
        {/* Decorative star shape from mockup */}
        <div className="relative mt-4 size-12 flex items-center justify-center opacity-50">
          <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
            <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" />
          </svg>
        </div>
      </footer>
    </div>
  )
}
