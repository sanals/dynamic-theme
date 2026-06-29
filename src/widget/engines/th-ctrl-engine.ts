import { InjectionEngine, EngineOptions } from "./types";
import { CustomColors } from "../WidgetStateProvider";

const STYLE_ID = "theme-widget-th-ctrl";

// Helper to determine if a color string is "dark" or "light"
// This is a naive heuristic (checks for rgb/rgba/hex and estimates luminance)
function isDarkColor(colorStr: string): boolean {
  // Simplistic hex check
  if (colorStr.startsWith("#")) {
    const hex = colorStr.replace("#", "");
    if (hex.length === 3 || hex.length === 6) {
      const r = parseInt(hex.length === 3 ? hex[0]+hex[0] : hex.substring(0,2), 16);
      const g = parseInt(hex.length === 3 ? hex[1]+hex[1] : hex.substring(2,4), 16);
      const b = parseInt(hex.length === 3 ? hex[2]+hex[2] : hex.substring(4,6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    }
  }
  // Simplistic rgb/rgba check
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  // Fallback
  return false;
}

export const ThCtrlEngine: InjectionEngine = {
  apply: (colors: CustomColors, radius: number | null, targetElement: HTMLElement, options?: EngineOptions) => {
    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }

    const cssRulesToInject: string[] = [];
    
    // First, define our variables for the injected rules to use
    cssRulesToInject.push(`
      :root {
        --widget-th-ctrl-bg: ${colors.background};
        --widget-th-ctrl-fg: ${colors.foreground};
        --widget-th-ctrl-primary: ${colors.primary};
        --widget-th-ctrl-primary-fg: ${colors.primaryForeground};
        --widget-th-ctrl-secondary: ${colors.secondary};
        --widget-th-ctrl-secondary-fg: ${colors.secondaryForeground};
        --widget-th-ctrl-muted: ${colors.muted};
        --widget-th-ctrl-muted-fg: ${colors.mutedForeground};
        --widget-th-ctrl-border: ${colors.border};
        --widget-th-ctrl-card: ${colors.card};
        --widget-th-ctrl-card-fg: ${colors.cardForeground};
      }
    `);

    // Determine if our new theme is dark or light overall
    const isNewThemeDark = isDarkColor(colors.background);

    // Iterate over existing stylesheets
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      // Skip the widget's own stylesheets
      if (sheet.ownerNode instanceof Element && sheet.ownerNode.id.startsWith("theme-widget")) {
        continue;
      }
      
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules || sheet.rules;
      } catch (e) {
        // CORS error reading cross-origin stylesheet
        continue;
      }
      
      if (!rules) continue;

      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j] as CSSStyleRule;
        if (rule.type === CSSRule.STYLE_RULE && rule.style) {
          let injectedProperties = "";

          // Check background-color
          const bgVal = rule.style.getPropertyValue("background-color").trim();
          if (bgVal && bgVal !== "transparent" && bgVal !== "inherit" && bgVal !== "initial") {
            // Very simplistic mapping heuristic:
            // If original background was dark, map to our dark color (card/bg depending on theme), etc.
            // For now, we'll map ALL non-transparent backgrounds to our card color
            injectedProperties += `background-color: var(--widget-th-ctrl-card) !important; `;
          }

          // Check color
          const colorVal = rule.style.getPropertyValue("color").trim();
          if (colorVal && colorVal !== "inherit" && colorVal !== "initial") {
             injectedProperties += `color: var(--widget-th-ctrl-fg) !important; `;
          }

          // Check border-color
          const borderVal = rule.style.getPropertyValue("border-color").trim();
          if (borderVal && borderVal !== "transparent" && borderVal !== "inherit" && borderVal !== "initial") {
             injectedProperties += `border-color: var(--widget-th-ctrl-border) !important; `;
          }

          if (injectedProperties) {
            cssRulesToInject.push(`${rule.selectorText} { ${injectedProperties} }`);
          }
        }
      }
    }

    styleEl.innerHTML = cssRulesToInject.join("\n");
  },

  cleanup: (targetElement: HTMLElement, options?: EngineOptions) => {
    const styleEl = document.getElementById(STYLE_ID);
    if (styleEl) {
      styleEl.remove();
    }
  }
};
