"use client"

import { useDesign, DesignProvider } from "@/components/providers/design-provider"

import { useFont, FontProvider } from "@/components/providers/font-provider"
import { useCustomPalette } from "@/components/providers/custom-palette-provider"
import { useComparison } from "@/components/providers/comparison-provider"
import { RakeryShell } from "@/components/designs/rakery-shell"
import { H2NShell } from "@/components/designs/h2n-shell"
import { SynthesisShell } from "@/components/designs/synthesis-shell"
import { DholeishShell } from "@/components/designs/dholeish-shell"
import { UiKitShell } from "@/components/designs/uikit-shell"
import { SaasShell } from "@/components/designs/saas-shell"
import { fontPairings, type FontPairingId } from "@/lib/font-config"
import { type DesignId } from "@/lib/design-config"
import { useTheme } from "next-themes"
import { useEffect, useState, useRef } from "react"
import { Lock } from "lucide-react"

function renderShell(designId: DesignId) {
  return (
    <div id="design-showcase-container" className="h-full w-full">
      {designId === "dholeish" && <DholeishShell />}
      {designId === "synthesis" && <SynthesisShell />}
      {designId === "h2n" && <H2NShell />}
      {designId === "rakery" && <RakeryShell />}
      {designId === "uikit" && <UiKitShell />}
      {designId === "saas" && <SaasShell />}
    </div>
  )
}

