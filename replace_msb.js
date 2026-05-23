const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/Myndigheten för samhällsskydd och beredskaps/gi, 'Myndigheten för civilt försvars');
    content = content.replace(/Myndigheten för samhällsskydd och beredskap/gi, 'Myndigheten för civilt försvar');
    
    // Also fix the missing space in "MCF:s(Myndigheten"
    content = content.replace(/MCF:s\(Myndigheten för civilt försvar\)/gi, 'MCF:s (Myndigheten för civilt försvar)');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            replaceInFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'legacy'));
walkDir(path.join(__dirname, 'public'));
console.log('Replacement complete.');
