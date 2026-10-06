const fs = require('fs');

// 1. Update translations.ts
let trans = fs.readFileSync('src/utils/translations.ts', 'utf8');

// Replace the en object
const newEnObj = `{
    appTitle: 'Inventory Manager',
    appSubtitle: 'Smart Stock & Inventory Management',
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    sales: 'Sales & POS',
    reports: 'Reports',
    users: 'User Roles',
    settings: 'Settings',
    
    // Metrics
    totalItems: 'Total Products',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    depletedStock: 'Sold / Depleted',
    inventoryValue: 'Inventory Value',
    potentialProfit: 'Potential Profit',
    todaySales: "Today's Sales",
    
    // Alerts
    stockAlerts: 'Stock Alerts',
    lowStockWarning: 'Low Stock Warning',
    outOfStockAlert: 'Out of Stock Alert',
    reorderNow: 'Reorder Now',
    healthyStock: 'Stock is healthy',
    
    // Voice & Speaker
    speakerStockAnnouncement: 'Speak Stock Aloud',
    speakStatus: 'Speak Status',
    voiceSearch: 'Voice Search',
    listening: 'Listening... please speak',
    stopSpeech: 'Stop Speech',
    announceAll: 'Announce Stock Summary',
    
    // Manual Stock Management
    manualStockManagement: 'Manual Stock Management',
    adjustStock: 'Adjust Stock (+/-)',
    currentStock: 'Current Stock',
    newStock: 'New Stock',
    stockChange: 'Stock Change',
    reason: 'Reason',
    reasonPurchase: 'New Purchase / Restock',
    reasonSale: 'Direct Sale',
    reasonReturn: 'Customer Return',
    reasonDamaged: 'Damaged / Expired',
    reasonAudit: 'Physical Count Audit',
    reasonCorrection: 'Manual Correction',
    quickAdjust: 'Quick Add / Subtract',
    saveStock: 'Update Stock',
    stockHistory: 'Stock Adjustment Log',
    
    // Items
    addItem: 'Add Product',
    editItem: 'Edit Product',
    deleteItem: 'Delete',
    itemName: 'Product Name',
    itemNameHi: 'Hindi Name',
    category: 'Category',
    sku: 'SKU / Barcode',
    quantity: 'Quantity',
    unit: 'Unit',
    costPrice: 'Cost Price',
    sellingPrice: 'Selling Price',
    minThreshold: 'Min Threshold (Low Stock Alert)',
    actions: 'Actions',
    searchPlaceholder: 'Search by name, category, or SKU...',
    filterAll: 'All Items',
    
    // Sales
    newSale: 'New Sale / Billing',
    selectProduct: 'Select Item',
    cart: 'Billing Cart',
    total: 'Total Amount',
    paymentMode: 'Payment Method',
    cash: 'Cash',
    upi: 'UPI / Online',
    card: 'Card',
    credit: 'Credit',
    customerName: 'Customer Name',
    customerPhone: 'Phone Number',
    completeSale: 'Complete Sale & Invoice',
    printBill: 'Print Invoice',
    recentSales: 'Recent Sales',
    
    // Reports
    salesReport: 'Sales & Profit Reports',
    filterToday: 'Today',
    filterWeek: 'This Week',
    filterMonth: 'This Month',
    filterAllTime: 'All Time',
    totalRevenue: 'Total Revenue',
    totalCost: 'Total Cost',
    netProfit: 'Net Profit',
    topSellingItems: 'Top Selling Products',
    categoryDistribution: 'Category Distribution',
    exportReport: 'Export to CSV',
    
    // Security & Roles
    userRoles: 'User Roles & Access',
    admin: 'Owner / Admin',
    manager: 'Manager',
    staff: 'Cashier / Staff',
    switchUser: 'Switch User',
    currentRole: 'Current Role',
    enterPin: 'Enter Security PIN',
    locked: 'Application Locked',
    unlock: 'Unlock',
    incorrectPin: 'Incorrect PIN, try again',
    
    // Backup & Encryption
    cloudBackup: 'Cloud Backup',
    cloudSync: 'Cloud Sync',
    syncedNow: 'Sync Now',
    lastSynced: 'Last Synced',
    endToEndEncryption: 'End-to-End Encryption',
    encryptionNote: 'All your sensitive data is protected with military-grade AES-256 GCM encryption.',
    downloadEncryptedBackup: 'Download Encrypted Backup',
    restoreBackup: 'Restore Encrypted Backup',
    enterPassphrase: 'Enter Master Encryption Key',
    
    // Common
    offline: 'Offline Mode (Data Saved Locally)',
    online: 'Online (Ready to Sync)',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    notifications: 'Notifications',
    clearAll: 'Clear All',
    noNotifications: 'No new notifications',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    success: 'Action completed successfully',
  }`;

trans = trans.replace(/en: \{[\s\S]*?\},/m, 'en: ' + newEnObj + ',');
fs.writeFileSync('src/utils/translations.ts', trans);
console.log('Updated translations.ts');
