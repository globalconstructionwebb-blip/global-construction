const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            const regex = /<h[123][^>]*>(.*?)<\/h[123]>/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                // remove nested tags
                let text = match[1].replace(/<[^>]*>/g, '').trim();
                if (text) {
                    console.log(`[${path.basename(fullPath)}] ${match[0]}`);
                }
            }
        }
    }
}

processDir(publicDir);
