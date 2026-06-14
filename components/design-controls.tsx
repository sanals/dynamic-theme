"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Frame, Palette, LayoutGrid, RotateCcw, Copy, Check, Minimize2, Sun, Moon, Lock, Unlock, Shuffle } from "lucide-react"
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
import { useCustomPalette, type CustomColors } from "@/components/providers/custom-palette-provider"
import { cn } from "@/lib/utils"
import { generatePalette } from "@/lib/palette-generator"

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
      draggable={!isHoveringInput}
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
        const sourceKey = e.dataTransfer.getData("text/plain") as keyof CustomColors
        if (sourceKey && sourceKey !== colorKey) {
          onSwap(sourceKey, colorKey)
        }
      }}
      className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing p-1 -m-1 rounded hover:bg-white/5 transition-colors group/item"
      title="Drag to swap. Click label to copy hex."
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
          className="size-full cursor-pointer border-0 p-0 rounded-md overflow-hidden pointer-events-auto shrink-0"
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
        onMouseEnter={() => setIsHoveringInput(true)}
        onMouseLeave={() => setIsHoveringInput(false)}
        onFocus={() => setIsHoveringInput(true)}
        onBlur={() => setIsHoveringInput(false)}
        onChange={(e) => {
          const val = e.target.value
          if (val.length > 0 && !val.startsWith("#")) {
            onChange("#" + val)
          } else {
            onChange(val)
          }
        }}
        placeholder="#000000"
        className="w-[68px] text-[11px] bg-black/30 border border-white/10 rounded text-center text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary h-5 px-1 mt-0.5"
      />
    </div>
  )
}

