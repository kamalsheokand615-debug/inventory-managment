const fs = require('fs');
let content = fs.readFileSync('src/context/InventoryContext.tsx', 'utf8');

if (!content.includes("import { translations }")) {
  content = content.replace(/import React/, "import { translations } from '../utils/translations';\nimport React");
}

fs.writeFileSync('src/context/InventoryContext.tsx', content);
