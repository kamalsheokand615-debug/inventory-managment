const fs = require('fs');
let content = fs.readFileSync('src/components/SalesView.tsx', 'utf8');

content = content.replace(
  /No products found/,
  '{t.noItemsFound}'
);

fs.writeFileSync('src/components/SalesView.tsx', content);
