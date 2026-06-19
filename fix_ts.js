const fs = require('fs');

// 1. Fix design-controls.tsx destructuring and missing imports
let dcText = fs.readFileSync('components/design-controls.tsx', 'utf8');

dcText = dcText.replace(
`  const {
    mode,
    setMode,
    mapperMappings,
    setMapperMappings,
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
  } = useCustomPalette()`,
`  const {
    mode,
    setMode,
    mapperMappings,
    setMapperMappings,
    customColors,
    setCustomColor,
    applyBulkColors,
    resetCustomColors,
    swapColors,
    lockedColors,
    setLockedColors,
    toggleLock,
    undo,
    redo,
    canUndo,
    canRedo,
    customRadius,
    setCustomRadius
  } = useCustomPalette()`
);

dcText = dcText.replace(
`  const theme = mode === "custom" ? "custom-palette" : "default"
  const setTheme = () => {}`,
`  const theme = mode === "custom" ? "custom-palette" : "default"
  const setTheme = (t: string) => {}`
);

// Check if extractHostVariables is actually imported. Wait, in my previous script I used:
// text = text.replace(`import { autoFixContrast } from "@/lib/color-utils"`, `import { autoFixContrast } from "@/lib/color-utils"\nimport { extractHostVariables, autoMapVariables } from "@/src/widget/utils/css-parser"`)
// If autoFixContrast wasn't there, it might have failed. Let's explicitly inject the import at the top.

if (!dcText.includes('extractHostVariables')) {
  // It shouldn't be missing if the buttons are there, but let's make sure it is imported
}
dcText = dcText.replace(
  `import { autoFixContrast } from "@/lib/color-utils"`,
  `import { autoFixContrast } from "@/lib/color-utils"\nimport { extractHostVariables, autoMapVariables } from "@/src/widget/utils/css-parser"`
);

// Wait, if autoFixContrast was removed previously, let's inject at the top:
if (!dcText.includes('import { extractHostVariables, autoMapVariables }')) {
  dcText = `import { extractHostVariables, autoMapVariables } from "@/src/widget/utils/css-parser"\n` + dcText;
}

fs.writeFileSync('components/design-controls.tsx', dcText);

// 2. Fix palette-generator.ts
let pgText = fs.readFileSync('lib/palette-generator.ts', 'utf8');
pgText = pgText.replace(
  `import { CustomColors } from "@/components/providers/custom-palette-provider"`,
  `import { CustomColors } from "@/src/widget/WidgetStateProvider"`
);
fs.writeFileSync('lib/palette-generator.ts', pgText);

// 3. Fix comparison-provider.tsx
let cpText = fs.readFileSync('src/widget/comparison-provider.tsx', 'utf8');
cpText = cpText.replace(
  `import { CustomColors } from "./custom-palette-provider"`,
  `import { CustomColors } from "./WidgetStateProvider"`
);
fs.writeFileSync('src/widget/comparison-provider.tsx', cpText);

