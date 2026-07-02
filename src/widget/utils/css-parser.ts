import { CustomColors, WIDGET_INTERNAL_KEYS } from "../WidgetStateProvider"

/**
 * A discovered CSS variable with its resolved value.
 */
export interface DiscoveredVariable {
  name: string    // e.g. "--background-color-base"
  value: string   // e.g. "rgb(255, 255, 255)" — the computed/resolved value
}

/**
 * Scans all stylesheets loaded in the document to extract CSS variables.
 * Returns both variable names and their resolved values.
 * Handles CORS errors gracefully.
 * If a composed path is provided, it can also scan stylesheets inside open Shadow Roots.
 */
export const knownShadowRoots = new Set<ShadowRoot>()

/** Recursively finds and caches all open shadow roots on the page */
export function cacheAllOpenShadowRoots(root: Node = document) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
  let currentNode = walker.currentNode as Element
  while (currentNode) {
    if (currentNode.shadowRoot && !knownShadowRoots.has(currentNode.shadowRoot)) {
      knownShadowRoots.add(currentNode.shadowRoot)
      cacheAllOpenShadowRoots(currentNode.shadowRoot)
    }
    currentNode = walker.nextNode() as Element
  }
}

// Global cache for variables extracted from CORS stylesheets
const corsVarNames = new Set<string>()

// Fire and forget function to fetch CORS stylesheets and extract variables
async function fetchCorsVariables() {
  const sheets = Array.from(document.styleSheets)
  for (const sheet of sheets) {
    try {
      // Test if we have access. If this throws, it's a CORS sheet.
      const rules = sheet.cssRules
      if (!rules) continue
    } catch (e) {
      // It's CORS protected. Try to fetch it manually.
      if (sheet.href) {
        try {
          const res = await fetch(sheet.href)
          if (res.ok) {
            const cssText = await res.text()
            // Extract anything that looks like a CSS variable
            const matches = cssText.match(/--[a-zA-Z0-9_-]+/g)
            if (matches) {
              matches.forEach(m => {
                if (!m.startsWith('--widget-')) corsVarNames.add(m)
              })
            }
          }
        } catch (fetchErr) {
          // Fetch also failed (maybe blocked by CORS policy or adblocker), nothing we can do
        }
      }
    }
  }
}

// Start fetching immediately
fetchCorsVariables()

