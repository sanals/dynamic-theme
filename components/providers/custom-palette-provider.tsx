"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useTheme } from "next-themes"

export type CustomColors = {
  background: string
  foreground: string
  card: string
  cardForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  border: string
  pedestalGlow: string
  pedestalTop: string
  pedestalTopBorder: string
  pedestalBody: string
  pedestalShadow: string
}

const DEFAULT_CUSTOM_COLORS: CustomColors = {
  background: "#18181b", // zinc-900
  foreground: "#f4f4f5", // zinc-100
  card: "#27272a",       // zinc-800
  cardForeground: "#f4f4f5", // zinc-100
  primary: "#3b82f6",    // blue-500
  primaryForeground: "#18181b", // zinc-900
  secondary: "#27272a",  // zinc-800
  secondaryForeground: "#f4f4f5", // zinc-100
  muted: "#27272a",      // zinc-800
  mutedForeground: "#a1a1aa", // zinc-400
  border: "#3f3f46",     // zinc-700
  pedestalGlow: "#3b82f6",    // blue-500
  pedestalTop: "#3f3f46",     // zinc-700
  pedestalTopBorder: "#3b82f6", // blue-500
  pedestalBody: "#27272a",    // zinc-800
  pedestalShadow: "#000000",  // black
}

interface CustomPaletteContextValue {
  customColors: CustomColors
  setCustomColor: (key: keyof CustomColors, value: string) => void
  applyBulkColors: (colors: string[]) => void
  resetCustomColors: () => void
  swapColors: (key1: keyof CustomColors, key2: keyof CustomColors) => void
}

const CustomPaletteContext = createContext<CustomPaletteContextValue | null>(null)

const STORAGE_KEY = "custom-palette-colors"

export function CustomPaletteProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const [customColors, setCustomColors] = useState<CustomColors>(DEFAULT_CUSTOM_COLORS)
  const [mounted, setMounted] = useState(false)

  // Hydrate custom colors
  useEffect(() => {
    setMounted(true)
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setCustomColors({ ...DEFAULT_CUSTOM_COLORS, ...JSON.parse(stored) })
      }
    } catch (e) {
      console.error("Failed to load custom colors", e)
    }
  }, [])

  const setCustomColor = (key: keyof CustomColors, value: string) => {
    setCustomColors((prev) => {
      const next = { ...prev, [key]: value }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const applyBulkColors = (colors: string[]) => {
    setCustomColors((prev) => {
      const next = { ...prev }
      if (colors[0]) next.background = colors[0]
      if (colors[1]) next.foreground = colors[1]
      if (colors[2]) next.card = colors[2]
      if (colors[3]) next.cardForeground = colors[3]
      if (colors[4]) next.primary = colors[4]
      if (colors[5]) next.primaryForeground = colors[5]
      if (colors[6]) next.secondary = colors[6]
      if (colors[7]) next.secondaryForeground = colors[7]
      if (colors[8]) next.muted = colors[8]
      if (colors[9]) next.mutedForeground = colors[9]
      if (colors[10]) next.border = colors[10]
      if (colors[11]) next.pedestalGlow = colors[11]
      if (colors[12]) next.pedestalTop = colors[12]
      if (colors[13]) next.pedestalTopBorder = colors[13]
      if (colors[14]) next.pedestalBody = colors[14]
      if (colors[15]) next.pedestalShadow = colors[15]
      
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const resetCustomColors = () => {
    setCustomColors(DEFAULT_CUSTOM_COLORS)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  const swapColors = (key1: keyof CustomColors, key2: keyof CustomColors) => {
    if (key1 === key2) return
    setCustomColors((prev) => {
      const next = { ...prev }
      const temp = next[key1]
      next[key1] = next[key2]
      next[key2] = temp
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  // Generate the CSS string dynamically based on the current custom colors.
  // We use standard hex colors, so they don't need oklch conversions, but they just map directly.
  const customCss = `
    [data-theme="custom-palette"] {
      --background: ${customColors.background};
      --foreground: ${customColors.foreground};
      --card: ${customColors.card};
      --card-foreground: ${customColors.cardForeground};
      --popover: ${customColors.card};
      --popover-foreground: ${customColors.foreground};
      --primary: ${customColors.primary};
      --primary-foreground: ${customColors.primaryForeground};
      --secondary: ${customColors.secondary};
      --secondary-foreground: ${customColors.secondaryForeground};
      --muted: ${customColors.muted};
      --muted-foreground: ${customColors.mutedForeground};
      --accent: ${customColors.primary};
      --accent-foreground: ${customColors.primaryForeground};
      --border: ${customColors.border};
      --input: ${customColors.border};
      --ring: ${customColors.primary};
      
      --pedestal-glow: ${customColors.pedestalGlow};
      --pedestal-top: ${customColors.pedestalTop};
      --pedestal-top-border: ${customColors.pedestalTopBorder};
      --pedestal-body: ${customColors.pedestalBody};
      --pedestal-shadow: ${customColors.pedestalShadow};
    }
  `

  return (
    <CustomPaletteContext.Provider value={{ customColors, setCustomColor, applyBulkColors, resetCustomColors, swapColors }}>
      {/* Inject styles unconditionally, they are scoped to [data-theme="custom-palette"] anyway */}
      {mounted && theme === "custom-palette" && (
        <style dangerouslySetInnerHTML={{ __html: customCss }} />
      )}
      {children}
    </CustomPaletteContext.Provider>
  )
}

export function useCustomPalette() {
  const ctx = useContext(CustomPaletteContext)
  if (!ctx) {
    throw new Error("useCustomPalette must be used within a CustomPaletteProvider")
  }
  return ctx
}
