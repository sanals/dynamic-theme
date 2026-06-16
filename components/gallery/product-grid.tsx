import { products } from "@/lib/products"
import { GalleryProductCard } from "./product-card"

export function GalleryProductGrid() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          // Generate faux subtitles/subtexts to match the mockup
          const subText1 = "10 Art* R65M.a"
          const subText2 = "Bschssaoma"
          const prefix = product.name.split(" ")[0]

          return (
            <GalleryProductCard 
              key={product.id}
              title={product.name}
              subtitle={prefix}
              subtext={`${subText1} \n ${subText2}`}
              imageUrl={product.image}
            />
          )
        })}
      </div>
    </div>
  )
}
