const fs = require('fs');

let text = fs.readFileSync('components/design-controls.tsx', 'utf8');

// 1. Update css-parser import
text = text.replace(
  `import { extractHostVariables, autoMapVariables } from "@/src/widget/utils/css-parser"`,
  `import { extractHostVariables, autoMapVariables, findVariableForElement } from "@/src/widget/utils/css-parser"`
);

// 2. Update lucide-react import
text = text.replace(
  `, Search } from "lucide-react"`,
  `, Search, Crosshair } from "lucide-react"`
);

// 3. Add activePickerToken state
text = text.replace(
  `const [detectedVariables, setDetectedVariables] = useState<string[]>([])`,
  `const [detectedVariables, setDetectedVariables] = useState<string[]>([])\n  const [activePickerToken, setActivePickerToken] = useState<string | null>(null)`
);

// 4. Add picker logic (useEffect)
const pickerLogic = `
  // DOM Element Picker Logic
  useEffect(() => {
    if (!activePickerToken) return

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Don't highlight widget elements
      if (target.closest('.theme-widget-container')) return
      
      target.setAttribute('data-picker-highlight', 'true')
      target.style.outline = '2px solid #a855f7'
      target.style.outlineOffset = '2px'
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.hasAttribute('data-picker-highlight')) {
        target.removeAttribute('data-picker-highlight')
        target.style.outline = ''
        target.style.outlineOffset = ''
      }
    }

    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      const target = e.target as HTMLElement
      if (target.closest('.theme-widget-container')) return

      // Clean up outline immediately
      handleMouseOut(e)

      // Ensure we have scanned variables
      let vars = detectedVariables
      if (vars.length === 0) {
        vars = extractHostVariables()
        setDetectedVariables(vars)
      }

      const match = findVariableForElement(target, activePickerToken, vars)
      if (match) {
        setMapperMappings(prev => ({ ...prev, [activePickerToken]: match }))
      } else {
        alert(\`Could not confidently determine the \${activePickerToken} variable for this element.\`)
      }

      setActivePickerToken(null)
    }

    // Capture true to run before react handlers
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('mouseout', handleMouseOut, true)
    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('mouseout', handleMouseOut, true)
      document.removeEventListener('click', handleClick, true)
      
      // Cleanup any lingering outlines
      document.querySelectorAll('[data-picker-highlight]').forEach(el => {
        (el as HTMLElement).removeAttribute('data-picker-highlight');
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
      })
    }
  }, [activePickerToken, detectedVariables])
`;

// Insert the picker logic before the return statement
text = text.replace(
  `  const handleAutoMap = () => {`,
  pickerLogic + `\n  const handleAutoMap = () => {`
);

// 5. Update UI inputs
// Object.keys loop
const oldInputHTML = `<input
                    type="text"
                    placeholder="--var-name"
                    value={mapperMappings[key] || ""}
                    onChange={(e) => setMapperMappings({ ...mapperMappings, [key]: e.target.value })}
                    className="h-6 w-full text-[10px] bg-black/20 border border-white/10 rounded px-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    list="detected-vars"
                  />`;

const newInputHTML = `<div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="--var-name"
                      value={mapperMappings[key] || ""}
                      onChange={(e) => setMapperMappings({ ...mapperMappings, [key]: e.target.value })}
                      className="h-6 flex-1 min-w-0 text-[10px] bg-black/20 border border-white/10 rounded px-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      list="detected-vars"
                    />
                    <button
                      type="button"
                      onClick={() => setActivePickerToken(key === activePickerToken ? null : key)}
                      title="Pick element from page"
                      className={\`h-6 w-6 flex items-center justify-center shrink-0 rounded transition-colors \${activePickerToken === key ? 'bg-primary text-primary-foreground' : 'bg-foreground/5 hover:bg-foreground/10 text-muted-foreground'}\`}
                    >
                      <Crosshair className="size-3" />
                    </button>
                  </div>`;
                  
text = text.replace(oldInputHTML, newInputHTML);

// Radius input
const oldRadiusHTML = `<input
                    type="text"
                    placeholder="--radius"
                    value={mapperMappings['radius'] || ""}
                    onChange={(e) => setMapperMappings({ ...mapperMappings, ['radius']: e.target.value })}
                    className="h-6 w-full text-[10px] bg-black/20 border border-white/10 rounded px-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />`;

const newRadiusHTML = `<div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="--radius"
                      value={mapperMappings['radius'] || ""}
                      onChange={(e) => setMapperMappings({ ...mapperMappings, ['radius']: e.target.value })}
                      className="h-6 flex-1 min-w-0 text-[10px] bg-black/20 border border-white/10 rounded px-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      list="detected-vars"
                    />
                    <button
                      type="button"
                      onClick={() => setActivePickerToken('radius' === activePickerToken ? null : 'radius')}
                      title="Pick element from page"
                      className={\`h-6 w-6 flex items-center justify-center shrink-0 rounded transition-colors \${activePickerToken === 'radius' ? 'bg-primary text-primary-foreground' : 'bg-foreground/5 hover:bg-foreground/10 text-muted-foreground'}\`}
                    >
                      <Crosshair className="size-3" />
                    </button>
                  </div>`;

text = text.replace(oldRadiusHTML, newRadiusHTML);

// 6. Add visual indicator if picker is active
const oldReturn = `return (
    <div className="relative flex flex-col gap-3.5 items-center w-full">`;
    
const newReturn = `return (
    <div className={\`relative flex flex-col gap-3.5 items-center w-full theme-widget-container \${activePickerToken ? 'pointer-events-auto' : ''}\`}>
      {activePickerToken && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-full shadow-2xl animate-bounce pointer-events-none">
          Click an element on the page to pick variable for {activePickerToken} (Press ESC to cancel)
        </div>
      )}`;

text = text.replace(oldReturn, newReturn);

// Also add a listener for ESC to cancel picker
text = text.replace(
  `// Capture true to run before react handlers`,
  `const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePickerToken(null)
      }
    }
    document.addEventListener('keydown', handleEsc, true)
    
    // Capture true to run before react handlers`
);
text = text.replace(
  `document.removeEventListener('click', handleClick, true)`,
  `document.removeEventListener('click', handleClick, true)\n      document.removeEventListener('keydown', handleEsc, true)`
);

fs.writeFileSync('components/design-controls.tsx', text);
