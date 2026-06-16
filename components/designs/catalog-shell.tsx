import { CatalogHeader } from "@/components/catalog/site-header"
import { CatalogHero } from "@/components/catalog/hero"
import { CatalogProductGrid } from "@/components/catalog/product-grid"

export function CatalogShell({ brandName }: { brandName: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans uppercase tracking-wider selection:bg-primary selection:text-primary-foreground">
      <CatalogHeader brandName={brandName} />
      <main className="flex-1 flex flex-col">
        <CatalogHero brandName={brandName} />
        <CatalogProductGrid />
      </main>
      <footer className="w-full bg-background border-t border-border/10 py-8 mt-auto">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col md:flex-row items-center justify-between gap-4 px-6 text-[10px] font-semibold tracking-widest text-muted-foreground">
          <p>© 2026 {brandName.toUpperCase()} COLLECTION PRINTS</p>
          <p>ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  )
}
