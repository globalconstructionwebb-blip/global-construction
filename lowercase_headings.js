const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const properNouns = new Set([
    'bim', 'kista', 'arlandastad', 'östermalm', 'solna', 'täby', 'vasastan', 'göteborg', 'malmö', 'uppsala', 'sverige', 'global', 'construction', 'mcf', 'msb', 'martynas', 'sudzius', 'lisette', 'svensson', 'mert', 'ulusoy', 'david', 'eloranta', 'larsson', 'vvs', 'vs', 'el', 'bbr', 'äta', 'sr', 'gdpr', 'syd', 'eprivacy', 'ce', 'a', 'k'
]);

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

            const regex = /(<h[123][^>]*>)(.*?)(<\/h[123]>)/g;
            const newContent = content.replace(regex, (match, p1, p2, p3) => {
                // Skip template strings
                if (p2.includes('${')) return match;

                let parts = p2.split(/(<[^>]+>)/g);
                let isFirstWordOfSentence = true;

                for (let i = 0; i < parts.length; i++) {
                    if (parts[i].startsWith('<')) continue;

                    let text = parts[i];
                    let words = text.split(/([ \t\n\r&;.,!?()\-]+)/g);
                    
                    for (let j = 0; j < words.length; j++) {
                        let word = words[j];
                        if (word.match(/[a-zåäöA-ZÅÄÖ]/)) {
                            // Check if it's the very first letter of a sentence
                            if (isFirstWordOfSentence) {
                                // Only capitalize the first letter, lowercase the rest (unless proper noun / all caps)
                                if (word === word.toUpperCase() && word.length > 1) {
                                    // keep all caps
                                } else {
                                    words[j] = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                                }
                                isFirstWordOfSentence = false;
                            } else {
                                // Not the first word
                                if (!properNouns.has(word.toLowerCase())) {
                                    // If the word was ALL CAPS, lower it down.
                                    words[j] = word.toLowerCase();
                                } else {
                                    // It is a proper noun, keep its original casing if it was properly cased, 
                                    // or if we just want to ensure acronyms like GDPR stay GDPR:
                                    // Actually, if it's in properNouns, let's keep it exactly as it was.
                                }
                            }
                        } else {
                            if (word.includes('.') || word.includes('!') || word.includes('?')) {
                                isFirstWordOfSentence = true;
                            }
                        }
                    }
                    parts[i] = words.join('');
                }
                
                let newInner = parts.join('');
                if (newInner !== p2) {
                    modified = true;
                    console.log(`[${path.basename(fullPath)}]\n- ${p2}\n+ ${newInner}`);
                }
                return p1 + newInner + p3;
            });

            if (modified) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
            }
        }
    }
}

processDir(publicDir);
console.log('Done!');
