const fs = require('fs');
let text = fs.readFileSync('components/design-controls.tsx', 'utf8');

// 1. Add imports
text = text.replace(
`import { autoFixContrast } from "@/lib/color-utils"`,
`import { autoFixContrast } from "@/lib/color-utils"
import { extractHostVariables, autoMapVariables } from "@/src/widget/utils/css-parser"`
);

text = text.replace(
`import { Palette, Play, Eye, RotateCcw, MonitorPlay, Save, Check, X, Code, MousePointer2 } from "lucide-react"`,
`import { Palette, Play, Eye, RotateCcw, MonitorPlay, Save, Check, X, Code, MousePointer2, Wand2, Search } from "lucide-react"`
);

// 2. Add state inside DesignControls component
text = text.replace(
`  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const fontFileInputRef = useRef<HTMLInputElement>(null)`,
`  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const fontFileInputRef = useRef<HTMLInputElement>(null)
  const [detectedVariables, setDetectedVariables] = useState<string[]>([])`
);

// 3. Add handler functions (insert before return)
const handlers = `
  const handleScanVariables = () => {
    const vars = extractHostVariables()
    setDetectedVariables(vars)
  }

  const handleAutoMap = () => {
    let vars = detectedVariables
    if (vars.length === 0) {
      vars = extractHostVariables()
      setDetectedVariables(vars)
    }
    const mapped = autoMapVariables(vars)
    // Merge with existing so we don't clear manual overrides unless they are automatically found
    setMapperMappings({ ...mapperMappings, ...mapped })
  }
`;

text = text.replace(
`  return (`,
handlers + `\n  return (`
);

// 4. Update Mapper UI
const oldMapperUI = `<div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Variable Mappings</span>
              <span className="text-[9px] text-muted-foreground bg-foreground/5 px-2 rounded-full py-0.5 border border-foreground/10">Map our tokens to your CSS variables (e.g., --brand-color)</span>
            </div>`;

const newMapperUI = `<div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Variable Mappings</span>
                <span className="text-[9px] text-muted-foreground bg-foreground/5 px-2 rounded-full py-0.5 border border-foreground/10">Map our tokens to your CSS variables</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleScanVariables}
                  title="Scan page for CSS variables"
                  className="flex items-center gap-1 px-2 py-1 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded transition-colors text-[9px] text-foreground font-medium"
                >
                  <Search className="size-3" />
                  Scan Variables
                </button>
                <button
                  type="button"
                  onClick={handleAutoMap}
                  title="Auto-detect and map matching variables"
                  className="flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 rounded transition-colors text-[9px] font-medium"
                >
                  <Wand2 className="size-3" />
                  Auto-Map
                </button>
              </div>
            </div>`;

text = text.replace(oldMapperUI, newMapperUI);

// 5. Add datalist and update inputs
const oldInput1 = `className="h-6 w-full text-[10px] bg-black/20 border border-white/10 rounded px-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />`;
const newInput1 = `className="h-6 w-full text-[10px] bg-black/20 border border-white/10 rounded px-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      list="detected-vars"
                    />`;

text = text.replace(new RegExp(oldInput1.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g'), newInput1);

const oldRadiusInput = `className="h-6 w-full text-[10px] bg-black/20 border border-white/10 rounded px-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />`;
const newRadiusInput = `className="h-6 w-full text-[10px] bg-black/20 border border-white/10 rounded px-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    list="detected-vars"
                  />`;

text = text.replace(oldRadiusInput, newRadiusInput);

// Add the datalist block before the grid
const datalistBlock = `
            <datalist id="detected-vars">
              {detectedVariables.map(v => <option key={v} value={v} />)}
            </datalist>
`;
text = text.replace(`<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">`, datalistBlock + `<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">`);

fs.writeFileSync('components/design-controls.tsx', text);
