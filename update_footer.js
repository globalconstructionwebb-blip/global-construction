const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const relaxedRegex = /<nav class="footer-links-col" aria-label="Tjänster">\s*<h3>Våra [Tt]jänster<\/h3>\s*<ul>[\s\S]*?<\/ul>\s*<\/nav>/gi;

const replacement = `<nav class="footer-links-col" aria-label="Tjänster">
                <h3>Våra tjänster</h3>
                <ul>
                    <li><a href="konstruktionsberakningar">Konstruktionsberäkningar</a></li>
                    <li><a href="konstruktionsritningar">Konstruktionsritningar</a></li>
                    <li><a href="nyproduktion">Nyproduktion</a></li>
                    <li><a href="kvalificerad-sakkunnig">Kvalificerad Sakkunnig</a></li>
                    <li><a href="byggnation-skyddsrum">Skyddsrumsbyggnation</a></li>
                    <li><a href="iordningstallanderitningar">Iordningställande</a></li>
                </ul>
            </nav>`;

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (relaxedRegex.test(content)) {
                const newContent = content.replace(relaxedRegex, replacement);
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log('Updated:', fullPath);
            }
        }
    }
}

processDir(publicDir);
console.log('Done!');
