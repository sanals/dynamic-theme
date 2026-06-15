"use client"

/*
  ROOT PROVIDERS
  --------------
  Combines the two theming axes:
    - ThemeProvider (next-themes)   -> color palette via `data-theme`
    - LayoutProvider (our context)  -> structural layout variant

  next-themes is configured with attribute="data-theme" and our palette
  ids as the value list, so toggling a theme writes
  <html data-theme="design-variant-2"> and CSS variables flip instantly.
*/

import { ThemeProvider } from "next-themes"
import { DEFAULT_PALETTE, allPaletteIds } from "@/lib/design-config"
import { LayoutProvider } from "@/components/providers/layout-provider"
import { DesignProvider } from "@/components/providers/design-provider"
import { CustomPaletteProvider } from "@/components/providers/custom-palette-provider"
import { FontProvider } from "@/components/providers/font-provider"
import { ComparisonProvider } from "@/components/providers/comparison-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme={DEFAULT_PALETTE}
      enableSystem={false}
      themes={allPaletteIds}
    >
      <CustomPaletteProvider>
        <DesignProvider>
          <FontProvider>
            <ComparisonProvider>
              <LayoutProvider>{children}</LayoutProvider>
            </ComparisonProvider>
          </FontProvider>
        </DesignProvider>
      </CustomPaletteProvider>
    </ThemeProvider>
  )
}
