const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkAndReplace(fullPath);
        } else {
            if (fullPath.endsWith('.astro') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let newContent = content
                    .replace(/\/admin\b(?!_)/g, '/abg-nexus')
                    .replace(/\/api\/admin\b/g, '/api/abg-nexus');
                if (newContent !== content) {
                    fs.writeFileSync(fullPath, newContent);
                    console.log('Updated: ' + fullPath);
                }
            }
        }
    }
}

walkAndReplace(srcDir);

// Also replace robots.txt
const robotsFile = path.join(__dirname, 'public', 'robots.txt');
if (fs.existsSync(robotsFile)) {
    let content = fs.readFileSync(robotsFile, 'utf8');
    content = content.replace(/\/admin\b/g, '/abg-nexus').replace(/\/api\/admin\b/g, '/api/abg-nexus');
    fs.writeFileSync(robotsFile, content);
    console.log('Updated robots.txt');
}
