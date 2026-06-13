"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useTheme } from "next-themes"

export type CustomColors = {
  background: string
  foreground: string
  primary: string
  card: string
  pedestalTop: string
}

const DEFAULT_CUSTOM_COLORS: CustomColors = {
  background: "#18181b", // zinc-900
  foreground: "#f4f4f5", // zinc-100
  primary: "#3b82f6",    // blue-500
  card: "#27272a",       // zinc-800
  pedestalTop: "#3f3f46",// zinc-700
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
      if (colors[0]) next.primary = colors[0]
      if (colors[1]) next.background = colors[1]
      if (colors[2]) next.card = colors[2]
      if (colors[3]) next.foreground = colors[3]
      if (colors[4]) next.pedestalTop = colors[4]
      
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
      --card-foreground: ${customColors.foreground};
      --popover: ${customColors.card};
      --popover-foreground: ${customColors.foreground};
      --primary: ${customColors.primary};
      --primary-foreground: ${customColors.background};
      --secondary: ${customColors.card};
      --secondary-foreground: ${customColors.foreground};
      --muted: ${customColors.card};
      --muted-foreground: ${customColors.foreground};
      --accent: ${customColors.primary};
      --accent-foreground: ${customColors.background};
      --border: ${customColors.primary}; /* simplified for custom mode */
      --input: ${customColors.primary};
      --ring: ${customColors.primary};
      
      --pedestal-glow: ${customColors.primary};
      --pedestal-top: ${customColors.pedestalTop};
      --pedestal-top-border: ${customColors.primary};
      --pedestal-body: ${customColors.card};
      --pedestal-shadow: #000000;
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
