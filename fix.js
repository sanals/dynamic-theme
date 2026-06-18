const fs = require('fs');
let content = fs.readFileSync('components/design-controls.tsx', 'utf8');

// 1. Replace imports
content = content.replace(/import \{ useTheme \} from "next-themes"\r?\n/, '');
content = content.replace(/import \{ useDesign \} from "@\/components\/providers\/design-provider"\r?\n/, '');
content = content.replace(/import \{ useFont \} from "@\/components\/providers\/font-provider"/, 'import { useFont } from "@/src/widget/font-provider"');
content = content.replace(/import \{ useCustomPalette, type CustomColors \} from "@\/components\/providers\/custom-palette-provider"/, 'import { useCustomPalette, type CustomColors } from "@/src/widget/WidgetStateProvider"');
content = content.replace(/import \{ useComparison, type Snapshot \} from "@\/components\/providers\/comparison-provider"/, 'import { useComparison, type Snapshot } from "@/src/widget/comparison-provider"');

// 2. Add dummy variables and mode to useCustomPalette
content = content.replace(
/const \{ theme, setTheme: _setTheme \} = useTheme\(\)[\s\S]*?canRedo\r?\n\s*\} = useCustomPalette\(\)/,
`const {
    mode,
    setMode,
    customColors,
    setCustomColor,
    applyBulkColors,
    swapColors,
    lockedColors,
    toggleLock,
    undo,
    redo,
    canUndo,
    canRedo,
    customRadius,
    setCustomRadius
  } = useCustomPalette()
  
  const { activeFont, setFont, setCustomFont, customFontName, dynamicGoogleFontName, setDynamicGoogleFont } = useFont()
  
  const theme = mode === "custom" ? "custom-palette" : "default"
  const setTheme = () => {}
  const activeDesign = "gallery" as any
  const setDesign = () => {}`
);

// 3. Fix the Palette Segmented component
content = content.replace(
/<Segmented<"default" \| "custom">[\s\S]*?value=\{mounted \? \(theme === "custom-palette" \? "custom" : "default"\) : undefined\}[\s\S]*?onChange=\{\(val\) => \{[\s\S]*?\}\}[\s\S]*?\/>/,
`<Segmented<"default" | "custom">
            label="Palette"
            icon={<Palette className="size-3.5" aria-hidden />}
            options={[
              { id: "default", label: "Default" },
              { id: "custom", label: "Custom" },
            ]}
            value={mounted ? mode : undefined}
            onChange={(val) => {
              setMode(val as "default" | "custom")
            }}
          />`
);

// 4. Remove Segmented DesignId conditionally rendered
content = content.replace(/\{!isStandalone && \(\s*<Segmented<DesignId>[\s\S]*?\/>\n\s*\)\}/, "");

fs.writeFileSync('components/design-controls.tsx', content);
console.log('done');
