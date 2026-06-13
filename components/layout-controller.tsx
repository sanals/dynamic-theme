"use client"

import { useLayoutStructure } from "@/components/providers/layout-provider"
import { CardGridLayout } from "@/components/layouts/card-grid-layout"
import { ShowcaseLayout } from "@/components/layouts/showcase-layout"
import type { LayoutStructure } from "@/lib/design-config"
import type { JSX } from "react"

/*
  LAYOUT CONTROLLER
  -----------------
  The single decision point for structural polymorphism. It reads the
  active layout structure from context and renders the matching variant.
  Adding a new structure = add an entry to this registry + a component.
  The data and color theming are entirely unaffected by this switch.
*/
const registry: Record<LayoutStructure, () => JSX.Element> = {
  "card-grid": CardGridLayout,
  showcase: ShowcaseLayout,
}

export function LayoutController() {
  const { activeLayoutStructure } = useLayoutStructure()
  const ActiveLayout = registry[activeLayoutStructure]
  return <ActiveLayout />
}
