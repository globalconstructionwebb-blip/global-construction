const fs = require('fs');
const path = require('path');

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

const files = walk('src/app/admin');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    content = content.replace(/supabase\.from\(['"]posts['"]\)/g, "supabase.from('BlogPost')");
    content = content.replace(/supabase\.from\(['"]faqs['"]\)/g, "supabase.from('FAQ')");
    content = content.replace(/supabase\.from\(['"]jobs['"]\)/g, "supabase.from('JobOpening')");
    content = content.replace(/supabase\.from\(['"]projects['"]\)/g, "supabase.from('Project')");
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
