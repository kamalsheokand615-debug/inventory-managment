const fs = require('fs');
let ctxContent = fs.readFileSync('src/context/InventoryContext.tsx', 'utf8');

// Always make storeId the new user's ID so they get their own DB.
ctxContent = ctxContent.replace(
  /storeId: role === 'admin' \? newId : currentStoreId,/g,
  "storeId: newId,"
);
fs.writeFileSync('src/context/InventoryContext.tsx', ctxContent);
