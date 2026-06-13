import { H2NProductCard } from "./product-card"
import { products } from "@/lib/products"

export function H2NProductGrid() {
  return (
    <div className="w-full bg-background pb-24 border-t-4 border-background pt-16">
      <div className="mx-auto max-w-[1400px] px-6">
        
        {/* Grid Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-12">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase">NEW COLLECTION</h2>
          
          <div className="flex flex-col sm:flex-row gap-8 lg:gap-16 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <div className="flex flex-col gap-1">
              <span>[ NEW PRINTS ]</span>
              <span>[ SERIES 01 ]</span>
              <span>[ FIGURINES ]</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="hover:text-foreground cursor-pointer transition-colors">VASES & DECOR</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">MECHANICAL</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">ARTICULATED</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">PUZZLES & FUN</span>
            </div>
          </div>

          <button className="hidden lg:flex items-center justify-center border border-border bg-card hover:bg-foreground hover:text-background transition-colors rounded-sm px-6 py-2.5 text-xs font-bold tracking-widest uppercase">
            FILTERS
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          
          {/* Large Featured Card (Spans 2 columns) */}
          <div className="lg:col-span-2">
            <H2NProductCard 
              title={products[4].name}
              price="$39.99"
              colors={[]}
              imageUrl={products[4].image}
              featured={true}
              className="h-full"
            />
          </div>

          {/* Standard Cards */}
          {products.filter((_, i) => i !== 4).map((product, i) => (
            <H2NProductCard 
              key={product.id}
              title={product.name}
              price={`$${(20 + i * 5).toFixed(2)}`} // Fake price since products don't have price field
              imageUrl={product.image}
              colors={[{ name: "STANDARD", hex: "#808080" }]} // Generic color since not in data
            />
          ))}
        </div>

      </div>
    </div>
  )
}
