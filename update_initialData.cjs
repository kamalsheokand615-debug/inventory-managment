const fs = require('fs');
let content = fs.readFileSync('src/data/initialData.ts', 'utf8');

content = content.replace(/id: 'user-admin',/g, "id: 'user-admin',\n    storeId: 'store-user-admin',");

fs.writeFileSync('src/data/initialData.ts', content);
