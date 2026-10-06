const fs = require('fs');
const path = require('path');

function findHindiStrings(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findHindiStrings(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, i) => {
                if (/[\u0900-\u097F]/.test(line)) {
                    console.log(`${fullPath}:${i + 1}: ${line.trim()}`);
                }
            });
        }
    }
}

findHindiStrings('src/components');
