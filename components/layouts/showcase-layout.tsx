import { products } from "@/lib/products"
import { ProductCard } from "@/components/product-card"
import { SectionHeading } from "@/components/section-heading"

/*
  LAYOUT VARIANT: "showcase"
  --------------------------
  An editorial mockup layout with mixed emphasis: a "featured" trio at
  larger scale, then a denser metadata-rich grid for the rest. Consumes
  the SAME data + ProductCard as the card grid; only the structural
  wrappers differ. Built entirely with responsive grid utilities.
*/
export function ShowcaseLayout() {
  const featured = products.filter((p) => p.category === "featured")
  const rest = products.filter((p) => p.category === "showcase")

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        title="Featured Showcase"
        subtitle="An editorial spread that mixes hero pieces with a dense gallery."
      />

      {/* Featured trio — larger, taller imagery */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {featured.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showMeta
            imageClassName="aspect-[4/5]"
          />
        ))}
      </div>

      {/* Dense metadata grid for the remaining models */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {rest.map((product) => (
          <ProductCard key={product.id} product={product} showMeta />
        ))}
      </div>
    </section>
  )
}
