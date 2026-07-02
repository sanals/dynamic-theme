import { CustomColors, WIDGET_INTERNAL_KEYS } from "../WidgetStateProvider"
import { InjectionEngine, EngineOptions } from "./types"
import { knownShadowRoots } from "../utils/css-parser"

/**
 * Converts a key to its CSS variable name.
 * - Internal widget keys (camelCase): "cardForeground" → "--card-foreground"
 * - Host-discovered keys (already kebab-case): "header-bg" → "--header-bg"
 */
function toCssVar(key: string): string {
  // If it already starts with '--', it's a host-discovered variable.
  // Never modify it, even if it has uppercase letters!
  if (key.startsWith('--')) return key

  // If the key contains uppercase letters, it's a camelCase internal key
  if (/[A-Z]/.test(key)) {
    return `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
  }
  
  return `--${key}`
}

function hexToRgbTuple(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) || 0
  const g = parseInt(hex.slice(3, 5), 16) || 0
  const b = parseInt(hex.slice(5, 7), 16) || 0
  return `${r}, ${g}, ${b}`
}

function hexToSpaceTuple(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) || 0
  const g = parseInt(hex.slice(3, 5), 16) || 0
  const b = parseInt(hex.slice(5, 7), 16) || 0
  return `${r} ${g} ${b}`
}

function hexToHslTuple(hex: string): string {
  let r = (parseInt(hex.slice(1, 3), 16) || 0) / 255
  let g = (parseInt(hex.slice(3, 5), 16) || 0) / 255
  let b = (parseInt(hex.slice(5, 7), 16) || 0) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/** Set of internal widget keys for fast lookup */
const INTERNAL_KEY_SET = new Set<string>(WIDGET_INTERNAL_KEYS)

const STYLE_ID = 'theme-widget-custom-engine'

/**
 * CustomEngine: Sets CSS variables via a global style tag.
 * 
 * - Always injects the 11 core WIDGET_INTERNAL_KEYS plus shadcn/ui aliases.
 * - Also injects any EXTRA keys in the colors dictionary (host-discovered
 *   variables added via the Element Picker), so changing them in the
 *   widget immediately overrides the host site's styling.
 */
export const CustomEngine: InjectionEngine = {
  apply: (colors: CustomColors, radius: number | null, targetElement: HTMLElement, options?: EngineOptions) => {
    const applyToStyleElement = (styleEl: HTMLStyleElement) => {
      const sheet = styleEl.sheet
      if (!sheet) return

      const maxSpecificitySelector = `:not(#theme-widget-fake-id-1):not(#theme-widget-fake-id-2):not(#theme-widget-fake-id-3) *`
      
      if (sheet.cssRules.length === 0) {
        sheet.insertRule(`${maxSpecificitySelector} {}`, 0)
      }
      const rule = sheet.cssRules[0] as CSSStyleRule
      if (!rule || !rule.style) return

      const formats = options?.variableFormats || {}

      for (const [key, value] of Object.entries(colors)) {
        if (!value) continue
        const cssVar = toCssVar(key)
        
        let formattedValue = value
        const format = formats[cssVar] || formats[key] || 'hex'
        
        if (format === 'comma-tuple') {
          formattedValue = hexToRgbTuple(value)
        } else if (format === 'space-tuple') {
          formattedValue = hexToSpaceTuple(value)
        } else if (format === 'hsl-tuple') {
          formattedValue = hexToHslTuple(value)
        }

        rule.style.setProperty(cssVar, formattedValue, 'important')
      }

      if (colors.card) rule.style.setProperty('--popover', colors.card, 'important')
      if (colors.foreground) rule.style.setProperty('--popover-foreground', colors.foreground, 'important')
      if (colors.primary) {
        rule.style.setProperty('--accent', colors.primary, 'important')
        rule.style.setProperty('--ring', colors.primary, 'important')
      }
      if (colors.primaryForeground) rule.style.setProperty('--accent-foreground', colors.primaryForeground, 'important')
      rule.style.setProperty('--destructive', '#ef4444', 'important')
      rule.style.setProperty('--destructive-foreground', '#f8fafc', 'important')
      if (colors.border) rule.style.setProperty('--input', colors.border, 'important')
      if (radius !== null) rule.style.setProperty('--radius', `${radius}rem`, 'important')
    }

    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = STYLE_ID
      styleEl.appendChild(document.createTextNode(''))
      document.head.appendChild(styleEl)
    }
    
    // Apply to main document
    applyToStyleElement(styleEl)
    
    // Also inject into any known shadow roots to override scoped variables
    knownShadowRoots.forEach(shadowRoot => {
      let shadowStyle = shadowRoot.getElementById(STYLE_ID) as HTMLStyleElement | null
      if (!shadowStyle) {
        shadowStyle = document.createElement('style')
        shadowStyle.id = STYLE_ID
        shadowStyle.appendChild(document.createTextNode(''))
        shadowRoot.appendChild(shadowStyle)
      }
      applyToStyleElement(shadowStyle)
    })
  },
  cleanup: (targetElement: HTMLElement, options?: EngineOptions) => {
    const styleEl = document.getElementById(STYLE_ID)
    if (styleEl) {
      styleEl.remove()
    }
    
    knownShadowRoots.forEach(shadowRoot => {
      const shadowStyle = shadowRoot.getElementById(STYLE_ID)
      if (shadowStyle) {
        shadowStyle.remove()
      }
    })
  }
}
