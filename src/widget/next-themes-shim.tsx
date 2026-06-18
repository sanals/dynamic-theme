"use client"
import React, { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext<{ theme: string; setTheme: (theme: string) => void }>({
  theme: "custom-palette",
  setTheme: () => {}
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("custom-palette")
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
