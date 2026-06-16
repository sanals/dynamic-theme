import Image from "next/image"
import type { Product } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  className?: string
  imageClassName?: string
}

/*
  Shared presentational card.
*/
export function ProductCard({
  product,
  className,
  imageClassName,
}: ProductCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-colors hover:border-primary/40",
        className,
      )}
    >
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden flex items-center justify-center p-6",
          imageClassName,
        )}
      >
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-105 drop-shadow-[4px_6px_8px_rgba(0,0,0,0.5)]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 text-center">
        <h3 className="text-pretty font-heading text-base font-semibold leading-tight">
          {product.name}
        </h3>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

          <div className="mt-auto pt-3">
            <Button size="sm" className="w-full">
              Order Print
            </Button>
          </div>
      </div>
    </article>
  )
}
