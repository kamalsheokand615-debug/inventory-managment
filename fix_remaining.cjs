const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');
content = content.replace(/\/\/ Depleted \/ Sold stock metric \("कितना खत्म हो गया"\)/g, '// Depleted / Sold stock metric');
content = content.replace(/\{\/\* Out of Stock \(खत्म स्टॉक\) \*\/\}/g, '{/* Out of Stock */}');
content = content.replace(/\{\/\* Low Stock \(कम स्टॉक\) \*\/\}/g, '{/* Low Stock */}');
content = content.replace(/\{\/\* Depleted \/ Sold \("कितना खत्म हो गया"\) \*\/\}/g, '{/* Depleted / Sold */}');
fs.writeFileSync('src/components/DashboardView.tsx', content);

content = fs.readFileSync('src/components/InventoryView.tsx', 'utf8');
content = content.replace(/\{\/\* Depleted \/ Sold \("कितना खत्म हो गया"\) \*\/\}/g, '{/* Depleted / Sold */}');
fs.writeFileSync('src/components/InventoryView.tsx', content);

content = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');
content = content.replace(/\{\/\* Stock Depletion Tracker \("कितना स्टॉक है और कितना खत्म हो गया"\) \*\/\}/g, '{/* Stock Depletion Tracker */}');
fs.writeFileSync('src/components/ReportsView.tsx', content);

