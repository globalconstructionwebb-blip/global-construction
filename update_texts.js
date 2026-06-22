const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const kbFile = path.join(publicDir, 'kunskapsbanken.html');
const kbDir = path.join(publicDir, 'kunskapsbanken');

// Update kunskapsbanken.html
if (fs.existsSync(kbFile)) {
    let content = fs.readFileSync(kbFile, 'utf8');
    content = content.replace(/<title>Blogg –/g, '<title>Kunskapsbanken –');
    content = content.replace(/Global Constructions blogg:/g, 'Global Constructions kunskapsbank:');
    content = content.replace(/"name": "Blogg"/g, '"name": "Kunskapsbanken"');
    content = content.replace(/globalconstruction\.se\/blogg\.html/g, 'globalconstruction.se/kunskapsbanken');
    content = content.replace(/Bloggkategorier/g, 'Kunskapsbankskategorier');
    fs.writeFileSync(kbFile, content, 'utf8');
    console.log('Updated:', kbFile);
}

// Update articles in kunskapsbanken folder
if (fs.existsSync(kbDir)) {
    const files = fs.readdirSync(kbDir);
    for (const file of files) {
        if (file.endsWith('.html')) {
            const fullPath = path.join(kbDir, file);
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            if (content.includes('href="https://globalconstruction.se/blogg/')) {
                content = content.replace(/href="https:\/\/globalconstruction\.se\/blogg\//g, 'href="https://globalconstruction.se/kunskapsbanken/');
                modified = true;
            }
            if (content.includes('href="../blogg"')) {
                content = content.replace(/href="\.\.\/blogg"/g, 'href="../kunskapsbanken"');
                modified = true;
            }
            if (content.includes('href="../blogg/')) {
                content = content.replace(/href="\.\.\/blogg\//g, 'href="../kunskapsbanken/');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated article:', fullPath);
            }
        }
    }
}
console.log('Done!');
