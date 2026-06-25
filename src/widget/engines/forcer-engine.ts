import { InjectionEngine, EngineOptions } from "./types";
import { CustomColors } from "../WidgetStateProvider";

const STYLE_ID = "theme-widget-forcer";

export const ForcerEngine: InjectionEngine = {
  apply: (colors: CustomColors, radius: number | null, targetElement: HTMLElement, options?: EngineOptions) => {
    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }

    // Force high specificity CSS rules using !important
    // Targets root level and common semantic elements.
    const css = `
      :root {
        --widget-forcer-bg: ${colors.background};
        --widget-forcer-fg: ${colors.foreground};
        --widget-forcer-primary: ${colors.primary};
        --widget-forcer-primary-fg: ${colors.primaryForeground};
        --widget-forcer-secondary: ${colors.secondary};
        --widget-forcer-secondary-fg: ${colors.secondaryForeground};
        --widget-forcer-muted: ${colors.muted};
        --widget-forcer-muted-fg: ${colors.mutedForeground};
        --widget-forcer-border: ${colors.border};
        --widget-forcer-card: ${colors.card};
        --widget-forcer-card-fg: ${colors.cardForeground};
        ${radius !== null ? `--widget-forcer-radius: ${radius}rem;` : ""}
      }

      body, main, article, section, aside, nav, header, footer {
        background-color: var(--widget-forcer-bg) !important;
        color: var(--widget-forcer-fg) !important;
      }

      h1, h2, h3, h4, h5, h6, p, span, div, li, td, th {
        color: var(--widget-forcer-fg) !important;
      }

      button, input[type="submit"], input[type="button"], .btn {
        background-color: var(--widget-forcer-primary) !important;
        color: var(--widget-forcer-primary-fg) !important;
        border-color: var(--widget-forcer-primary) !important;
        ${radius !== null ? `border-radius: var(--widget-forcer-radius) !important;` : ""}
      }

      a, .link {
        color: var(--widget-forcer-primary) !important;
      }

      input:not([type="submit"]):not([type="button"]), textarea, select {
        background-color: var(--widget-forcer-bg) !important;
        color: var(--widget-forcer-fg) !important;
        border-color: var(--widget-forcer-border) !important;
        ${radius !== null ? `border-radius: var(--widget-forcer-radius) !important;` : ""}
      }

      .card, .panel, [class*="card"], [class*="panel"] {
        background-color: var(--widget-forcer-card) !important;
        color: var(--widget-forcer-card-fg) !important;
        border-color: var(--widget-forcer-border) !important;
      }
    `;

    styleEl.innerHTML = css;
  },

  cleanup: (targetElement: HTMLElement, options?: EngineOptions) => {
    const styleEl = document.getElementById(STYLE_ID);
    if (styleEl) {
      styleEl.remove();
    }
  }
};
