const fs = require('fs');

function replaceInFile(filePath, findStr, replaceStr) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(findStr, replaceStr);
    fs.writeFileSync(filePath, content);
}

// DashboardView
let dashContent = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');
dashContent = dashContent.replace(
    /\{item\.nameHi \|\| item\.name\}/g,
    "{settings.language === 'en' ? item.name : (item.nameHi || item.name)}"
);
dashContent = dashContent.replace(
    /\{item\.nameHi && \(/g,
    "{settings.language !== 'en' && item.nameHi && ("
);
fs.writeFileSync('src/components/DashboardView.tsx', dashContent);

// InventoryView
let invContent = fs.readFileSync('src/components/InventoryView.tsx', 'utf8');
invContent = invContent.replace(
    /\{item\.nameHi \|\| item\.name\}/g,
    "{settings.language === 'en' ? item.name : (item.nameHi || item.name)}"
);
invContent = invContent.replace(
    /\{item\.nameHi && <span>\{item\.name\}<\/span>\}/g,
    "{settings.language !== 'en' && item.nameHi && <span>{item.name}</span>}"
);
fs.writeFileSync('src/components/InventoryView.tsx', invContent);

// SalesView
let salesContent = fs.readFileSync('src/components/SalesView.tsx', 'utf8');
salesContent = salesContent.replace(
    /name: item\.nameHi \|\| item\.name,/g,
    "name: settings.language === 'en' ? item.name : (item.nameHi || item.name),"
);
salesContent = salesContent.replace(
    /\{item\.nameHi \|\| item\.name\}/g,
    "{settings.language === 'en' ? item.name : (item.nameHi || item.name)}"
);
fs.writeFileSync('src/components/SalesView.tsx', salesContent);

// ReportsView
let repContent = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');
repContent = repContent.replace(
    /\{item\.nameHi \|\| item\.name\}/g,
    "{settings.language === 'en' ? item.name : (item.nameHi || item.name)}"
);
fs.writeFileSync('src/components/ReportsView.tsx', repContent);

// ManualStockModal
let modalContent = fs.readFileSync('src/components/ManualStockModal.tsx', 'utf8');
modalContent = modalContent.replace(
    /\{item\.nameHi \? `\$\{item\.nameHi\} \(\$\{item\.name\}\)` : item\.name\}/g,
    "{settings.language === 'en' ? item.name : (item.nameHi ? `${item.nameHi} (${item.name})` : item.name)}"
);
fs.writeFileSync('src/components/ManualStockModal.tsx', modalContent);

// InventoryContext
let ctxContent = fs.readFileSync('src/context/InventoryContext.tsx', 'utf8');
ctxContent = ctxContent.replace(
    /title: `\$\{t\.outOfStockMsgTitle\}: \$\{item\.nameHi \|\| item\.name\}`/g,
    "title: `${t.outOfStockMsgTitle}: ${settings.language === 'en' ? item.name : (item.nameHi || item.name)}`"
);
ctxContent = ctxContent.replace(
    /title: `\$\{t\.lowStockMsgTitle\}: \$\{item\.nameHi \|\| item\.name\}`/g,
    "title: `${t.lowStockMsgTitle}: ${settings.language === 'en' ? item.name : (item.nameHi || item.name)}`"
);
fs.writeFileSync('src/context/InventoryContext.tsx', ctxContent);

console.log("Patched product names successfully!");
