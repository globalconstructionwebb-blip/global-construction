const fs = require('fs');
let s = fs.readFileSync('style.css', 'utf8');

// Update Track
s = s.replace(/gap:\s*25rem;/, 'gap: 0;');
s = s.replace(/padding-left:\s*25rem;/, 'padding-left: 0;');

// Update Items
s = s.replace(/\/\* width auto \*\//, 'min-width: 600px; padding: 0 60px;');

// Update Svenska
s = s.replace(/img\[alt\*="Svenska"\]:hover\s*{\s*transform:\s*scale\(1\.1\);\s*}/, 'img[alt*="Svenska"]:hover { transform: scale(1.4); }');

fs.writeFileSync('style.css', s);
console.log('Success');
