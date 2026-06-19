import { CustomColors } from "../WidgetStateProvider"
import { InjectionEngine, EngineOptions } from "./types"

export const CustomEngine: InjectionEngine = {
  apply: (colors: CustomColors, radius: number | null, targetElement: HTMLElement, options?: EngineOptions) => {
    const style = targetElement.style
    style.setProperty("--background", colors.background)
    style.setProperty("--foreground", colors.foreground)
    style.setProperty("--card", colors.card)
    style.setProperty("--card-foreground", colors.cardForeground)
    style.setProperty("--popover", colors.card)
    style.setProperty("--popover-foreground", colors.foreground)
    style.setProperty("--primary", colors.primary)
    style.setProperty("--primary-foreground", colors.primaryForeground)
    style.setProperty("--secondary", colors.secondary)
    style.setProperty("--secondary-foreground", colors.secondaryForeground)
    style.setProperty("--muted", colors.muted)
    style.setProperty("--muted-foreground", colors.mutedForeground)
    style.setProperty("--accent", colors.primary)
    style.setProperty("--accent-foreground", colors.primaryForeground)
    style.setProperty("--destructive", "#ef4444")
    style.setProperty("--destructive-foreground", "#f8fafc")
    style.setProperty("--border", colors.border)
    style.setProperty("--input", colors.border)
    style.setProperty("--ring", colors.primary)

    style.setProperty("--pedestal-glow", colors.pedestalGlow)
    style.setProperty("--pedestal-top", colors.pedestalTop)
    style.setProperty("--pedestal-top-border", colors.pedestalTopBorder)
    style.setProperty("--pedestal-body", colors.pedestalBody)
    style.setProperty("--pedestal-shadow", colors.pedestalShadow)

    if (radius !== null) {
      style.setProperty("--radius", `${radius}rem`)
    }
  },
  cleanup: (targetElement: HTMLElement, options?: EngineOptions) => {
    const style = targetElement.style
    const varsToRemove = [
      "--background", "--foreground", "--card", "--card-foreground",
      "--popover", "--popover-foreground", "--primary", "--primary-foreground",
      "--secondary", "--secondary-foreground", "--muted", "--muted-foreground",
      "--accent", "--accent-foreground", "--destructive", "--destructive-foreground",
      "--border", "--input", "--ring", "--pedestal-glow", "--pedestal-top",
      "--pedestal-top-border", "--pedestal-body", "--pedestal-shadow", "--radius"
    ]
    varsToRemove.forEach(v => style.removeProperty(v))
  }
}
