"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Frame, Palette, LayoutGrid, RotateCcw, Copy, Check, Minimize2 } from "lucide-react"
import {
  designs,
  palettesByDesign,
  layoutStructures,
  type DesignId,
  type ColorPalette,
  type LayoutStructure,
} from "@/lib/design-config"
import { useDesign } from "@/components/providers/design-provider"
import { useLayoutStructure } from "@/components/providers/layout-provider"
import { useCustomPalette, type CustomColors } from "@/components/providers/custom-palette-provider"
import { cn } from "@/lib/utils"

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
}: {
  colorKey: keyof CustomColors
  label: string
  value: string
  onChange: (val: string) => void
  onSwap: (source: keyof CustomColors, target: keyof CustomColors) => void
}) {
  const [copied, setCopied] = useState(false)
  const safeValue = value || "#000000"

  const copySingle = () => {
    navigator.clipboard.writeText(safeValue).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      draggable
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
      className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing p-1 -m-1 rounded hover:bg-white/5 transition-colors group"
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
      <input
        type="color"
        value={safeValue.slice(0, 7)}
        onChange={(e) => onChange(e.target.value)}
        className="size-6 cursor-pointer border-0 p-0 rounded-md overflow-hidden pointer-events-auto shrink-0"
      />
      <input
        type="text"
        value={safeValue}
        onChange={(e) => {
          const val = e.target.value
          if (val.length > 0 && !val.startsWith("#")) {
            onChange("#" + val)
          } else {
            onChange(val)
          }
        }}
        placeholder="#000000"
        className="w-[58px] text-[8px] bg-black/30 border border-white/10 rounded text-center text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary h-3.5 px-0.5 mt-0.5"
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

  // next-themes only knows the resolved theme on the client.
  useEffect(() => setMounted(true), [])

  const handleDesignChange = (newDesignId: DesignId) => {
    setDesign(newDesignId)
    const designOpt = designs.find((d) => d.id === newDesignId)
    if (designOpt) {
      setTheme(designOpt.defaultPalette)
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

  const currentPalettes = palettesByDesign[activeDesign] || []

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
        <Segmented<ColorPalette>
          label="Palette"
          icon={<Palette className="size-3.5" aria-hidden />}
          options={currentPalettes}
          value={mounted ? (theme as ColorPalette) : undefined}
          onChange={setTheme}
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
                  onClick={resetCustomColors} 
                  title="Reset to default palette"
                  className="h-6 w-6 flex items-center justify-center rounded bg-black/20 hover:bg-black/40 border border-white/10 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              </>
            )}
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

      {/* Bottom Row: Color Pickers (only shown in custom mode) */}
      {mounted && theme === "custom-palette" && (
        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-border/20 pt-3.5 w-full">
          <DraggableColorPicker 
            colorKey="background" label="Bg" value={customColors.background} 
            onChange={(v) => setCustomColor("background", v)} onSwap={swapColors} 
          />
          <DraggableColorPicker 
            colorKey="foreground" label="Text" value={customColors.foreground} 
            onChange={(v) => setCustomColor("foreground", v)} onSwap={swapColors} 
          />
          <DraggableColorPicker 
            colorKey="card" label="Card" value={customColors.card} 
            onChange={(v) => setCustomColor("card", v)} onSwap={swapColors} 
          />
          <DraggableColorPicker 
            colorKey="cardForeground" label="Card Txt" value={customColors.cardForeground} 
            onChange={(v) => setCustomColor("cardForeground", v)} onSwap={swapColors} 
          />
          <DraggableColorPicker 
            colorKey="primary" label="Accent" value={customColors.primary} 
            onChange={(v) => setCustomColor("primary", v)} onSwap={swapColors} 
          />
          <DraggableColorPicker 
            colorKey="primaryForeground" label="Acc Txt" value={customColors.primaryForeground} 
            onChange={(v) => setCustomColor("primaryForeground", v)} onSwap={swapColors} 
          />
          <DraggableColorPicker 
            colorKey="secondary" label="Sec" value={customColors.secondary} 
            onChange={(v) => setCustomColor("secondary", v)} onSwap={swapColors} 
          />
          <DraggableColorPicker 
            colorKey="secondaryForeground" label="Sec Txt" value={customColors.secondaryForeground} 
            onChange={(v) => setCustomColor("secondaryForeground", v)} onSwap={swapColors} 
          />
          <DraggableColorPicker 
            colorKey="muted" label="Muted" value={customColors.muted} 
            onChange={(v) => setCustomColor("muted", v)} onSwap={swapColors} 
          />
          <DraggableColorPicker 
            colorKey="mutedForeground" label="Mut Txt" value={customColors.mutedForeground} 
            onChange={(v) => setCustomColor("mutedForeground", v)} onSwap={swapColors} 
          />
          <DraggableColorPicker 
            colorKey="border" label="Border" value={customColors.border} 
            onChange={(v) => setCustomColor("border", v)} onSwap={swapColors} 
          />
          {(activeDesign === "dholeish" || activeDesign === "rakery") && (
            <>
              <DraggableColorPicker 
                colorKey="pedestalGlow" label="Ped Glow" value={customColors.pedestalGlow} 
                onChange={(v) => setCustomColor("pedestalGlow", v)} onSwap={swapColors} 
              />
              <DraggableColorPicker 
                colorKey="pedestalTop" label="Ped Top" value={customColors.pedestalTop} 
                onChange={(v) => setCustomColor("pedestalTop", v)} onSwap={swapColors} 
              />
              <DraggableColorPicker 
                colorKey="pedestalTopBorder" label="Ped Border" value={customColors.pedestalTopBorder} 
                onChange={(v) => setCustomColor("pedestalTopBorder", v)} onSwap={swapColors} 
              />
              <DraggableColorPicker 
                colorKey="pedestalBody" label="Ped Body" value={customColors.pedestalBody} 
                onChange={(v) => setCustomColor("pedestalBody", v)} onSwap={swapColors} 
              />
              <DraggableColorPicker 
                colorKey="pedestalShadow" label="Ped Shad" value={customColors.pedestalShadow} 
                onChange={(v) => setCustomColor("pedestalShadow", v)} onSwap={swapColors} 
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
