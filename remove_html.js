const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            const newContent = content.replace(/href=["']([^"']*\.html)(#[^"']*)?["']/g, (match, p1, p2) => {
                modified = true;
                let newPath = p1.replace(/\.html$/, '');
                
                // Handle index.html special case
                if (newPath === 'index' || newPath === './index') {
                    newPath = '/';
                } else if (newPath.endsWith('/index')) {
                    newPath = newPath.replace(/\/index$/, '/');
                }
                
                return `href="${newPath}${p2 || ''}"`;
            });

            if (modified) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log('Updated:', fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'public'));
console.log('Done!');
