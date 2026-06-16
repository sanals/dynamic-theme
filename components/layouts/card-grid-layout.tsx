import { products } from "@/lib/products"
import { ProductCard } from "@/components/storefront/product-card"
import { SectionHeading } from "@/components/storefront/section-heading"

/*
  LAYOUT VARIANT: "card-grid"
  ---------------------------
  A clean, uniform responsive grid. Every product gets identical
  emphasis. Pure flex/grid with responsive column counts — no fixed
  pixel widths, so it reflows safely at any breakpoint.
*/
export function CardGridLayout() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        title="Featured Catalog"
        subtitle="A uniform gallery of our most-printed models."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
