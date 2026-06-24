const fs = require('fs');
const path = require('path');

const paths = [
  'src/app/admin/content/blog/edit/[id]/page.tsx',
  'src/app/admin/content/blog/new/page.tsx',
  'src/app/admin/content/jobs/edit/[id]/page.tsx',
  'src/app/admin/content/jobs/new/page.tsx',
  'src/app/admin/content/projects/edit/[id]/page.tsx',
  'src/app/admin/content/projects/new/page.tsx'
];

for (const p of paths) {
  const fullPath = path.join('f:/Antigravity/Global Construction', p);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // 1. Add List, ListOrdered to lucide-react import
  content = content.replace(/import \{([^}]+)\} from "lucide-react";/, (match, p1) => {
    if (!p1.includes('ListOrdered')) {
      return `import {${p1}, List, ListOrdered } from "lucide-react";`;
    }
    return match;
  });

  // 2. Add the buttons to RichTextEditor
  const targetBtn = `<button type="button" onClick={() => executeCommand('italic')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Kursiv"><Italic className="w-3.5 h-3.5" /></button>`;
  const listBtns = `
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => executeCommand('insertUnorderedList')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Punktlista"><List className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => executeCommand('insertOrderedList')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Numrerad lista"><ListOrdered className="w-3.5 h-3.5" /></button>`;
  
  if (!content.includes('insertUnorderedList')) {
    content = content.replace(targetBtn, targetBtn + listBtns);
  }
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${p}`);
}
