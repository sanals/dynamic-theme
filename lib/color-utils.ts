
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


