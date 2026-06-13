"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Frame, Palette, LayoutGrid, RotateCcw, Copy, Check } from "lucide-react"
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

  const copySingle = () => {
    navigator.clipboard.writeText(value).then(() => {
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
      className="flex flex-col gap-0.5 cursor-grab active:cursor-grabbing p-1 -m-1 rounded hover:bg-white/5 transition-colors group"
      title="Drag to swap. Click label to copy hex."
    >
      <button 
        onClick={copySingle}
        title="Copy hex code"
        className="text-[10px] text-muted-foreground leading-none hover:text-foreground transition-colors w-full text-center"
      >
        {copied ? "Copied" : label}
      </button>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="size-6 cursor-pointer border-0 p-0 rounded-md overflow-hidden pointer-events-auto"
      />
    </div>
  )
}

export function DesignControls() {
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
    // Regex for 3 or 6 digit hex colors
    const regex = /#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b/g
    const matches = text.match(regex)
    if (matches && matches.length >= 4) {
      applyBulkColors(matches)
      // Clear the input
      e.target.value = ""
    }
  }

  const handleCopyPalette = () => {
    let paletteString = `${customColors.primary}, ${customColors.background}, ${customColors.card}, ${customColors.foreground}`
    if (activeDesign === "dholeish") {
      paletteString += `, ${customColors.pedestalTop}`
    }
    navigator.clipboard.writeText(paletteString).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const currentPalettes = palettesByDesign[activeDesign] || []

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
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
      
      {mounted && theme === "custom-palette" && (
        <div className="flex items-center gap-4 border-l border-border/50 pl-4 ml-1">
          <DraggableColorPicker 
            colorKey="primary" label="Accent" value={customColors.primary} 
            onChange={(v) => setCustomColor("primary", v)} onSwap={swapColors} 
          />
          <DraggableColorPicker 
            colorKey="background" label="Bg" value={customColors.background} 
            onChange={(v) => setCustomColor("background", v)} onSwap={swapColors} 
          />
          <DraggableColorPicker 
            colorKey="card" label="Card" value={customColors.card} 
            onChange={(v) => setCustomColor("card", v)} onSwap={swapColors} 
          />
          <DraggableColorPicker 
            colorKey="foreground" label="Text" value={customColors.foreground} 
            onChange={(v) => setCustomColor("foreground", v)} onSwap={swapColors} 
          />
          {activeDesign === "dholeish" && (
            <DraggableColorPicker 
              colorKey="pedestalTop" label="Pedestal" value={customColors.pedestalTop} 
              onChange={(v) => setCustomColor("pedestalTop", v)} onSwap={swapColors} 
            />
          )}
          <div className="flex items-end gap-1.5 border-l border-border/50 pl-3 ml-1 h-full">
            <input 
              type="text" 
              placeholder="Paste #colors..." 
              onChange={handleBulkPaste}
              className="h-6 w-28 text-[10px] bg-black/20 border border-white/10 rounded px-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button 
              onClick={handleCopyPalette} 
              title="Copy palette to clipboard"
              className="h-6 w-6 flex items-center justify-center rounded bg-black/20 hover:bg-black/40 border border-white/10 transition-colors text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
            </button>
            <button 
              onClick={resetCustomColors} 
              title="Reset to default palette"
              className="h-6 w-6 flex items-center justify-center rounded bg-black/20 hover:bg-black/40 border border-white/10 transition-colors text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
