
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

function interpolateColor(hex1: string, hex2: string, factor: number): string {
  const c1 = hexToRgb(hex1) || { r: 0, g: 0, b: 0 }
  const c2 = hexToRgb(hex2) || { r: 0, g: 0, b: 0 }
  const r = Math.round(c1.r + (c2.r - c1.r) * factor)
  const g = Math.round(c1.g + (c2.g - c1.g) * factor)
  const b = Math.round(c1.b + (c2.b - c1.b) * factor)
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

/**
 * Automatically adjusts the foreground color to meet the target WCAG contrast ratio against the background.
 * Uses a binary search to find the minimal color shift required.
 */
export function autoFixContrast(bgHex: string, fgHex: string, targetRatio: number = 4.5): string {
  const currentRatio = getContrastRatio(bgHex, fgHex)
  if (currentRatio >= targetRatio) return fgHex

  // Target white or black based on which provides the highest possible contrast
  const contrastWithWhite = getContrastRatio(bgHex, "#FFFFFF")
  const contrastWithBlack = getContrastRatio(bgHex, "#000000")
  const targetHex = contrastWithWhite > contrastWithBlack ? "#FFFFFF" : "#000000"

  let low = 0
  let high = 1
  let best = targetHex

  // Binary search for the minimum blending factor
  for (let i = 0; i < 15; i++) {
    const mid = (low + high) / 2
    const testHex = interpolateColor(fgHex, targetHex, mid)
    const ratio = getContrastRatio(bgHex, testHex)
    
    if (ratio >= targetRatio) {
      best = testHex
      high = mid // Try to find a color closer to original
    } else {
      low = mid // Need more contrast, blend closer to target
    }
  }

  return best
}

/**
 * Extracts a dominant colorful hex from an image file using Canvas.
 */
export async function extractDominantColor(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        URL.revokeObjectURL(url)
        return reject(new Error("No canvas context"))
      }
      
      // Scale down for performance
      canvas.width = 64
      canvas.height = 64
      ctx.drawImage(img, 0, 0, 64, 64)
      
      const data = ctx.getImageData(0, 0, 64, 64).data
      
      const bins = new Map<number, { r: number, g: number, b: number, count: number }>()
      let maxCount = 0
      let bestBin = null

      for (let i = 0; i < data.length; i += 4) {
        const _r = data[i]
        const _g = data[i + 1]
        const _b = data[i + 2]
        const _a = data[i + 3]
        
        // Ignore transparent pixels
        if (_a < 128) continue
        
        // Group similar colors into bins (32x32x32 color space chunks = 512 bins)
        // This effectively clusters grainy noise together
        const rBin = _r >> 5
        const gBin = _g >> 5
        const bBin = _b >> 5
        const binIndex = (rBin << 6) | (gBin << 3) | bBin
        
        let bin = bins.get(binIndex)
        if (!bin) {
          bin = { r: 0, g: 0, b: 0, count: 0 }
          bins.set(binIndex, bin)
        }
        
        bin.r += _r
        bin.g += _g
        bin.b += _b
        bin.count++

        if (bin.count > maxCount) {
          maxCount = bin.count
          bestBin = bin
        }
      }
      
      URL.revokeObjectURL(url)
      
      let r = 0, g = 0, b = 0
      if (bestBin) {
        // Average the pixels inside the winning cluster to get a perfectly smooth representative color
        r = Math.floor(bestBin.r / bestBin.count)
        g = Math.floor(bestBin.g / bestBin.count)
        b = Math.floor(bestBin.b / bestBin.count)
      } else {
        // Fallback to center pixel if completely transparent or empty
        const fallbackData = ctx.getImageData(32, 32, 1, 1).data
        r = fallbackData[0]
        g = fallbackData[1]
        b = fallbackData[2]
      }
      
      const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
      resolve(hex)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }
    
    img.src = url
  })
}
