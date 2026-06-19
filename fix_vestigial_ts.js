const fs = require('fs');

let text = fs.readFileSync('components/design-controls.tsx', 'utf8');

// Fix setDesign
text = text.replace(
  `const setDesign = () => {}`,
  `const setDesign = (id: string) => {}`
);

// Fix the useEffect that checks pair.dark
text = text.replace(
  `  // Sync active theme with lastDefaultPalettes when a built-in theme is active
  useEffect(() => {
    if (theme && theme !== "custom-palette") {
      const pair = darkLightPairs[activeDesign]
      if (theme === pair.dark || theme === pair.light) {
        setLastDefaultPalettes((prev) => ({
          ...prev,
          [activeDesign]: theme as ColorPalette,
        }))
      }
    }
  }, [theme, activeDesign])`,
  `  // Sync active theme removed for standalone widget`
);

// Fix handleDesignChange
text = text.replace(
  `  const handleDesignChange = (newDesignId: DesignId) => {
    setDesign(newDesignId)
    if (theme !== "custom-palette") {
      setTheme(lastDefaultPalettes[newDesignId])
    }
  }`,
  `  const handleDesignChange = (newDesignId: DesignId) => {
    setDesign(newDesignId)
  }`
);

// Fix dark mode toggle
text = text.replace(
  `              {theme !== "custom-palette" && (() => {
                const pair = darkLightPairs[activeDesign]
                const isDark = theme === pair.dark
                return (
                  <button
                    onClick={() => setTheme(isDark ? pair.light : pair.dark)}
                    title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    className="h-6 w-6 flex items-center justify-center rounded bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                  </button>
                )
              })()}`,
  `              {/* Dark mode toggle removed for standalone widget */}`
);

fs.writeFileSync('components/design-controls.tsx', text);
