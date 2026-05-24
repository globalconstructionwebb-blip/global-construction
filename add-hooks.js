const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/content/projects/new/page.tsx',
  'src/app/admin/content/projects/edit/[id]/page.tsx',
  'src/app/admin/content/blog/new/page.tsx',
  'src/app/admin/content/blog/edit/[id]/page.tsx',
  'src/app/admin/content/faq/new/page.tsx',
  'src/app/admin/content/faq/edit/[id]/page.tsx',
  'src/app/admin/content/jobs/new/page.tsx',
  'src/app/admin/content/jobs/edit/[id]/page.tsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // 1. Add import
  if (!content.includes('useLeaveConfirmation')) {
    content = content.replace(
      /import { supabase } from "@\/lib\/supabase";/,
      'import { supabase } from "@/lib/supabase";\nimport { useLeaveConfirmation } from "@/hooks/useLeaveConfirmation";'
    );
  }

  // 2. Add state and hook
  if (!content.includes('const [isDirty, setIsDirty]')) {
    // Some files use 'loading', some use 'saving'
    if (content.includes('const [saving, setSaving] = useState(false);')) {
       content = content.replace(
         /const \[saving, setSaving\] = useState\(false\);/,
         'const [saving, setSaving] = useState(false);\n  const [isDirty, setIsDirty] = useState(false);\n  useLeaveConfirmation(isDirty && !saving);'
       );
    } else if (content.includes('const [loading, setLoading] = useState(false);')) {
       content = content.replace(
         /const \[loading, setLoading\] = useState\(false\);/,
         'const [loading, setLoading] = useState(false);\n  const [isDirty, setIsDirty] = useState(false);\n  useLeaveConfirmation(isDirty && !loading);'
       );
    } else {
       // Just inject it after router
       content = content.replace(
         /const router = useRouter\(\);/,
         'const router = useRouter();\n  const [isDirty, setIsDirty] = useState(false);\n  useLeaveConfirmation(isDirty);'
       );
    }
  }

  // 3. Ensure onChange is present
  if (!content.includes('onChange={() => setIsDirty(true)}')) {
    content = content.replace(
      /<div className="flex flex-col (lg|xl):flex-row (gap-[0-9]+ mt-[0-9]+|gap-[0-9]+|gap-8[^"]*)">/,
      match => match.replace('>', ' onChange={() => setIsDirty(true)} onInput={() => setIsDirty(true)}>')
    );
  }
  
  fs.writeFileSync(fullPath, content);
});
