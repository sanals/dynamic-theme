const fs = require('fs');
let text = fs.readFileSync('src/widget/WidgetStateProvider.tsx', 'utf8');

// Add import
text = text.replace('import { autoFixContrast } from "@/lib/color-utils"\n', 'import { autoFixContrast } from "@/lib/color-utils"\nimport { Engines } from "./engines"\n');

// Update Context Value
text = text.replace(
`export interface CustomPaletteContextValue {
  mode: "default" | "custom"
  setMode: (mode: "default" | "custom") => void`,
`export interface CustomPaletteContextValue {
  mode: "default" | "custom" | "mapper"
  setMode: (mode: "default" | "custom" | "mapper") => void
  mapperMappings: Record<string, string>
  setMapperMappings: (mappings: Record<string, string>) => void`
);

// Update mode type
text = text.replace(
`  const [mode, setModeState] = useState<"default" | "custom">("default")`,
`  const [mode, setModeState] = useState<"default" | "custom" | "mapper">("default")
  const [mapperMappings, setMapperMappingsState] = useState<Record<string, string>>({})`
);

// Add mapper key to mode set
text = text.replace(
`  const setMode = (m: "default" | "custom") => {
    setModeState(m)
    window.localStorage.setItem(MODE_STORAGE_KEY, m)
  }`,
`  const setMode = (m: "default" | "custom" | "mapper") => {
    setModeState(m)
    window.localStorage.setItem(MODE_STORAGE_KEY, m)
  }

  const setMapperMappings = (m: Record<string, string>) => {
    setMapperMappingsState(m)
    window.localStorage.setItem("widget-mapper-mappings", JSON.stringify(m))
  }`
);

// Hydrate mapper mappings
text = text.replace(
`      const storedMode = window.localStorage.getItem(MODE_STORAGE_KEY) as "default" | "custom" | null
      if (storedMode) {
        setModeState(storedMode)
      }`,
`      const storedMode = window.localStorage.getItem(MODE_STORAGE_KEY) as "default" | "custom" | "mapper" | null
      if (storedMode) {
        setModeState(storedMode)
      }
      const storedMappings = window.localStorage.getItem("widget-mapper-mappings")
      if (storedMappings) {
        setMapperMappingsState(JSON.parse(storedMappings))
      }`
);

// Replace useEffect
const oldUseEffect = `  // Apply CSS Variables to host document
  useEffect(() => {
    if (!mounted) return
    const el = targetElement()
    if (!el) return

    const style = el.style
    
    if (mode === "default") {
      // Remove all injected styles so the host defaults take over
      style.removeProperty('--background')
      style.removeProperty('--foreground')
      style.removeProperty('--card')
      style.removeProperty('--card-foreground')
      style.removeProperty('--popover')
      style.removeProperty('--popover-foreground')
      style.removeProperty('--primary')
      style.removeProperty('--primary-foreground')
      style.removeProperty('--secondary')
      style.removeProperty('--secondary-foreground')
      style.removeProperty('--muted')
      style.removeProperty('--muted-foreground')
      style.removeProperty('--accent')
      style.removeProperty('--accent-foreground')
      style.removeProperty('--border')
      style.removeProperty('--input')
      style.removeProperty('--ring')
      
      style.removeProperty('--pedestal-glow')
      style.removeProperty('--pedestal-top')
      style.removeProperty('--pedestal-top-border')
      style.removeProperty('--pedestal-body')
      style.removeProperty('--pedestal-shadow')
      
      style.removeProperty('--radius')
      return
    }

    style.setProperty('--background', customColors.background)
    style.setProperty('--foreground', customColors.foreground)
    style.setProperty('--card', customColors.card)
    style.setProperty('--card-foreground', customColors.cardForeground)
    style.setProperty('--popover', customColors.card)
    style.setProperty('--popover-foreground', customColors.foreground)
    style.setProperty('--primary', customColors.primary)
    style.setProperty('--primary-foreground', customColors.primaryForeground)
    style.setProperty('--secondary', customColors.secondary)
    style.setProperty('--secondary-foreground', customColors.secondaryForeground)
    style.setProperty('--muted', customColors.muted)
    style.setProperty('--muted-foreground', customColors.mutedForeground)
    style.setProperty('--accent', customColors.primary)
    style.setProperty('--accent-foreground', customColors.primaryForeground)
    style.setProperty('--border', customColors.border)
    style.setProperty('--input', customColors.border)
    style.setProperty('--ring', customColors.primary)
    
    style.setProperty('--pedestal-glow', customColors.pedestalGlow)
    style.setProperty('--pedestal-top', customColors.pedestalTop)
    style.setProperty('--pedestal-top-border', customColors.pedestalTopBorder)
    style.setProperty('--pedestal-body', customColors.pedestalBody)
    style.setProperty('--pedestal-shadow', customColors.pedestalShadow)
    
    if (customRadius !== null) {
      style.setProperty('--radius', \`\${customRadius}rem\`)
    } else {
      style.removeProperty('--radius')
    }
  }, [customColors, customRadius, mounted, targetElement, mode])`;

const newUseEffect = `  // Apply CSS Variables to host document using Engines
  useEffect(() => {
    if (!mounted) return
    const el = targetElement()
    if (!el) return

    // Cleanup ALL engines first to prevent variable pollution across modes
    Object.values(Engines).forEach(engine => engine.cleanup(el, { mapperMappings }))

    if (mode === "default") {
      return
    }

    const activeEngine = Engines[mode]
    if (activeEngine) {
      activeEngine.apply(customColors, customRadius, el, { mapperMappings })
    }
  }, [customColors, customRadius, mounted, targetElement, mode, mapperMappings])`;

text = text.replace(oldUseEffect, newUseEffect);

// Update Provider values
text = text.replace(
`      value={{
        mode,
        setMode,
        customColors,`,
`      value={{
        mode,
        setMode,
        mapperMappings,
        setMapperMappings,
        customColors,`
);

fs.writeFileSync('src/widget/WidgetStateProvider.tsx', text);
