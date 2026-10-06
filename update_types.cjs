const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

// Add storeId to UserAccount
if (!content.includes('storeId?: string;')) {
    content = content.replace(/email\?: string;/g, "email?: string;\n  storeId?: string; // Multi-tenant ID");
}

fs.writeFileSync('src/types.ts', content);
