const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// Increase gap and padding inside the track
css = css.replace(/gap:\s*6rem;/g, 'gap: 12rem;');
css = css.replace(/padding-left:\s*6rem;/g, 'padding-left: 12rem;');

// Make the items fixed wide width to force consistent grid columns
css = css.replace(/min-width:\s*200px;/g, 'width: 300px; min-width: 300px;');
css = css.replace(/min-width:\s*250px;/g, 'width: 300px; min-width: 300px;');

// Increase HSB Size massively (from 1.6 to 2.8) because the file has large visual padding
css = css.replace(/img\[alt=["']HSB["']\]\s*\{\s*transform:\s*scale\([\d\.]+\);\s*\}/g, 'img[alt="HSB"] { transform: scale(2.8); }');
css = css.replace(/img\[alt=["']HSB["']\]:hover\s*\{\s*transform:\s*scale\([\d\.]+\);\s*\}/g, 'img[alt="HSB"]:hover { transform: scale(2.9); }');

fs.writeFileSync('style.css', css);
console.log('Marquee updated.');
