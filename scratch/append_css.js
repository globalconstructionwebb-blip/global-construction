const fs = require('fs');
const css = `
.editor-content ul,
.editor-content ol {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
    font-size: 1.1rem;
}

.editor-content ul {
    list-style-type: disc;
}

.editor-content ol {
    list-style-type: decimal;
}

.editor-content li {
    margin-bottom: 0.5rem;
}
`;
fs.appendFileSync('f:/Antigravity/Global Construction/public/style.css', css, 'utf8');
console.log("Appended styles");
