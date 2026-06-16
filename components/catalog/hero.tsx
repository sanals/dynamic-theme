import { ArrowUpRight } from "lucide-react"
import { products, heroContent } from "@/lib/products"

export function CatalogHero({ brandName = "Forge" }: { brandName?: string }) {
  return (
    <div className="relative w-full overflow-hidden bg-background pt-12 pb-24 border-b border-border/10">
      <div className="mx-auto max-w-[1400px] px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Text & Add to Cart */}
        <div className="lg:col-span-4 flex flex-col justify-center pt-8">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground mb-6">
            [ SERIES: PRINTS 01 ]
          </span>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.85] tracking-tighter mb-12">
            COLLECTION<br />PRINTS 01™
          </h1>

          <div className="space-y-6 text-xs font-semibold tracking-widest text-muted-foreground mb-12">
            <div className="flex items-center gap-8">
              <span className="w-16">SIZE</span>
              <div className="flex gap-4 text-foreground">
                <span className="border-b border-foreground">S</span>
                <span className="opacity-50 hover:opacity-100 cursor-pointer transition-opacity">M</span>
                <span className="opacity-50 hover:opacity-100 cursor-pointer transition-opacity">L</span>
                <span className="opacity-50 hover:opacity-100 cursor-pointer transition-opacity">XL</span>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-16">COLOUR</span>
              <div className="flex gap-4 text-foreground">
                <span className="opacity-50 hover:opacity-100 cursor-pointer transition-opacity">WHITE</span>
                <span className="border-b border-foreground">SILVER</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-8">
            <button className="flex h-20 w-20 items-center justify-center rounded-full border border-border hover:bg-foreground hover:text-background transition-colors group">
              <ArrowUpRight className="size-6 transition-transform group-hover:rotate-45" />
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-widest text-muted-foreground">ADD TO CART</span>
              <span className="text-2xl font-medium">$59.99</span>
            </div>
          </div>
        </div>

        {/* Center Column: Main Hero Image */}
        <div className="lg:col-span-6 relative flex justify-center items-center">
          {/* Faux background text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[20rem] font-black text-foreground/5 pointer-events-none select-none -z-10 tracking-tighter">
            {brandName.toUpperCase()}
          </div>
          {/* Main Hero image */}
          <img 
            src={heroContent.image}
            alt={heroContent.title}
            className="w-full max-w-[600px] object-contain drop-shadow-2xl"
          />
        </div>

        {/* Right Column: Mini Gallery & Socials */}
        <div className="lg:col-span-2 flex flex-col justify-between items-end pb-8">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="bg-card w-24 h-32 rounded-sm relative overflow-hidden group cursor-pointer flex justify-center items-center">
                 <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                 <img src={products[1].image} alt={products[1].name} className="w-full h-full object-contain p-2" />
              </div>
              <div className="bg-card w-24 h-32 rounded-sm relative overflow-hidden group cursor-pointer flex justify-center items-center">
                 <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                 <img src={products[4].image} alt={products[4].name} className="w-full h-full object-contain p-2" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground w-full justify-center mt-2">
              <span>01</span>
              <div className="h-[1px] w-8 bg-border"></div>
              <span>07</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-foreground/50">
            <svg
              className="size-5 hover:text-foreground cursor-pointer transition-colors fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
            <svg
              className="size-5 hover:text-foreground cursor-pointer transition-colors fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.822a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            <svg
              className="size-5 hover:text-foreground cursor-pointer transition-colors fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  )
}
