const fs = require('fs');
let content = fs.readFileSync('src/utils/translations.ts', 'utf8');

// Replace duplicate manualStockManagement in each block with something else or delete it if it's already there
// Turns out it is duplicated, let's just do a regex replace
// We can find `manualStockManagement: '.*',` and replace the second instance or just use a script to parse and remove duplicates.

content = content.replace(/(\/\/\s*Manual Stock Management\s*)manualStockManagement: 'मैनुअल स्टॉक प्रबंधन',\s*manualStockManagement: 'मैनुअल स्टॉक प्रबंधन',/g, "$1manualStockManagement: 'मैनुअल स्टॉक प्रबंधन',");
content = content.replace(/(\/\/\s*Manual Stock Management\s*)manualStockManagement: 'Manual Stock Management',\s*manualStockManagement: 'Manual Stock Management',/g, "$1manualStockManagement: 'Manual Stock Management',");

fs.writeFileSync('src/utils/translations.ts', content);
