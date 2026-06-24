const fs = require('fs');
const path = require('path');

const rteSource = `
// --- Premium Rich Text Editor ---
function RichTextEditor({ value, onChange, placeholder, editorClassName }: { value: string, onChange: (val: string) => void, placeholder: string, editorClassName?: string }) {
  const editorRef = import("react").then(m => m.useRef<HTMLDivElement>(null));
  // We need to use React.useRef since it's not imported. Wait, I will just use the standard one and import it.
  // Actually, I can just copy the exact RTE from projects/new/page.tsx
}
`;
// Instead of hardcoding, I'll read projects/new/page.tsx, extract RichTextEditor, and inject it.

const projectNewFile = fs.readFileSync('f:/Antigravity/Global Construction/src/app/admin/content/projects/new/page.tsx', 'utf8');
const rteMatch = projectNewFile.match(/\/\/ --- Premium Rich Text Editor ---\nfunction RichTextEditor[\s\S]*?return \([\s\S]*?\);\n\}/);

if (!rteMatch) {
  console.error("Could not find RichTextEditor in projects/new/page.tsx");
  process.exit(1);
}

const rteCode = rteMatch[0];

const faqPaths = [
  'src/app/admin/content/faq/new/page.tsx',
  'src/app/admin/content/faq/edit/[id]/page.tsx'
];

for (const p of faqPaths) {
  const fullPath = path.join('f:/Antigravity/Global Construction', p);
  let content = fs.readFileSync(fullPath, 'utf8');

  // 1. Add Lucide imports
  content = content.replace(/import \{([^}]+)\} from "lucide-react";/, (match, p1) => {
    return `import {${p1}, Bold, Italic, AlignLeft, AlignCenter, AlignJustify, Link as LinkIcon, List, ListOrdered } from "lucide-react";`;
  });

  // 2. Add useRef and useEffect if not present
  content = content.replace(/import \{([^}]+)\} from "react";/, (match, p1) => {
    let newImports = p1;
    if (!newImports.includes('useRef')) newImports += ', useRef';
    if (!newImports.includes('useEffect')) newImports += ', useEffect';
    return `import {${newImports}} from "react";`;
  });

  // 3. Inject RichTextEditor before the default export
  if (!content.includes('function RichTextEditor')) {
    content = content.replace(/export default function/, `${rteCode}\n\nexport default function`);
  }

  // 4. Replace <textarea ... /> with <RichTextEditor ... />
  const textareaRegex = /<textarea value={answer} onChange={\(e\) => setAnswer\(e\.target\.value\)}[^>]*\/>/;
  content = content.replace(textareaRegex, `<RichTextEditor value={answer} onChange={setAnswer} placeholder="Skriv det informativa svaret här..." editorClassName="text-base text-gray-600 leading-relaxed min-h-[120px]" />`);

  // 5. Replace preview rendering <p className="...">{answer}</p> with dangerouslySetInnerHTML
  const previewRegex = /<p className="([^"]*)">\{answer\}<\/p>/;
  content = content.replace(previewRegex, `<div className="$1 editor-content" dangerouslySetInnerHTML={{ __html: answer || 'Här dyker det informativa svaret upp exakt som det kommer se ut när en besökare klickar på frågan på hemsidan.' }} />`);

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${p}`);
}
