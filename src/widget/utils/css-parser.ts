import { CustomColors } from "../WidgetStateProvider"

/**
 * Scans all stylesheets loaded in the document to extract CSS variables.
 * Handles CORS errors gracefully.
 */
export function extractHostVariables(): string[] {
  const vars = new Set<string>()

  // Iterate over all style sheets
  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i]
    try {
      // Accessing cssRules might throw a SecurityError if the stylesheet is cross-origin
      if (!sheet.cssRules) continue

      for (let j = 0; j < sheet.cssRules.length; j++) {
        const rule = sheet.cssRules[j] as CSSStyleRule
        if (rule.style) {
          for (let k = 0; k < rule.style.length; k++) {
            const prop = rule.style[k]
            if (prop.startsWith('--')) {
              vars.add(prop)
            }
          }
        }
      }
    } catch (e) {
      // Ignore CORS errors from external stylesheets
    }
  }

  // Also check inline styles on the document element
  const rootStyle = document.documentElement.style
  for (let i = 0; i < rootStyle.length; i++) {
    const prop = rootStyle[i]
    if (prop.startsWith('--')) {
      vars.add(prop)
    }
  }

  return Array.from(vars)
}

/**
 * Given a list of available CSS variables on the page, intelligently auto-maps
 * them to our internal widget tokens based on common naming conventions.
 */
export function autoMapVariables(availableVars: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}

  // Helper to find the best matching variable
  const findMatch = (patterns: RegExp[]): string | undefined => {
    for (const pattern of patterns) {
      const match = availableVars.find(v => pattern.test(v))
      if (match) return match
    }
    return undefined
  }

  // Define heuristic matching rules for each token
  const heuristics: Record<keyof CustomColors | 'radius', RegExp[]> = {
    background: [/^--bg$/i, /^--background$/i, /^--bg-main$/i, /^--color-bg$/i, /^--surface$/i, /^--base$/i],
    foreground: [/^--fg$/i, /^--foreground$/i, /^--text$/i, /^--text-main$/i, /^--color-text$/i],
    card: [/^--card$/i, /^--bg-card$/i, /^--surface-2$/i, /^--panel$/i],
    cardForeground: [/^--card-foreground$/i, /^--text-card$/i],
    primary: [/^--primary$/i, /^--brand$/i, /^--accent$/i, /^--color-primary$/i, /^--brand-main$/i],
    primaryForeground: [/^--primary-foreground$/i, /^--on-primary$/i, /^--text-on-primary$/i],
    secondary: [/^--secondary$/i, /^--brand-secondary$/i, /^--surface-3$/i],
    secondaryForeground: [/^--secondary-foreground$/i, /^--on-secondary$/i],
    muted: [/^--muted$/i, /^--bg-muted$/i, /^--gray$/i, /^--grey$/i],
    mutedForeground: [/^--muted-foreground$/i, /^--text-muted$/i],
    border: [/^--border$/i, /^--line$/i, /^--divider$/i, /^--border-color$/i],
    
    // Pedestal specifics (unlikely to be found, but check just in case)
    pedestalGlow: [/^--pedestal-glow$/i],
    pedestalTop: [/^--pedestal-top$/i],
    pedestalTopBorder: [/^--pedestal-top-border$/i],
    pedestalBody: [/^--pedestal-body$/i],
    pedestalShadow: [/^--pedestal-shadow$/i],
    
    radius: [/^--radius$/i, /^--border-radius$/i, /^--rounded$/i]
  }

  // Iterate over heuristics and find matches
  for (const [token, patterns] of Object.entries(heuristics)) {
    const match = findMatch(patterns)
    if (match) {
      mapping[token] = match
    }
  }

  return mapping
}

/**
 * Reverse-engineers the CSS variable used by an element by comparing the element's computed style
 * with the resolved values of all known CSS variables.
 */
export function findVariableForElement(
  element: HTMLElement,
  tokenType: string,
  detectedVariables: string[]
): string | undefined {
  const computedStyle = window.getComputedStyle(element)
  
  // Determine which CSS property to check based on the token
  let targetColor = ''
  let targetProp = ''
  
  if (tokenType === 'radius') {
    targetColor = computedStyle.borderRadius
    targetProp = 'radius'
  } else if (tokenType === 'border') {
    targetColor = computedStyle.borderColor
    targetProp = 'color'
  } else if (tokenType.toLowerCase().includes('foreground')) {
    targetColor = computedStyle.color
    targetProp = 'color'
  } else {
    // Default to background color (primary, background, card, muted, secondary, etc.)
    targetColor = computedStyle.backgroundColor
    targetProp = 'color'
  }

  // If the target is fully transparent or not set, it might be hard to match.
  if (!targetColor || targetColor === 'rgba(0, 0, 0, 0)') {
    return undefined
  }

  // To resolve CSS variables properly, we evaluate them against the document element
  // or the element itself.
  const rootStyle = window.getComputedStyle(document.documentElement)
  const elStyle = window.getComputedStyle(element)

  // Create a dummy element to accurately evaluate colors without regex parsing
  const dummy = document.createElement('div')
  dummy.style.display = 'none'
  document.body.appendChild(dummy)

  let bestMatch: string | undefined = undefined
  
  for (const v of detectedVariables) {
    // First, get the raw value of the variable
    let rawVal = elStyle.getPropertyValue(v)
    if (!rawVal) {
      rawVal = rootStyle.getPropertyValue(v)
    }
    if (!rawVal) continue
    
    rawVal = rawVal.trim()

    // Test the raw value using the browser's own CSS engine
    if (targetProp === 'radius') {
      dummy.style.borderRadius = rawVal
      const resolved = window.getComputedStyle(dummy).borderRadius
      if (resolved === targetColor) {
        bestMatch = v
        break
      }
    } else {
      dummy.style.backgroundColor = '' // clear
      dummy.style.backgroundColor = rawVal
      
      // Sometimes rawVal is just an HSL tuple like "222.2 84% 4.9%" without hsl()
      if (!dummy.style.backgroundColor) {
        dummy.style.backgroundColor = `hsl(${rawVal})`
      }
      
      const resolved = window.getComputedStyle(dummy).backgroundColor
      if (resolved === targetColor) {
        // We found a match! 
        // If we find multiple matches, we might want to apply heuristics, 
        // but for now, first exact match wins, unless it's a generic one and we find a better named one.
        bestMatch = v
        
        // Minor heuristic: if the variable name contains the token name, it's a perfect match
        if (v.toLowerCase().includes(tokenType.toLowerCase().replace('foreground', 'fg'))) {
          break
        }
      }
    }
  }

  document.body.removeChild(dummy)
  return bestMatch
}
