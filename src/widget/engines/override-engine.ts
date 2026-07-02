import { InjectionEngine, EngineOptions } from "./types";
import { CustomColors } from "../WidgetStateProvider";

const STYLE_ID = "theme-widget-override";

/**
 * OverrideEngine: Aggressive CSS injection that forces colors on all elements.
 * 
 * Combines two strategies for maximum coverage:
 * 1. Tag-based brute-force: Forces colors on common HTML elements (body, headings,
 *    buttons, links, inputs, cards) using !important rules.
 * 2. Selector-mirroring: Scans accessible stylesheets and overrides any rules that
 *    explicitly set color, background-color, or border-color.
 * 
 * This engine is designed for sites that don't use CSS variables, where the
 * CustomEngine's variable injection alone cannot theme the page.
 */
export const OverrideEngine: InjectionEngine = {
  apply: (colors: CustomColors, radius: number | null, targetElement: HTMLElement, options?: EngineOptions) => {
    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }

    const bg = colors.background || "#18181b";
    const fg = colors.foreground || "#f4f4f5";
    const primary = colors.primary || "#3b82f6";
    const primaryFg = colors.primaryForeground || "#18181b";
    const border = colors.border || "#3f3f46";
    const card = colors.card || "#27272a";
    const cardFg = colors.cardForeground || "#f4f4f5";
    const muted = colors.muted || "#27272a";
    const mutedFg = colors.mutedForeground || "#a1a1aa";
    const secondary = colors.secondary || "#27272a";
    const secondaryFg = colors.secondaryForeground || "#f4f4f5";
    const radiusCss = radius !== null ? `${radius}rem` : "";

    const cssChunks: string[] = [];

    // ── Strategy 1: Tag-based brute-force ──
    // Containers and body
    cssChunks.push(`
      body, main, article, section, aside, nav, header, footer, [role="main"] {
        background-color: ${bg} !important;
        color: ${fg} !important;
      }
    `);

    // Text elements
    cssChunks.push(`
      h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, label, figcaption, blockquote, pre, code, summary, details {
        color: ${fg} !important;
      }
    `);

    // Buttons
    cssChunks.push(`
      button, input[type="submit"], input[type="button"], [role="button"], .btn {
        background-color: ${primary} !important;
        color: ${primaryFg} !important;
        border-color: ${primary} !important;
        ${radiusCss ? `border-radius: ${radiusCss} !important;` : ""}
      }
    `);

    // Links
    cssChunks.push(`
      a, a:visited, .link {
        color: ${primary} !important;
      }
    `);

    // Form inputs
    cssChunks.push(`
      input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]),
      textarea, select {
        background-color: ${card} !important;
        color: ${fg} !important;
        border-color: ${border} !important;
        ${radiusCss ? `border-radius: ${radiusCss} !important;` : ""}
      }
    `);

    // Cards and panels
    cssChunks.push(`
      .card, .panel, [class*="card"], [class*="panel"], [class*="Card"], [class*="Panel"] {
        background-color: ${card} !important;
        color: ${cardFg} !important;
        border-color: ${border} !important;
      }
    `);

    // Tables
    cssChunks.push(`
      table, thead, tbody, tr, th, td {
        background-color: ${bg} !important;
        color: ${fg} !important;
        border-color: ${border} !important;
      }
    `);

    // Muted / secondary elements
    cssChunks.push(`
      small, .text-muted, .text-secondary, [class*="muted"], [class*="secondary"], [class*="subtle"] {
        color: ${mutedFg} !important;
      }
    `);

    // SVG icons
    cssChunks.push(`
      svg { fill: currentColor !important; }
    `);

    // ── Strategy 2: Selector-mirroring ──
    // Scan existing stylesheets and override color-related properties
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      // Skip the widget's own stylesheets
      if (sheet.ownerNode instanceof Element && (sheet.ownerNode as Element).id?.startsWith("theme-widget")) {
        continue;
      }

      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules || sheet.rules;
      } catch (e) {
        // CORS error reading cross-origin stylesheet — skip
        continue;
      }

      if (!rules) continue;

      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j] as CSSStyleRule;
        if (rule.type !== CSSRule.STYLE_RULE || !rule.style) continue;

        let injectedProperties = "";

        // Check background-color
        const bgVal = rule.style.getPropertyValue("background-color").trim();
        if (bgVal && bgVal !== "transparent" && bgVal !== "inherit" && bgVal !== "initial" && bgVal !== "currentColor") {
          injectedProperties += `background-color: ${card} !important; `;
        }

        // Check color
        const colorVal = rule.style.getPropertyValue("color").trim();
        if (colorVal && colorVal !== "inherit" && colorVal !== "initial" && colorVal !== "currentColor") {
          injectedProperties += `color: ${fg} !important; `;
        }

        // Check border-color
        const borderVal = rule.style.getPropertyValue("border-color").trim();
        if (borderVal && borderVal !== "transparent" && borderVal !== "inherit" && borderVal !== "initial" && borderVal !== "currentColor") {
          injectedProperties += `border-color: ${border} !important; `;
        }

        if (injectedProperties) {
          cssChunks.push(`${rule.selectorText} { ${injectedProperties} }`);
        }
      }
    }

    styleEl.innerHTML = cssChunks.join("\n");
  },

  cleanup: (targetElement: HTMLElement, options?: EngineOptions) => {
    const styleEl = document.getElementById(STYLE_ID);
    if (styleEl) {
      styleEl.remove();
    }
  }
};
