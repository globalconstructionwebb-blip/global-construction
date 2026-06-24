const fs = require('fs');

const paths = [
  'src/app/admin/content/blog/edit/[id]/page.tsx',
  'src/app/admin/content/blog/new/page.tsx',
  'src/app/admin/content/jobs/edit/[id]/page.tsx',
  'src/app/admin/content/jobs/new/page.tsx',
  'src/app/admin/content/projects/edit/[id]/page.tsx',
  'src/app/admin/content/projects/new/page.tsx',
  'src/app/admin/content/faq/edit/[id]/page.tsx',
  'src/app/admin/content/faq/new/page.tsx'
];

const externalLinkCode = `
        <button type="button" onClick={() => {
          const url = prompt('Extern länk URL (inklusive https://):');
          if (url) {
            const id = 'ext-link-' + Date.now();
            document.execCommand('createLink', false, id);
            const links = editorRef.current?.querySelectorAll(\`a[href="\${id}"]\`);
            if (links && links.length > 0) {
              links.forEach(link => {
                link.setAttribute('href', url);
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
              });
            } else {
              document.execCommand('insertHTML', false, \`<a href="\${url}" target="_blank" rel="noopener noreferrer">\${url}</a>\`);
            }
            handleInput();
          }
        }} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Infoga extern länk"><ExternalLink className="w-3.5 h-3.5" /></button>`;

for (const p of paths) {
  const fullPath = 'f:/Antigravity/Global Construction/' + p;
  let content = fs.readFileSync(fullPath, 'utf8');

  // Add ExternalLink to lucide-react import
  content = content.replace(/import \{([^}]+)\} from "lucide-react";/, (match, p1) => {
    if (!p1.includes('ExternalLink')) {
      return `import {${p1}, ExternalLink } from "lucide-react";`;
    }
    return match;
  });

  // Inject the button
  const linkRegex = /<button type="button" onClick=\{\(\) => \{\s*const url = prompt\('Länk URL \(inklusive https:\/\/\):'\);\s*if \(url\) executeCommand\('createLink', url\);\s*\}\} className="p-1\.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Infoga länk"><LinkIcon className="w-3\.5 h-3\.5" \/><\/button>/;
  
  if (!content.includes('Infoga extern länk')) {
    content = content.replace(linkRegex, match => match + externalLinkCode);
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Updated ' + p);
}
