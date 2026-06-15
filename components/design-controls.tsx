"use client"

import { useTheme } from "next-themes"
import { useEffect, useState, useRef } from "react"
import { createPortal, flushSync } from "react-dom"
import { Frame, Palette, LayoutGrid, RotateCcw, Copy, Check, Minimize2, Sun, Moon, Lock, Unlock, Shuffle, Download, Type, Upload, Columns, Share2, Camera, Undo2, Redo2, ChevronDown, ChevronRight, ChevronLeft, Link2, Eye, Sparkles, Loader2 } from "lucide-react"
import {
  designs,
  palettesByDesign,
  layoutStructures,
  darkLightPairs,
  type DesignId,
  type ColorPalette,
  type LayoutStructure,
} from "@/lib/design-config"
import { useDesign } from "@/components/providers/design-provider"
import { useLayoutStructure } from "@/components/providers/layout-provider"
import { useFont } from "@/components/providers/font-provider"
import { fontPairings, type FontPairingId } from "@/lib/font-config"
import { useCustomPalette, type CustomColors } from "@/components/providers/custom-palette-provider"
import { cn } from "@/lib/utils"
import { generatePalette } from "@/lib/palette-generator"
import { getContrastInfo } from "@/lib/color-utils"
import { useComparison, type Snapshot } from "@/components/providers/comparison-provider"
import { toPng } from "html-to-image"
import { POPULAR_GOOGLE_FONTS } from "@/lib/popular-fonts"

export interface Preset {
  id: string
  name: string
  colors: CustomColors
  isCustom?: boolean
}

export const BUILTIN_PRESETS: Preset[] = [
  {
    id: "sunset-glow",
    name: "Sunset Glow",
    colors: {
      background: "#1e152a",
      foreground: "#f7f4fb",
      card: "#2c1e3d",
      cardForeground: "#f7f4fb",
      primary: "#ff6b6b",
      primaryForeground: "#1e152a",
      secondary: "#fca311",
      secondaryForeground: "#1e152a",
      muted: "#2c1e3d",
      mutedForeground: "#bca0dc",
      border: "#4b3269",
      pedestalGlow: "#ff6b6b",
      pedestalTop: "#3e275c",
      pedestalTopBorder: "#ff6b6b",
      pedestalBody: "#2c1e3d",
      pedestalShadow: "#0d0614",
    }
  },
  {
    id: "cyberpunk-neon",
    name: "Cyber Neon",
    colors: {
      background: "#0d0e15",
      foreground: "#00f0ff",
      card: "#151722",
      cardForeground: "#ffffff",
      primary: "#ff007f",
      primaryForeground: "#ffffff",
      secondary: "#00f0ff",
      secondaryForeground: "#0d0e15",
      muted: "#151722",
      mutedForeground: "#787f9d",
      border: "#ff007f",
      pedestalGlow: "#ff007f",
      pedestalTop: "#1c1e2d",
      pedestalTopBorder: "#00f0ff",
      pedestalBody: "#151722",
      pedestalShadow: "#000000",
    }
  },
  {
    id: "nordic-winter",
    name: "Nordic Ice",
    colors: {
      background: "#f0f4f8",
      foreground: "#102a43",
      card: "#ffffff",
      cardForeground: "#102a43",
      primary: "#486581",
      primaryForeground: "#ffffff",
      secondary: "#627d98",
      secondaryForeground: "#ffffff",
      muted: "#bcccdc",
      mutedForeground: "#486581",
      border: "#d9e2ec",
      pedestalGlow: "#627d98",
      pedestalTop: "#e1e8ed",
      pedestalTopBorder: "#bcccdc",
      pedestalBody: "#bcccdc",
      pedestalShadow: "#102a4315",
    }
  },
  {
    id: "vintage-retro",
    name: "Retro Warm",
    colors: {
      background: "#faf6ee",
      foreground: "#2b2a27",
      card: "#f4ede0",
      cardForeground: "#2b2a27",
      primary: "#d95d39",
      primaryForeground: "#faf6ee",
      secondary: "#f0a28e",
      secondaryForeground: "#2b2a27",
      muted: "#f4ede0",
      mutedForeground: "#8c877d",
      border: "#dfd5c2",
      pedestalGlow: "#d95d39",
      pedestalTop: "#ebe0cc",
      pedestalTopBorder: "#d95d39",
      pedestalBody: "#dfd5c2",
      pedestalShadow: "#2b2a2712",
    }
  }
]

/*
  DESIGN CONTROLS
  ---------------
  Two independent segmented toggles. The first drives the COLOR axis
  (next-themes -> data-theme), the second drives the STRUCTURE axis
  (LayoutProvider). They never interfere with each other.
*/

