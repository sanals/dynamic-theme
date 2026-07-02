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

let globalHostVariablesCache: Set<string> | null = null

export function extractHostVariableNames(path?: EventTarget[], forceRefresh = false): Set<string> {
  if (!globalHostVariablesCache || forceRefresh) {
    globalHostVariablesCache = new Set<string>(corsVarNames)
    const sheetsToScan: CSSStyleSheet[] = Array.from(document.styleSheets)
    if (document.adoptedStyleSheets) {
      sheetsToScan.push(...document.adoptedStyleSheets)
    }
    knownShadowRoots.forEach(root => {
      if (root.styleSheets) sheetsToScan.push(...Array.from(root.styleSheets))
      if (root.adoptedStyleSheets) sheetsToScan.push(...root.adoptedStyleSheets)
    })
    scanSheetsForVariables(sheetsToScan, globalHostVariablesCache)
  }

  // Check for any newly discovered shadow roots in the path
  if (path) {
    const newSheets: CSSStyleSheet[] = []
    for (const target of path) {
      if (target instanceof ShadowRoot) {
        if (!knownShadowRoots.has(target)) {
          knownShadowRoots.add(target)
          if (target.styleSheets) newSheets.push(...Array.from(target.styleSheets))
          if (target.adoptedStyleSheets) newSheets.push(...target.adoptedStyleSheets)
        }
      }
    }
    if (newSheets.length > 0) {
      scanSheetsForVariables(newSheets, globalHostVariablesCache)
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
        globalHostVariablesCache.add(prop)
      }
    }
    
    const cssText = el.getAttribute('style')
    if (cssText) {
      const matches = cssText.match(/var\(\s*(--[a-zA-Z0-9_-]+)/g)
      if (matches) {
        matches.forEach(m => {
          const varName = m.replace(/var\(\s*/, '')
          if (!varName.startsWith('--widget-')) {
            globalHostVariablesCache.add(varName)
          }
        })
      }
    }
  }

  return globalHostVariablesCache
}

function scanSheetsForVariables(sheetsToScan: CSSStyleSheet[], varNames: Set<string>) {
  for (let i = 0; i < sheetsToScan.length; i++) {
    const sheet = sheetsToScan[i]
    try {
      if (!sheet.cssRules) continue
      for (let j = 0; j < sheet.cssRules.length; j++) {
        const rule = sheet.cssRules[j] as CSSStyleRule
        if (rule.style) {
          for (let k = 0; k < rule.style.length; k++) {
            const prop = rule.style[k]
            if (prop.startsWith('--') && !prop.startsWith('--widget-')) {
              varNames.add(prop)
            }
          }
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
      // Ignore CORS errors
    }
  }
}
// ... replaced by scanSheetsForVariables ...

/**
 * Resolves a raw CSS value (which may be an HSL tuple, rgb(), hex, etc.)
 * into a hex color string using a temporary DOM element.
 */
export function resolveColorToHex(rawValue: string, context: HTMLElement = document.body, providedDummy?: HTMLElement): string | null {
  const dummy = providedDummy || document.createElement('div')
  if (!providedDummy) {
    dummy.style.display = 'none'
    context.appendChild(dummy)
  }

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

  // Clear inline style if reusing
  if (providedDummy) {
    dummy.style.backgroundColor = ''
  } else {
    context.removeChild(dummy)
  }

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
  
  const dummy = document.createElement('div')
  dummy.style.display = 'none'
  element.appendChild(dummy)

  for (const varName of allVarNames) {
    if (seen.has(varName)) continue

    const valueOnElement = computed.getPropertyValue(varName).trim()
    if (!valueOnElement) continue

    const hex = resolveColorToHex(valueOnElement, element, dummy)
    if (!hex) continue

    const targetHexColors = targetColors.map(c => rgbStringToHex(c)).filter(Boolean)
    
    dummy.style.backgroundColor = hex
    const resolvedRgb = window.getComputedStyle(dummy).backgroundColor
    const resolvedHex = rgbStringToHex(resolvedRgb)

    if (resolvedHex && targetHexColors.includes(resolvedHex)) {
      candidates.push({ name: varName, hex })
    }
    dummy.style.backgroundColor = ''
  }
  
  element.removeChild(dummy)

  if (candidates.length === 0) return results

  // Targeted Mutation Test using Inline Style Path Mutation and Chunked Batch Testing
  const pathElements = (path || []).filter(p => p instanceof HTMLElement) as HTMLElement[]
  if (!pathElements.includes(element)) {
    pathElements.unshift(element) // ensure target element is always in there
  }

  // Backup original styles to prevent breaking the site
  const originalStyles = new Map<HTMLElement, Map<string, { value: string, priority: string }>>()
  for (const el of pathElements) {
    const map = new Map<string, { value: string, priority: string }>()
    for (const candidate of candidates) {
      const val = el.style.getPropertyValue(candidate.name)
      const prio = el.style.getPropertyPriority(candidate.name)
      if (val !== '') {
        map.set(candidate.name, { value: val, priority: prio })
      }
    }
    originalStyles.set(el, map)
  }

  function restoreProperty(el: HTMLElement, varName: string) {
    const backup = originalStyles.get(el)?.get(varName)
    if (backup) {
      el.style.setProperty(varName, backup.value, backup.priority)
    } else {
      el.style.removeProperty(varName)
    }
  }

  type Variation = { varName: string, format: string, formatType: string, hex: string }
  const allVariations: Variation[] = []
  for (const candidate of candidates) {
    allVariations.push({ varName: candidate.name, format: `rgb(1, 2, 3)`, formatType: 'hex', hex: candidate.hex })
    allVariations.push({ varName: candidate.name, format: `1, 2, 3`, formatType: 'comma-tuple', hex: candidate.hex })
    allVariations.push({ varName: candidate.name, format: `1 2 3`, formatType: 'space-tuple', hex: candidate.hex })
    allVariations.push({ varName: candidate.name, format: `1 2% 3%`, formatType: 'hsl-tuple', hex: candidate.hex })
  }

  const chunkSize = 20
  for (let i = 0; i < allVariations.length; i += chunkSize) {
    const chunk = allVariations.slice(i, i + chunkSize)
    
    // Apply chunk via inline styles to all path elements
    for (const v of chunk) {
      for (const el of pathElements) {
        el.style.setProperty(v.varName, v.format, 'important')
      }
    }
    
    let chunkChanged = false
    for (const t of validTargets) {
      const newComputed = window.getComputedStyle(t.element)
      if (newComputed[t.property as keyof CSSStyleDeclaration] !== t.originalValue) {
        chunkChanged = true
        break
      }
    }
    
    // Remove chunk
    for (const v of chunk) {
      for (const el of pathElements) {
        restoreProperty(el, v.varName)
      }
    }
    
    if (chunkChanged) {
      // Test individually
      for (const v of chunk) {
        const keyName = v.varName.startsWith('--') ? v.varName : `--${v.varName}`
        if (seen.has(keyName)) continue
        
        for (const el of pathElements) {
          el.style.setProperty(v.varName, v.format, 'important')
        }
        
        let actuallyDrives = false
        for (const t of validTargets) {
          const newComputed = window.getComputedStyle(t.element)
          if (newComputed[t.property as keyof CSSStyleDeclaration] !== t.originalValue) {
            actuallyDrives = true
            break
          }
        }
        
        for (const el of pathElements) {
          restoreProperty(el, v.varName)
        }
        
        if (actuallyDrives) {
          seen.add(keyName)
          results.push({ name: keyName, resolvedHex: v.hex, format: v.formatType })
        }
      }
    }
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
