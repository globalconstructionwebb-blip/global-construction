const fs = require('fs');
const path = require('path');

const rteCode = `
// --- Premium Rich Text Editor ---
function RichTextEditor({ value, onChange, placeholder, editorClassName }: { value: string, onChange: (val: string) => void, placeholder: string, editorClassName?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500 transition-all bg-white relative shadow-sm">
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-gray-50/80 border-b border-gray-200">
        <button type="button" onClick={() => executeCommand('bold')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Fetstilt"><Bold className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => executeCommand('italic')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Kursiv"><Italic className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => executeCommand('insertUnorderedList')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Punktlista"><List className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => executeCommand('insertOrderedList')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Numrerad lista"><ListOrdered className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => executeCommand('justifyLeft')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Vänsterjustera"><AlignLeft className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => executeCommand('justifyCenter')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Centrera"><AlignCenter className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => executeCommand('justifyFull')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Marginaljustera"><AlignJustify className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => {
          const url = prompt('Länk URL (inklusive https://):');
          if (url) executeCommand('createLink', url);
        }} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Infoga länk"><LinkIcon className="w-3.5 h-3.5" /></button>
      </div>
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className={\`p-4 outline-none font-outfit editor-content \${editorClassName || 'min-h-[120px] text-gray-700 leading-relaxed'}\`}
        data-placeholder={placeholder}
      />
    </div>
  );
}
`;

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
  const textareaRegex = /<textarea value=\{answer\} onChange=\{\(e\) => setAnswer\(e\.target\.value\)\}[^>]*\/>/;
  content = content.replace(textareaRegex, `<RichTextEditor value={answer} onChange={setAnswer} placeholder="Skriv det informativa svaret här..." editorClassName="text-base text-gray-600 leading-relaxed min-h-[120px]" />`);

  // 5. Replace preview rendering <p className="...">{answer}</p> with dangerouslySetInnerHTML
  const previewRegex = /<p className="([^"]*)">\{answer\}<\/p>/;
  content = content.replace(previewRegex, `<div className="$1 editor-content" dangerouslySetInnerHTML={{ __html: answer || 'Här dyker det informativa svaret upp exakt som det kommer se ut när en besökare klickar på frågan på hemsidan.' }} />`);

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${p}`);
}
