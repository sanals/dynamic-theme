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
    // Merge with existing so we don't clear manual overrides unless they are automatically found
    setMapperMappings({ ...mapperMappings, ...mapped })
  }
`;

// Remove from old location
text = text.replace(handlers, '');

// Insert before the DesignControls return
text = text.replace(
`  return (
    <div className="relative flex flex-col gap-3.5 items-center w-full">`,
handlers + `\n  return (
    <div className="relative flex flex-col gap-3.5 items-center w-full">`
);

fs.writeFileSync('components/design-controls.tsx', text);
