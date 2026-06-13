import { Menu } from "lucide-react"

export function DholeishHeader() {
  return (
    <header className="w-full pt-6 pb-4 px-6 md:px-12 bg-transparent z-50">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        
        {/* Left: Hamburger */}
        <button className="flex items-center justify-center p-2 rounded-full hover:bg-white/5 transition-colors">
          <Menu className="size-6 text-foreground" strokeWidth={1.5} />
        </button>

        {/* Center: Logo and Links */}
        <div className="hidden md:flex items-center gap-12 font-mono text-sm tracking-widest uppercase">
          <a href="#" className="hover:text-primary transition-colors">Hobroe</a>
          
          <div className="text-2xl font-black tracking-[0.2em] px-4 font-sans uppercase relative">
            <span className="opacity-90">dHOLEISH</span>
          </div>
          
          <a href="#" className="hover:text-primary transition-colors">Sonero</a>
        </div>

        {/* Right: Shop Button */}
        <button className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
          Shop
        </button>

      </div>
    </header>
  )
}
