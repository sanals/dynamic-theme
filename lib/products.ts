/*
  DATA LAYER
  ----------
  Pure data, completely decoupled from presentation. Any layout variant
  consumes this same array, so swapping structures never touches data.
*/

export interface Product {
  id: string
  name: string
  description: string
  image: string
  /** Print weight in grams, shown as metadata in some layouts. */
  weight: number
  category: "featured" | "showcase"
}

export const products: Product[] = [
  {
    id: "dragon",
    name: "Articulated Crystal Dragon",
    description: "Fully poseable blue resin dragon with interlocking scales.",
    image: "/products/dragon.png",
    weight: 142,
    category: "featured",
  },
  {
    id: "figure",
    name: "Hero Action Figure",
    description: "High-resolution collectible figure, paint-ready finish.",
    image: "/products/figure.png",
    weight: 96,
    category: "featured",
  },
  {
    id: "gear-cube",
    name: "Kinetic Gear Cube",
    description: "Transparent puzzle box with functional moving gears.",
    image: "/products/gear-cube.png",
    weight: 118,
    category: "featured",
  },
  {
    id: "ford",
    name: "Ford Model T Scale Model",
    description: "Vintage automobile replica with detailed spoked wheels.",
    image: "/products/ford.png",
    weight: 136,
    category: "showcase",
  },
  {
    id: "tower",
    name: "Parametric Tower",
    description: "Twisted lattice architecture printed in spool resin.",
    image: "/products/tower.png",
    weight: 136,
    category: "showcase",
  },
  {
    id: "gears",
    name: "Functional Gear Assembly",
    description: "Printed in PA-CF for industrial-grade durability.",
    image: "/products/gears.png",
    weight: 166,
    category: "showcase",
  },
  {
    id: "terrain",
    name: "Fantasy Terrain",
    description: "Tabletop diorama terrain pieces, hand-finished.",
    image: "/products/terrain.png",
    weight: 120,
    category: "showcase",
  },
  {
    id: "lamp",
    name: "Lattice Lamp Shade",
    description: "Woven geometric shade that glows warmly from within.",
    image: "/products/lamp.png",
    weight: 150,
    category: "showcase",
  },
  {
    id: "spheres",
    name: "Interlocking Puzzle Spheres",
    description: "A set of nested resin spheres in multiple colors.",
    image: "/products/spheres.png",
    weight: 250,
    category: "showcase",
  },
  {
    id: "drone",
    name: "Fully Printed Drone",
    description: "Operational FPV quadcopter frame, flight-tested.",
    image: "/products/drone.png",
    weight: 280,
    category: "showcase",
  },
]

export const heroContent = {
  eyebrow: "Premium Resin & Filament",
  title: "Free Luxury 3D Prints",
  description:
    "Browse a curated gallery of high-fidelity 3D models, from articulated creatures to functional mechanical assemblies. Order a print or upload your own design.",
  primaryCta: "Order a Print",
  secondaryCta: "Browse Designs",
  image: "/products/hero-vase.png",
}
