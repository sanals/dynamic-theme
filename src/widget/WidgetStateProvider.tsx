"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { autoFixContrast } from "@/lib/color-utils"
import { Engines } from "./engines"
import { cacheAllOpenShadowRoots } from "./utils/css-parser"

/**
 * The 11 core widget keys that the widget's own UI always needs.
 * These are the "minimum guaranteed set" — the widget's internal CSS
 * variables (--background, --primary, etc.) map to these keys.
 * 
 * External host sites may add additional keys dynamically.
 */
export const WIDGET_INTERNAL_KEYS = [
  "background",
  "foreground",
  "card",
  "cardForeground",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "muted",
  "mutedForeground",
  "border",
] as const

export type WidgetInternalKey = typeof WIDGET_INTERNAL_KEYS[number]

/**
 * Dynamic palette type — a flat dictionary of CSS variable keys to hex values.
 * Always contains at least the 11 WIDGET_INTERNAL_KEYS, but may contain
 * arbitrary additional keys discovered from the host site.
 */
export type CustomColors = Record<string, string>

/**
 * Contrast pairs: background/foreground pairings used for WCAG auto-fix.
 */
export const CONTRAST_PAIRS: [string, string][] = [
  ["background", "foreground"],
  ["card", "cardForeground"],
  ["primary", "primaryForeground"],
  ["secondary", "secondaryForeground"],
  ["muted", "mutedForeground"],
]

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
}

export { DEFAULT_CUSTOM_COLORS }

