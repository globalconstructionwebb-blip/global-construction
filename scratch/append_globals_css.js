const fs = require('fs');

const css = `
.editor-content ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.editor-content ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.editor-content li {
  margin-bottom: 0.25rem;
}
`;

fs.appendFileSync('f:/Antigravity/Global Construction/src/app/globals.css', css, 'utf8');
console.log("Appended styles to globals.css");
