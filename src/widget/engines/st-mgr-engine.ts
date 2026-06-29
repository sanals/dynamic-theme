import { InjectionEngine, EngineOptions } from "./types";
import { CustomColors } from "../WidgetStateProvider";

const STYLE_ID = "theme-widget-st-mgr";

export const StMgrEngine: InjectionEngine = {
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
        --widget-st-mgr-bg: ${colors.background};
        --widget-st-mgr-fg: ${colors.foreground};
        --widget-st-mgr-primary: ${colors.primary};
        --widget-st-mgr-primary-fg: ${colors.primaryForeground};
        --widget-st-mgr-secondary: ${colors.secondary};
        --widget-st-mgr-secondary-fg: ${colors.secondaryForeground};
        --widget-st-mgr-muted: ${colors.muted};
        --widget-st-mgr-muted-fg: ${colors.mutedForeground};
        --widget-st-mgr-border: ${colors.border};
        --widget-st-mgr-card: ${colors.card};
        --widget-st-mgr-card-fg: ${colors.cardForeground};
        ${radius !== null ? `--widget-st-mgr-radius: ${radius}rem;` : ""}
      }

      body, main, article, section, aside, nav, header, footer {
        background-color: var(--widget-st-mgr-bg) !important;
        color: var(--widget-st-mgr-fg) !important;
      }

      h1, h2, h3, h4, h5, h6, p, span, div, li, td, th {
        color: var(--widget-st-mgr-fg) !important;
      }

      button, input[type="submit"], input[type="button"], .btn {
        background-color: var(--widget-st-mgr-primary) !important;
        color: var(--widget-st-mgr-primary-fg) !important;
        border-color: var(--widget-st-mgr-primary) !important;
        ${radius !== null ? `border-radius: var(--widget-st-mgr-radius) !important;` : ""}
      }

      a, .link {
        color: var(--widget-st-mgr-primary) !important;
      }

      input:not([type="submit"]):not([type="button"]), textarea, select {
        background-color: var(--widget-st-mgr-bg) !important;
        color: var(--widget-st-mgr-fg) !important;
        border-color: var(--widget-st-mgr-border) !important;
        ${radius !== null ? `border-radius: var(--widget-st-mgr-radius) !important;` : ""}
      }

      .card, .panel, [class*="card"], [class*="panel"] {
        background-color: var(--widget-st-mgr-card) !important;
        color: var(--widget-st-mgr-card-fg) !important;
        border-color: var(--widget-st-mgr-border) !important;
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
