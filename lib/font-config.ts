export type FontPairingId = "geist" | "inter" | "roboto-mono" | "playfair" | "custom"

export interface FontPairing {
  id: FontPairingId
  label: string
  googleFontUrl?: string
  headingFamily: string
  sansFamily: string
  monoFamily: string
}

export const fontPairings: Record<FontPairingId, FontPairing> = {
  "geist": {
    id: "geist",
    label: "Geist (Default)",
    // Geist is already loaded via next/font in layout.tsx, using CSS vars
    headingFamily: "var(--font-geist-sans), 'Geist Fallback'",
    sansFamily: "var(--font-geist-sans), 'Geist Fallback'",
    monoFamily: "var(--font-geist-mono), 'Geist Mono Fallback'",
  },
  "inter": {
    id: "inter",
    label: "Inter & Roboto Mono",
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap",
    headingFamily: "'Inter', sans-serif",
    sansFamily: "'Inter', sans-serif",
    monoFamily: "'Roboto Mono', monospace",
  },
  "playfair": {
    id: "playfair",
    label: "Playfair Display & Lora",
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap",
    headingFamily: "'Playfair Display', serif",
    sansFamily: "'Lora', serif",
    monoFamily: "var(--font-geist-mono), monospace", // fallback
  },
  "roboto-mono": {
    id: "roboto-mono",
    label: "Roboto Mono (Industrial)",
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap",
    headingFamily: "'Roboto Mono', monospace",
    sansFamily: "'Roboto Mono', monospace",
    monoFamily: "'Roboto Mono', monospace",
  },
  "custom": {
    id: "custom",
    label: "Custom Upload",
    headingFamily: "'CustomHeading', sans-serif",
    sansFamily: "'CustomSans', sans-serif",
    monoFamily: "'CustomMono', monospace",
  }
}
