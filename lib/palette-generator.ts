import { type CustomColors } from "@/components/providers/custom-palette-provider"
import { type DesignId } from "@/lib/design-config"

interface HSL {
  h: number // 0-360
  s: number // 0-100
  l: number // 0-100
  a?: number // 0-1
}

// Convert HEX string to HSL
export function hexToHsl(hex: string): HSL {
  // Strip '#'
  let cleaned = hex.replace(/^#/, "")

  // Parse alpha if present
  let a = 1
  if (cleaned.length === 8) {
    a = parseInt(cleaned.substring(6, 8), 16) / 255
    cleaned = cleaned.substring(0, 6)
  } else if (cleaned.length === 4) {
    a = parseInt(cleaned.substring(3, 4) + cleaned.substring(3, 4), 16) / 255
    cleaned = cleaned.substring(0, 3)
  }

  // Handle shorthand (e.g. FFF -> FFFFFF)
  if (cleaned.length === 3) {
    cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2]
  }

  const r = parseInt(cleaned.substring(0, 2), 16) / 255
  const g = parseInt(cleaned.substring(2, 4), 16) / 255
  const b = parseInt(cleaned.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: parseFloat(a.toFixed(2)),
  }
}

// Convert HSL to HEX
export function hslToHex({ h, s, l, a }: HSL): string {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (0 <= h && h < 60) {
    r = c
    g = x
    b = 0
  } else if (60 <= h && h < 120) {
    r = x
    g = c
    b = 0
  } else if (120 <= h && h < 180) {
    r = 0
    g = c
    b = x
  } else if (180 <= h && h < 240) {
    r = 0
    g = x
    b = c
  } else if (240 <= h && h < 300) {
    r = x
    g = 0
    b = c
  } else if (300 <= h && h < 360) {
    r = c
    g = 0
    b = x
  }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, "0").toUpperCase()
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, "0").toUpperCase()
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, "0").toUpperCase()

  let alphaHex = ""
  if (a !== undefined && a < 1) {
    alphaHex = Math.round(a * 255).toString(16).padStart(2, "0").toUpperCase()
  }

  return `#${rHex}${gHex}${bHex}${alphaHex}`
}

// Color Harmonies
type HarmonyType = "analogous" | "complementary" | "triadic" | "split" | "monochromatic"

