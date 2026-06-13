import { products } from "@/lib/products"
import { SynthesisProductCard } from "./product-card"

export function SynthesisProductGrid() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12">
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 [column-fill:balance]">
        {products.map((product, i) => (
          <div key={product.id} className="break-inside-avoid mb-8">
            <SynthesisProductCard 
              key={product.id}
              title={product.name}
              price={`$${(20 + i * 5).toFixed(2)}`}
              imageUrl={product.image}
              featured={i === 4 || i === 0} // Making a few featured for layout variety
            />
          </div>
        ))}
      </div>
    </div>
  )
}
