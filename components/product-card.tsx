import Image from "next/image"
import type { Product } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  /** Show the print-weight metadata row (used by the showcase layout). */
  showMeta?: boolean
  className?: string
  imageClassName?: string
}

/*
  Shared presentational card. Both layout variants reuse this exact
  component, only changing the grid that wraps it — keeping product
  presentation consistent regardless of structure.
*/
export function ProductCard({
  product,
  showMeta = false,
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
          "relative aspect-square w-full overflow-hidden bg-secondary",
          imageClassName,
        )}
      >
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-pretty font-heading text-base font-semibold leading-tight">
          {product.name}
        </h3>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        {showMeta ? (
          <div className="mt-auto flex items-center justify-between pt-3 text-sm">
            <span className="text-muted-foreground">{product.weight}g</span>
            <span className="font-medium text-primary">View design</span>
          </div>
        ) : (
          <div className="mt-auto pt-3">
            <Button size="sm" className="w-full">
              Order Print
            </Button>
          </div>
        )}
      </div>
    </article>
  )
}
