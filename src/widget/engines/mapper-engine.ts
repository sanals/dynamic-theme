import { CustomColors } from "../WidgetStateProvider"
import { InjectionEngine, EngineOptions } from "./types"

const SITE_SPECIFIC_MAPPINGS: Record<string, Record<string, string>> = {
  "en.wikipedia.org": {
    "background": "--background-color-base",
    "foreground": "--color-base",
    "card": "--background-color-neutral",
    "cardForeground": "--color-base",
    "primary": "--color-progressive",
    "primaryForeground": "--color-inverted",
    "muted": "--background-color-neutral-subtle",
    "mutedForeground": "--color-subtle",
    "border": "--border-color-base",
  },
  "www.reddit.com": {
    "background": "--dx-bg-color-light",
    "foreground": "--dx-text-color-light",
    "card": "--dx-bg-color-dark",
    "cardForeground": "--dx-text-color-dark",
    "primary": "--button-color-background-default",
    "primaryForeground": "--button-color-text-default",
    "border": "--dx-border-color-light",
  }
};

export const MapperEngine: InjectionEngine = {
  apply: (colors: CustomColors, radius: number | null, targetElement: HTMLElement, options?: EngineOptions) => {
    const style = targetElement.style
    let mappings = { ...(options?.mapperMappings || {}) }

    try {
      const hostname = window.location.hostname;
      if (SITE_SPECIFIC_MAPPINGS[hostname]) {
         mappings = { ...SITE_SPECIFIC_MAPPINGS[hostname], ...mappings }
      }
    } catch(e) {}

    // For every core widget color token, apply it to the user's mapped variable name (if provided)
    const tokens = [
      { key: 'background', val: colors.background },
      { key: 'foreground', val: colors.foreground },
      { key: 'card', val: colors.card },
      { key: 'cardForeground', val: colors.cardForeground },
      { key: 'primary', val: colors.primary },
      { key: 'primaryForeground', val: colors.primaryForeground },
      { key: 'secondary', val: colors.secondary },
      { key: 'secondaryForeground', val: colors.secondaryForeground },
      { key: 'muted', val: colors.muted },
      { key: 'mutedForeground', val: colors.mutedForeground },
      { key: 'border', val: colors.border },
      
      // Pedestal
      { key: 'pedestalGlow', val: colors.pedestalGlow },
      { key: 'pedestalTop', val: colors.pedestalTop },
      { key: 'pedestalTopBorder', val: colors.pedestalTopBorder },
      { key: 'pedestalBody', val: colors.pedestalBody },
      { key: 'pedestalShadow', val: colors.pedestalShadow },
    ]

    tokens.forEach(({ key, val }) => {
      const mappedVarName = mappings[key]
      if (mappedVarName && mappedVarName.trim() !== '') {
        // Ensure variable name starts with --
        const varName = mappedVarName.startsWith('--') ? mappedVarName : `--${mappedVarName}`
        style.setProperty(varName, val)
      }
    })

    if (radius !== null) {
      const mappedRadiusVar = mappings['radius']
      if (mappedRadiusVar && mappedRadiusVar.trim() !== '') {
        const varName = mappedRadiusVar.startsWith('--') ? mappedRadiusVar : `--${mappedRadiusVar}`
        style.setProperty(varName, `${radius}rem`)
      }
    }
  },
  cleanup: (targetElement: HTMLElement, options?: EngineOptions) => {
    const style = targetElement.style
    let mappings = { ...(options?.mapperMappings || {}) }

    try {
      const hostname = window.location.hostname;
      if (SITE_SPECIFIC_MAPPINGS[hostname]) {
         mappings = { ...SITE_SPECIFIC_MAPPINGS[hostname], ...mappings }
      }
    } catch(e) {}
    
    // Remove all custom mapped variables
    Object.values(mappings).forEach(mappedVarName => {
      if (mappedVarName && mappedVarName.trim() !== '') {
        const varName = mappedVarName.startsWith('--') ? mappedVarName : `--${mappedVarName}`
        style.removeProperty(varName)
      }
    })
  }
}