export interface CustomPaletteContextValue {
  mode: "default" | "custom"
  setMode: (mode: "default" | "custom") => void
  forceOverride: boolean
  setForceOverride: (v: boolean) => void
  mapperMappings: Record<string, string>
  setMapperMappings: (mappings: Record<string, string>) => void
  variableFormats: Record<string, string>
  setVariableFormat: (key: string, format: string) => void
  customColors: CustomColors
  setCustomColor: (key: string, value: string) => void
  applyBulkColors: (colors: CustomColors, lockedColors?: Record<string, boolean>) => void
  removeCustomColor: (key: string) => void
  resetCustomColors: () => void
  swapColors: (key1: string, key2: string, lockedColors?: Record<string, boolean>) => void
  customRadius: number | null
  setCustomRadius: (r: number | null) => void
  lockedColors: Record<string, boolean>
  toggleLock: (key: string) => void
  setLockedColors: (v: Record<string, boolean>) => void
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
const FORCE_OVERRIDE_STORAGE_KEY = "widget-force-override"

export function WidgetStateProvider({ 
  children,
  targetElement = () => document.documentElement
}: { 
  children: React.ReactNode,
  targetElement?: () => HTMLElement 
}) {
  const [mode, setModeState] = useState<"default" | "custom">("default")
  const [forceOverride, setForceOverrideState] = useState(false)
  const [mapperMappings, setMapperMappingsState] = useState<Record<string, string>>({})
  const [variableFormats, setVariableFormatsState] = useState<Record<string, string>>({})
  const [customColors, setCustomColors] = useState<CustomColors>(DEFAULT_CUSTOM_COLORS)
  const [customRadius, setCustomRadiusState] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  // Undo/Redo stacks
  const [history, setHistory] = useState<CustomColors[]>([])
  const [future, setFuture] = useState<CustomColors[]>([])

  const [lockedColors, setLockedColors] = useState<Record<string, boolean>>({})

  const toggleLock = (key: string) => {
    setLockedColors((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const lastEditedKey = useRef<string | null>(null)
  const lastPushTime = useRef<number>(0)

  const setMode = (m: "default" | "custom") => {
    setModeState(m)
    window.localStorage.setItem(MODE_STORAGE_KEY, m)
  }

  const setForceOverride = (v: boolean) => {
    setForceOverrideState(v)
    window.localStorage.setItem(FORCE_OVERRIDE_STORAGE_KEY, JSON.stringify(v))
  }

  const setMapperMappings = (m: Record<string, string>) => {
    setMapperMappingsState(m)
    window.localStorage.setItem("widget-mapper-mappings", JSON.stringify(m))
  }

  const setVariableFormat = (key: string, format: string) => {
    setVariableFormatsState(prev => {
      const next = { ...prev, [key]: format }
      window.localStorage.setItem("widget-variable-formats", JSON.stringify(next))
      return next
    })
  }

  // Hydrate custom colors and mode
  useEffect(() => {
    setMounted(true)
    cacheAllOpenShadowRoots()
    try {
      const storedMode = window.localStorage.getItem(MODE_STORAGE_KEY)
      if (storedMode === 'default' || storedMode === 'custom') {
        setModeState(storedMode)
      } else if (storedMode) {
        // Migrate old modes (mapper/thCtrl/stMgr) to custom
        setModeState('custom')
        window.localStorage.setItem(MODE_STORAGE_KEY, 'custom')
      }
      const storedOverride = window.localStorage.getItem(FORCE_OVERRIDE_STORAGE_KEY)
      if (storedOverride) {
        setForceOverrideState(JSON.parse(storedOverride))
      }
      const storedMappings = window.localStorage.getItem("widget-mapper-mappings")
      if (storedMappings) {
        setMapperMappingsState(JSON.parse(storedMappings))
      }
      const storedFormats = window.localStorage.getItem("widget-variable-formats")
      if (storedFormats) {
        setVariableFormatsState(JSON.parse(storedFormats))
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

    // Always apply CustomEngine in custom mode
    Engines.custom.apply(customColors, customRadius, el, { mapperMappings, variableFormats })

    // If Force Override is ON, also apply the aggressive OverrideEngine
    if (forceOverride && Engines.override) {
      Engines.override.apply(customColors, customRadius, el, { mapperMappings, variableFormats, forceOverride: true })
    }
  }, [customColors, customRadius, mounted, targetElement, mode, mapperMappings, variableFormats, forceOverride])


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

  const setCustomColor = (key: string, value: string) => {
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

  /**
   * Apply a full set of colors. Accepts a CustomColors object (dynamic keys).
   * Respects locked colors. Runs contrast auto-fix on known pairs.
   */
  const applyBulkColors = (incoming: CustomColors, locked?: Record<string, boolean>) => {
    setCustomColors((prev) => {
      const next = { ...prev }
      let hasChanges = false

      // Apply all incoming keys, respecting locks
      for (const [key, val] of Object.entries(incoming)) {
        if (val && !locked?.[key] && next[key] !== val) {
          next[key] = val
          hasChanges = true
        }
      }

      // Auto-fix contrast on known pairs
      const MIN_RATIO = 2.5;
      let wasModified = false;
      for (const [bgKey, fgKey] of CONTRAST_PAIRS) {
        if (next[bgKey] && next[fgKey] && !locked?.[bgKey] && !locked?.[fgKey]) {
          const newFg = autoFixContrast(next[bgKey], next[fgKey], MIN_RATIO);
          if (newFg.toUpperCase() !== next[fgKey].toUpperCase()) {
            next[fgKey] = newFg;
            wasModified = true;
          }
        }
      }

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

  const removeCustomColor = (key: string) => {
    // Only allow removing non-core keys (dynamically discovered variables)
    if ((WIDGET_INTERNAL_KEYS as readonly string[]).includes(key)) return
    pushToHistory(customColors)
    lastEditedKey.current = null
    lastPushTime.current = 0
    setCustomColors((prev) => {
      const next = { ...prev }
      delete next[key]
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

  const swapColors = (key1: string, key2: string, locked?: Record<string, boolean>) => {
    if (key1 === key2) return
    if (locked?.[key1] || locked?.[key2]) return
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

  // Generate CSS for the widget's own shadow DOM styling
  const widgetInternalCss = WIDGET_INTERNAL_KEYS.map(key => {
    const val = customColors[key] || DEFAULT_CUSTOM_COLORS[key]
    // Convert camelCase key to kebab-case CSS variable
    const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    return `--${cssVar}: ${val};`
  }).join('\n      ')

  const customCss = `
    :host {
      ${widgetInternalCss}
      --popover: ${customColors.card || DEFAULT_CUSTOM_COLORS.card};
      --popover-foreground: ${customColors.foreground || DEFAULT_CUSTOM_COLORS.foreground};
      --accent: ${customColors.primary || DEFAULT_CUSTOM_COLORS.primary};
      --accent-foreground: ${customColors.primaryForeground || DEFAULT_CUSTOM_COLORS.primaryForeground};
      --input: ${customColors.border || DEFAULT_CUSTOM_COLORS.border};
      --ring: ${customColors.primary || DEFAULT_CUSTOM_COLORS.primary};
      ${customRadius !== null ? `--radius: ${customRadius}rem;` : ''}
    }
  `

  return (
    <CustomPaletteContext.Provider
      value={{
        mode,
        setMode,
        forceOverride,
        setForceOverride,
        mapperMappings,
        setMapperMappings,
        variableFormats,
        setVariableFormat,
        customColors,
        setCustomColor,
        removeCustomColor,
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