export default function Page() {
  const { activeDesign, setDesign } = useDesign()

  const { activeFont, setFont } = useFont()
  const { customColors, applyBulkColors } = useCustomPalette()
  const { isComparisonMode, setComparisonMode, snapshot } = useComparison()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const hydratedRef = useRef(false)

  useEffect(() => {
    setMounted(true)

    if (hydratedRef.current) return
    hydratedRef.current = true

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const d = params.get("d") // designId

      const f = params.get("f") // font
      const t = params.get("t") // theme
      const c = params.get("c") // colors

      let didHydrate = false

      if (d) {
        setDesign(d as DesignId)
        didHydrate = true
      }

      if (f) {
        setFont(f as FontPairingId)
        didHydrate = true
      }
      if (t) {
        setTheme(t)
        didHydrate = true
      }
      if (c) {
        const colors = c.split(",").map(val => val.startsWith("#") ? val : "#" + val)
        if (colors.length >= 11) {
          applyBulkColors(colors)
          didHydrate = true
        }
      }

      if (didHydrate) {
        // Clear search parameters from address bar to keep it clean
        const url = new URL(window.location.href)
        url.search = ""
        window.history.replaceState({}, document.title, url.toString())
      }
    }
  }, [setDesign, setFont, setTheme, applyBulkColors])

  if (!mounted) {
    return <div className="min-h-screen bg-background" /> // Prevent hydration mismatch flash
  }

  const handleApplyToLive = () => {
    if (!snapshot) return
    setDesign(snapshot.designId)
    applyBulkColors([
      snapshot.colors.background,
      snapshot.colors.foreground,
      snapshot.colors.card,
      snapshot.colors.cardForeground,
      snapshot.colors.primary,
      snapshot.colors.primaryForeground,
      snapshot.colors.secondary,
      snapshot.colors.secondaryForeground,
      snapshot.colors.muted,
      snapshot.colors.mutedForeground,
      snapshot.colors.border,
      snapshot.colors.pedestalGlow,
      snapshot.colors.pedestalTop,
      snapshot.colors.pedestalTopBorder,
      snapshot.colors.pedestalBody,
      snapshot.colors.pedestalShadow,
    ])
    setFont(snapshot.font as FontPairingId)

  }

  if (isComparisonMode) {
    const pairing = snapshot ? fontPairings[snapshot.font as FontPairingId] : null
    const snapshotStyle = snapshot ? ({
      "--background": snapshot.colors.background,
      "--foreground": snapshot.colors.foreground,
      "--card": snapshot.colors.card,
      "--card-foreground": snapshot.colors.cardForeground,
      "--popover": snapshot.colors.card,
      "--popover-foreground": snapshot.colors.foreground,
      "--primary": snapshot.colors.primary,
      "--primary-foreground": snapshot.colors.primaryForeground,
      "--secondary": snapshot.colors.secondary,
      "--secondary-foreground": snapshot.colors.secondaryForeground,
      "--muted": snapshot.colors.muted,
      "--muted-foreground": snapshot.colors.mutedForeground,
      "--accent": snapshot.colors.primary,
      "--accent-foreground": snapshot.colors.primaryForeground,
      "--border": snapshot.colors.border,
      "--input": snapshot.colors.border,
      "--ring": snapshot.colors.primary,

      "--pedestal-glow": snapshot.colors.pedestalGlow,
      "--pedestal-top": snapshot.colors.pedestalTop,
      "--pedestal-top-border": snapshot.colors.pedestalTopBorder,
      "--pedestal-body": snapshot.colors.pedestalBody,
      "--pedestal-shadow": snapshot.colors.pedestalShadow,

      "--font-heading": pairing?.headingFamily || "inherit",
      "--font-sans": pairing?.sansFamily || "inherit",
      "--font-mono": pairing?.monoFamily || "inherit",
      fontFamily: pairing?.sansFamily || "inherit",
    } as React.CSSProperties) : {}

    return (
      <div className="relative flex flex-col min-h-screen w-full bg-zinc-950 overflow-x-hidden p-2 gap-2">
        {/* Floating Top Control Bar */}
        <div className="z-[999] bg-zinc-900/90 border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between text-white shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary px-2.5 py-0.5 rounded border border-primary/30">
              Comparison Mode
            </span>
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              Compare your live edits (Left) side-by-side with a locked reference snapshot (Right).
            </span>
          </div>
          <div className="flex items-center gap-2">
            {snapshot && (
              <button
                onClick={handleApplyToLive}
                className="h-7 px-3 text-[11px] font-bold rounded bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                Restore Snapshot to Editor
              </button>
            )}
            <button
              onClick={() => setComparisonMode(false)}
              className="h-7 px-3 text-[11px] font-bold rounded bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/10 transition-all cursor-pointer"
            >
              Exit Comparison
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 w-full gap-2 relative">
          {/* Left Panel: Live View */}
          <div className="flex-1 min-h-[45vh] md:min-h-[85vh] relative rounded-xl border-2 border-emerald-500/20 bg-background overflow-hidden shadow-emerald-500/5 shadow-xl transition-all">
            <div className="absolute top-3 left-4 z-50 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold flex items-center gap-1.5 text-white select-none">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Preview (Editable)
            </div>
            <div className="h-full w-full overflow-y-auto">
              {renderShell(activeDesign)}
            </div>
          </div>

          {/* Right Panel: Snapshot View */}
          <div className="flex-1 min-h-[45vh] md:min-h-[85vh] relative rounded-xl border-2 border-dashed border-amber-500/20 bg-zinc-900/30 overflow-hidden transition-all">
            <div className="absolute top-3 left-4 z-50 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold flex items-center gap-1.5 text-white select-none">
              <span className="size-2 rounded-full bg-amber-500" />
              Snapshot Baseline
            </div>
            {snapshot && (
              <div className="absolute top-3 right-4 z-50 bg-amber-500 text-black px-2.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow select-none leading-none">
                <Lock className="size-3 stroke-[2.5]" />
                LOCKED REFERENCE
              </div>
            )}
            <div className="h-full w-full overflow-y-auto">
              {snapshot ? (
                <div 
                  style={snapshotStyle} 
                  className="h-full w-full pointer-events-none select-none relative opacity-90"
                >
                  <DesignProvider overrideValue={snapshot.designId}>
                    <FontProvider overrideValue={snapshot.font as FontPairingId}>
                      {renderShell(snapshot.designId)}
                    </FontProvider>
                  </DesignProvider>
                </div>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground select-none gap-3">
                  <p className="text-sm font-semibold text-zinc-300">No snapshot captured yet.</p>
                  <p className="text-xs max-w-xs text-muted-foreground/70 leading-relaxed">
                    Open the custom palette control panel and click "Capture Current" to pin your current design configuration as a baseline for comparison.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return renderShell(activeDesign)
}
