const fs = require('fs');
const path = require('path');

const gtmHead = `
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N9QNLFS9');</script>
<!-- End Google Tag Manager -->
`;

const gtmBody = `
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N9QNLFS9"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
`;

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            // Insert into <head>
            if (!content.includes('GTM-N9QNLFS9')) {
                // Find <head> or <head ...>
                const headRegex = /<head[^>]*>/i;
                if (headRegex.test(content)) {
                    content = content.replace(headRegex, `$&${gtmHead}`);
                    changed = true;
                }

                // Insert into <body>
                const bodyRegex = /<body[^>]*>/i;
                if (bodyRegex.test(content)) {
                    content = content.replace(bodyRegex, `$&${gtmBody}`);
                    changed = true;
                }

                if (changed) {
                    fs.writeFileSync(fullPath, content);
                    console.log('Updated', fullPath);
                }
            }
        }
    }
}

processDir(path.join(__dirname, '../public'));
