"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { autoFixContrast } from "@/lib/color-utils"
import { Engines } from "./engines"

// Reuse the exact same CustomColors type from the main app
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
  background: "#18181b", 
  foreground: "#f4f4f5", 
  card: "#27272a",       
  cardForeground: "#f4f4f5", 
  primary: "#3b82f6",    
  primaryForeground: "#18181b", 
  secondary: "#27272a",  
  secondaryForeground: "#f4f4f5", 
  muted: "#27272a",      
  mutedForeground: "#a1a1aa", 
  border: "#3f3f46",     
  pedestalGlow: "#3b82f6",    
  pedestalTop: "#3f3f46",     
  pedestalTopBorder: "#3b82f6", 
  pedestalBody: "#27272a",    
  pedestalShadow: "#000000",  
}

export interface CustomPaletteContextValue {
  mode: "default" | "custom" | "mapper" | "thCtrl" | "stMgr"
  setMode: (mode: "default" | "custom" | "mapper" | "thCtrl" | "stMgr") => void
  mapperMappings: Record<string, string>
  setMapperMappings: (mappings: Record<string, string>) => void
  customColors: CustomColors
  setCustomColor: (key: keyof CustomColors, value: string) => void
  applyBulkColors: (colors: string[], lockedColors?: Partial<Record<keyof CustomColors, boolean>>) => void
  resetCustomColors: () => void
  swapColors: (key1: keyof CustomColors, key2: keyof CustomColors, lockedColors?: Partial<Record<keyof CustomColors, boolean>>) => void
  customRadius: number | null
  setCustomRadius: (r: number | null) => void
  lockedColors: Partial<Record<keyof CustomColors, boolean>>
  toggleLock: (key: keyof CustomColors) => void
  setLockedColors: (v: Partial<Record<keyof CustomColors, boolean>>) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

export const CustomPaletteContext = createContext<CustomPaletteContextValue | null>(null)

export function useCustomPalette() {
  const ctx = useContext(CustomPaletteContext)
  if (!ctx) {
    throw new Error("useCustomPalette must be used within WidgetStateProvider")
  }
  return ctx
}

const STORAGE_KEY = "custom-palette-colors"
const RADIUS_STORAGE_KEY = "custom-palette-radius"
const MODE_STORAGE_KEY = "widget-palette-mode"

export function WidgetStateProvider({ 
  children,
  targetElement = () => document.documentElement
}: { 
  children: React.ReactNode,
  targetElement?: () => HTMLElement 
}) {
  const [mode, setModeState] = useState<"default" | "custom" | "mapper" | "thCtrl" | "stMgr">("default")
  const [mapperMappings, setMapperMappingsState] = useState<Record<string, string>>({})
  const [customColors, setCustomColors] = useState<CustomColors>(DEFAULT_CUSTOM_COLORS)
  const [customRadius, setCustomRadiusState] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  // Undo/Redo stacks
  const [history, setHistory] = useState<CustomColors[]>([])
  const [future, setFuture] = useState<CustomColors[]>([])

  const [lockedColors, setLockedColors] = useState<Partial<Record<keyof CustomColors, boolean>>>({})

  const toggleLock = (key: keyof CustomColors) => {
    setLockedColors((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const lastEditedKey = useRef<keyof CustomColors | null>(null)
  const lastPushTime = useRef<number>(0)

  const setMode = (m: "default" | "custom" | "mapper" | "thCtrl" | "stMgr") => {
    setModeState(m)
    window.localStorage.setItem(MODE_STORAGE_KEY, m)
  }

  const setMapperMappings = (m: Record<string, string>) => {
    setMapperMappingsState(m)
    window.localStorage.setItem("widget-mapper-mappings", JSON.stringify(m))
  }

  // Hydrate custom colors and mode
  useEffect(() => {
    setMounted(true)
    try {
      const storedMode = window.localStorage.getItem(MODE_STORAGE_KEY) as "default" | "custom" | "mapper" | "thCtrl" | "stMgr" | null
      if (storedMode) {
        setModeState(storedMode)
      }
      const storedMappings = window.localStorage.getItem("widget-mapper-mappings")
      if (storedMappings) {
        setMapperMappingsState(JSON.parse(storedMappings))
      }
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setCustomColors({ ...DEFAULT_CUSTOM_COLORS, ...JSON.parse(stored) })
      }
      const storedRadius = window.localStorage.getItem(RADIUS_STORAGE_KEY)
      if (storedRadius) {
        setCustomRadiusState(JSON.parse(storedRadius))
      }
    } catch (e) {
      console.error("Failed to load custom colors", e)
    }
  }, [])

  // Apply CSS Variables to host document using Engines
  useEffect(() => {
    if (!mounted) return
    const el = targetElement()
    if (!el) return

    // Cleanup ALL engines first to prevent variable pollution across modes
    Object.values(Engines).forEach(engine => engine.cleanup(el, { mapperMappings }))

    if (mode === "default") {
      return
    }

    const activeEngine = Engines[mode]
    if (activeEngine) {
      activeEngine.apply(customColors, customRadius, el, { mapperMappings })
    }
  }, [customColors, customRadius, mounted, targetElement, mode, mapperMappings])


  const setCustomRadius = (radius: number | null) => {
    setCustomRadiusState(radius)
    if (radius === null) {
      window.localStorage.removeItem(RADIUS_STORAGE_KEY)
    } else {
      window.localStorage.setItem(RADIUS_STORAGE_KEY, JSON.stringify(radius))
    }
  }

  const pushToHistory = (stateToPush: CustomColors) => {
    setHistory((prev) => {
      const nextHistory = [...prev, stateToPush]
      if (nextHistory.length > 50) return nextHistory.slice(1)
      return nextHistory
    })
    setFuture([])
  }

  const undo = () => {
    if (history.length === 0) return
    const prevColors = history[history.length - 1]
    const currentColors = { ...customColors }

    setFuture((prev) => {
      const nextFuture = [...prev, currentColors]
      if (nextFuture.length > 50) return nextFuture.slice(1)
      return nextFuture
    })

    setHistory((prev) => prev.slice(0, -1))
    setCustomColors(prevColors)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prevColors))

    lastEditedKey.current = null
    lastPushTime.current = 0
  }

  const redo = () => {
    if (future.length === 0) return
    const nextColors = future[future.length - 1]
    const currentColors = { ...customColors }

    setHistory((prev) => {
      const nextHistory = [...prev, currentColors]
      if (nextHistory.length > 50) return nextHistory.slice(1)
      return nextHistory
    })

    setFuture((prev) => prev.slice(0, -1))
    setCustomColors(nextColors)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextColors))

