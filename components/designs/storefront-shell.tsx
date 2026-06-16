import { StorefrontHeader } from "@/components/storefront/site-header"
import { StorefrontHero } from "@/components/storefront/hero"
import { CardGridLayout } from "@/components/layouts/card-grid-layout"

export function StorefrontShell({ brandName }: { brandName: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <StorefrontHeader brandName={brandName} />
      <main className="flex-1">
        <StorefrontHero brandName={brandName} />
        {/* Structural layout: standard product grid. */}
        <CardGridLayout />
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>{brandName} — Luxury 3D Prints</p>
          <p>Use the toggles above to switch palette & layout.</p>
        </div>
      </footer>
    </div>
  )
}
