import { Search, ShoppingBag } from "lucide-react"

export function H2NHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur border-b border-border/10">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-6">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <span className="text-2xl font-bold tracking-widest">H2N</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">[ CATALOG ]</a>
          <a href="#" className="hover:text-foreground transition-colors">[ SERIES ]</a>
          <a href="#" className="text-foreground">[ PRINTS ]</a>
          <a href="#" className="hover:text-foreground transition-colors">[ MODELS ]</a>
          <a href="#" className="hover:text-foreground transition-colors">[ COLLECTIONS ]</a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="flex h-8 w-8 items-center justify-center rounded-sm bg-card hover:bg-card/80 transition-colors">
            <Search className="size-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-sm bg-card hover:bg-card/80 transition-colors">
            <ShoppingBag className="size-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
