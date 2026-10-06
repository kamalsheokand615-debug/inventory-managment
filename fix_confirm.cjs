const fs = require('fs');

let content = fs.readFileSync('src/components/InventoryView.tsx', 'utf8');
content = content.replace(/confirm\(`क्या आप वाकई "\$\{item.name\}" को हटाना चाहते हैं\?`\)/g, "confirm(`${t.confirmDeleteItem} - ${item.name}`)");
fs.writeFileSync('src/components/InventoryView.tsx', content);

