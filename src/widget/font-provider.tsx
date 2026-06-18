"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { FontPairingId, fontPairings } from "@/lib/font-config"

interface FontContextValue {
  activeFont: FontPairingId | "dynamic-google"
  setFont: (font: FontPairingId | "dynamic-google") => void
  customFontFamilies: { heading: string; sans: string; mono: string } | null
  setCustomFont: (files: File[], familyName: string) => Promise<void>
  customFontName: string | null
  dynamicGoogleFontName: string | null
  setDynamicGoogleFont: (fontName: string) => void
}

const FontContext = createContext<FontContextValue | null>(null)

const STORAGE_KEY = "active-font-pairing"
const STORAGE_DYNAMIC_KEY = "dynamic-google-font-name"

export function FontProvider({ children, overrideValue }: { children: React.ReactNode; overrideValue?: FontPairingId | "dynamic-google" }) {
  const [activeFont, setActiveFont] = useState<FontPairingId | "dynamic-google">("geist")
  const [customFontFamilies, setCustomFontFamilies] = useState<{ heading: string; sans: string; mono: string } | null>(null)
  const [customFontName, setCustomFontName] = useState<string | null>(null)
  const [dynamicGoogleFontName, setDynamicGoogleFontName] = useState<string | null>(null)
  const [userOverridden, setUserOverridden] = useState(false)

  // Load from local storage
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      if (stored === "dynamic-google") {
        const dynamicStored = window.localStorage.getItem(STORAGE_DYNAMIC_KEY)
        if (dynamicStored) {
          setDynamicGoogleFontName(dynamicStored)
          setActiveFont("dynamic-google")
          setUserOverridden(true)
        }
      } else if (fontPairings[stored as FontPairingId]) {
        setActiveFont(stored as FontPairingId)
        setUserOverridden(true)
      }
    }
  }, [])

  const setFont = useCallback((font: FontPairingId | "dynamic-google") => {
    setActiveFont(font)
    setUserOverridden(true)
    window.localStorage.setItem(STORAGE_KEY, font)
  }, [])

  const setDynamicGoogleFont = useCallback((fontName: string) => {
    setDynamicGoogleFontName(fontName)
    setFont("dynamic-google")
    window.localStorage.setItem(STORAGE_DYNAMIC_KEY, fontName)
  }, [setFont])

  // Handle uploading multiple custom font files (for different weights/styles)
  const setCustomFont = useCallback(async (files: File[], familyName: string) => {
    try {
      const loadPromises = files.map(async (file) => {
        const url = URL.createObjectURL(file)
        const name = file.name.toLowerCase()
        
        let weight = "400"
        if (name.includes("thin") || name.includes("hairline")) weight = "100"
        else if (name.includes("extralight") || name.includes("ultralight")) weight = "200"
        else if (name.includes("light")) weight = "300"
        else if (name.includes("medium")) weight = "500"
        else if (name.includes("semibold") || name.includes("demibold")) weight = "600"
        else if (name.includes("extrabold") || name.includes("ultrabold")) weight = "800"
        else if (name.includes("black") || name.includes("heavy")) weight = "900"
        else if (name.includes("bold")) weight = "700"
  
        let style = "normal"
        if (name.includes("italic") || name.includes("oblique")) style = "italic"
  
        const font = new FontFace(familyName, `url(${url})`, { weight, style })
        await font.load()
        document.fonts.add(font)
      })
      
      await Promise.all(loadPromises)
      
      const familyStr = `"${familyName}", sans-serif`
      setCustomFontFamilies({
        heading: familyStr,
        sans: familyStr,
        mono: familyStr, // just use same for mono for simplicity, or keep default
      })
      setCustomFontName(familyName)
      setFont("custom")
    } catch (err: any) {
      console.error("Failed to load custom font", err)
      alert("Failed to load font: " + err?.message)
    }
  }, [setFont])

  // Apply CSS vars and Google Fonts
  useEffect(() => {
    if (overrideValue !== undefined) return

    let googleFontUrl = ""
    let headingFamily = ""
    let sansFamily = ""
    let monoFamily = ""

    if (activeFont === "dynamic-google" && dynamicGoogleFontName) {
      googleFontUrl = `https://fonts.googleapis.com/css2?family=${dynamicGoogleFontName.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`
      headingFamily = `"${dynamicGoogleFontName}", sans-serif`
      sansFamily = `"${dynamicGoogleFontName}", sans-serif`
      monoFamily = `"${dynamicGoogleFontName}", monospace`
    } else {
      const pairing = fontPairings[activeFont as FontPairingId]
      if (pairing) {
        googleFontUrl = pairing.googleFontUrl || ""
        headingFamily = pairing.headingFamily
        sansFamily = pairing.sansFamily
        monoFamily = pairing.monoFamily
      }
    }

    // Inject google font if provided
    let linkId = "dynamic-google-font"
    let linkElement = document.getElementById(linkId) as HTMLLinkElement | null

    if (googleFontUrl) {
      if (!linkElement) {
        linkElement = document.createElement("link")
        linkElement.id = linkId
        linkElement.rel = "stylesheet"
        document.head.appendChild(linkElement)
      }
      linkElement.href = googleFontUrl
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
          --font-heading: ${headingFamily} !important;
          --font-sans: ${sansFamily} !important;
          --font-mono: ${monoFamily} !important;
        }
        body, .font-sans { font-family: ${sansFamily} !important; }
        .font-heading { font-family: ${headingFamily} !important; }
        .font-mono { font-family: ${monoFamily} !important; }
      `
    }
  }, [activeFont, customFontFamilies, overrideValue, dynamicGoogleFontName])

  return (
    <FontContext.Provider value={{ activeFont: overrideValue !== undefined ? overrideValue : activeFont, setFont, customFontFamilies, setCustomFont, customFontName, dynamicGoogleFontName, setDynamicGoogleFont }}>
      {children}
    </FontContext.Provider>
  )
}

export function useFont() {
  const ctx = useContext(FontContext)
  if (!ctx) throw new Error("useFont must be used within FontProvider")
  return ctx
}
