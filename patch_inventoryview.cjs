const fs = require('fs');
let content = fs.readFileSync('src/components/InventoryView.tsx', 'utf8');

content = content.replace(
  /const canEdit = currentUser\.role === 'admin' \|\| currentUser\.role === 'manager';/,
  "const canEdit = true;"
);

content = content.replace(
  /currentUser\.role === 'admin' &&/g,
  "true &&"
);

fs.writeFileSync('src/components/InventoryView.tsx', content);
