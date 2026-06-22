const fs = require('fs');
const path = require('path');

const publicDir = 'public';
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html')).map(f => path.join(publicDir, f));

for (const file of files) {
    const buf = fs.readFileSync(file);
    const strUtf8 = buf.toString('utf8');
    const bufUtf8 = Buffer.from(strUtf8, 'utf8');
    
    if (buf.equals(bufUtf8)) {
        if (strUtf8.includes('Ã¤') || strUtf8.includes('Ã¶') || strUtf8.includes('Ã¥') || strUtf8.includes('Ã„') || strUtf8.includes('Ã–') || strUtf8.includes('Ã…')) {
            console.log(`Fixing double-encoded UTF-8 in ${file}`);
            const fixedStr = Buffer.from(strUtf8, 'latin1').toString('utf8');
            fs.writeFileSync(file, fixedStr, 'utf8');
        } else {
            // Already valid and not obviously double encoded. No action needed.
            // Wait, what if it's UTF-8 but the user saw a broken character?
            // If the user saw a broken character, it MUST have been one of the files that is NOT valid UTF-8, or is double-encoded.
            console.log(`${file} is already valid UTF-8`);
        }
    } else {
        console.log(`Fixing Windows-1252 encoded file ${file}`);
        const strLatin1 = buf.toString('latin1');
        fs.writeFileSync(file, strLatin1, 'utf8');
    }
}