export function generatePalette(
  currentColors: CustomColors,
  lockedKeys: Partial<Record<keyof CustomColors, boolean>>,
  activeDesign: DesignId
): CustomColors {
  const result = { ...currentColors }

  // 1. Determine base seed color (Hue, Saturation, Lightness)
  // Check if primary accent is locked. If yes, use it as seed.
  // Otherwise, use first locked key we find.
  // If none locked, generate random base seed.
  let seedHsl: HSL
  if (lockedKeys.primary) {
    seedHsl = hexToHsl(currentColors.primary)
  } else {
    const lockedKey = (Object.keys(lockedKeys) as Array<keyof CustomColors>).find(
      (k) => lockedKeys[k] && currentColors[k]
    )
    if (lockedKey) {
      seedHsl = hexToHsl(currentColors[lockedKey])
    } else {
      seedHsl = {
        h: Math.floor(Math.random() * 360),
        s: 40 + Math.floor(Math.random() * 45), // 40-85% (vibrant)
        l: 45 + Math.floor(Math.random() * 20), // 45-65%
      }
    }
  }

  // Random harmony strategy
  const harmonies: HarmonyType[] = ["analogous", "complementary", "triadic", "split", "monochromatic"]
  const harmony = harmonies[Math.floor(Math.random() * harmonies.length)]

  // Calculate harmonized hues based on seed hue
  let primaryHue = seedHsl.h
  let secondaryHue = (seedHsl.h + 30) % 360
  let accentHue = seedHsl.h

  switch (harmony) {
    case "complementary":
      accentHue = (seedHsl.h + 180) % 360
      secondaryHue = (seedHsl.h + 180) % 360
      break
    case "triadic":
      accentHue = (seedHsl.h + 120) % 360
      secondaryHue = (seedHsl.h + 240) % 360
      break
    case "analogous":
      accentHue = (seedHsl.h + 30) % 360
      secondaryHue = (seedHsl.h - 30 + 360) % 360
      break
    case "split":
      accentHue = (seedHsl.h + 150) % 360
      secondaryHue = (seedHsl.h + 210) % 360
      break
    case "monochromatic":
      accentHue = seedHsl.h
      secondaryHue = seedHsl.h
      break
  }

  // 2. Determine general theme brightness (dark vs light theme)
  // Check if background color is locked. If yes, check if it's light or dark.
  // Otherwise, use the seed color's lightness to infer the user's intent.
  // If the seed color is very light (L > 75), it's probably a light theme.
  // If the seed color is very dark (L < 25), it's probably a dark theme.
  // If it's a mid-tone color, randomly favor dark themes (80%).
  let isDark = true
  if (lockedKeys.background) {
    const bgHsl = hexToHsl(currentColors.background)
    isDark = bgHsl.l < 50
  } else {
    if (seedHsl.l > 75) {
      isDark = false // Seed is light, assume light theme
    } else if (seedHsl.l < 25) {
      isDark = true // Seed is dark, assume dark theme
    } else {
      isDark = Math.random() < 0.8 // Random fallback, favor dark
    }
  }

  // Helper helper to generate HSL
  const getHsl = (h: number, s: number, l: number, a?: number): HSL => ({
    h,
    s: Math.max(0, Math.min(100, s)),
    l: Math.max(0, Math.min(100, l)),
    a,
  })

  // 3. Define color slots based on lightness preference
  const generated: Partial<Record<keyof CustomColors, string>> = {}

  if (isDark) {
    const bgH = (seedHsl.h + 10) % 360
    const bgS = Math.min(15, seedHsl.s)
    generated.background = hslToHex(getHsl(bgH, bgS, 8)) // Very dark grey/colored
    generated.foreground = hslToHex(getHsl(seedHsl.h, 10, 95)) // Almost white
    generated.card = hslToHex(getHsl(bgH, bgS + 4, 14)) // Slightly lighter card
    generated.cardForeground = hslToHex(getHsl(seedHsl.h, 10, 92))
    generated.muted = hslToHex(getHsl(bgH, bgS + 2, 16))
    generated.mutedForeground = hslToHex(getHsl(seedHsl.h, 15, 60))
    generated.border = hslToHex(getHsl(bgH, bgS + 5, 22))
  } else {
    const bgH = seedHsl.h
    const bgS = Math.min(10, seedHsl.s)
    generated.background = hslToHex(getHsl(bgH, bgS, 97)) // Soft off-white
    generated.foreground = hslToHex(getHsl(seedHsl.h, 15, 12)) // Dark text
    generated.card = hslToHex(getHsl(bgH, bgS + 2, 100)) // Pure white card
    generated.cardForeground = hslToHex(getHsl(seedHsl.h, 15, 15))
    generated.muted = hslToHex(getHsl(bgH, bgS + 4, 92))
    generated.mutedForeground = hslToHex(getHsl(seedHsl.h, 15, 45))
    generated.border = hslToHex(getHsl(bgH, bgS + 8, 86))
  }

  // Primary Accent (seedHsl or accentHue depending on locks)
  generated.primary = hslToHex(getHsl(primaryHue, seedHsl.s, isDark ? 55 : 45))
  // Contrast color for primary text
  generated.primaryForeground = seedHsl.l > 60 || (harmony === "monochromatic" && seedHsl.l > 60)
    ? "#09090b" // black
    : "#ffffff" // white

  // Secondary Accent
  generated.secondary = isDark
    ? hslToHex(getHsl(secondaryHue, Math.max(15, seedHsl.s - 20), 22))
    : hslToHex(getHsl(secondaryHue, Math.max(15, seedHsl.s - 20), 90))
  generated.secondaryForeground = isDark ? "#ffffff" : "#09090b"

  // 4. Pedestal options for dholeish / rakery
  if (activeDesign === "dholeish" || activeDesign === "rakery") {
    // Pedestal Glow matches accent color
    generated.pedestalGlow = hslToHex(getHsl(primaryHue, seedHsl.s, 50, 0.4))
    
    if (isDark) {
      generated.pedestalTop = hslToHex(getHsl(primaryHue, 12, 18))
      generated.pedestalTopBorder = hslToHex(getHsl(primaryHue, seedHsl.s, 40, 0.25))
      generated.pedestalBody = hslToHex(getHsl(primaryHue, 10, 13))
      generated.pedestalShadow = "#000000"
    } else {
      generated.pedestalTop = hslToHex(getHsl(primaryHue, 10, 93))
      generated.pedestalTopBorder = hslToHex(getHsl(primaryHue, seedHsl.s, 40, 0.15))
      generated.pedestalBody = hslToHex(getHsl(primaryHue, 8, 88))
      generated.pedestalShadow = hslToHex(getHsl(primaryHue, 10, 30, 0.15))
    }
  }

  // 5. Apply generated values, preserving locked colors
  Object.keys(result).forEach((k) => {
    const colorKey = k as keyof CustomColors
    if (!lockedKeys[colorKey] && generated[colorKey] !== undefined) {
      result[colorKey] = generated[colorKey]!
    }
  })

  return result
}
