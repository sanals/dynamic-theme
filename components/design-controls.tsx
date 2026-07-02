import { extractHostVariableNames, extractElementVariables, autoMapVariables, findVariableForElement, knownShadowRoots, resolveColorToHex } from "@/src/widget/utils/css-parser"
"use client"

import { useEffect, useState, useRef } from "react"
import { createPortal, flushSync } from "react-dom"
import { Frame, Palette, RotateCcw, Copy, Check, Minimize2, Sun, Moon, Lock, Unlock, Shuffle, Download, Upload, Columns, Share2, Camera, Undo2, Redo2, ChevronDown, ChevronLeft, Link2, Eye, Sparkles, Loader2, ImagePlus, Wand2 , Search, Crosshair, X, Plus } from "lucide-react"
import {
  designs,
  darkLightPairs,
  type DesignId,
  type ColorPalette,
} from "@/lib/design-config"
import { useFont } from "@/src/widget/font-provider"
import { fontPairings, type FontPairingId } from "@/lib/font-config"
import { useCustomPalette, type CustomColors, WIDGET_INTERNAL_KEYS, CONTRAST_PAIRS } from "@/src/widget/WidgetStateProvider"
import { cn } from "@/lib/utils"
import { generatePalette } from "@/lib/palette-generator"
import { getContrastInfo, extractDominantColor, autoFixContrast, getRelativeLuminance, getContrastRatio } from "@/lib/color-utils"
import { useComparison, type Snapshot } from "@/src/widget/comparison-provider"
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
    }
  },
  {
    id: "desert-sun",
    name: "Desert Sun",
    colors: {
      background: "#faf089",
      foreground: "#23221A",
      card: "#FFFFFF",
      cardForeground: "#2C2B21",
      primary: "#DCCB09",
      primaryForeground: "#09090b",
      secondary: "#F8E2D3",
      secondaryForeground: "#09090b",
      muted: "#EDEDE8",
      mutedForeground: "#6F6C52",
      border: "#E2E1D5",
    }
  },
  {
    id: "ember-obsidian",
    name: "Ember Obsidian",
    colors: {
      background: "#0F0D0C",
      foreground: "#F3EEE6",
      card: "#1A1816",
      cardForeground: "#F3EEE6",
      primary: "#F17730",
      primaryForeground: "#15110D",
      secondary: "#292624",
      secondaryForeground: "#F3EEE6",
      muted: "#292624",
      mutedForeground: "#A49D94",
      border: "#FFFFFF14",
    }
  },
  {
    id: "pine-night",
    name: "Pine Night",
    colors: {
      background: "#111715",
      foreground: "#F1F4F2",
      card: "#1D2A24",
      cardForeground: "#E9EDEA",
      primary: "#294C36",
      primaryForeground: "#ffffff",
      secondary: "#324130",
      secondaryForeground: "#ffffff",
      muted: "#223029",
      mutedForeground: "#8AA895",
      border: "#2D4339",
    }
  },
  {
    id: "slate-pearl",
    name: "Slate Pearl",
    colors: {
      background: "#F1F2F6",
      foreground: "#1A1C23",
      card: "#FFFFFF",
      cardForeground: "#21232C",
      primary: "#5A648C",
      primaryForeground: "#E3E3E3",
      secondary: "#E2E7E9",
      secondaryForeground: "#09090b",
      muted: "#E8E9ED",
      mutedForeground: "#626884",
      border: "#D5D7E2",
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
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/10",
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
  isHighlighted,
}: {
  colorKey: string
  label: string
  value: string
  onChange: (val: string) => void
  onSwap: (source: string, target: string) => void
  isLocked?: boolean
  onToggleLock?: () => void
  isHighlighted?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [isHoveringInput, setIsHoveringInput] = useState(false)
  const safeValue = value || "#000000"

  const inputRef = useRef<HTMLInputElement>(null)
  const throttleRef = useRef<NodeJS.Timeout | null>(null)
  
  // We track the last color we deliberately *set* or *received* to know if a change is external.
  const latestColorRef = useRef(safeValue)

  // Sync external changes (e.g., undo/redo, element picker) directly to the DOM node
  // only if they differ from what we are currently broadcasting.
  useEffect(() => {
    if (safeValue !== latestColorRef.current) {
      latestColorRef.current = safeValue
      if (inputRef.current) {
        inputRef.current.value = safeValue.slice(0, 7)
      }
    }
  }, [safeValue])

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    latestColorRef.current = newColor

    // Throttle the heavy global React re-render to ~30fps
    if (!throttleRef.current) {
      throttleRef.current = setTimeout(() => {
        onChange(latestColorRef.current)
        throttleRef.current = null
      }, 33)
    }
  }

  const copySingle = () => {
    navigator.clipboard.writeText(safeValue).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      draggable={!isHoveringInput && !isLocked}
      className={cn(
        "group/item flex flex-col items-center gap-1.5 w-[76px] shrink-0 transition-transform duration-300",
        isHighlighted && "scale-110 -translate-y-2 drop-shadow-2xl z-50 animate-pulse"
      )}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", colorKey)
        e.dataTransfer.effectAllowed = "move"
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
      }}
      onDrop={async (e) => {
        e.preventDefault()
        if (isLocked) return

        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith("image/")) {
          try {
            const hex = await extractDominantColor(file)
            onChange(hex)
          } catch (err) {
            console.error("Failed to extract color from dropped image", err)
          }
          return
        }

        const sourceKey = e.dataTransfer.getData("text/plain")
        if (sourceKey && sourceKey !== colorKey) {
          onSwap(sourceKey, colorKey)
        }
      }}
      className={cn(
        "flex flex-col items-center gap-1 p-1 -m-1 rounded hover:bg-white/5 transition-colors group/item",
        !isLocked && !isHoveringInput ? "cursor-grab active:cursor-grabbing" : ""
      )}
      title={isLocked ? "Color locked. Click label to copy hex." : "Drag to swap. Drop an image to extract its average color. Click label to copy hex."}
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
          ref={inputRef}
          type="color"
          defaultValue={safeValue.slice(0, 7)}
          onChange={handleColorChange}
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

      <div className="relative mt-0.5">
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
          className="w-[68px] text-[11px] bg-background/50 border border-border/50 rounded text-center text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary h-5 px-1 relative z-10"
        />
        <div
          key={safeValue}
          className="absolute inset-0 flex items-center justify-center text-[11px] font-mono text-foreground pointer-events-none animate-zoom-fade z-20"
        >
          {safeValue}
        </div>
      </div>
    </div>
  )
}

