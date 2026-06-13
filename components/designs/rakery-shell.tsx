import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { LayoutController } from "@/components/layout-controller"

export function RakeryShell() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        {/* Structural polymorphism: the controller swaps the entire
            gallery layout based on the active design state. */}
        <LayoutController />
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>Rakery — Luxury 3D Prints</p>
          <p>Use the toggles above to switch palette & layout.</p>
        </div>
      </footer>
    </div>
  )
}
