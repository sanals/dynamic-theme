const fs = require('fs');
let text = fs.readFileSync('components/design-controls.tsx', 'utf8');

// 1. Destructure mapperMappings and setMapperMappings from useCustomPalette
text = text.replace(
`  const {
    mode,
    setMode,
    customColors,`,
`  const {
    mode,
    setMode,
    mapperMappings,
    setMapperMappings,
    customColors,`
);

// 2. Update Segmented component
text = text.replace(
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
          />`,
`<Segmented<"default" | "custom" | "mapper">
            label="Palette Engine"
            icon={<Palette className="size-3.5" aria-hidden />}
            options={[
              { id: "default", label: "Default" },
              { id: "custom", label: "Custom" },
              { id: "mapper", label: "Mapper" },
            ]}
            value={mounted ? mode : undefined}
            onChange={(val) => {
              setMode(val as "default" | "custom" | "mapper")
            }}
          />`
);

// 3. Add Mapper UI above Presets Library
const mapperUI = `
        {/* Mapper Configuration UI */}
        {mounted && mode === "mapper" && (
          <div className="flex flex-col gap-3 w-full px-1 py-3 border-t border-border/20">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Variable Mappings</span>
              <span className="text-[9px] text-muted-foreground bg-foreground/5 px-2 rounded-full py-0.5 border border-foreground/10">Map our tokens to your CSS variables (e.g., --brand-color)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.keys(customColors).map(key => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-[9px] text-muted-foreground uppercase tracking-wide truncate">{key}</label>
                  <input
                    type="text"
                    placeholder="--var-name"
                    value={mapperMappings[key] || ""}
                    onChange={(e) => setMapperMappings({ ...mapperMappings, [key]: e.target.value })}
                    className="h-6 w-full text-[10px] bg-black/20 border border-white/10 rounded px-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-muted-foreground uppercase tracking-wide truncate">border-radius</label>
                  <input
                    type="text"
                    placeholder="--radius"
                    value={mapperMappings['radius'] || ""}
                    onChange={(e) => setMapperMappings({ ...mapperMappings, ['radius']: e.target.value })}
                    className="h-6 w-full text-[10px] bg-black/20 border border-white/10 rounded px-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
            </div>
          </div>
        )}
`;

text = text.replace(
`          {/* Presets Library */}`,
mapperUI + `          {/* Presets Library */}`
);

// 4. Update the bottom section conditionally rendered on `theme === "custom-palette"` to instead render on `mode === "custom" || mode === "mapper"`
// Actually, earlier we replaced `theme === "custom-palette"` logic with `mode` mapping, wait, let's just check what the condition is
text = text.replace(
`{mounted && theme === "custom-palette" && (`,
`{mounted && (mode === "custom" || mode === "mapper") && (`
);

fs.writeFileSync('components/design-controls.tsx', text);
