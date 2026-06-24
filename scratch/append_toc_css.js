const fs = require('fs');
const css = `
/* Make H2 bold in TOC */
.journal-toc > ul > li > a {
    font-weight: 700;
}

.journal-toc > ul > li > ul > li > a {
    font-weight: 400;
}
`;
fs.appendFileSync('f:/Antigravity/Global Construction/public/style.css', css, 'utf8');
console.log("Appended TOC styles");
