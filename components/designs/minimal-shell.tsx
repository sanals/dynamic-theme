import { MinimalHeader } from "@/components/minimal/site-header"
import { MinimalHero } from "@/components/minimal/hero"
import { MinimalProductGrid } from "@/components/minimal/product-grid"

export function MinimalShell({ brandName }: { brandName: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans tracking-wide selection:bg-foreground selection:text-background pb-32">
      <MinimalHeader />
      <main className="flex-1 flex flex-col items-center">
        <MinimalHero />
        <MinimalProductGrid />
      </main>
      <footer className="w-full bg-background mt-auto py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-4 px-6 text-xs font-semibold text-muted-foreground/50">
          <p>{brandName.toUpperCase()} 2026. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  )
}
