const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// 1. Rename public/blogg.html to public/kunskapsbanken.html
const oldFile = path.join(publicDir, 'blogg.html');
const newFile = path.join(publicDir, 'kunskapsbanken.html');
if (fs.existsSync(oldFile)) {
    fs.renameSync(oldFile, newFile);
}

// 2. Rename public/blogg to public/kunskapsbanken
const oldDir = path.join(publicDir, 'blogg');
const newDir = path.join(publicDir, 'kunskapsbanken');
if (fs.existsSync(oldDir)) {
    fs.renameSync(oldDir, newDir);
}

// 3. Search and replace in all HTML files
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

            const newContent = content.replace(/href=["'](\/?blogg)([\/"'][^>]*)/g, (match, p1, p2) => {
                modified = true;
                const replacement = p1.replace('blogg', 'kunskapsbanken');
                return `href="${replacement}${p2}`;
            });

            if (modified) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log('Updated:', fullPath);
            }
        }
    }
}

processDir(publicDir);
console.log('Done!');
