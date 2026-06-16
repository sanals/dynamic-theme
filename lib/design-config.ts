/*
  DESIGN SYSTEM CONFIG
  --------------------
  Single source of truth for THREE independent axes of polymorphism:

    1. design           -> the top-level "whole design" switch. Swapping it
                           replaces the ENTIRE structural shell (header, hero,
                           gallery + typography) AND applies that design's
                           default color palette. This is the seamless
                           "switch to a completely different look" control.
    2. colorPalette     -> maps to the `data-theme` attribute on <html>
                           (handled by next-themes), which swaps CSS vars.
  Adding a new design / palette is a one-line change here plus the
  corresponding CSS block + components. Nothing else needs to know.
*/

/* ---------------------------------------------------------------- */
/* 1. TOP-LEVEL DESIGN AXIS                                         */
/* ---------------------------------------------------------------- */

import { FontPairingId } from "./font-config"

export type DesignId = "rakery" | "h2n" | "synthesis" | "dholeish" | "saas" | "uikit"

export interface DesignOption {
  id: DesignId
  label: string
  description: string
  /** Palette applied automatically when this design becomes active. */
  defaultPalette: ColorPalette
  /** Font applied automatically when this design becomes active. */
  defaultFont: FontPairingId
}

export const designs: DesignOption[] = [
  {
    id: "rakery",
    label: "Rakery",
    description: "Warm luxe storefront with an orange accent.",
    defaultPalette: "design-variant-1",
    defaultFont: "inter",
  },
  {
    id: "h2n",
    label: "H2N",
    description: "Industrial steel-blue catalog with condensed type.",
    defaultPalette: "design-variant-3",
    defaultFont: "roboto-mono",
  },
  {
    id: "synthesis",
    label: "Synthesis",
    description: "Futuristic bionic minimal catalog with ultra-clean elements.",
    defaultPalette: "design-variant-5",
    defaultFont: "geist",
  },
  {
    id: "dholeish",
    label: "Dholeish",
    description: "Forest green glassmorphic aesthetic with pedestals.",
    defaultPalette: "design-variant-7",
    defaultFont: "playfair",
  },
  {
    id: "saas",
    label: "SaaS",
    description: "Data-heavy application dashboard layout.",
    defaultPalette: "design-variant-1",
    defaultFont: "inter",
  },
  {
    id: "uikit",
    label: "UI Kit",
    description: "Raw component library showcase to test theme coverage.",
    defaultPalette: "design-variant-5",
    defaultFont: "geist",
  },
]

export const DEFAULT_DESIGN: DesignId = "rakery"

/** Maps each design to its dark and light palette variants for the quick toggle. */
export const darkLightPairs: Record<DesignId, { dark: ColorPalette; light: ColorPalette }> = {
  rakery: { dark: "design-variant-1", light: "design-variant-2" },
  h2n: { dark: "design-variant-3", light: "design-variant-4" },
  synthesis: { dark: "design-variant-6", light: "design-variant-5" },
  dholeish: { dark: "design-variant-7", light: "design-variant-8" },
  saas: { dark: "design-variant-1", light: "design-variant-2" },
  uikit: { dark: "design-variant-6", light: "design-variant-5" },
}

/* ---------------------------------------------------------------- */
/* 2. COLOR PALETTE AXIS (data-theme)                              */
/* ---------------------------------------------------------------- */

export type ColorPalette =
  | "design-variant-1"
  | "design-variant-2"
  | "design-variant-3"
  | "design-variant-4"
  | "design-variant-5"
  | "design-variant-6"
  | "design-variant-7"
  | "design-variant-8"
  | "custom-palette"

export interface PaletteOption {
  id: ColorPalette
  label: string
  description: string
}

/**
 * Every palette registered with next-themes. The steel-blue palette is
 * owned by the H2N design and is applied automatically, so it is not part
 * of Rakery's user-facing palette toggle below.
 */
export const allPaletteIds: ColorPalette[] = [
  "design-variant-1",
  "design-variant-2",
  "design-variant-3",
  "design-variant-4",
  "design-variant-5",
  "design-variant-6",
  "design-variant-7",
  "design-variant-8",
  "custom-palette",
]

/** The palettes mapped by design ID. */
export const palettesByDesign: Record<DesignId, PaletteOption[]> = {
  rakery: [
    {
      id: "design-variant-1",
      label: "Luxe Dark",
      description: "Near-black canvas with a vivid orange accent.",
    },
    {
      id: "design-variant-2",
      label: "Clean Light",
      description: "Bright surface with a calm teal accent.",
    },
    {
      id: "custom-palette",
      label: "Custom",
      description: "User defined palette.",
    },
  ],
  h2n: [
    {
      id: "design-variant-3",
      label: "Industrial Dark",
      description: "Steel-blue catalog with condensed type.",
    },
    {
      id: "design-variant-4",
      label: "Industrial Light",
      description: "Light steel catalog with condensed type.",
    },
    {
      id: "custom-palette",
      label: "Custom",
      description: "User defined palette.",
    },
  ],
  synthesis: [
    {
      id: "design-variant-5",
      label: "Bionic Light",
      description: "Minimalist pale palette with soft shadows.",
    },
    {
      id: "design-variant-6",
      label: "Bionic Dark",
      description: "Sleek dark monochrome palette.",
    },
    {
      id: "custom-palette",
      label: "Custom",
      description: "User defined palette.",
    },
  ],
  dholeish: [
    {
      id: "design-variant-7",
      label: "Forest",
      description: "Deep forest greens and pale golds.",
    },
    {
      id: "design-variant-8",
      label: "Deep Woods",
      description: "Darker green with high contrast accents.",
    },
    {
      id: "custom-palette",
      label: "Custom",
      description: "User defined palette.",
    },
  ],
}

export const DEFAULT_PALETTE: ColorPalette = "design-variant-1"
