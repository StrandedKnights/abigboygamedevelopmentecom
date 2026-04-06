const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkAndFix(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkAndFix(fullPath);
        } else {
            if (fullPath.endsWith('.astro') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let newContent = content.replace(/components\/abg-nexus\//g, 'components/admin/');
                if (newContent !== content) {
                    fs.writeFileSync(fullPath, newContent);
                    console.log('Fixed import in: ' + fullPath);
                }
            }
        }
    }
}

walkAndFix(srcDir);
