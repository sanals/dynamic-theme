const fs = require('fs');
let text = fs.readFileSync('components/design-controls.tsx', 'utf8');

text = text.replace(
  '} from "lucide-react"',
  ', Search } from "lucide-react"'
);

fs.writeFileSync('components/design-controls.tsx', text);