export function DesignControls({ onMinimize }: { onMinimize: () => void }) {
  const { theme, setTheme } = useTheme()
  const { activeLayoutStructure, setLayoutStructure } = useLayoutStructure()
  const { activeDesign, setDesign } = useDesign()
  const { customColors, setCustomColor, applyBulkColors, resetCustomColors, swapColors } = useCustomPalette()
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  const [lastDefaultPalettes, setLastDefaultPalettes] = useState<Record<DesignId, ColorPalette>>({
    rakery: "design-variant-1",
    h2n: "design-variant-3",
    synthesis: "design-variant-5",
    dholeish: "design-variant-7",
  })

  const [lockedColors, setLockedColors] = useState<Partial<Record<keyof CustomColors, boolean>>>({})

  // next-themes only knows the resolved theme on the client.
  useEffect(() => setMounted(true), [])

  const toggleLock = (key: keyof CustomColors) => {
    setLockedColors((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const [presets, setPresets] = useState<Preset[]>(BUILTIN_PRESETS)
  const [newPresetName, setNewPresetName] = useState("")
  const [showSaveInput, setShowSaveInput] = useState(false)

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
    if (!newPresetName.trim()) return
    const newPreset: Preset = {
      id: "custom-" + Date.now(),
      name: newPresetName.trim(),
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
    if (matches && matches.length >= 11) {
      applyBulkColors(matches)
      // Clear the input
      e.target.value = ""
    }
  }

  const handleCopyPalette = () => {
    let paletteString = ""

    if (theme === "custom-palette") {
      paletteString = [
        customColors.background,
        customColors.foreground,
        customColors.card,
        customColors.cardForeground,
        customColors.primary,
        customColors.primaryForeground,
        customColors.secondary,
        customColors.secondaryForeground,
        customColors.muted,
        customColors.mutedForeground,
        customColors.border,
      ].join(", ")

      if (activeDesign === "dholeish" || activeDesign === "rakery") {
        paletteString += `, ${customColors.pedestalGlow}, ${customColors.pedestalTop}, ${customColors.pedestalTopBorder}, ${customColors.pedestalBody}, ${customColors.pedestalShadow}`
      }
    } else {
      // Read current computed colors directly from the browser
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

      const bgHex = getHex("bg-background")
      const fgHex = getHex("bg-foreground")
      const cardHex = getHex("bg-card")
      const cardFgHex = getHex("bg-card-foreground")
      const primaryHex = getHex("bg-primary")
      const primaryFgHex = getHex("bg-primary-foreground")
      const secondaryHex = getHex("bg-secondary")
      const secondaryFgHex = getHex("bg-secondary-foreground")
      const mutedHex = getHex("bg-muted")
      const mutedFgHex = getHex("bg-muted-foreground")
      const borderHexVal = getHexBorder("border-border")

      paletteString = [
        bgHex,
        fgHex,
        cardHex,
        cardFgHex,
        primaryHex,
        primaryFgHex,
        secondaryHex,
        secondaryFgHex,
        mutedHex,
        mutedFgHex,
        borderHexVal
      ].join(", ")

      if (activeDesign === "dholeish" || activeDesign === "rakery") {
        const glowHex = getHex("bg-pedestal-glow")
        const topHex = getHex("bg-pedestal-top")
        const topBorderHex = getHex("bg-pedestal-top-border")
        const bodyHex = getHex("bg-pedestal-body")
        const shadowHex = getHex("bg-pedestal-shadow")
        paletteString += `, ${glowHex}, ${topHex}, ${topBorderHex}, ${bodyHex}, ${shadowHex}`
      }

      document.body.removeChild(testDiv)
    }

    navigator.clipboard.writeText(paletteString).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex flex-col gap-3.5 items-center w-full">
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
          <div className="flex items-center gap-1.5 ml-1 pl-3 border-l border-border/50 h-7">
            {theme === "custom-palette" && (
              <>
                <input
                  type="text"
                  placeholder="Paste #colors..."
                  onChange={handleBulkPaste}
                  className="h-6 w-24 text-[10px] bg-black/20 border border-white/10 rounded px-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
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
              </>
            )}
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
              onClick={handleCopyPalette}
              title="Copy current palette to clipboard"
              className="h-6 w-6 flex items-center justify-center rounded bg-black/20 hover:bg-black/40 border border-white/10 transition-colors text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
            </button>
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
          <div className="flex flex-col gap-2 w-full px-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Palette Presets</span>
              {!showSaveInput ? (
                <button
                  type="button"
                  onClick={() => setShowSaveInput(true)}
                  className="text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  + Save Current
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Preset name..."
                    className="h-5 text-[10px] bg-black/40 border border-white/10 rounded px-1.5 w-24 text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSavePreset()
                      if (e.key === "Escape") {
                        setShowSaveInput(false)
                        setNewPresetName("")
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSavePreset}
                    className="h-5 px-2 rounded bg-primary text-primary-foreground text-[10px] font-medium hover:bg-primary/90 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveInput(false)
                      setNewPresetName("")
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth w-full">
              {presets.map((preset) => (
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
            </div>
          </div>

          {/* Color Swatch Pickers Grid */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1 w-full">
            <DraggableColorPicker
              colorKey="background" label="Bg" value={customColors.background}
              onChange={(v) => setCustomColor("background", v)} onSwap={swapColors}
              isLocked={lockedColors.background} onToggleLock={() => toggleLock("background")}
            />
            <DraggableColorPicker
              colorKey="foreground" label="Text" value={customColors.foreground}
              onChange={(v) => setCustomColor("foreground", v)} onSwap={swapColors}
              isLocked={lockedColors.foreground} onToggleLock={() => toggleLock("foreground")}
            />
            <DraggableColorPicker
              colorKey="card" label="Card" value={customColors.card}
              onChange={(v) => setCustomColor("card", v)} onSwap={swapColors}
              isLocked={lockedColors.card} onToggleLock={() => toggleLock("card")}
            />
            <DraggableColorPicker
              colorKey="cardForeground" label="Card Txt" value={customColors.cardForeground}
              onChange={(v) => setCustomColor("cardForeground", v)} onSwap={swapColors}
              isLocked={lockedColors.cardForeground} onToggleLock={() => toggleLock("cardForeground")}
            />
            <DraggableColorPicker
              colorKey="primary" label="Accent" value={customColors.primary}
              onChange={(v) => setCustomColor("primary", v)} onSwap={swapColors}
              isLocked={lockedColors.primary} onToggleLock={() => toggleLock("primary")}
            />
            <DraggableColorPicker
              colorKey="primaryForeground" label="Acc Txt" value={customColors.primaryForeground}
              onChange={(v) => setCustomColor("primaryForeground", v)} onSwap={swapColors}
              isLocked={lockedColors.primaryForeground} onToggleLock={() => toggleLock("primaryForeground")}
            />
            <DraggableColorPicker
              colorKey="secondary" label="Sec" value={customColors.secondary}
              onChange={(v) => setCustomColor("secondary", v)} onSwap={swapColors}
              isLocked={lockedColors.secondary} onToggleLock={() => toggleLock("secondary")}
            />
            <DraggableColorPicker
              colorKey="secondaryForeground" label="Sec Txt" value={customColors.secondaryForeground}
              onChange={(v) => setCustomColor("secondaryForeground", v)} onSwap={swapColors}
              isLocked={lockedColors.secondaryForeground} onToggleLock={() => toggleLock("secondaryForeground")}
            />
            <DraggableColorPicker
              colorKey="muted" label="Muted" value={customColors.muted}
              onChange={(v) => setCustomColor("muted", v)} onSwap={swapColors}
              isLocked={lockedColors.muted} onToggleLock={() => toggleLock("muted")}
            />
            <DraggableColorPicker
              colorKey="mutedForeground" label="Mut Txt" value={customColors.mutedForeground}
              onChange={(v) => setCustomColor("mutedForeground", v)} onSwap={swapColors}
              isLocked={lockedColors.mutedForeground} onToggleLock={() => toggleLock("mutedForeground")}
            />
            <DraggableColorPicker
              colorKey="border" label="Border" value={customColors.border}
              onChange={(v) => setCustomColor("border", v)} onSwap={swapColors}
              isLocked={lockedColors.border} onToggleLock={() => toggleLock("border")}
            />
            {(activeDesign === "dholeish" || activeDesign === "rakery") && (
              <>
                <DraggableColorPicker
                  colorKey="pedestalGlow" label="Ped Glow" value={customColors.pedestalGlow}
                  onChange={(v) => setCustomColor("pedestalGlow", v)} onSwap={swapColors}
                  isLocked={lockedColors.pedestalGlow} onToggleLock={() => toggleLock("pedestalGlow")}
                />
                <DraggableColorPicker
                  colorKey="pedestalTop" label="Ped Top" value={customColors.pedestalTop}
                  onChange={(v) => setCustomColor("pedestalTop", v)} onSwap={swapColors}
                  isLocked={lockedColors.pedestalTop} onToggleLock={() => toggleLock("pedestalTop")}
                />
                <DraggableColorPicker
                  colorKey="pedestalTopBorder" label="Ped Border" value={customColors.pedestalTopBorder}
                  onChange={(v) => setCustomColor("pedestalTopBorder", v)} onSwap={swapColors}
                  isLocked={lockedColors.pedestalTopBorder} onToggleLock={() => toggleLock("pedestalTopBorder")}
                />
                <DraggableColorPicker
                  colorKey="pedestalBody" label="Ped Body" value={customColors.pedestalBody}
                  onChange={(v) => setCustomColor("pedestalBody", v)} onSwap={swapColors}
                  isLocked={lockedColors.pedestalBody} onToggleLock={() => toggleLock("pedestalBody")}
                />
                <DraggableColorPicker
                  colorKey="pedestalShadow" label="Ped Shad" value={customColors.pedestalShadow}
                  onChange={(v) => setCustomColor("pedestalShadow", v)} onSwap={swapColors}
                  isLocked={lockedColors.pedestalShadow} onToggleLock={() => toggleLock("pedestalShadow")}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
