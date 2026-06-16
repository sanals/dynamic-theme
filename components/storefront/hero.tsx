import Image from "next/image"
import { Button } from "@/components/ui/button"
import { heroContent } from "@/lib/products"

export function StorefrontHero({ brandName }: { brandName?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        <div className="flex flex-col items-start gap-6">
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {heroContent.eyebrow}
          </span>
          <h1 className="text-balance font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {heroContent.title}
          </h1>
          <p className="max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
            {heroContent.description}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg">{heroContent.primaryCta}</Button>
            <Button size="lg" variant="outline">
              {heroContent.secondaryCta}
            </Button>
          </div>
        </div>

        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-secondary">
          <Image
            src={heroContent.image || "/placeholder.svg"}
            alt="Luxury 3D-printed lattice vase"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