function Segmented<T extends string>({
  label,
  icon,
  options,
  value,
  onChange,
}: {
  label: string
  icon: React.ReactNode
  options: { id: T; label: string }[]
  value: T | undefined
  onChange: (id: T) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground sm:flex">
        {icon}
        {label}
      </span>
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={value === opt.id}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              value === opt.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function DraggableColorPicker({
  colorKey,
  label,
  value,
  onChange,
  onSwap,
  isLocked,
  onToggleLock,
}: {
  colorKey: keyof CustomColors
  label: string
  value: string
  onChange: (val: string) => void
  onSwap: (source: keyof CustomColors, target: keyof CustomColors) => void
  isLocked?: boolean
  onToggleLock?: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [isHoveringInput, setIsHoveringInput] = useState(false)
  const safeValue = value || "#000000"

  const copySingle = () => {
    navigator.clipboard.writeText(safeValue).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      draggable={!isHoveringInput && !isLocked}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", colorKey)
        e.dataTransfer.effectAllowed = "move"
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
      }}
      onDrop={(e) => {
        e.preventDefault()
        if (isLocked) return
        const sourceKey = e.dataTransfer.getData("text/plain") as keyof CustomColors
        if (sourceKey && sourceKey !== colorKey) {
          onSwap(sourceKey, colorKey)
        }
      }}
      className={cn(
        "flex flex-col items-center gap-1 p-1 -m-1 rounded hover:bg-white/5 transition-colors group/item",
        !isLocked && !isHoveringInput ? "cursor-grab active:cursor-grabbing" : ""
      )}
      title={isLocked ? "Color locked. Click label to copy hex." : "Drag to swap. Click label to copy hex."}
    >
      <button
        type="button"
        onClick={copySingle}
        title="Copy hex code"
        className="text-[10px] text-muted-foreground leading-none hover:text-foreground transition-colors w-full text-center font-medium"
      >
        {copied ? "Copied" : label}
      </button>
      <div className="relative group/picker size-6">
        <input
          type="color"
          value={safeValue.slice(0, 7)}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLocked}
          className={cn(
            "size-full border-0 p-0 rounded-md overflow-hidden shrink-0",
            isLocked ? "cursor-not-allowed opacity-80" : "cursor-pointer pointer-events-auto"
          )}
        />
        {onToggleLock && (
          <button
            type="button"
            onClick={onToggleLock}
            title={isLocked ? "Unlock color" : "Lock color"}
            className={cn(
              "absolute -top-2 -right-2 p-0.5 rounded-full border shadow transition-all",
              isLocked
                ? "bg-amber-500 text-black border-amber-600 opacity-100 scale-100"
                : "bg-black/85 text-white border-white/20 opacity-0 group-hover/item:opacity-100 scale-100 hover:scale-110"
            )}
          >
            {isLocked ? <Lock className="size-3 stroke-[3]" /> : <Unlock className="size-3 stroke-[2.5]" />}
          </button>
        )}
      </div>

      <input
        type="text"
        value={safeValue}
        readOnly={isLocked}
        onMouseEnter={() => !isLocked && setIsHoveringInput(true)}
        onMouseLeave={() => !isLocked && setIsHoveringInput(false)}
        onFocus={(e) => {
          if (!isLocked) setIsHoveringInput(true)
          e.target.select()
        }}
        onClick={(e) => e.currentTarget.select()}
        onBlur={() => setIsHoveringInput(false)}
        onPaste={(e) => e.stopPropagation()}
        onChange={(e) => {
          let val = e.target.value.trim().replace(/#/g, "")
          if (val.length > 0) {
            onChange("#" + val)
          } else {
            onChange("")
          }
        }}
        placeholder="#000000"
        className="w-[68px] text-[11px] bg-black/30 border border-white/10 rounded text-center text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary h-5 px-1 mt-0.5"
      />
    </div>
  )
}

export function DesignControls({ onMinimize }: { onMinimize: () => void }) {
  const { theme, setTheme: _setTheme } = useTheme()
  const { activeLayoutStructure, setLayoutStructure: _setLayoutStructure } = useLayoutStructure()
  const { activeDesign, setDesign: _setDesign } = useDesign()
  const { activeFont, setFont, setCustomFont, customFontName, dynamicGoogleFontName, setDynamicGoogleFont } = useFont()

  // View Transition Wrappers
  const setTheme = (newTheme: string) => {
    if (!document.startViewTransition) return _setTheme(newTheme)
    document.startViewTransition(() => flushSync(() => _setTheme(newTheme)))
  }

  const setLayoutStructure = (newLayout: LayoutStructure) => {
    if (!document.startViewTransition) return _setLayoutStructure(newLayout)
    document.startViewTransition(() => flushSync(() => _setLayoutStructure(newLayout)))
  }

  const setDesign = (newDesign: DesignId) => {
    if (!document.startViewTransition) return _setDesign(newDesign)
    document.startViewTransition(() => flushSync(() => _setDesign(newDesign)))
  }
  const { customColors, setCustomColor, applyBulkColors, resetCustomColors, swapColors, customRadius, setCustomRadius, undo, redo, canUndo, canRedo } = useCustomPalette()
  const { isComparisonMode, setComparisonMode, snapshot, setSnapshot } = useComparison()
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false)
  const [googleFontSearch, setGoogleFontSearch] = useState("")
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false)
  const [wcagExpanded, setWcagExpanded] = useState(false)
  const [extendedColorsExpanded, setExtendedColorsExpanded] = useState(false)
  const [pedestalColorsExpanded, setPedestalColorsExpanded] = useState(false)
  const [presetsExpanded, setPresetsExpanded] = useState(false)
  const [maxVisiblePresets, setMaxVisiblePresets] = useState(4)
  const presetsContainerRef = useRef<HTMLDivElement>(null)
  
  // Font Selector
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const fontFileInputRef = useRef<HTMLInputElement>(null)

  const handleCaptureSnapshot = () => {
    const activeThemeName = theme === "custom-palette" ? "Custom" : theme || "Default"
    const currentSnapshot: Snapshot = {
      designId: activeDesign,
      colors: { ...getActiveColors() },
      layoutStructure: activeLayoutStructure,
      font: activeFont,
      themeName: activeThemeName,
    }
    setSnapshot(currentSnapshot)
  }

  const handleToggleComparison = () => {
    const nextMode = !isComparisonMode
    setComparisonMode(nextMode)
    if (nextMode && !snapshot) {
      handleCaptureSnapshot()
    }
  }

  const [shareCopied, setShareCopied] = useState(false)
  const [capturingPng, setCapturingPng] = useState(false)

  const handleShareLink = () => {
    const c = getActiveColors()
    const colorParams = [
      c.background, c.foreground, c.card, c.cardForeground,
      c.primary, c.primaryForeground, c.secondary, c.secondaryForeground,
      c.muted, c.mutedForeground, c.border,
      c.pedestalGlow, c.pedestalTop, c.pedestalTopBorder, c.pedestalBody, c.pedestalShadow
    ].map(color => (color || "").replace("#", "")).join(",")

    const shareUrl = `${window.location.origin}${window.location.pathname}?d=${activeDesign}&l=${activeLayoutStructure}&f=${activeFont}&t=${theme}&c=${colorParams}`

    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    })
  }

  const handleScreenshot = () => {
    const el = document.getElementById("design-showcase-container")
    if (!el) {
      alert("Could not locate showcase area for capture.")
      return
    }

    setCapturingPng(true)
    toPng(el, {
      cacheBust: true,
      skipFonts: true,
      backgroundColor: getActiveColors().background,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
        width: el.offsetWidth + 'px',
        height: el.offsetHeight + 'px'
      },
      styleSheetsFilter: (styleSheet: any) => {
        try {
          const rules = styleSheet.cssRules
          return rules !== undefined
        } catch (e) {
          return false
        }
      }
    } as any)
      .then((dataUrl) => {
        const link = document.createElement("a")
        link.download = `design-theme-${activeDesign}-${Date.now()}.png`
        link.href = dataUrl
        link.click()
        setCapturingPng(false)
      })
      .catch((err) => {
        console.error("Screenshot capture failed", err)
        alert("Failed to capture screenshot. Please try again.")
        setCapturingPng(false)
      })
  }

  const [lastDefaultPalettes, setLastDefaultPalettes] = useState<Record<DesignId, ColorPalette>>({
    rakery: "design-variant-1",
    h2n: "design-variant-3",
    synthesis: "design-variant-5",
    dholeish: "design-variant-7",
  })

  const [lockedColors, setLockedColors] = useState<Partial<Record<keyof CustomColors, boolean>>>({})

  const [activeHexColors, setActiveHexColors] = useState<CustomColors>(customColors)

  useEffect(() => {
    if (theme === "custom-palette") {
      setActiveHexColors(customColors)
    } else {
      const timer = setTimeout(() => {
        setActiveHexColors(getActiveColors())
      }, 100)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, activeDesign, customColors])

  // next-themes only knows the resolved theme on the client.
  useEffect(() => setMounted(true), [])

  // Close dropdowns on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFontDropdownOpen(false)
        setShareDropdownOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Responsive preset count based on container width
  useEffect(() => {
    const el = presetsContainerRef.current
    if (!el) return

    const PRESET_PILL_WIDTH = 120 // approximate width of each preset pill in px
    const GAP = 8 // gap-2 = 8px

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width
        const fits = Math.max(3, Math.floor((containerWidth + GAP) / (PRESET_PILL_WIDTH + GAP)))
        setMaxVisiblePresets(fits)
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [mounted, theme])

  const toggleLock = (key: keyof CustomColors) => {
    setLockedColors((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const [presets, setPresets] = useState<Preset[]>(BUILTIN_PRESETS)
  const [newPresetName, setNewPresetName] = useState("")
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [presetError, setPresetError] = useState<string | null>(null)

  // Load custom presets on mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("custom-palette-presets")
      if (stored) {
        const parsed = JSON.parse(stored) as Preset[]
        setPresets([...BUILTIN_PRESETS, ...parsed])
      }
    } catch (e) {
      console.error("Failed to load presets", e)
    }
  }, [])

  const handleApplyPreset = (preset: Preset) => {
    applyBulkColors([
      preset.colors.background,
      preset.colors.foreground,
      preset.colors.card,
      preset.colors.cardForeground,
      preset.colors.primary,
      preset.colors.primaryForeground,
      preset.colors.secondary,
      preset.colors.secondaryForeground,
      preset.colors.muted,
      preset.colors.mutedForeground,
      preset.colors.border,
      preset.colors.pedestalGlow,
      preset.colors.pedestalTop,
      preset.colors.pedestalTopBorder,
      preset.colors.pedestalBody,
      preset.colors.pedestalShadow,
    ])
  }

  const handleSavePreset = () => {
    const trimmedName = newPresetName.trim()
    if (!trimmedName) return

    // 1. Check duplicate name (case-insensitive)
    const nameExists = presets.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())
    if (nameExists) {
      setPresetError("Name already exists")
      setTimeout(() => setPresetError(null), 3000)
      return
    }

    // 2. Check duplicate color palette (comparing core 11 colors)
    const colorExists = presets.find(p => {
      const keysToCompare: (keyof CustomColors)[] = [
        "background", "foreground", "card", "cardForeground",
        "primary", "primaryForeground", "secondary", "secondaryForeground",
        "muted", "mutedForeground", "border"
      ]
      return keysToCompare.every(key => p.colors[key] === customColors[key])
    })

    if (colorExists) {
      setPresetError(`Same colors as "${colorExists.name}"`)
      setTimeout(() => setPresetError(null), 3000)
      return
    }

    setPresetError(null)

    const newPreset: Preset = {
      id: "custom-" + Date.now(),
      name: trimmedName,
      colors: { ...customColors },
      isCustom: true,
    }
    const updatedPresets = [...presets, newPreset]
    setPresets(updatedPresets)

    // Save only custom ones to localStorage
    const customOnly = updatedPresets.filter(p => p.isCustom)
    window.localStorage.setItem("custom-palette-presets", JSON.stringify(customOnly))

    setNewPresetName("")
    setShowSaveInput(false)
  }

  const handleDeletePreset = (id: string) => {
    const updatedPresets = presets.filter(p => p.id !== id)
    setPresets(updatedPresets)
    const customOnly = updatedPresets.filter(p => p.isCustom)
    window.localStorage.setItem("custom-palette-presets", JSON.stringify(customOnly))
  }

  const handleGenerateAiTheme = async () => {
    if (!aiPrompt.trim() || isGeneratingAi) return
    setIsGeneratingAi(true)
    try {
      const res = await fetch("/api/generate-palette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim() })
      })
      if (!res.ok) {
        throw new Error("Failed to generate theme")
      }
      const newColors = await res.json()
      applyBulkColors([
        newColors.background,
        newColors.foreground,
        newColors.card,
        newColors.cardForeground,
        newColors.primary,
        newColors.primaryForeground,
        newColors.secondary,
        newColors.secondaryForeground,
        newColors.muted,
        newColors.mutedForeground,
        newColors.border,
        newColors.pedestalGlow || customColors.pedestalGlow,
        newColors.pedestalTop || customColors.pedestalTop,
        newColors.pedestalTopBorder || customColors.pedestalTopBorder,
        newColors.pedestalBody || customColors.pedestalBody,
        newColors.pedestalShadow || customColors.pedestalShadow,
      ])
      setAiPrompt("")
    } catch (err) {
      console.error(err)
      alert("AI Generation failed. Check terminal for details.")
    } finally {
      setIsGeneratingAi(false)
    }
  }

  const handleRandomizePalette = () => {
    const newColors = generatePalette(customColors, lockedColors, activeDesign)
    applyBulkColors([
      newColors.background,
      newColors.foreground,
      newColors.card,
      newColors.cardForeground,
      newColors.primary,
      newColors.primaryForeground,
      newColors.secondary,
      newColors.secondaryForeground,
      newColors.muted,
      newColors.mutedForeground,
      newColors.border,
      newColors.pedestalGlow,
      newColors.pedestalTop,
      newColors.pedestalTopBorder,
      newColors.pedestalBody,
      newColors.pedestalShadow,
    ])
  }

  const handleSwapColors = (source: keyof CustomColors, target: keyof CustomColors) => {
    swapColors(source, target, lockedColors)
  }

  const handleResetColors = () => {
    resetCustomColors()
    setLockedColors({})
  }

  // Sync active theme with lastDefaultPalettes when a built-in theme is active
  useEffect(() => {
    if (theme && theme !== "custom-palette") {
      setLastDefaultPalettes((prev) => ({
        ...prev,
        [activeDesign]: theme as ColorPalette,
      }))
    }
  }, [theme, activeDesign])

  // Global keyboard shortcuts for Custom Theme Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (theme !== "custom-palette") return

      // Ignore if user is typing in an input, textarea, or contenteditable element
      const activeEl = document.activeElement
      if (activeEl) {
        const tag = activeEl.tagName.toUpperCase()
        const isContentEditable = activeEl.getAttribute("contenteditable") === "true"
        if (tag === "INPUT" || tag === "TEXTAREA" || isContentEditable) {
          return
        }
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === "z") {
          e.preventDefault()
          if (e.shiftKey) {
            redo()
          } else {
            undo()
          }
        } else if (e.key.toLowerCase() === "y") {
          e.preventDefault()
          redo()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [theme, undo, redo])

  const handleDesignChange = (newDesignId: DesignId) => {
    setDesign(newDesignId)
    if (theme !== "custom-palette") {
      setTheme(lastDefaultPalettes[newDesignId])
    }
  }

  const handleBulkPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    // Regex for 8, 6 or 3 digit hex colors
    const regex = /#([a-fA-F0-9]{8}|[a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b/g
    const matches = text.match(regex)
    if (matches && matches.length > 0) {
      applyBulkColors(matches, lockedColors)
      if (theme !== "custom-palette") {
        setTheme("custom-palette")
      }
      // Clear the input
      e.target.value = ""
    }
  }

  const getActiveColors = (): CustomColors => {
    if (theme === "custom-palette") {
      return customColors
    }

    const testDiv = document.createElement("div")
    testDiv.setAttribute("data-no-transition", "")
    document.body.appendChild(testDiv)

    const canvas = document.createElement("canvas")
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext("2d", { willReadFrequently: true })

    const getHex = (cssClass: string) => {
      testDiv.className = `fixed top-0 left-0 opacity-0 pointer-events-none ${cssClass}`
      const color = getComputedStyle(testDiv).backgroundColor

      if (!ctx) return "#000000"

      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)

      const data = ctx.getImageData(0, 0, 1, 1).data
      const r = data[0]
      const g = data[1]
      const b = data[2]
      const a = data[3]

      const baseHex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
      if (a < 255) {
        const alphaHex = a.toString(16).padStart(2, "0").toUpperCase()
        return baseHex + alphaHex
      }
      return baseHex
    }

    const getHexBorder = (cssClass: string) => {
      testDiv.className = `fixed top-0 left-0 opacity-0 pointer-events-none border ${cssClass}`
      const color = getComputedStyle(testDiv).borderTopColor

      if (!ctx) return "#000000"

      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)

      const data = ctx.getImageData(0, 0, 1, 1).data
      const r = data[0]
      const g = data[1]
      const b = data[2]
      const a = data[3]

      const baseHex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
      if (a < 255) {
        const alphaHex = a.toString(16).padStart(2, "0").toUpperCase()
        return baseHex + alphaHex
      }
      return baseHex
    }

    const colors: CustomColors = {
      background: getHex("bg-background"),
      foreground: getHex("bg-foreground"),
      card: getHex("bg-card"),
      cardForeground: getHex("bg-card-foreground"),
      primary: getHex("bg-primary"),
      primaryForeground: getHex("bg-primary-foreground"),
      secondary: getHex("bg-secondary"),
      secondaryForeground: getHex("bg-secondary-foreground"),
      muted: getHex("bg-muted"),
      mutedForeground: getHex("bg-muted-foreground"),
      border: getHexBorder("border-border"),
      pedestalGlow: getHex("bg-pedestal-glow"),
      pedestalTop: getHex("bg-pedestal-top"),
      pedestalTopBorder: getHex("bg-pedestal-top-border"),
      pedestalBody: getHex("bg-pedestal-body"),
      pedestalShadow: getHex("bg-pedestal-shadow"),
    }

    document.body.removeChild(testDiv)
    return colors
  }

  const handleCopyPalette = () => {
    const c = getActiveColors()
    let paletteString = [
      c.background,
      c.foreground,
      c.card,
      c.cardForeground,
      c.primary,
      c.primaryForeground,
      c.secondary,
      c.secondaryForeground,
      c.muted,
      c.mutedForeground,
      c.border,
    ].join(", ")

    if (activeDesign === "dholeish" || activeDesign === "rakery") {
      paletteString += `, ${c.pedestalGlow}, ${c.pedestalTop}, ${c.pedestalTopBorder}, ${c.pedestalBody}, ${c.pedestalShadow}`
    }

    navigator.clipboard.writeText(paletteString).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Export Modal states & handlers
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportTab, setExportTab] = useState<"css" | "json">("css")
  const [exportCopied, setExportCopied] = useState(false)

  const getCssExport = () => {
    const c = getActiveColors()
    return `:root {
  --background: ${c.background};
  --foreground: ${c.foreground};
  --card: ${c.card};
  --card-foreground: ${c.cardForeground};
  --popover: ${c.card};
  --popover-foreground: ${c.foreground};
  --primary: ${c.primary};
  --primary-foreground: ${c.primaryForeground};
  --secondary: ${c.secondary};
  --secondary-foreground: ${c.secondaryForeground};
  --muted: ${c.muted};
  --muted-foreground: ${c.mutedForeground};
  --accent: ${c.primary};
  --accent-foreground: ${c.primaryForeground};
  --border: ${c.border};
  --input: ${c.border};
  --ring: ${c.primary};
  
  /* Pedestal variables */
  --pedestal-glow: ${c.pedestalGlow};
  --pedestal-top: ${c.pedestalTop};
  --pedestal-top-border: ${c.pedestalTopBorder};
  --pedestal-body: ${c.pedestalBody};
  --pedestal-shadow: ${c.pedestalShadow};
}`
  }

  const getJsonExport = () => {
    const c = getActiveColors()
    return JSON.stringify(c, null, 2)
  }

  const handleCopyExport = () => {
    const text = exportTab === "css" ? getCssExport() : getJsonExport()
    navigator.clipboard.writeText(text).then(() => {
      setExportCopied(true)
      setTimeout(() => setExportCopied(false), 2000)
    })
  }

  return (
    <div className="relative flex flex-col gap-3.5 items-center w-full">
      {/* Top Row: Selectors + Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full">
        <Segmented<DesignId>
          label="Design"
          icon={<Frame className="size-3.5" aria-hidden />}
          options={designs}
          value={activeDesign}
          onChange={handleDesignChange}
        />
        <Segmented<"default" | "custom">
          label="Palette"
          icon={<Palette className="size-3.5" aria-hidden />}
          options={[
            { id: "default", label: "Default" },
            { id: "custom", label: "Custom" },
          ]}
          value={mounted ? (theme === "custom-palette" ? "custom" : "default") : undefined}
          onChange={(val) => {
            if (val === "custom") {
              setTheme("custom-palette")
            } else {
              setTheme(lastDefaultPalettes[activeDesign])
            }
          }}
        />
        {activeDesign === "rakery" && (
          <Segmented<LayoutStructure>
            label="Layout"
            icon={<LayoutGrid className="size-3.5" aria-hidden />}
            options={layoutStructures}
            value={activeLayoutStructure}
            onChange={setLayoutStructure}
          />
        )}

        {mounted && (
          <div className="flex items-center gap-1 ml-1 pl-3 border-l border-border/50 h-7">
            {/* Edit cluster */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyPalette}
                title="Copy current palette to clipboard"
                className={cn(
                  "h-6 px-2 flex items-center justify-center gap-1.5 rounded transition-colors text-[10px] font-bold cursor-pointer border shadow-sm",
                  copied
                    ? "bg-green-500 text-black border-green-600"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground border-primary/50"
                )}
              >
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                Copy Palette
              </button>
              <input
                type="text"
                placeholder="Paste palette"
                onChange={handleBulkPaste}
                className="h-6 w-24 text-[10px] bg-black/20 border border-white/10 rounded px-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {theme === "custom-palette" && (
                <>
                  <button
                    onClick={handleRandomizePalette}
                    title="Generate random cohesive palette (respects locks)"
                    className="h-6 w-6 flex items-center justify-center rounded bg-black/20 hover:bg-black/40 border border-white/10 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Shuffle className="size-3.5" />
                  </button>
                  <button
                    onClick={handleResetColors}
                    title="Reset to default palette"
                    className="h-6 w-6 flex items-center justify-center rounded bg-black/20 hover:bg-black/40 border border-white/10 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    title="Undo last change (Ctrl+Z)"
                    className="h-6 w-6 flex items-center justify-center rounded bg-black/20 hover:bg-black/40 border border-white/10 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <Undo2 className="size-3.5" />
                  </button>
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    title="Redo next change (Ctrl+Y)"
                    className="h-6 w-6 flex items-center justify-center rounded bg-black/20 hover:bg-black/40 border border-white/10 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <Redo2 className="size-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-border/30 mx-0.5" />

            {/* View cluster */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWcagExpanded(!wcagExpanded)}
                title="Toggle Contrast Accessibility (WCAG) Checker"
                className={cn(
                  "h-6 px-1.5 flex items-center justify-center gap-1.5 rounded transition-colors text-xs font-semibold cursor-pointer",
                  wcagExpanded
                    ? "bg-primary text-primary-foreground border border-primary shadow-sm"
                    : "bg-black/20 hover:bg-black/40 border border-white/10 text-muted-foreground hover:text-foreground"
                )}
              >
                <Eye className="size-3.5" />
                <span className="text-[10px] hidden sm:inline">WCAG</span>
              </button>
              {theme !== "custom-palette" && (() => {
                const pair = darkLightPairs[activeDesign]
                const isDark = theme === pair.dark
                return (
                  <button
                    onClick={() => setTheme(isDark ? pair.light : pair.dark)}
                    title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    className="h-6 w-6 flex items-center justify-center rounded bg-black/20 hover:bg-black/40 border border-white/10 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                  </button>
                )
              })()}
              <button
                onClick={handleToggleComparison}
                title={isComparisonMode ? "Exit comparison mode" : "Enter comparison mode (splits screen to compare designs)"}
                className={cn(
                  "h-6 px-1.5 flex items-center justify-center gap-1.5 rounded transition-colors text-xs font-semibold cursor-pointer",
                  isComparisonMode
                    ? "bg-primary text-primary-foreground border border-primary shadow-sm"
                    : "bg-black/20 hover:bg-black/40 border border-white/10 text-muted-foreground hover:text-foreground"
                )}
              >
                <Columns className="size-3.5" />
                <span className="text-[10px] hidden sm:inline">Compare</span>
              </button>
              {isComparisonMode && (
                <button
                  onClick={handleCaptureSnapshot}
                  title="Capture current layout & styles as the comparison snapshot"
                  className="h-6 px-1.5 flex items-center justify-center gap-1.5 rounded bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/35 text-amber-300 transition-colors text-[10px] font-bold cursor-pointer"
                >
                  Pin Reference
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-border/30 mx-0.5" />

            {/* Share & Copy cluster */}
            <div className="flex items-center gap-1.5">
              {/* Unified Share Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShareDropdownOpen(!shareDropdownOpen)}
                  title="Share & export options"
                  className={cn(
                    "h-6 w-6 flex items-center justify-center rounded border transition-colors cursor-pointer",
                    shareDropdownOpen
                      ? "bg-primary/20 border-primary/40 text-primary"
                      : "bg-black/20 hover:bg-black/40 border-white/10 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Share2 className="size-3.5" />
                </button>
                {shareDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onPointerDown={() => setShareDropdownOpen(false)} />
                    <div className="absolute top-full right-0 mt-1.5 z-50 min-w-[180px] py-1.5 rounded-xl border border-white/10 bg-background/95 backdrop-blur-lg shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                      <button
                        type="button"
                        onClick={() => { handleShareLink(); setShareDropdownOpen(false) }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors flex items-center gap-2.5"
                      >
                        <Link2 className="size-3.5" />
                        {shareCopied ? "Link Copied!" : "Copy Shareable Link"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { handleScreenshot(); setShareDropdownOpen(false) }}
                        disabled={capturingPng}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors flex items-center gap-2.5 disabled:opacity-50"
                      >
                        <Camera className="size-3.5" />
                        {capturingPng ? "Capturing…" : "Download Screenshot"}
                      </button>
                      <div className="h-px bg-white/10 my-1 mx-2" />
                      <button
                        type="button"
                        onClick={() => {
                          setShowExportModal(true)
                          setExportCopied(false)
                          setShareDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors flex items-center gap-2.5"
                      >
                        <Download className="size-3.5" />
                        Export CSS / JSON
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-border/30 mx-0.5" />

            {/* Minimize */}
            <button
              onClick={onMinimize}
              title="Minimize panel"
              className="h-6 w-6 flex items-center justify-center rounded bg-black/20 hover:bg-black/40 border border-white/10 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Minimize2 className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Row: Color Pickers and Presets (only shown in custom mode) */}
      {mounted && theme === "custom-palette" && (
        <div className="flex flex-col gap-3.5 border-t border-border/20 pt-3.5 w-full">
          {/* Presets Library */}
          <div className="flex items-center gap-3 w-full px-1">
            <div className="flex items-center justify-center shrink-0">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Presets</span>
            </div>
            <div className="w-px h-6 bg-border/30 shrink-0 hidden sm:block" />
            <div ref={presetsContainerRef} className="flex gap-2 flex-wrap items-center w-full min-w-0">
              {(presetsExpanded ? presets : presets.slice(0, maxVisiblePresets)).map((preset) => (
                <div
                  key={preset.id}
                  className="group/preset relative flex items-center gap-1.5 shrink-0 rounded-full border border-white/10 bg-black/20 pl-2 pr-1.5 py-0.5 hover:bg-black/40 hover:border-white/20 transition-all"
                >
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {/* 4 dots for preview */}
                    <div className="flex -space-x-1 shrink-0">
                      <span className="size-2 rounded-full border border-black/20" style={{ backgroundColor: preset.colors.background }} />
                      <span className="size-2 rounded-full border border-black/20" style={{ backgroundColor: preset.colors.primary }} />
                      <span className="size-2 rounded-full border border-black/20" style={{ backgroundColor: preset.colors.secondary }} />
                      <span className="size-2 rounded-full border border-black/20" style={{ backgroundColor: preset.colors.foreground }} />
                    </div>
                    <span>{preset.name}</span>
                  </button>
                  {preset.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeletePreset(preset.id)}
                      title="Delete preset"
                      className="text-muted-foreground hover:text-red-400 text-xs ml-0.5 leading-none transition-colors"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              {presets.length > maxVisiblePresets && (
                <button
                  type="button"
                  onClick={() => setPresetsExpanded(!presetsExpanded)}
                  className="shrink-0 rounded-full border border-dashed border-white/20 bg-black/10 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-white/30 transition-all cursor-pointer"
                >
                  {presetsExpanded ? "Show less" : `+${presets.length - maxVisiblePresets} more`}
                </button>
              )}
            </div>

            <div className="w-px h-6 bg-border/30 shrink-0 hidden sm:block ml-auto" />
            <div className="shrink-0 flex items-center justify-end pl-1 sm:pl-0">
              {!showSaveInput ? (
                <button
                  type="button"
                  onClick={() => setShowSaveInput(true)}
                  className="h-6 px-2.5 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-[10px] font-semibold cursor-pointer border border-primary/30 shadow-sm"
                >
                  + Save Current
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-lg border border-white/10 shadow-sm animate-in fade-in slide-in-from-right-2 relative">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Name..."
                    className="h-6 text-[10px] bg-black/40 border border-white/10 rounded px-2 w-20 text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSavePreset()
                      if (e.key === "Escape") {
                        setShowSaveInput(false)
                        setNewPresetName("")
                        setPresetError(null)
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSavePreset}
                    className="h-6 px-2.5 rounded bg-primary text-primary-foreground text-[10px] font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveInput(false)
                      setNewPresetName("")
                      setPresetError(null)
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                  {presetError && (
                    <span className="absolute -top-6 right-0 text-[9px] text-red-400 font-medium animate-pulse bg-background/90 px-1 rounded border border-red-500/30 whitespace-nowrap">
                      {presetError}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI Magic Generator */}
          <div className="px-3 pb-1 flex items-center gap-2 relative z-10 w-full animate-in fade-in">
            <div className="flex items-center gap-1.5 w-full bg-black/30 border border-purple-500/30 rounded-lg p-1.5 shadow-inner">
              <Sparkles className="size-3.5 text-purple-400 shrink-0 ml-1" />
              <input
                type="text"
                placeholder="AI Magic: Describe a theme (e.g. Cyberpunk Neon)..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerateAiTheme()
                }}
                disabled={isGeneratingAi}
                className="flex-1 min-w-0 bg-transparent border-none text-[10px] text-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60"
              />
              <button
                type="button"
                onClick={handleGenerateAiTheme}
                disabled={isGeneratingAi || !aiPrompt.trim()}
                className="h-6 px-3 rounded bg-purple-500/20 text-purple-300 border border-purple-500/50 text-[10px] font-semibold hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
              >
                {isGeneratingAi ? <Loader2 className="size-3 animate-spin" /> : "Generate"}
              </button>
            </div>
          </div>

          {/* Shape & Format Sliders */}
          <div className="px-3 pb-1 flex flex-wrap items-center gap-6 relative z-10">

            {/* Font Selector */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-12">Font</label>
              
              <div className="relative">
                <button
                  onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                  className={cn(
                    "h-6 w-32 flex items-center justify-between px-2 rounded bg-black/30 border border-white/10 transition-all text-[10px] font-medium cursor-pointer",
                    fontDropdownOpen
                      ? "ring-1 ring-primary text-foreground"
                      : "text-foreground hover:border-white/20"
                  )}
                >
                  <span className="truncate">
                    {mounted ? (
                      activeFont === "dynamic-google" ? (dynamicGoogleFontName || "Google Font") :
                      activeFont === "custom" ? (customFontName || "Custom Font") :
                      fontPairings[activeFont as FontPairingId]?.label || "Font"
                    ) : "Font"}
                  </span>
                  <ChevronDown className={cn("size-3 opacity-50 transition-transform duration-200", fontDropdownOpen && "rotate-180")} />
                </button>
                {fontDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onPointerDown={() => setFontDropdownOpen(false)} />
                    <div className="absolute bottom-full left-0 mb-1.5 z-50 min-w-[200px] py-1.5 rounded-xl border border-white/10 bg-background/95 backdrop-blur-lg shadow-2xl animate-in fade-in slide-in-from-bottom-1 duration-150">
                      {Object.values(fontPairings).filter(fp => fp.id !== "custom").map((fp) => (
                        <button
                          key={fp.id}
                          type="button"
                          onClick={() => { setFont(fp.id); setFontDropdownOpen(false) }}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2",
                            activeFont === fp.id
                              ? "bg-primary/15 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          )}
                        >
                          {activeFont === fp.id && <Check className="size-3" />}
                          <span className={activeFont === fp.id ? "" : "ml-5"}>{fp.label}</span>
                        </button>
                      ))}
                      {/* Dynamic Google Font Selection if active */}
                      {dynamicGoogleFontName && (
                        <button
                          type="button"
                          onClick={() => { setFont("dynamic-google"); setFontDropdownOpen(false) }}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2",
                            activeFont === "dynamic-google"
                              ? "bg-primary/15 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          )}
                        >
                          {activeFont === "dynamic-google" && <Check className="size-3" />}
                          <span className={activeFont === "dynamic-google" ? "" : "ml-5"}>{dynamicGoogleFontName} (Google)</span>
                        </button>
                      )}

                      {/* Custom Upload Selection if uploaded */}
                      {customFontName && (
                        <button
                          type="button"
                          onClick={() => { setFont("custom"); setFontDropdownOpen(false) }}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2",
                            activeFont === "custom"
                              ? "bg-primary/15 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          )}
                        >
                          {activeFont === "custom" && <Check className="size-3" />}
                          <span className={activeFont === "custom" ? "" : "ml-5"}>{customFontName} (Local)</span>
                        </button>
                      )}

                      <div className="border-t border-white/10 mt-1 pt-1">
                        <div className="px-3 pt-2 pb-1 relative">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="Search Google Fonts..."
                              value={googleFontSearch}
                              onChange={(e) => setGoogleFontSearch(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && googleFontSearch.trim()) {
                                  setDynamicGoogleFont(googleFontSearch.trim())
                                  setGoogleFontSearch("")
                                  setFontDropdownOpen(false)
                                }
                              }}
                              className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (googleFontSearch.trim()) {
                                  setDynamicGoogleFont(googleFontSearch.trim())
                                  setGoogleFontSearch("")
                                  setFontDropdownOpen(false)
                                }
                              }}
                              className="h-6 px-2.5 rounded bg-primary text-primary-foreground text-[10px] font-medium hover:bg-primary/90 transition-colors shrink-0"
                            >
                              Apply
                            </button>
                          </div>
                          
                          {/* Autocomplete Suggestions */}
                          {googleFontSearch.trim().length > 0 && (
                            <div className="absolute top-full left-3 right-3 mt-1 max-h-32 overflow-y-auto bg-black/90 border border-white/10 rounded shadow-xl z-50 no-scrollbar">
                              {POPULAR_GOOGLE_FONTS.filter(f => f.toLowerCase().includes(googleFontSearch.toLowerCase())).slice(0, 15).map(font => (
                                <button
                                  key={font}
                                  type="button"
                                  onClick={() => {
                                    setDynamicGoogleFont(font)
                                    setGoogleFontSearch("")
                                    setFontDropdownOpen(false)
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors truncate"
                                >
                                  {font}
                                </button>
                              ))}
                              {POPULAR_GOOGLE_FONTS.filter(f => f.toLowerCase().includes(googleFontSearch.toLowerCase())).length === 0 && (
                                <div className="px-2 py-1.5 text-[10px] text-muted-foreground/50">
                                  Press Apply to use anyway.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => fontFileInputRef.current?.click()}
                title="Upload custom font (.ttf, .otf, .woff2)"
                className="h-6 w-6 flex items-center justify-center rounded bg-black/30 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <Upload className="size-3" />
              </button>
              <input
                type="file"
                ref={fontFileInputRef}
                className="hidden"
                multiple
                accept=".ttf,.otf,.woff,.woff2"
                onChange={async (e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const filesArray = Array.from(e.target.files)
                    const baseName = filesArray[0].name.split('.')[0].replace(/[-_]/g, ' ')
                    await setCustomFont(filesArray, baseName)
                    e.target.value = ""
                  }
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-12">Radius</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={customRadius ?? 0.5}
                onChange={(e) => setCustomRadius(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-[10px] text-muted-foreground w-6">{customRadius ?? 0.5}r</span>
              <button
                onClick={() => setCustomRadius(null)}
                title="Reset to default radius"
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors ml-1"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Color Swatch Pickers Grid */}
          <div className="w-full pb-1 relative z-0">
            <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-4">
              {/* Standard Pickers */}
              <div className="flex items-center gap-3 shrink-0 max-w-[90vw] sm:max-w-none overflow-x-auto no-scrollbar px-2 pb-2">
                <DraggableColorPicker
                  colorKey="background" label="Bg" value={customColors.background}
                  onChange={(v) => setCustomColor("background", v)} onSwap={handleSwapColors}
                  isLocked={lockedColors.background} onToggleLock={() => toggleLock("background")}
                />
                <DraggableColorPicker
                  colorKey="foreground" label="Text" value={customColors.foreground}
                  onChange={(v) => setCustomColor("foreground", v)} onSwap={handleSwapColors}
                  isLocked={lockedColors.foreground} onToggleLock={() => toggleLock("foreground")}
                />
                <DraggableColorPicker
                  colorKey="card" label="Card" value={customColors.card}
                  onChange={(v) => setCustomColor("card", v)} onSwap={handleSwapColors}
                  isLocked={lockedColors.card} onToggleLock={() => toggleLock("card")}
                />
                <DraggableColorPicker
                  colorKey="cardForeground" label="Card Txt" value={customColors.cardForeground}
                  onChange={(v) => setCustomColor("cardForeground", v)} onSwap={handleSwapColors}
                  isLocked={lockedColors.cardForeground} onToggleLock={() => toggleLock("cardForeground")}
                />
                <DraggableColorPicker
                  colorKey="primary" label="Accent" value={customColors.primary}
                  onChange={(v) => setCustomColor("primary", v)} onSwap={handleSwapColors}
                  isLocked={lockedColors.primary} onToggleLock={() => toggleLock("primary")}
                />
                <DraggableColorPicker
                  colorKey="primaryForeground" label="Acc Txt" value={customColors.primaryForeground}
                  onChange={(v) => setCustomColor("primaryForeground", v)} onSwap={handleSwapColors}
                  isLocked={lockedColors.primaryForeground} onToggleLock={() => toggleLock("primaryForeground")}
                />
                <DraggableColorPicker
                  colorKey="secondary" label="Sec" value={customColors.secondary}
                  onChange={(v) => setCustomColor("secondary", v)} onSwap={handleSwapColors}
                  isLocked={lockedColors.secondary} onToggleLock={() => toggleLock("secondary")}
                />
                <DraggableColorPicker
                  colorKey="secondaryForeground" label="Sec Txt" value={customColors.secondaryForeground}
                  onChange={(v) => setCustomColor("secondaryForeground", v)} onSwap={handleSwapColors}
                  isLocked={lockedColors.secondaryForeground} onToggleLock={() => toggleLock("secondaryForeground")}
                />
                <DraggableColorPicker
                  colorKey="muted" label="Muted" value={customColors.muted}
                  onChange={(v) => setCustomColor("muted", v)} onSwap={handleSwapColors}
                  isLocked={lockedColors.muted} onToggleLock={() => toggleLock("muted")}
                />
                <DraggableColorPicker
                  colorKey="mutedForeground" label="Mut Txt" value={customColors.mutedForeground}
                  onChange={(v) => setCustomColor("mutedForeground", v)} onSwap={handleSwapColors}
                  isLocked={lockedColors.mutedForeground} onToggleLock={() => toggleLock("mutedForeground")}
                />
                <DraggableColorPicker
                  colorKey="border" label="Border" value={customColors.border}
                  onChange={(v) => setCustomColor("border", v)} onSwap={handleSwapColors}
                  isLocked={lockedColors.border} onToggleLock={() => toggleLock("border")}
                />
              </div>

              {/* Pedestal */}
              {(activeDesign === "dholeish" || activeDesign === "rakery") && (
                <div className="flex items-center gap-3 shrink-0 max-w-[90vw] sm:max-w-none overflow-x-auto no-scrollbar px-2 pb-2">
                  <div className="hidden 2xl:block w-px h-8 bg-white/20 shrink-0 mx-1" />
                  <div className="flex items-center">
                    <div
                      className="grid transition-[grid-template-columns] duration-300 ease-in-out"
                      style={{ gridTemplateColumns: pedestalColorsExpanded ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-3 pr-3 w-max">
                          <DraggableColorPicker
                            colorKey="pedestalGlow" label="Ped Glow" value={customColors.pedestalGlow}
                            onChange={(v) => setCustomColor("pedestalGlow", v)} onSwap={handleSwapColors}
                            isLocked={lockedColors.pedestalGlow} onToggleLock={() => toggleLock("pedestalGlow")}
                          />
                          <DraggableColorPicker
                            colorKey="pedestalTop" label="Ped Top" value={customColors.pedestalTop}
                            onChange={(v) => setCustomColor("pedestalTop", v)} onSwap={handleSwapColors}
                            isLocked={lockedColors.pedestalTop} onToggleLock={() => toggleLock("pedestalTop")}
                          />
                          <DraggableColorPicker
                            colorKey="pedestalTopBorder" label="Ped Brdr" value={customColors.pedestalTopBorder}
                            onChange={(v) => setCustomColor("pedestalTopBorder", v)} onSwap={handleSwapColors}
                            isLocked={lockedColors.pedestalTopBorder} onToggleLock={() => toggleLock("pedestalTopBorder")}
                          />
                          <DraggableColorPicker
                            colorKey="pedestalBody" label="Ped Body" value={customColors.pedestalBody}
                            onChange={(v) => setCustomColor("pedestalBody", v)} onSwap={handleSwapColors}
                            isLocked={lockedColors.pedestalBody} onToggleLock={() => toggleLock("pedestalBody")}
                          />
                          <DraggableColorPicker
                            colorKey="pedestalShadow" label="Ped Shdw" value={customColors.pedestalShadow}
                            onChange={(v) => setCustomColor("pedestalShadow", v)} onSwap={handleSwapColors}
                            isLocked={lockedColors.pedestalShadow} onToggleLock={() => toggleLock("pedestalShadow")}
                          />

                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPedestalColorsExpanded(!pedestalColorsExpanded)}
                      className="flex flex-col items-center gap-0.5 text-[9px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                    >
                      <div className="size-6 rounded-full bg-black/20 border border-white/10 flex items-center justify-center hover:bg-black/40">
                        <ChevronLeft className={cn("size-3.5 transition-transform duration-300", !pedestalColorsExpanded && "rotate-180")} />
                      </div>
                      <span>Pedestal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contrast Accessibility Checker (Available in all modes) */}
      {mounted && wcagExpanded && (
        <div className="flex flex-col gap-2 border-t border-border/20 pt-3 mt-2 w-full px-1 pb-2 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 w-full pt-1">
            {[
              {
                label: "Main Body",
                bgKey: "background" as keyof CustomColors,
                fgKey: "foreground" as keyof CustomColors,
              },
              {
                label: "Card Content",
                bgKey: "card" as keyof CustomColors,
                fgKey: "cardForeground" as keyof CustomColors,
              },
              {
                label: "Accent Button",
                bgKey: "primary" as keyof CustomColors,
                fgKey: "primaryForeground" as keyof CustomColors,
              },
              {
                label: "Muted Text",
                bgKey: "muted" as keyof CustomColors,
                fgKey: "mutedForeground" as keyof CustomColors,
              },
            ].map((pair) => {
              const bg = activeHexColors[pair.bgKey] || "#000000"
              const fg = activeHexColors[pair.fgKey] || "#ffffff"
              const info = getContrastInfo(bg, fg)

              // Color coding for levels
              let levelBadgeClass = "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              if (info.level === "AAA") {
                levelBadgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              } else if (info.level === "AA") {
                levelBadgeClass = "bg-teal-500/10 text-teal-400 border border-teal-500/20"
              } else if (info.level === "AA Large") {
                levelBadgeClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }

              // Tooltip text explanations and recommendations
              let tooltipTitle = ""
              let tooltipDesc = ""
              let tooltipAction = ""

              if (info.level === "AAA") {
                tooltipTitle = "AAA - Enhanced Contrast (≥ 7.0:1)"
                tooltipDesc = "Excellent readability. Reads perfectly for all text sizes and users."
                tooltipAction = "No action needed. Outstanding accessibility!"
              } else if (info.level === "AA") {
                tooltipTitle = "AA - Minimum Contrast (≥ 4.5:1)"
                tooltipDesc = "Standard compliant. Good for body text and headings."
                tooltipAction = "To meet enhanced AAA standards, increase contrast further."
              } else if (info.level === "AA Large") {
                tooltipTitle = "AA Large - Large Text Only (≥ 3.0:1)"
                tooltipDesc = "Readable only for large text (18px+) or bold headers."
                tooltipAction = "Action: Make text darker or background lighter to pass for body text."
              } else {
                tooltipTitle = "Fail - Insufficient Contrast (< 3.0:1)"
                tooltipDesc = "Hard to read. Does not meet WCAG readability guidelines."
                tooltipAction = "Action: Adjust colors to increase contrast ratio to at least 4.5:1."
              }

              return (
                <div
                  key={pair.label}
                  className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/15 p-2"
                >
                  <div
                    className="size-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border border-white/10 select-none shadow-inner"
                    style={{ backgroundColor: bg, color: fg }}
                  >
                    Aa
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-medium text-muted-foreground truncate leading-none mb-1">
                      {pair.label}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono font-bold leading-none text-foreground">
                        {info.ratio.toFixed(1)}:1
                      </span>

                      <div className="relative group/tooltip">
                        <span className={cn("text-[9px] font-black uppercase px-1 py-0.5 rounded leading-none shrink-0 tracking-wider cursor-help", levelBadgeClass)}>
                          {info.level}
                        </span>

                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col gap-1 w-52 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 shadow-2xl z-50 pointer-events-none select-none text-center animate-in fade-in slide-in-from-bottom-1 duration-150">
                          <span className="font-bold text-white leading-tight">{tooltipTitle}</span>
                          <span className="text-zinc-400 leading-normal">{tooltipDesc}</span>
                          <span className="text-primary font-semibold leading-normal border-t border-white/5 pt-1 mt-0.5">{tooltipAction}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {mounted && showExportModal && createPortal(
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-200"
        >
          <div className="bg-background/95 border border-white/10 rounded-2xl p-5 w-full max-w-lg mx-4 flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-foreground">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Download className="size-4 text-primary" />
                Export Theme Configuration
              </span>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors font-semibold"
              >
                Close
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-black/35 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setExportTab("css")}
                className={cn(
                  "flex-1 text-xs font-semibold py-1.5 rounded-md transition-all",
                  exportTab === "css" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                CSS Variables
              </button>
              <button
                type="button"
                onClick={() => setExportTab("json")}
                className={cn(
                  "flex-1 text-xs font-semibold py-1.5 rounded-md transition-all",
                  exportTab === "json" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                JSON Config
              </button>
            </div>

            {/* Code Viewer */}
            <div className="relative bg-black/45 border border-white/5 rounded-lg overflow-hidden flex flex-col h-64">
              <textarea
                readOnly
                value={exportTab === "css" ? getCssExport() : getJsonExport()}
                className="flex-1 w-full bg-transparent p-4 pr-16 text-xs font-mono text-foreground focus:outline-none resize-none overflow-y-auto leading-relaxed scrollbar-thin"
              />
              <button
                type="button"
                onClick={handleCopyExport}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/80 hover:bg-black/90 border border-white/10 transition-colors text-xs font-medium text-foreground shadow-md"
              >
                {exportCopied ? (
                  <>
                    <Check className="size-3.5 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-muted-foreground" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