export function extractHostVariableNames(path?: EventTarget[]): Set<string> {
  const varNames = new Set<string>(corsVarNames)

  const sheetsToScan: CSSStyleSheet[] = Array.from(document.styleSheets)
  if (document.adoptedStyleSheets) {
    sheetsToScan.push(...document.adoptedStyleSheets)
  }

  // Add all stylesheets from all known shadow roots (not just the ones in path)
  knownShadowRoots.forEach(root => {
    if (root.styleSheets) sheetsToScan.push(...Array.from(root.styleSheets))
    if (root.adoptedStyleSheets) sheetsToScan.push(...root.adoptedStyleSheets)
  })

  if (path) {
    for (const target of path) {
      if (target instanceof ShadowRoot) {
        if (!knownShadowRoots.has(target)) {
          knownShadowRoots.add(target)
          if (target.styleSheets) sheetsToScan.push(...Array.from(target.styleSheets))
          if (target.adoptedStyleSheets) sheetsToScan.push(...target.adoptedStyleSheets)
        }
      }
    }
  }

  // Iterate over all style sheets
  for (let i = 0; i < sheetsToScan.length; i++) {
    const sheet = sheetsToScan[i]
    try {
      // Accessing cssRules might throw a SecurityError if the stylesheet is cross-origin
      if (!sheet.cssRules) continue

      for (let j = 0; j < sheet.cssRules.length; j++) {
        const rule = sheet.cssRules[j] as CSSStyleRule
        if (rule.style) {
          // Extract defined variables
          for (let k = 0; k < rule.style.length; k++) {
            const prop = rule.style[k]
            if (prop.startsWith('--') && !prop.startsWith('--widget-')) {
              varNames.add(prop)
            }
          }
          // Extract USED variables (handles cases where variable definition is in a CORS stylesheet,
          // but it is used in a readable local stylesheet or shadow DOM style tag)
          if (rule.style.cssText) {
            const matches = rule.style.cssText.match(/var\(\s*(--[a-zA-Z0-9_-]+)/g)
            if (matches) {
              matches.forEach(m => {
                const varName = m.replace(/var\(\s*/, '')
                if (!varName.startsWith('--widget-')) {
                  varNames.add(varName)
                }
              })
            }
          }
        }
      }
    } catch (e) {
      // Ignore CORS errors from external stylesheets
    }
  }

  // Also check inline styles on the document element, body, and all path elements
  const inlineTargets = [document.documentElement, document.body]
  if (path) {
    for (const p of path) {
      if (p instanceof HTMLElement) inlineTargets.push(p)
      if (p instanceof ShadowRoot && p.host instanceof HTMLElement) inlineTargets.push(p.host)
    }
  }
  for (const el of inlineTargets) {
    if (!el || !el.style) continue
    for (let i = 0; i < el.style.length; i++) {
      const prop = el.style[i]
      if (prop.startsWith('--') && !prop.startsWith('--widget-')) {
        varNames.add(prop)
      }
    }
    
    const cssText = el.getAttribute('style')
    if (cssText) {
      const matches = cssText.match(/var\(\s*(--[a-zA-Z0-9_-]+)/g)
      if (matches) {
        matches.forEach(m => {
          const varName = m.replace(/var\(\s*/, '')
          if (!varName.startsWith('--widget-')) {
            varNames.add(varName)
          }
        })
      }
    }
  }
  return varNames
}

/**
 * Resolves a raw CSS value (which may be an HSL tuple, rgb(), hex, etc.)
 * into a hex color string using a temporary DOM element.
 */
export function resolveColorToHex(rawValue: string, context: HTMLElement = document.body): string | null {
  const dummy = document.createElement('div')
  dummy.style.display = 'none'
  context.appendChild(dummy)

  // Try the value directly
  dummy.style.backgroundColor = rawValue
  if (!dummy.style.backgroundColor) {
    // Some sites use bare HSL tuples like "222.2 84% 4.9%"
    dummy.style.backgroundColor = `hsl(${rawValue})`
  }
  if (!dummy.style.backgroundColor) {
    // Try bare rgb tuples (Tailwind) like "255 0 0" or "255, 0, 0"
    dummy.style.backgroundColor = `rgb(${rawValue})`
  }
  if (!dummy.style.backgroundColor) {
    // Try oklch format
    dummy.style.backgroundColor = `oklch(${rawValue})`
  }

  let hex: string | null = null
  if (dummy.style.backgroundColor) {
    const computed = window.getComputedStyle(dummy).backgroundColor
    if (computed && computed !== 'rgba(0, 0, 0, 0)') {
      hex = rgbStringToHex(computed)
    }
  }

  context.removeChild(dummy)
  return hex
}

/**
 * Converts "rgb(r, g, b)" or "rgba(r, g, b, a)" to "#RRGGBB"
 */
function rgbStringToHex(rgb: string): string {
  const match = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (!match) return '#000000'
  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

/**
 * Analyzes a clicked DOM element and discovers which CSS variables are
 * controlling its visual appearance (color, background-color, border-color).
 * 
 * Returns an array of { name, resolvedHex } entries ready to be added
 * into the widget's customColors dictionary.
 */
function hasVisibleTextOrIcon(el: HTMLElement): boolean {
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true
  if (el instanceof SVGElement || el.tagName === 'IMG') return true
  if (el.querySelector('svg, img')) return true
  if (el.textContent && el.textContent.trim() !== '') return true
  return false
}

export function extractElementVariables(element: HTMLElement, path?: EventTarget[]): { name: string, resolvedHex: string, format: string }[] {
  const results: { name: string, resolvedHex: string, format: string }[] = []
  const seen = new Set<string>()

  const allVarNames = extractHostVariableNames(path)
  const computed = window.getComputedStyle(element)
  
  type TargetNode = { element: HTMLElement, property: string, originalValue: string }
  const targetNodes: TargetNode[] = []

  // Only check text color if the element actually renders text or icons
  if (hasVisibleTextOrIcon(element)) {
    targetNodes.push({ element, property: 'color', originalValue: computed.color })
  }

  // Borders
  if (computed.borderTopWidth !== '0px' && computed.borderTopStyle !== 'none') {
    targetNodes.push({ element, property: 'borderTopColor', originalValue: computed.borderTopColor })
  }
  if (computed.borderBottomWidth !== '0px' && computed.borderBottomStyle !== 'none') {
    targetNodes.push({ element, property: 'borderBottomColor', originalValue: computed.borderBottomColor })
  }
  if (computed.borderLeftWidth !== '0px' && computed.borderLeftStyle !== 'none') {
    targetNodes.push({ element, property: 'borderLeftColor', originalValue: computed.borderLeftColor })
  }
  if (computed.borderRightWidth !== '0px' && computed.borderRightStyle !== 'none') {
    targetNodes.push({ element, property: 'borderRightColor', originalValue: computed.borderRightColor })
  }

  // SVGs
  if (element instanceof SVGElement) {
    targetNodes.push({ element, property: 'fill', originalValue: computed.fill })
    targetNodes.push({ element, property: 'stroke', originalValue: computed.stroke })
  }

  // If this element doesn't have direct text/icons, but its children do, 
  // we should test those children's colors too! This fixes issues where clicking 
  // a container/overlay fails to detect variables that color its child text.
  const childNodes = Array.from(element.querySelectorAll('*'))
    .filter(el => hasVisibleTextOrIcon(el as HTMLElement))
    .slice(0, 5) // Limit to first 5 visible children for performance
  
  for (const child of childNodes) {
    const childComputed = window.getComputedStyle(child)
    targetNodes.push({ element: child as HTMLElement, property: 'color', originalValue: childComputed.color })
    if (child instanceof SVGElement) {
      targetNodes.push({ element: child, property: 'fill', originalValue: childComputed.fill })
    }
  }

  // Traverse up to find the first non-transparent background
  let bgElement: Element | null = element
  let effectiveBg = computed.backgroundColor
  while (bgElement && (effectiveBg === 'rgba(0, 0, 0, 0)' || effectiveBg === 'transparent')) {
    const parent = bgElement.parentElement
    if (parent) {
      bgElement = parent
    } else {
      const root = bgElement.getRootNode()
      if (root instanceof ShadowRoot) {
        bgElement = root.host
      } else {
        bgElement = null
      }
    }
    
    if (bgElement) {
      effectiveBg = window.getComputedStyle(bgElement).backgroundColor
    }
  }
  if (bgElement) {
    targetNodes.push({ element: bgElement as HTMLElement, property: 'backgroundColor', originalValue: effectiveBg })
  }

  const validTargets = targetNodes.filter(t => t.originalValue && t.originalValue !== 'rgba(0, 0, 0, 0)' && t.originalValue !== 'transparent' && t.originalValue !== 'none')
  if (validTargets.length === 0) return results
  
  const targetColors = validTargets.map(t => t.originalValue)

  // Pre-filter candidate variables
  const candidates: { name: string, hex: string }[] = []
  for (const varName of allVarNames) {
    if (seen.has(varName)) continue

    // RESOLVE THE VARIABLE ON THE TARGET ELEMENT ITSELF!
    // This is critical. If the variable is defined on a Shadow Host or a specific container
    // like .theme-dark, it won't exist on :root, but it WILL exist on the element itself!
    const valueOnElement = computed.getPropertyValue(varName).trim()
    if (!valueOnElement) continue

    const hex = resolveColorToHex(valueOnElement, element)
    if (!hex) continue

    const targetHexColors = targetColors.map(c => rgbStringToHex(c)).filter(Boolean)
    
    // We append the dummy to `element` so it correctly resolves variables using element's context
    const dummy = document.createElement('div')
    dummy.style.display = 'none'
    element.appendChild(dummy)
    dummy.style.backgroundColor = hex
    const resolvedRgb = window.getComputedStyle(dummy).backgroundColor
    element.removeChild(dummy)
    
    const resolvedHex = rgbStringToHex(resolvedRgb)

    // Only test variables that currently evaluate to one of the target colors on the element
    if (resolvedHex && targetHexColors.includes(resolvedHex)) {
      candidates.push({ name: varName, hex })
    }
  }

  // Targeted Mutation Test
  const styleEl = document.createElement('style')
  document.head.appendChild(styleEl)

  // Also inject mutation styles into any open ShadowRoots in the path
  const shadowStyles: HTMLStyleElement[] = []
  if (path) {
    for (const p of path) {
      if (p instanceof ShadowRoot) {
        const s = document.createElement('style')
        p.appendChild(s)
        shadowStyles.push(s)
      }
    }
  }

  for (const candidate of candidates) {
    const varName = candidate.name
    
    // We try multiple mutation formats because we don't know how the site uses the variable.
    // E.g. `color: var(--var)` needs `rgb(1,2,3)`
    // `color: rgb(var(--var))` needs `1, 2, 3` or `1 2 3`
    const mutationFormats = [
      `rgb(1, 2, 3)`, // Standard color
      `1, 2, 3`,      // Comma-separated tuple (Tailwind v2)
      `1 2 3`,        // Space-separated tuple (Tailwind v3)
      `1 2% 3%`       // HSL tuple
    ]

    let actuallyDrives = false
    let successfulFormat = 'rgb(1, 2, 3)'

    for (const format of mutationFormats) {
      // Use extremely high specificity with ID pseudo-classes to ensure we override any site theme selectors
      // like html[data-theme="dark"] or #app or .theme-provider
      // :not(#a) adds 1 ID specificity without restricting matches. We use 3 of them = 3,0,0
      const maxSpecificitySelector = `:not(#theme-widget-fake-id-1):not(#theme-widget-fake-id-2):not(#theme-widget-fake-id-3) *`
      const cssText = `${maxSpecificitySelector} { ${varName}: ${format} !important; }`
      styleEl.innerHTML = cssText
      for (const s of shadowStyles) s.innerHTML = cssText
      
      for (const t of validTargets) {
        const newComputed = window.getComputedStyle(t.element)
        const newVal = newComputed[t.property as keyof CSSStyleDeclaration] as string
        if (newVal !== t.originalValue) {
          actuallyDrives = true
          successfulFormat = format
          break
        }
      }
      if (actuallyDrives) break // Stop trying formats if one worked
    }
    
    if (actuallyDrives) {
      const keyName = varName.startsWith('--') ? varName : `--${varName}`
      if (!seen.has(keyName)) {
        seen.add(keyName)
        
        let formatType = 'hex'
        if (successfulFormat === '1, 2, 3') formatType = 'comma-tuple'
        else if (successfulFormat === '1 2 3') formatType = 'space-tuple'
        else if (successfulFormat === '1 2% 3%') formatType = 'hsl-tuple'

        results.push({ name: keyName, resolvedHex: candidate.hex, format: formatType })
      }
    }
  }

  document.head.removeChild(styleEl)
  for (const s of shadowStyles) {
    if (s.parentNode) s.parentNode.removeChild(s)
  }

  return results
}


/**
 * Given a list of available CSS variables on the page, intelligently auto-maps
 * them to our internal widget tokens based on common naming conventions.
 * 
 * Uses fuzzy substring matching instead of exact regex to be more robust
 * across different sites' naming conventions.
 */
export function autoMapVariables(availableVars: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}

  // Define heuristic matching rules for each token.
  // Each rule is a list of substring patterns, checked in priority order.
  // The first available variable that matches a pattern wins.
  const heuristics: Record<string, string[][]> = {
    background: [
      ['background'],  // exact/strong matches
      ['bg-main', 'bg-base', 'bg-primary', 'color-bg', 'surface-bg'],
      ['bg', 'surface', 'base'],
    ],
    foreground: [
      ['foreground'],
      ['fg-main', 'text-main', 'color-text', 'text-primary'],
      ['fg', 'text', 'body-color'],
    ],
    card: [
      ['card-bg', 'card-background'],
      ['card', 'panel', 'surface-2', 'bg-card', 'bg-secondary'],
    ],
    cardForeground: [
      ['card-foreground', 'card-fg', 'card-text'],
      ['text-card', 'on-card'],
    ],
    primary: [
      ['primary'],
      ['brand', 'accent', 'color-primary', 'brand-main', 'link-color'],
    ],
    primaryForeground: [
      ['primary-foreground', 'primary-fg'],
      ['on-primary', 'text-on-primary'],
    ],
    secondary: [
      ['secondary'],
      ['brand-secondary', 'surface-3'],
    ],
    secondaryForeground: [
      ['secondary-foreground', 'secondary-fg'],
      ['on-secondary'],
    ],
    muted: [
      ['muted'],
      ['bg-muted', 'gray', 'grey', 'subtle-bg'],
    ],
    mutedForeground: [
      ['muted-foreground', 'muted-fg'],
      ['text-muted', 'text-subtle'],
    ],
    border: [
      ['border-color', 'border'],
      ['line', 'divider', 'separator'],
    ],
    radius: [
      ['radius'],
      ['border-radius', 'rounded'],
    ],
  }

  // Helper: find the best matching variable across priority tiers
  const findMatch = (tiers: string[][]): string | undefined => {
    for (const tier of tiers) {
      for (const pattern of tier) {
        const match = availableVars.find(v => 
          v.toLowerCase().includes(pattern.toLowerCase())
        )
        if (match) return match
      }
    }
    return undefined
  }

  // Iterate over heuristics and find matches
  for (const [token, tiers] of Object.entries(heuristics)) {
    const match = findMatch(tiers)
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
