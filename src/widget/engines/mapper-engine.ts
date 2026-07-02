import { CustomColors } from "../WidgetStateProvider"
import { InjectionEngine, EngineOptions } from "./types"

/**
 * MapperEngine: Maps the widget's internal color tokens to the host site's
 * CSS variables based on user-defined mappings (and future heuristic mappings).
 * 
 * For every entry in the mappings dictionary, it sets the mapped CSS variable
 * on the target element to the widget's chosen color value.
 */
export const MapperEngine: InjectionEngine = {
  apply: (colors: CustomColors, radius: number | null, targetElement: HTMLElement, options?: EngineOptions) => {
    const style = targetElement.style
    const mappings = options?.mapperMappings || {}

    // For every mapping entry, set the host's CSS variable to our color value
    for (const [widgetKey, hostVarName] of Object.entries(mappings)) {
      if (!hostVarName || hostVarName.trim() === '') continue
      
      // Get the color value for this widget key
      const colorValue = colors[widgetKey]
      if (!colorValue) continue

      // Ensure variable name starts with --
      const varName = hostVarName.startsWith('--') ? hostVarName : `--${hostVarName}`
      style.setProperty(varName, colorValue)
    }

    // Handle radius mapping
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
    const mappings = options?.mapperMappings || {}
    
    // Remove all custom mapped variables
    for (const hostVarName of Object.values(mappings)) {
      if (!hostVarName || hostVarName.trim() === '') continue
      const varName = hostVarName.startsWith('--') ? hostVarName : `--${hostVarName}`
      style.removeProperty(varName)
    }
  }
}
