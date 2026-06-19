const fs = require('fs');

let text = fs.readFileSync('components/design-controls.tsx', 'utf8');

const targetStr = `<div className="hidden md:block w-px h-6 bg-white/20 shrink-0" />

            {/* Generate Controls */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">`;

const replacementStr = `{!isStandalone && (
              <div className="hidden md:block w-px h-6 bg-white/20 shrink-0" />
            )}

            {/* Generate Controls */}
            {!isStandalone && (
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">`;

text = text.replace(targetStr, replacementStr);

// We need to close the `{!isStandalone && (` wrapper.
// Let's find the end of the Generate Controls block.
// It ends with: `<input type="file" ref={imageFileInputRef} ... />` followed by `</div>`

const targetEndStr = `onChange={handleExtractImage}
                />
              </div>`;

const replacementEndStr = `onChange={handleExtractImage}
                />
              </div>
            )}`;

text = text.replace(targetEndStr, replacementEndStr);

fs.writeFileSync('components/design-controls.tsx', text);
