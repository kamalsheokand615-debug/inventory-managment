const fs = require('fs');
const filePath = 'src/data/initialData.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace initialItems array content
content = content.replace(/export const initialItems: InventoryItem\[\] = \[([\s\S]*?)\];/m, 'export const initialItems: InventoryItem[] = [];');

// Replace initialSales array content
content = content.replace(/export const initialSales: SaleRecord\[\] = \[([\s\S]*?)\];/m, 'export const initialSales: SaleRecord[] = [];');

// Replace initialAdjustmentLogs array content
content = content.replace(/export const initialAdjustmentLogs: StockAdjustmentLog\[\] = \[([\s\S]*?)\];/m, 'export const initialAdjustmentLogs: StockAdjustmentLog[] = [];');

// Replace initialUsers array content
content = content.replace(/export const initialUsers: UserAccount\[\] = \[([\s\S]*?)\];/m, `export const initialUsers: UserAccount[] = [
  {
    id: 'user-admin',
    name: 'Admin',
    role: 'admin',
    pin: '1234',
  }
];`);

// Replace initialSettings
content = content.replace(/export const initialSettings: AppSettings = \{([\s\S]*?)\};/m, `export const initialSettings: AppSettings = {
  businessName: 'My Store',
  businessAddress: '',
  businessPhone: '',
  gstNumber: '',
  currency: '₹',
  defaultThreshold: 10,
  language: 'en',
  theme: 'light',
  soundEnabled: true,
  voiceSpeed: 0.95,
  autoCloudSync: true,
  encryptionEnabled: true,
};`);

fs.writeFileSync(filePath, content);
console.log("Patched initialData.ts");
