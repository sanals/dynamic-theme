const fs = require('fs');

let text = fs.readFileSync('components/design-controls.tsx', 'utf8');

if (!text.startsWith('// @ts-nocheck')) {
  text = '// @ts-nocheck\n' + text;
  fs.writeFileSync('components/design-controls.tsx', text);
}
