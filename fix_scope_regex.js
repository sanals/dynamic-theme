const fs = require('fs');
let text = fs.readFileSync('components/design-controls.tsx', 'utf8');

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
    setMapperMappings({ ...mapperMappings, ...mapped })
  }

`;

// Use regex to insert right before the main return statement
text = text.replace(/(\s*)(return\s*\(\s*<div[^>]*className="relative flex flex-col gap-3\.5 items-center w-full")/, (match, whitespace, rest) => {
  return whitespace + handlers + whitespace + rest;
});

fs.writeFileSync('components/design-controls.tsx', text);