    lastEditedKey.current = null
    lastPushTime.current = 0
  }

  const setCustomColor = (key: keyof CustomColors, value: string) => {
    if (customColors[key] === value) return

    const now = Date.now()
    const isContinuous = key === lastEditedKey.current && (now - lastPushTime.current < 800)

    if (!isContinuous) {
      pushToHistory(customColors)
      lastEditedKey.current = key
    }
    lastPushTime.current = now

    setCustomColors((prev) => {
      const next = { ...prev, [key]: value }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const applyBulkColors = (colors: string[], lockedColors?: Partial<Record<keyof CustomColors, boolean>>) => {
    setCustomColors((prev) => {
      const next = { ...prev }
      let hasChanges = false

      const trySet = (key: keyof CustomColors, val: string | undefined, isLocked: boolean | undefined) => {
        if (val && !isLocked && next[key] !== val) {
          next[key] = val
          hasChanges = true
        }
      }

      trySet("background", colors[0], lockedColors?.background)
      trySet("foreground", colors[1], lockedColors?.foreground)
      trySet("card", colors[2], lockedColors?.card)
      trySet("cardForeground", colors[3], lockedColors?.cardForeground)
      trySet("primary", colors[4], lockedColors?.primary)
      trySet("primaryForeground", colors[5], lockedColors?.primaryForeground)
      trySet("secondary", colors[6], lockedColors?.secondary)
      trySet("secondaryForeground", colors[7], lockedColors?.secondaryForeground)
      trySet("muted", colors[8], lockedColors?.muted)
      trySet("mutedForeground", colors[9], lockedColors?.mutedForeground)
      trySet("border", colors[10], lockedColors?.border)
      trySet("pedestalGlow", colors[11], lockedColors?.pedestalGlow)
      trySet("pedestalTop", colors[12], lockedColors?.pedestalTop)
      trySet("pedestalTopBorder", colors[13], lockedColors?.pedestalTopBorder)
      trySet("pedestalBody", colors[14], lockedColors?.pedestalBody)
      trySet("pedestalShadow", colors[15], lockedColors?.pedestalShadow)

      const MIN_RATIO = 2.5;
      let wasModified = false;
      const enforce = (bgKey: keyof CustomColors, fgKey: keyof CustomColors) => {
        if (!lockedColors?.[bgKey] && !lockedColors?.[fgKey]) {
          const newFg = autoFixContrast(next[bgKey], next[fgKey], MIN_RATIO);
          if (newFg.toUpperCase() !== next[fgKey].toUpperCase()) {
            next[fgKey] = newFg;
            wasModified = true;
          }
        }
      };

      enforce("background", "foreground");
      enforce("card", "cardForeground");
      enforce("primary", "primaryForeground");
      enforce("secondary", "secondaryForeground");
      enforce("muted", "mutedForeground");

      if (!hasChanges && !wasModified) return prev

      if (wasModified) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("palette-auto-fixed"));
        }
      }

      pushToHistory(prev)
      lastEditedKey.current = null
      lastPushTime.current = 0

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const resetCustomColors = () => {
    pushToHistory(customColors)
    lastEditedKey.current = null
    lastPushTime.current = 0
    setCustomColors(DEFAULT_CUSTOM_COLORS)
    setCustomRadius(null)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  const swapColors = (key1: keyof CustomColors, key2: keyof CustomColors, lockedColors?: Partial<Record<keyof CustomColors, boolean>>) => {
    if (key1 === key2) return
    if (lockedColors?.[key1] || lockedColors?.[key2]) return
    pushToHistory(customColors)
    lastEditedKey.current = null
    lastPushTime.current = 0

    setCustomColors((prev) => {
      const next = { ...prev }
      const temp = next[key1]
      next[key1] = next[key2]
      next[key2] = temp
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const customCss = `
    :host {
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
      ${customRadius !== null ? `--radius: ${customRadius}rem;` : ''}
    }
  `

  return (
    <CustomPaletteContext.Provider
      value={{
        mode,
        setMode,
        mapperMappings,
        setMapperMappings,
        customColors,
        setCustomColor,
        applyBulkColors,
        resetCustomColors,
        swapColors,
        customRadius,
        setCustomRadius,
        lockedColors,
        toggleLock,
        setLockedColors,
        undo,
        redo,
        canUndo: history.length > 0,
        canRedo: future.length > 0
      }}
    >
      {mounted && (
        <style dangerouslySetInnerHTML={{ __html: customCss }} />
      )}
      {children}
    </CustomPaletteContext.Provider>
  )
}


