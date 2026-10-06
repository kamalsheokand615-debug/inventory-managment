const fs = require('fs');
let ctxContent = fs.readFileSync('src/context/InventoryContext.tsx', 'utf8');

// message: `${item.name} ${t.outOfStockMsgBody}`
ctxContent = ctxContent.replace(
    /message: `\$\{item\.name\} \$\{t\.outOfStockMsgBody\}`/g,
    "message: `${settings.language === 'en' ? item.name : (item.nameHi || item.name)} ${t.outOfStockMsgBody}`"
);

// message: `${item.name} ${t.lowStockMsgBody} ${item.quantity} ${item.unit} ${t.remainingLimit} ${item.minThreshold})`
ctxContent = ctxContent.replace(
    /message: `\$\{item\.name\} \$\{t\.lowStockMsgBody\} \$\{item\.quantity\} \$\{item\.unit\} \$\{t\.remainingLimit\} \$\{item\.minThreshold\}\)`/g,
    "message: `${settings.language === 'en' ? item.name : (item.nameHi || item.name)} ${t.lowStockMsgBody} ${item.quantity} ${item.unit} ${t.remainingLimit} ${item.minThreshold})`"
);

fs.writeFileSync('src/context/InventoryContext.tsx', ctxContent);
console.log("Fixed context messages");
