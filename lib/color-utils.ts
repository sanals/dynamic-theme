import { converter, formatHex } from 'culori'

/**
 * Helper to convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Normalize hex string
  let sanitized = hex.trim().replace(/^#/, "")
  
  if (sanitized.length === 3) {
    sanitized = sanitized.split("").map(char => char + char).join("")
  }
  
  if (sanitized.length !== 6) {
    return null
  }
  
  const num = parseInt(sanitized, 16)
  if (isNaN(num)) {
    return null
  }
  
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

/**
 * Calculates the relative luminance of an RGB color.
 * Formula defined by WCAG 2.0:
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * where R, G, B are sRGB values scaled by formula.
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0 // Default fallback

  const rS = rgb.r / 255
  const gS = rgb.g / 255
  const bS = rgb.b / 255

  const r = rS <= 0.04045 ? rS / 12.92 : Math.pow((rS + 0.055) / 1.055, 2.4)
  const g = gS <= 0.04045 ? gS / 12.92 : Math.pow((gS + 0.055) / 1.055, 2.4)
  const b = bS <= 0.04045 ? bS / 12.92 : Math.pow((bS + 0.055) / 1.055, 2.4)

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculates the contrast ratio between two hex colors.
 * Formula: (L1 + 0.05) / (L2 + 0.05)
 * Returns a value between 1 and 21.
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1)
  const l2 = getRelativeLuminance(hex2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  const ratio = (lighter + 0.05) / (darker + 0.05)
  // Round to two decimal places
  return Math.round(ratio * 100) / 100
}

export type WCAGLevel = "AAA" | "AA" | "AA Large" | "Fail"

export interface ContrastResult {
  ratio: number
  level: WCAGLevel
}

/**
 * Get WCAG level and contrast ratio
 */
export function getContrastInfo(bgHex: string, fgHex: string): ContrastResult {
  const ratio = getContrastRatio(bgHex, fgHex)
  
  let level: WCAGLevel = "Fail"
  if (ratio >= 7.0) {
    level = "AAA"
  } else if (ratio >= 4.5) {
    level = "AA"
  } else if (ratio >= 3.0) {
    level = "AA Large"
  }

  return { ratio, level }
}

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch'

const toRgb = converter('rgb')
const toHsl = converter('hsl')
const toOklch = converter('oklch')

export function formatColor(hex: string, format: ColorFormat): string {
  if (format === 'hex') return hex.toUpperCase()
  
  if (format === 'rgb') {
    const rgb = toRgb(hex)
    if (!rgb) return hex
    return `rgb(${Math.round((rgb.r || 0) * 255)} ${Math.round((rgb.g || 0) * 255)} ${Math.round((rgb.b || 0) * 255)})`
  }
  
  if (format === 'hsl') {
    const hsl = toHsl(hex)
    if (!hsl) return hex
    return `hsl(${Math.round(hsl.h || 0)} ${Math.round((hsl.s || 0) * 100)}% ${Math.round((hsl.l || 0) * 100)}%)`
  }
  
  if (format === 'oklch') {
    const o = toOklch(hex)
    if (!o) return hex
    return `oklch(${(o.l || 0).toFixed(3)} ${(o.c || 0).toFixed(3)} ${(o.h || 0).toFixed(1)})`
  }
  
  return hex
}

/**
 * Generate Tailwind-style 50-950 shades based on a base hex color.
 * The base color is treated roughly as the 500 shade.
 * We interpolate lightness in OKLCH space for a perceptually smooth gradient.
 */
export function generateTailwindShades(baseHex: string): { step: string; hex: string }[] {
  const baseOklch = toOklch(baseHex)
  if (!baseOklch) return []

  const steps = [
    { step: '50', l: 0.98 },
    { step: '100', l: 0.95 },
    { step: '200', l: 0.90 },
    { step: '300', l: 0.82 },
    { step: '400', l: 0.74 },
    { step: '500', l: 0.62 },
    { step: '600', l: 0.52 },
    { step: '700', l: 0.42 },
    { step: '800', l: 0.32 },
    { step: '900', l: 0.22 },
    { step: '950', l: 0.12 },
  ]

  return steps.map(({ step, l }) => {
    // A simple curve to reduce chroma at extremes (very light or very dark)
    const chromaScale = Math.sin(l * Math.PI)
    
    const shadedOklch = {
      mode: 'oklch',
      l: l,
      c: (baseOklch.c || 0) * (0.6 + 0.4 * chromaScale),
      h: baseOklch.h || 0
    } as any

    return {
      step,
      hex: formatHex(shadedOklch) || '#000000'
    }
  })
}

