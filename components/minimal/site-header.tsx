import { Menu, User } from "lucide-react"

export function MinimalHeader() {
  return (
    <header className="w-full bg-transparent pt-8 pb-4">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6">
        <button className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <Menu className="size-5" />
        </button>
        
        {/* Minimal Logo */}
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-foreground">
          <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z" />
        </svg>

        <button className="flex items-center justify-center size-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <User className="size-5" />
        </button>
      </div>
    </header>
  )
}
