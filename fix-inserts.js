const fs = require('fs');
 // Note: glob might not be installed, we can just use our walk function again.

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('src/app/admin/content');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Project insert
    if (file.includes('projects/new/page.tsx')) {
        content = content.replace(/id: crypto\.randomUUID\(\), \s*title,/g, "id: crypto.randomUUID(), \n        name: title, \n        updatedAt: new Date().toISOString(),\n        title,");
    }
    // Project update
    if (file.includes('projects/edit/[id]/page.tsx')) {
        content = content.replace(/\.update\(\{([\s\S]*?)title,/g, ".update({$1name: title, \n        updatedAt: new Date().toISOString(),\n        title,");
    }

    // JobOpening insert
    if (file.includes('jobs/new/page.tsx')) {
        content = content.replace(/id: crypto\.randomUUID\(\), \s*title,/g, "id: crypto.randomUUID(), \n        type: jobType,\n        updatedAt: new Date().toISOString(),\n        title,");
    }
    // JobOpening update
    if (file.includes('jobs/edit/[id]/page.tsx')) {
        content = content.replace(/\.update\(\{([\s\S]*?)title,/g, ".update({$1type: jobType,\n        updatedAt: new Date().toISOString(),\n        title,");
    }

    // FAQ insert
    if (file.includes('faq/new/page.tsx')) {
        content = content.replace(/id: crypto\.randomUUID\(\), \s*question,/g, "id: crypto.randomUUID(), \n        updatedAt: new Date().toISOString(),\n        question,");
    }
    // FAQ update
    if (file.includes('faq/edit/[id]/page.tsx')) {
        content = content.replace(/\.update\(\{([\s\S]*?)question,/g, ".update({$1updatedAt: new Date().toISOString(),\n        question,");
    }

    // BlogPost insert
    if (file.includes('blog/new/page.tsx')) {
        content = content.replace(/id: crypto\.randomUUID\(\), \s*title,/g, "id: crypto.randomUUID(), \n        updatedAt: new Date().toISOString(),\n        title,");
    }
    // BlogPost update
    if (file.includes('blog/edit/[id]/page.tsx')) {
        content = content.replace(/\.update\(\{([\s\S]*?)title,/g, ".update({$1updatedAt: new Date().toISOString(),\n        title,");
    }
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
