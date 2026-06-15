"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { FontPairingId, fontPairings } from "@/lib/font-config"
import { useDesign } from "./design-provider"
import { designs } from "@/lib/design-config"

interface FontContextValue {
  activeFont: FontPairingId
  setFont: (font: FontPairingId) => void
  customFontFamilies: { heading: string; sans: string; mono: string } | null
  setCustomFont: (file: File, familyName: string) => Promise<void>
}

const FontContext = createContext<FontContextValue | null>(null)

const STORAGE_KEY = "active-font-pairing"

export function FontProvider({ children, overrideValue }: { children: React.ReactNode; overrideValue?: FontPairingId }) {
  const { activeDesign } = useDesign()
  
  // By default, derive from activeDesign if no explicit user override
  const [activeFont, setActiveFont] = useState<FontPairingId>("geist")
  const [customFontFamilies, setCustomFontFamilies] = useState<{ heading: string; sans: string; mono: string } | null>(null)
  const [userOverridden, setUserOverridden] = useState(false)

  // Load from local storage
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && fontPairings[stored as FontPairingId]) {
      setActiveFont(stored as FontPairingId)
      setUserOverridden(true)
    }
  }, [])

  // Auto-apply design's default font if user hasn't locked/overridden
  useEffect(() => {
    if (!userOverridden) {
      const designOpt = designs.find((d) => d.id === activeDesign)
      if (designOpt) {
        setActiveFont(designOpt.defaultFont)
      }
    }
  }, [activeDesign, userOverridden])

  const setFont = useCallback((font: FontPairingId) => {
    setActiveFont(font)
    setUserOverridden(true)
    window.localStorage.setItem(STORAGE_KEY, font)
  }, [])

  // Handle uploading a custom font
  const setCustomFont = useCallback(async (file: File, familyName: string) => {
    try {
      const url = URL.createObjectURL(file)
      const font = new FontFace(familyName, `url(${url})`)
      await font.load()
      document.fonts.add(font)
      
      const familyStr = `"${familyName}", sans-serif`
      setCustomFontFamilies({
        heading: familyStr,
        sans: familyStr,
        mono: familyStr, // just use same for mono for simplicity, or keep default
      })
      setFont("custom")
    } catch (err: any) {
      console.error("Failed to load custom font", err)
      alert("Failed to load font: " + err?.message)
    }
  }, [setFont])

  // Apply CSS vars and Google Fonts
  useEffect(() => {
    if (overrideValue !== undefined) return
    const pairing = fontPairings[activeFont]
    if (!pairing) return

    // Inject google font if provided
    let linkId = "dynamic-google-font"
    let linkElement = document.getElementById(linkId) as HTMLLinkElement | null

    if (pairing.googleFontUrl) {
      if (!linkElement) {
        linkElement = document.createElement("link")
        linkElement.id = linkId
        linkElement.rel = "stylesheet"
        document.head.appendChild(linkElement)
      }
      linkElement.href = pairing.googleFontUrl
    } else if (linkElement) {
      linkElement.remove()
    }

    // Apply CSS custom properties via injected <style> block for max specificity
    let styleId = "dynamic-font-overrides"
    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null

    if (!styleElement) {
      styleElement = document.createElement("style")
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    if (activeFont === "custom" && customFontFamilies) {
      styleElement.innerHTML = `
        :root {
          --font-heading: ${customFontFamilies.heading} !important;
          --font-sans: ${customFontFamilies.sans} !important;
          --font-mono: ${customFontFamilies.mono} !important;
        }
        body, .font-sans { font-family: ${customFontFamilies.sans} !important; }
        .font-heading { font-family: ${customFontFamilies.heading} !important; }
        .font-mono { font-family: ${customFontFamilies.mono} !important; }
      `
    } else {
      styleElement.innerHTML = `
        :root {
          --font-heading: ${pairing.headingFamily} !important;
          --font-sans: ${pairing.sansFamily} !important;
          --font-mono: ${pairing.monoFamily} !important;
        }
        body, .font-sans { font-family: ${pairing.sansFamily} !important; }
        .font-heading { font-family: ${pairing.headingFamily} !important; }
        .font-mono { font-family: ${pairing.monoFamily} !important; }
      `
    }
  }, [activeFont, customFontFamilies, overrideValue])

  return (
    <FontContext.Provider value={{ activeFont: overrideValue !== undefined ? overrideValue : activeFont, setFont, customFontFamilies, setCustomFont }}>
      {children}
    </FontContext.Provider>
  )
}

export function useFont() {
  const ctx = useContext(FontContext)
  if (!ctx) throw new Error("useFont must be used within FontProvider")
  return ctx
}
