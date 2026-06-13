import { H2NHeader } from "@/components/h2n/site-header"
import { H2NHero } from "@/components/h2n/hero"
import { H2NProductGrid } from "@/components/h2n/product-grid"

export function H2NShell() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans uppercase tracking-wider selection:bg-primary selection:text-primary-foreground">
      <H2NHeader />
      <main className="flex-1 flex flex-col">
        <H2NHero />
        <H2NProductGrid />
      </main>
      <footer className="w-full bg-background border-t border-border/10 py-8 mt-auto">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col md:flex-row items-center justify-between gap-4 px-6 text-[10px] font-semibold tracking-widest text-muted-foreground">
          <p>© 2026 H2N COLLECTION PRINTS</p>
          <p>ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  )
}
