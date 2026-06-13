"use client"

/*
  LAYOUT STRUCTURE CONTEXT
  ------------------------
  next-themes owns the COLOR axis (it writes `data-theme` on <html>).
  This context owns the orthogonal STRUCTURE axis so the two can change
  independently. Persisted to localStorage so the choice survives reloads.
*/

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import {
  DEFAULT_LAYOUT,
  type LayoutStructure,
} from "@/lib/design-config"

interface LayoutContextValue {
  activeLayoutStructure: LayoutStructure
  setLayoutStructure: (layout: LayoutStructure) => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

const STORAGE_KEY = "active-layout-structure"

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [activeLayoutStructure, setActive] =
    useState<LayoutStructure>(DEFAULT_LAYOUT)

  // Hydrate from storage after mount to avoid SSR mismatch.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "card-grid" || stored === "showcase") {
      setActive(stored)
    }
  }, [])

  const setLayoutStructure = useCallback((layout: LayoutStructure) => {
    setActive(layout)
    window.localStorage.setItem(STORAGE_KEY, layout)
  }, [])

  return (
    <LayoutContext.Provider
      value={{ activeLayoutStructure, setLayoutStructure }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayoutStructure() {
  const ctx = useContext(LayoutContext)
  if (!ctx) {
    throw new Error("useLayoutStructure must be used within a LayoutProvider")
  }
  return ctx
}
