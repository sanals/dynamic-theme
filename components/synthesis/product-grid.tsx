import { products } from "@/lib/products"
import { SynthesisProductCard } from "./product-card"

export function SynthesisProductGrid() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, i) => (
          <SynthesisProductCard 
            key={product.id}
            title={product.name}
            price={`$${(20 + i * 5).toFixed(2)}`}
            imageUrl={product.image}
            featured={i === 4 || i === 0} // Making a few featured for layout variety
          />
        ))}
      </div>
    </div>
  )
}
