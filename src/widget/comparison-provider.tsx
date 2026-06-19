"use client"

import { createContext, useContext, useState } from "react"
import { type DesignId } from "@/lib/design-config"
import { type CustomColors } from "./WidgetStateProvider"

export interface Snapshot {
  designId: DesignId
  colors: CustomColors
  font: string
  themeName: string
}

interface ComparisonContextValue {
  isComparisonMode: boolean
  setComparisonMode: (val: boolean) => void
  snapshot: Snapshot | null
  setSnapshot: (val: Snapshot | null) => void
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null)

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [isComparisonMode, setComparisonMode] = useState(false)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)

  return (
    <ComparisonContext.Provider value={{ isComparisonMode, setComparisonMode, snapshot, setSnapshot }}>
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const ctx = useContext(ComparisonContext)
  if (!ctx) {
    throw new Error("useComparison must be used within a ComparisonProvider")
  }
  return ctx
}
