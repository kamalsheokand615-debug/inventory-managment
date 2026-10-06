const fs = require('fs');

let content = fs.readFileSync('src/context/InventoryContext.tsx', 'utf8');

content = content.replace(/}, \[items\]\);/g, "}, [items, currentStoreId]);");
content = content.replace(/}, \[sales\]\);/g, "}, [sales, currentStoreId]);");
content = content.replace(/}, \[adjustmentLogs\]\);/g, "}, [adjustmentLogs, currentStoreId]);");
content = content.replace(/}, \[settings\]\);/g, "}, [settings, currentStoreId]);");
content = content.replace(/}, \[notifications\]\);/g, "}, [notifications, currentStoreId]);");

fs.writeFileSync('src/context/InventoryContext.tsx', content);
