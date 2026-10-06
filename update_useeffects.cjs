const fs = require('fs');

let content = fs.readFileSync('src/context/InventoryContext.tsx', 'utf8');

// Replace standard STORAGE_KEYS references with dynamic ones in useEffects.
// E.g. localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
// to localStorage.setItem(`${STORAGE_KEYS.ITEMS}_${currentStoreId}`, JSON.stringify(items));

content = content.replace(
  /localStorage\.setItem\(STORAGE_KEYS\.ITEMS, JSON\.stringify\(items\)\);/g,
  "localStorage.setItem(`${STORAGE_KEYS.ITEMS}_${currentStoreId}`, JSON.stringify(items));"
);

content = content.replace(
  /localStorage\.setItem\(STORAGE_KEYS\.SALES, JSON\.stringify\(sales\)\);/g,
  "localStorage.setItem(`${STORAGE_KEYS.SALES}_${currentStoreId}`, JSON.stringify(sales));"
);

content = content.replace(
  /localStorage\.setItem\(STORAGE_KEYS\.LOGS, JSON\.stringify\(adjustmentLogs\)\);/g,
  "localStorage.setItem(`${STORAGE_KEYS.LOGS}_${currentStoreId}`, JSON.stringify(adjustmentLogs));"
);

content = content.replace(
  /localStorage\.setItem\(STORAGE_KEYS\.SETTINGS, JSON\.stringify\(settings\)\);/g,
  "localStorage.setItem(`${STORAGE_KEYS.SETTINGS}_${currentStoreId}`, JSON.stringify(settings));"
);

content = content.replace(
  /localStorage\.setItem\(STORAGE_KEYS\.NOTIFICATIONS, JSON\.stringify\(notifications\)\);/g,
  "localStorage.setItem(`store_notifications_${currentStoreId}`, JSON.stringify(notifications));"
);

fs.writeFileSync('src/context/InventoryContext.tsx', content);
