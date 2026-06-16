"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import {
  DEFAULT_DESIGN,
  type DesignId,
} from "@/lib/design-config"

interface DesignContextValue {
  activeDesign: DesignId
  setDesign: (design: DesignId) => void
}

const DesignContext = createContext<DesignContextValue | null>(null)

const STORAGE_KEY = "active-design-structure"

export function DesignProvider({ children, overrideValue }: { children: React.ReactNode; overrideValue?: DesignId }) {
  const [activeDesign, setActive] = useState<DesignId>(DEFAULT_DESIGN)

  // Hydrate from storage after mount to avoid SSR mismatch.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "storefront" || stored === "catalog" || stored === "minimal" || stored === "gallery" || stored === "saas" || stored === "uikit") {
      setActive(stored as DesignId)
    }
  }, [])

  const setDesign = useCallback((design: DesignId) => {
    setActive(design)
    window.localStorage.setItem(STORAGE_KEY, design)
  }, [])

  return (
    <DesignContext.Provider value={{ activeDesign: overrideValue !== undefined ? overrideValue : activeDesign, setDesign }}>
      {children}
    </DesignContext.Provider>
  )
}

export function useDesign() {
  const ctx = useContext(DesignContext)
  if (!ctx) {
    throw new Error("useDesign must be used within a DesignProvider")
  }
  return ctx
}
