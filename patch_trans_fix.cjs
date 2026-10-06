const fs = require('fs');
let content = fs.readFileSync('src/utils/translations.ts', 'utf8');

// The issue is probably that I was replacing instances, but it didn't match.
// Let's just find and replace all instances of manualStockManagement. Wait, it is complaining about duplicate keys in the object literal.
// Let's print out the block around line 251.