export function DesignControls({
  onMinimize,
  isStandalone = false
}: {
  onMinimize?: () => void
  isStandalone?: boolean
}) {
  const {
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
    lockedColors,
    setLockedColors,
    toggleLock,
    undo,
    redo,
    canUndo,
    canRedo,
    customRadius,
    setCustomRadius
  } = useCustomPalette()
  
  const { activeFont, setFont, setCustomFont, customFontName, dynamicGoogleFontName, setDynamicGoogleFont } = useFont()
  
  const theme = mode === "custom" ? "custom-palette" : "default"
  const setTheme = (t: string) => {}
  const activeDesign = "gallery" as DesignId
  const setDesign = (id: string) => {}
  const { isComparisonMode, setComparisonMode, snapshot, setSnapshot } = useComparison()
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false)
  const [googleFontSearch, setGoogleFontSearch] = useState("")
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false)
  const [wcagExpanded, setWcagExpanded] = useState(false)
  const [wcagMessage, setWcagMessage] = useState<string | null>(null)

  const [autoFixMessage, setAutoFixMessage] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedWcag = window.localStorage.getItem("wcag-expanded")
      if (storedWcag === "true") setWcagExpanded(true)
    }

    const handleAutoFixed = () => {
      setAutoFixMessage("Palette colors were automatically adjusted for legibility.")
      setTimeout(() => setAutoFixMessage(null), 5000)
    }

    window.addEventListener("palette-auto-fixed", handleAutoFixed)
    return () => window.removeEventListener("palette-auto-fixed", handleAutoFixed)
  }, [])

  const toggleWcag = () => {
    setWcagExpanded(prev => {
      const next = !prev
      window.localStorage.setItem("wcag-expanded", String(next))
      return next
    })
  }



  const [presetsExpanded, setPresetsExpanded] = useState(false)
  const [maxVisiblePresets, setMaxVisiblePresets] = useState(4)
  const presetsContainerRef = useRef<HTMLDivElement>(null)

  // Font Selector
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const fontFileInputRef = useRef<HTMLInputElement>(null)
  const [detectedVariables, setDetectedVariables] = useState<string[]>([])
  const [activePickerToken, setActivePickerToken] = useState<string | null>(null)
  const [isPickingElement, setIsPickingElement] = useState(false)
  const [highlightedKeys, setHighlightedKeys] = useState<string[]>([])

  // Image Theme Extractor
  const imageFileInputRef = useRef<HTMLInputElement>(null)
  const [isExtractingImage, setIsExtractingImage] = useState(false)

  const handleCaptureSnapshot = () => {
    const activeThemeName = theme === "custom-palette" ? "Custom" : theme || "Default"
    const currentSnapshot: Snapshot = {
      designId: activeDesign,
      colors: { ...getActiveColors() },

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
    const colorParams = WIDGET_INTERNAL_KEYS.map(key => (c[key] || "").replace("#", "")).join(",")

    const shareUrl = `${window.location.origin}${window.location.pathname}?d=${activeDesign}&f=${activeFont}&t=${theme}&c=${colorParams}`

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
    storefront: "design-variant-1",
    catalog: "design-variant-3",
    minimal: "design-variant-5",
    gallery: "design-variant-7",
    saas: "design-variant-9",
    uikit: "design-variant-11",
  })



  const [activeHexColors, setActiveHexColors] = useState<CustomColors>(customColors)

  useEffect(() => {
    if (mode !== "default") {
      setActiveHexColors(customColors)
    } else if (theme === "custom-palette") {
      setActiveHexColors(customColors)
    } else {
      const timer = setTimeout(() => {
        setActiveHexColors(getActiveColors())
      }, 100)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, activeDesign, customColors, mode])

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
    applyBulkColors(preset.colors)
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
      applyBulkColors(newColors, lockedColors)

      setAiPrompt("")
    } catch (err) {
      console.error(err)
      alert("AI Generation failed. Check terminal for details.")
    } finally {
      setIsGeneratingAi(false)
    }
  }

  const handleExtractImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsExtractingImage(true)
    try {
      const dominantHex = await extractDominantColor(file)

      // Temporarily lock an unlocked core color to the extracted hex.
      // If the color is very light or very dark, it's likely a background color.
      // If it's a mid-tone colorful color, it's likely an accent color.
      const tempColors = { ...customColors }
      const tempLocked = { ...lockedColors }

      const lum = getRelativeLuminance(dominantHex)
      const isBackgroundLike = lum > 0.7 || lum < 0.15

      if (isBackgroundLike && !lockedColors.background) {
        tempColors.background = dominantHex
        tempLocked.background = true
      } else if (!isBackgroundLike && !lockedColors.primary) {
        tempColors.primary = dominantHex
        tempLocked.primary = true
      } else if (!lockedColors.primary) {
        tempColors.primary = dominantHex
        tempLocked.primary = true
      } else if (!lockedColors.background) {
        tempColors.background = dominantHex
        tempLocked.background = true
      } else if (!lockedColors.secondary) {
        tempColors.secondary = dominantHex
        tempLocked.secondary = true
      }

      const newPalette = generatePalette(
        tempColors,
        tempLocked,
        activeDesign
      )

      // Apply the newly generated palette, passing lockedColors to prevent overwriting
      applyBulkColors(newPalette, lockedColors)
    } catch (err) {
      console.error(err)
      alert("Failed to extract color from image.")
    } finally {
      setIsExtractingImage(false)
      // Reset input so the same image can be uploaded again if needed
      if (imageFileInputRef.current) imageFileInputRef.current.value = ""
    }
  }

  const handleAutoFixWcag = () => {
    if (mode === "default") return

    const bg = customColors.background || "#000000"
    const newFg = autoFixContrast(bg, customColors.foreground || "#ffffff", 4.5)

    const cardBg = customColors.card || "#000000"
    const newCardFg = autoFixContrast(cardBg, customColors.cardForeground || "#ffffff", 4.5)

    const primaryBg = customColors.primary || "#000000"
    const newPrimaryFg = autoFixContrast(primaryBg, customColors.primaryForeground || "#ffffff", 4.5)

    const mutedBg = customColors.muted || "#000000"
    const newMutedFg = autoFixContrast(mutedBg, customColors.mutedForeground || "#ffffff", 4.5)

    const secondaryBg = customColors.secondary || "#000000"
    const newSecondaryFg = autoFixContrast(secondaryBg, customColors.secondaryForeground || "#ffffff", 4.5)

    const hasChanges =
      newFg !== customColors.foreground ||
      newCardFg !== customColors.cardForeground ||
      newPrimaryFg !== customColors.primaryForeground ||
      newMutedFg !== customColors.mutedForeground ||
      newSecondaryFg !== customColors.secondaryForeground

    if (!hasChanges) {
      setWcagMessage("Maximum possible contrast reached. Cannot improve further without altering background colors.")
      setTimeout(() => setWcagMessage(null), 4000)
    } else {
      applyBulkColors({
        ...customColors,
        foreground: newFg,
        cardForeground: newCardFg,
        primaryForeground: newPrimaryFg,
        secondaryForeground: newSecondaryFg,
        mutedForeground: newMutedFg,
      })
    }
  }

  const handleRandomizePalette = () => {
    const newColors = generatePalette(customColors, lockedColors, activeDesign)
    applyBulkColors(newColors, lockedColors)
  }

  const handleSwapColors = (source: string, target: string) => {
    swapColors(source, target, lockedColors)
  }

  const handleResetColors = () => {
    resetCustomColors()
    setLockedColors({})
  }

  // Sync active theme with lastDefaultPalettes when a built-in theme is active
  useEffect(() => {
    if (theme && theme !== "custom-palette") {
      const pair = darkLightPairs[activeDesign]
      if (theme === pair.dark || theme === pair.light) {
        setLastDefaultPalettes((prev) => ({
          ...prev,
          [activeDesign]: theme as ColorPalette,
        }))
      }
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
    }

    document.body.removeChild(testDiv)
    return colors
  }

  const handleCopyPalette = () => {
    const c = getActiveColors()
    let paletteString = WIDGET_INTERNAL_KEYS.map(k => c[k]).join(", ")

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

  const currentContrast = getContrastRatio(customColors.background, customColors.foreground);
  const isPanicMode = mode !== "default" && currentContrast < 2.0;

  const [varsCopied, setVarsCopied] = useState(false)

  const handleScanVariables = () => {
    const vars = extractHostVariableNames()
    setDetectedVariables(vars)
  }

  const handleCopyVariables = () => {
    let vars = detectedVariables
    if (vars.length === 0) {
      vars = extractHostVariableNames()
      setDetectedVariables(vars)
    }
    const rootStyle = window.getComputedStyle(document.documentElement)
    const bodyStyle = window.getComputedStyle(document.body)
    const lines = vars.map(v => {
      let resolved = rootStyle.getPropertyValue(v).trim()
      if (!resolved) {
        resolved = bodyStyle.getPropertyValue(v).trim()
      }
      return `${v}: ${resolved || '(unresolved)'}`
    })
    const text = `--- CSS Variables (${vars.length}) ---\n${lines.join('\n')}`
    navigator.clipboard.writeText(text).then(() => {
      setVarsCopied(true)
      setTimeout(() => setVarsCopied(false), 2000)
    })
  }


  // DOM Element Picker Logic
  useEffect(() => {
    if (!activePickerToken) return

    const handleMouseMove = (e: MouseEvent) => {
      let target = (e.composedPath && e.composedPath().length > 0 ? e.composedPath()[0] : e.target) as Node
      if (target.nodeType === Node.TEXT_NODE && target.parentElement) {
        target = target.parentElement
      }
      const targetEl = target as HTMLElement

      // Don't highlight widget elements
      if (targetEl.closest && targetEl.closest('.theme-widget-container')) return
      
      targetEl.setAttribute('data-picker-highlight', 'true')
      targetEl.style.outline = '2px solid #a855f7'
      targetEl.style.outlineOffset = '2px'
    }

    const handleMouseOut = (e: MouseEvent) => {
      let target = (e.composedPath && e.composedPath().length > 0 ? e.composedPath()[0] : e.target) as Node
      if (target.nodeType === Node.TEXT_NODE && target.parentElement) {
        target = target.parentElement
      }
      const targetEl = target as HTMLElement

      if (targetEl.hasAttribute && targetEl.hasAttribute('data-picker-highlight')) {
        targetEl.removeAttribute('data-picker-highlight')
        targetEl.style.outline = ''
        targetEl.style.outlineOffset = ''
      }
    }

    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      let target = (e.composedPath && e.composedPath().length > 0 ? e.composedPath()[0] : e.target) as Node
      if (target.nodeType === Node.TEXT_NODE && target.parentElement) {
        target = target.parentElement
      }
      const targetEl = target as HTMLElement

      if (targetEl.closest && targetEl.closest('.theme-widget-container')) return

      // Clean up outline immediately
      handleMouseOut(e)

      // Ensure we have scanned variables
      let vars = detectedVariables
      if (vars.length === 0) {
        vars = extractHostVariableNames(path)
        setDetectedVariables(vars)
      }

      const match = findVariableForElement(targetEl, activePickerToken, vars)
      if (match) {
        setMapperMappings(prev => ({ ...prev, [activePickerToken]: match }))
      } else {
        alert(`Could not confidently determine the ${activePickerToken} variable for this element.`)
      }

      setActivePickerToken(null)
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePickerToken(null)
      }
    }
    document.addEventListener('keydown', handleEsc, true)
    
    // Capture true to run before react handlers
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('mouseout', handleMouseOut, true)
    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('mouseout', handleMouseOut, true)
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('keydown', handleEsc, true)
      
      // Cleanup any lingering outlines
      document.querySelectorAll('[data-picker-highlight]').forEach(el => {
        (el as HTMLElement).removeAttribute('data-picker-highlight');
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
      })
    }
  }, [activePickerToken, detectedVariables])

  const handleAutoMap = () => {
    let vars = detectedVariables
    if (vars.length === 0) {
      vars = extractHostVariableNames()
      setDetectedVariables(vars)
    }
    const mapped = autoMapVariables(vars)
    setMapperMappings({ ...mapperMappings, ...mapped })
  }

  // ── Element Picker: click any element to discover its CSS variables ──
  useEffect(() => {
    if (!isPickingElement) return

    // Create a non-interfering highlight overlay
    const highlight = document.createElement('div')
    highlight.id = 'theme-widget-picker-highlight'
    highlight.style.position = 'fixed'
    highlight.style.pointerEvents = 'none'
    highlight.style.zIndex = '2147483647' // Max z-index
    highlight.style.outline = '2px dashed #22d3ee'
    highlight.style.backgroundColor = 'rgba(34, 211, 238, 0.1)'
    highlight.style.transition = 'all 0.1s ease-out'
    highlight.style.display = 'none'
    document.body.appendChild(highlight)

    const tooltip = document.createElement('div')
    tooltip.id = 'theme-widget-picker-tooltip'
    tooltip.style.position = 'fixed'
    tooltip.style.pointerEvents = 'none'
    tooltip.style.zIndex = '2147483647'
    tooltip.style.backgroundColor = '#181C1F'
    tooltip.style.color = '#F8FAFC'
    tooltip.style.padding = '6px 10px'
    tooltip.style.borderRadius = '6px'
    tooltip.style.fontSize = '12px'
    tooltip.style.fontFamily = 'monospace'
    tooltip.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)'
    tooltip.style.border = '1px solid #334155'
    tooltip.style.display = 'none'
    tooltip.style.flexDirection = 'column'
    tooltip.style.gap = '4px'
    document.body.appendChild(tooltip)

    // Create a global style to force crosshair cursor even on links/buttons
    const cursorStyle = document.createElement('style')
    cursorStyle.id = 'theme-widget-picker-cursor'
    cursorStyle.innerHTML = `*, *::before, *::after { cursor: crosshair !important; }`
    document.head.appendChild(cursorStyle)

    // Also inject into known shadow roots
    const shadowCursorStyles: HTMLStyleElement[] = []
    knownShadowRoots.forEach(root => {
      const s = document.createElement('style')
      s.innerHTML = cursorStyle.innerHTML
      root.appendChild(s)
      shadowCursorStyles.push(s)
    })

    const handleMouseMove = (e: MouseEvent) => {
      let target = (e.composedPath && e.composedPath().length > 0 ? e.composedPath()[0] : e.target) as Node
      if (target.nodeType === Node.TEXT_NODE && target.parentElement) {
        target = target.parentElement
      }
      const targetEl = target as HTMLElement

      if (targetEl.closest && targetEl.closest('.theme-widget-container')) {
        highlight.style.display = 'none'
        return
      }
      
      const rect = targetEl.getBoundingClientRect()
      highlight.style.display = 'block'
      highlight.style.top = `${rect.top}px`
      highlight.style.left = `${rect.left}px`
      highlight.style.width = `${rect.width}px`
      highlight.style.height = `${rect.height}px`

      const computed = window.getComputedStyle(targetEl)
      const bgColor = computed.backgroundColor
      const textColor = computed.color
      const bgHex = resolveColorToHex(bgColor) || bgColor
      const textHex = resolveColorToHex(textColor) || textColor

      tooltip.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <div style="width:12px; height:12px; background:${bgColor}; border:1px solid #475569; border-radius:2px;"></div>
            <span style="opacity:0.8">Bg</span>
          </div>
          <span style="opacity:0.6">${bgHex}</span>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <div style="width:12px; height:12px; background:${textColor}; border:1px solid #475569; border-radius:2px;"></div>
            <span style="opacity:0.8">Text</span>
          </div>
          <span style="opacity:0.6">${textHex}</span>
        </div>
      `
      tooltip.style.display = 'flex'
      tooltip.style.left = `${e.clientX + 15}px`
      tooltip.style.top = `${e.clientY + 15}px`
    }

    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const path = e.composedPath ? e.composedPath() : []
      let target = (path.length > 0 ? path[0] : e.target) as Node
      if (target.nodeType === Node.TEXT_NODE && target.parentElement) {
        target = target.parentElement
      }
      const targetEl = target as HTMLElement

      if (targetEl.closest && targetEl.closest('.theme-widget-container')) return

      // Snapshot 1: Extract variables while the element is STILL HOVERED
      const discoveredHover = extractElementVariables(targetEl, path)

      // HACK: To extract the *default* color and not the :hover color,
      // we need to temporarily move the mouse off the element and disable transitions.
      // We do this by putting an invisible blocker over the screen and waiting a tiny bit.
      const blocker = document.createElement('div')
      blocker.style.position = 'fixed'
      blocker.style.inset = '0'
      blocker.style.zIndex = '2147483647' // Max z-index
      document.body.appendChild(blocker)

      const noTransition = document.createElement('style')
      noTransition.textContent = `* { transition: none !important; animation: none !important; }`
      document.head.appendChild(noTransition)
      
      const noTransitionShadows: HTMLStyleElement[] = []
      knownShadowRoots.forEach(root => {
        const s = document.createElement('style')
        s.textContent = noTransition.textContent
        root.appendChild(s)
        noTransitionShadows.push(s)
      })

      // Wait 50ms for the browser to clear :hover state and snap transitions to 0
      setTimeout(() => {
        // Snapshot 2: Extract variables while the element is UNHOVERED
        const discoveredDefault = extractElementVariables(targetEl, path)
        
        // Cleanup
        document.body.removeChild(blocker)
        document.head.removeChild(noTransition)
        noTransitionShadows.forEach(s => s.parentNode && s.parentNode.removeChild(s))

        // Merge the two snapshots to get BOTH hover and default variables!
        const discovered = [...discoveredHover]
        for (const def of discoveredDefault) {
          if (!discovered.some(d => d.name === def.name)) {
            discovered.push(def)
          }
        }

        let alreadyExists: string[] = []
        
        if (discovered.length > 0) {
          for (const dv of discovered) {
            const key = dv.name
            if (dv.format) {
              setVariableFormat(key, dv.format)
            }
            if (!customColors[key]) {
              setCustomColor(key, dv.resolvedHex)
              // Also highlight newly added ones so user knows what appeared
              alreadyExists.push(key)
            } else {
              alreadyExists.push(key)
            }
          }
        } else {
          console.log('[ThemeWidget] No CSS variables found driving this element\'s colors.')
        }

        if (alreadyExists.length > 0) {
          setHighlightedKeys(alreadyExists)
          setTimeout(() => setHighlightedKeys([]), 800)
        }

        setIsPickingElement(false)
      }, 50)
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPickingElement(false)
      }
    }

    document.addEventListener('keydown', handleEsc, true)
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('keydown', handleEsc, true)
      
      if (highlight.parentNode) {
        highlight.parentNode.removeChild(highlight)
      }
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip)
      }
      if (cursorStyle.parentNode) {
        cursorStyle.parentNode.removeChild(cursorStyle)
      }
      for (const s of shadowCursorStyles) {
        if (s.parentNode) s.parentNode.removeChild(s)
      }
      
      // Cleanup any lingering old inline styles from previous implementation (just in case)
      document.querySelectorAll('[data-element-picker]').forEach(el => {
        (el as HTMLElement).removeAttribute('data-element-picker');
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
        (el as HTMLElement).style.cursor = '';
      })
    }
  }, [isPickingElement, customColors])

  /**
   * Converts a CSS variable name to a short human-readable label.
   * e.g. "--site-header-background" → "Header Bg"
   *      "--primary-color" → "Primary"
   */
  const humanizeVarName = (name: string): string => {
    // Strip leading dashes
    let clean = name.replace(/^-+/, '')
    // Split on dashes/underscores
    const parts = clean.split(/[-_]+/).filter(Boolean)
    // Map common abbreviations
    const abbrevs: Record<string, string> = {
      'background': 'Bg', 'foreground': 'Fg', 'color': 'Clr',
      'primary': 'Primary', 'secondary': 'Secondary',
      'accent': 'Accent', 'text': 'Txt', 'border': 'Border',
      'surface': 'Surface', 'header': 'Header', 'footer': 'Footer',
      'nav': 'Nav', 'sidebar': 'Side', 'card': 'Card', 'muted': 'Muted',
    }
    const mapped = parts.map(p => abbrevs[p.toLowerCase()] || (p.charAt(0).toUpperCase() + p.slice(1)))
    // Limit to 3 words max for compact display
    return mapped.slice(0, 3).join(' ')
  }

  /** Check if a key is one of the 11 core widget keys */
  const isCoreKey = (key: string): boolean => {
    return (WIDGET_INTERNAL_KEYS as readonly string[]).includes(key)
  }

  /** Get extra (non-core) keys in customColors */
  const extraKeys = Object.keys(customColors).filter(k => !isCoreKey(k))

  return (
    <div className="relative flex flex-col gap-3.5 items-center w-full">

      {/* Auto-Fix Toast */}
      {mounted && autoFixMessage && !isPanicMode && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-[90] bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md text-emerald-400 text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 whitespace-nowrap">
          <Wand2 className="size-3" />
          {autoFixMessage}
        </div>
      )}

      {/* Top Row: Selectors + Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full">
        {!isStandalone && (
          <Segmented<DesignId>
            label="Design"
            icon={<Frame className="size-3.5" aria-hidden />}
            options={designs}
            value={activeDesign}
            onChange={handleDesignChange}
          />
        )}
        <Segmented<"default" | "custom">
            label="Palette Engine"
            icon={<Palette className="size-3.5" aria-hidden />}
            options={[
              { id: "default", label: "Off" },
              { id: "custom", label: "Custom" },
            ]}
            value={mounted ? mode : undefined}
            onChange={(val) => {
              setMode(val as "default" | "custom")
            }}
          />

        {/* Force Override Toggle — only visible in Custom mode */}
        {mounted && mode === "custom" && (
          <button
            type="button"
            onClick={() => setForceOverride(!forceOverride)}
            title="Forces colors on all elements, even those without CSS variables. Use for stubborn sites."
            className={cn(
              "flex items-center gap-1.5 h-7 px-3 rounded-lg text-[10px] font-semibold transition-all border cursor-pointer",
              forceOverride
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30"
                : "bg-foreground/5 border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/10"
            )}
          >
            <Wand2 className="size-3" />
            Force Override {forceOverride ? "ON" : "OFF"}
          </button>
        )}

        {mounted && (
          <div className="flex items-center gap-1 ml-1 pl-3 border-l border-white/20 h-7">
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
              {/* Duplicate history controls removed */}
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-white/20 mx-0.5" />

            {/* View cluster */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleWcag}
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
                    className="h-6 w-6 flex items-center justify-center rounded bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-colors text-muted-foreground hover:text-foreground"
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
                    : "bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-muted-foreground hover:text-foreground"
                )}
              >
                <Columns className="size-3.5" />
                <span className="text-[10px] hidden sm:inline">Compare</span>
              </button>
              {isComparisonMode && (
                <button
                  onClick={handleCaptureSnapshot}
                  title="Capture current layout & styles as the comparison snapshot"
                  className="h-6 px-2 flex items-center justify-center gap-1.5 rounded bg-foreground text-background hover:opacity-90 shadow-sm transition-colors text-[10px] font-bold cursor-pointer"
                >
                  Pin Reference
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-white/20 mx-0.5" />

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
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "bg-foreground/5 hover:bg-foreground/10 border-foreground/10 text-muted-foreground hover:text-foreground"
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
            <div className="w-px h-4 bg-white/20 mx-0.5" />

            {/* Minimize */}
            <button
              onClick={onMinimize}
              title="Minimize panel"
              className="h-6 w-6 flex items-center justify-center rounded bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Minimize2 className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Row: Color Pickers and Presets (only shown in custom mode) */}
      {mounted && mode !== "default" && (
        <div className="flex flex-col gap-3.5 border-t border-border/20 pt-3.5 w-full">

        {/* Mapper Configuration UI removed — replaced by Element Picker + Custom Engine */}
          {/* Presets Library */}
          <div className="flex items-center gap-3 w-full px-1">
            <div className="flex items-center justify-center shrink-0">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Presets</span>
            </div>
            <div ref={presetsContainerRef} className="flex gap-2 flex-wrap items-center w-full min-w-0">
              {(presetsExpanded ? presets : presets.slice(0, maxVisiblePresets)).map((preset) => (
                <div
                  key={preset.id}
                  className="group/preset relative flex items-center gap-1.5 shrink-0 rounded-full border border-foreground/10 bg-foreground/5 pl-2 pr-1.5 py-0.5 hover:bg-foreground/10 hover:border-foreground/20 transition-all text-foreground/80 hover:text-foreground"
                >
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="flex items-center gap-1.5 text-[10px] font-medium transition-colors"
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
                  className="shrink-0 rounded-full border border-dashed border-foreground/20 bg-foreground/5 px-2.5 py-0.5 text-[10px] font-medium text-foreground/80 hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer"
                >
                  {presetsExpanded ? "Show less" : `+${presets.length - maxVisiblePresets} more`}
                </button>
              )}
            </div>

            <div className="shrink-0 flex items-center justify-end ml-auto pl-1 sm:pl-0">
              {!showSaveInput ? (
                <button
                  type="button"
                  onClick={() => setShowSaveInput(true)}
                  className="h-6 px-2.5 rounded bg-foreground text-background hover:bg-foreground/90 transition-colors text-[10px] font-semibold cursor-pointer shadow-sm"
                >
                  + Save Current
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-foreground/5 p-1 rounded-lg border border-foreground/10 shadow-sm animate-in fade-in slide-in-from-right-2 relative">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Name..."
                    className="h-6 text-[10px] bg-background border border-border rounded px-2 w-20 text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
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
                    className="h-6 px-2.5 rounded bg-foreground text-background text-[10px] font-medium hover:bg-foreground/90 transition-colors cursor-pointer"
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
          {/* Shape & Format Sliders */}
          <div className="px-3 pb-1 flex flex-wrap items-center gap-6 relative z-10">

            {/* Font Selector */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Font</label>
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
                              ? "bg-foreground/15 text-foreground font-bold"
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
                              ? "bg-foreground/15 text-foreground font-bold"
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
                              ? "bg-foreground/15 text-foreground font-bold"
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
                className="h-6 w-6 flex items-center justify-center rounded bg-foreground/5 border border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
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

            <div className="hidden sm:block w-px h-6 bg-white/20 shrink-0" />

            <div className="flex items-center gap-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Radius</label>
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

            <div className="hidden md:block w-px h-6 bg-white/20 shrink-0" />

            {/* Generate Controls */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden xl:block">Generate</label>

              <div className="flex-1 flex items-center gap-1.5 bg-foreground/5 border border-foreground/10 rounded-lg p-1 transition-all shadow-inner relative z-10 animate-in fade-in">
                <Sparkles className="size-3.5 text-purple-400 shrink-0 ml-1" />
                <input
                  type="text"
                  maxLength={120}
                  placeholder="Describe a theme..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGenerateAiTheme()
                  }}
                  disabled={isGeneratingAi || isExtractingImage}
                  className="flex-1 min-w-0 bg-transparent border-none text-[10px] text-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
                />

                <button
                  type="button"
                  onClick={handleGenerateAiTheme}
                  disabled={isGeneratingAi || !aiPrompt.trim() || isExtractingImage}
                  title={!aiPrompt.trim() ? "Generate with AI (enter text to enable)" : "Generate with AI"}
                  className="h-6 px-2.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-[10px] font-bold hover:bg-purple-500/25 dark:hover:text-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                >
                  {isGeneratingAi ? <Loader2 className="size-3 animate-spin" /> : "AI"}
                </button>

                <div className="w-px h-4 bg-white/20 mx-0.5" />

                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  disabled={isExtractingImage || isGeneratingAi}
                  title={Object.values(lockedColors).some(Boolean) ? "Extract palette from Image (Locked colors may cause the extracted color to apply to secondary sections)" : "Extract palette from Image"}
                  className="h-6 px-2 flex items-center justify-center gap-1.5 rounded bg-foreground/5 text-muted-foreground border border-foreground/10 hover:text-foreground hover:bg-foreground/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isExtractingImage ? <Loader2 className="size-3 animate-spin" /> : <ImagePlus className="size-3.5" />}
                  {/* <span className="hidden 2xl:inline text-[10px] font-medium">Image</span> */}
                </button>
                <input
                  type="file"
                  ref={imageFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleExtractImage}
                />

                <div className="w-px h-4 bg-white/20 mx-0.5" />

                <button
                  type="button"
                  onClick={handleRandomizePalette}
                  title="Generate random cohesive palette locally"
                  className="h-6 px-2 flex items-center justify-center gap-1.5 rounded bg-foreground/5 text-muted-foreground border border-foreground/10 hover:text-foreground hover:bg-foreground/10 transition-colors text-[10px] font-medium shrink-0"
                >
                  <Shuffle className="size-3.5" />
                  {/* <span className="hidden 2xl:inline">Random</span> */}
                </button>
              </div>
            </div>

            {/* History Controls */}
            <div className="hidden sm:block w-px h-6 bg-white/20 shrink-0 ml-auto" />
            <div className="flex items-center gap-1.5">

              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                title="Undo last change (Ctrl+Z)"
                className="h-6 w-6 flex items-center justify-center rounded bg-foreground/5 border border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Undo2 className="size-3" />
              </button>

              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                title="Redo next change (Ctrl+Y)"
                className="h-6 w-6 flex items-center justify-center rounded bg-foreground/5 border border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Redo2 className="size-3" />
              </button>

              <button
                type="button"
                onClick={handleResetColors}
                title="Reset to default palette"
                className="h-6 w-6 flex items-center justify-center rounded bg-foreground/5 border border-foreground/10 text-red-600/70 dark:text-red-400/70 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors ml-1"
              >
                <RotateCcw className="size-3" />
              </button>
            </div>
          </div>

          {/* Color Swatch Pickers Grid */}
          <div className="w-full pb-1 relative z-0">
            <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-4">
              {/* Core Widget Pickers (always shown) */}
              <div className="flex items-center gap-3 shrink-0 max-w-[90vw] sm:max-w-none overflow-x-auto no-scrollbar px-2 pb-2">
                {WIDGET_INTERNAL_KEYS.map(key => {
                  // Human-readable labels for the core keys
                  const coreLabels: Record<string, string> = {
                    background: 'Bg', foreground: 'Text', card: 'Card',
                    cardForeground: 'Card Txt', primary: 'Accent',
                    primaryForeground: 'Acc Txt', secondary: 'Sec',
                    secondaryForeground: 'Sec Txt', muted: 'Muted',
                    mutedForeground: 'Mut Txt', border: 'Border',
                  }
                  return (
                    <DraggableColorPicker
                      key={key}
                      colorKey={key}
                      label={coreLabels[key] || key}
                      value={customColors[key]}
                      onChange={(v) => setCustomColor(key, v)}
                      onSwap={handleSwapColors}
                      isLocked={lockedColors[key]}
                      onToggleLock={() => toggleLock(key)}
                      isHighlighted={highlightedKeys.includes(key)}
                    />
                  )
                })}
              </div>

              {/* Dynamically discovered host variables */}
              {extraKeys.length > 0 && (
                <div className="flex items-center gap-3 shrink-0 max-w-[90vw] sm:max-w-none overflow-x-auto no-scrollbar px-2 pb-2">
                  <div className="hidden 2xl:block w-px h-8 bg-white/20 shrink-0 mx-1" />
                  {extraKeys.map(key => (
                    <div key={key} className="relative group/extra">
                      <DraggableColorPicker
                        colorKey={key}
                        label={humanizeVarName(key)}
                        value={customColors[key]}
                        onChange={(v) => setCustomColor(key, v)}
                        onSwap={handleSwapColors}
                        isLocked={lockedColors[key]}
                        onToggleLock={() => toggleLock(key)}
                        isHighlighted={highlightedKeys.includes(key)}
                      />
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeCustomColor(key)}
                        title={`Remove ${key}`}
                        className="absolute -top-1 -left-1 p-0.5 rounded-full bg-red-500/90 text-white border border-red-600 opacity-0 group-hover/extra:opacity-100 transition-opacity shadow-sm hover:scale-110 z-10"
                      >
                        <X className="size-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Element Picker Button */}
              <div className="flex items-center gap-2 shrink-0 px-2 pb-2">
                <button
                  type="button"
                  onClick={() => setIsPickingElement(!isPickingElement)}
                  title={isPickingElement ? "Cancel element picker (Esc)" : "Pick an element to discover its CSS variables"}
                  className={cn(
                    "flex items-center gap-1.5 h-7 px-3 rounded-lg text-[10px] font-semibold transition-all border",
                    isPickingElement
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 ring-1 ring-cyan-500/30 animate-pulse"
                      : "bg-foreground/5 border-foreground/10 text-muted-foreground hover:text-foreground hover:bg-foreground/10"
                  )}
                >
                  <Crosshair className="size-3.5" />
                  {isPickingElement ? "Picking..." : "Pick Element"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panic Mode / Emergency Reset Inline Banner */}
      {mounted && isPanicMode && (
        <div className="w-[95%] sm:w-[80%] max-w-lg flex items-center p-3 mt-1 rounded-xl border border-red-500 bg-zinc-950 shadow-md animate-in slide-in-from-top-2 fade-in duration-300 mx-auto" style={{ color: "white" }}>
          <div className="relative z-10 flex w-full flex-col sm:flex-row items-center gap-4">
            <div className="flex shrink-0 items-center justify-center size-8 rounded-full bg-red-500 text-white shadow-sm ring-2 ring-red-500/30">
              <Eye className="size-4" />
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h3 className="text-xs font-bold text-white tracking-tight">Low Contrast Detected</h3>
              <p className="text-[10px] text-zinc-300 mt-0.5 leading-snug">
                Your text might be hard to read. Use the reset button if you get stuck.
              </p>
            </div>
            <button
              onClick={() => {
                resetCustomColors()
                setTheme(lastDefaultPalettes[activeDesign])
              }}
              className="shrink-0 h-7 px-4 rounded-full bg-red-500 hover:bg-red-400 text-white text-[10px] font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <RotateCcw className="size-3" />
              Reset Palette
            </button>
          </div>
        </div>
      )}

      {/* Contrast Accessibility Checker (Available in all modes) */}
      {mounted && wcagExpanded && (
        <div className="flex flex-col gap-2 border-t border-white/20 pt-3 mt-2 w-full px-1 pb-2 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Accessibility (WCAG)</span>
              {wcagMessage && (
                <span className="text-[9px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded animate-in fade-in zoom-in slide-in-from-left-2 duration-300">
                  {wcagMessage}
                </span>
              )}
            </div>
            {mode !== "default" && (
              <button
                type="button"
                onClick={handleAutoFixWcag}
                title="Automatically adjust foreground colors to pass AA contrast"
                className="flex items-center gap-1.5 h-6 px-2.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 hover:text-emerald-300 transition-colors text-[10px] font-semibold cursor-pointer"
              >
                <Wand2 className="size-3" />
                Auto-Fix All
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 w-full">
            {[
              {
                label: "Main Body",
                bgKey: "background",
                fgKey: "foreground",
              },
              {
                label: "Card Content",
                bgKey: "card",
                fgKey: "cardForeground",
              },
              {
                label: "Accent Button",
                bgKey: "primary",
                fgKey: "primaryForeground",
              },
              {
                label: "Secondary Btn",
                bgKey: "secondary",
                fgKey: "secondaryForeground",
              },
              {
                label: "Muted Text",
                bgKey: "muted",
                fgKey: "mutedForeground",
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

                      <div className="relative group/tooltip flex items-center gap-1.5">
                        <span className={cn("text-[9px] font-black uppercase px-1 py-0.5 rounded leading-none shrink-0 tracking-wider cursor-help", levelBadgeClass)}>
                          {info.level}
                        </span>

                        {mode !== "default" && info.level !== "AAA" && (
                          <button
                            type="button"
                            onClick={() => {
                              const targetRatio = info.level === "AA" ? 7.0 : 4.5
                              const fixedFg = autoFixContrast(bg, fg, targetRatio)
                              if (fixedFg === fg) {
                                setWcagMessage("Maximum possible contrast reached. Cannot improve further without altering the background color.")
                                setTimeout(() => setWcagMessage(null), 4000)
                              } else {
                                setCustomColor(pair.fgKey, fixedFg)
                              }
                            }}
                            title={info.level === "AA" ? "Auto-fix to AAA (Enhanced Contrast ≥ 7.0:1)" : "Auto-fix to AA (Minimum Contrast ≥ 4.5:1)"}
                            className="p-0.5 rounded border border-white/5 bg-white/5 hover:bg-white/15 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Wand2 className="size-2.5" />
                          </button>
                        )}

                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col gap-1 w-52 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 shadow-2xl z-50 pointer-events-none select-none text-center animate-in fade-in slide-in-from-bottom-1 duration-150">
                          <span className="font-bold text-white leading-tight">{tooltipTitle}</span>
                          <span className="text-zinc-400 leading-normal">{tooltipDesc}</span>
                          <span className="text-white font-bold leading-normal border-t border-white/5 pt-1 mt-0.5">{tooltipAction}</span>
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
                <Download className="size-4 text-foreground/80" />
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


