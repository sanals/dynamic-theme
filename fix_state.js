const fs = require('fs');
let text = fs.readFileSync('components/design-controls.tsx', 'utf8');

text = text.replace(/const \[isGeneratingAi, setIsGeneratingAi\] = useState\(false\)\s*const fontFileInputRef = useRef<HTMLInputElement>\(null\)/, `const [isGeneratingAi, setIsGeneratingAi] = useState(false)\n  const fontFileInputRef = useRef<HTMLInputElement>(null)\n  const [detectedVariables, setDetectedVariables] = useState<string[]>([])`);

fs.writeFileSync('components/design-controls.tsx', text);
