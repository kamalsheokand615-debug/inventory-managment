export type UserRole = 'admin' | 'manager' | 'staff';

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  pin: string; // 4-digit or custom PIN
  email?: string;
  storeId?: string; // Multi-tenant ID
}

export type UnitType = 'kg' | 'g' | 'pcs' | 'packet' | 'box' | 'litre' | 'meter' | 'bottle' | 'dozen';

export interface InventoryItem {
  id: string;
  name: string;
  nameHi?: string;
  category: string;
  sku: string;
  quantity: number;
  minThreshold: number; // Low stock alert threshold
  unit: UnitType;
  costPrice: number;    // खरीद मूल्य
  sellingPrice: number; // विक्रय मूल्य
  initialStock: number; // For tracking how much has been consumed / depleted
  totalSold: number;    // कितना खत्म/बिक गया
  barcode?: string;
  supplier?: string;
  notes?: string;
  lastUpdated: string;
}

export type StockChangeReason = 
  | 'purchase'    // नई खरीद / रेस्टॉक
  | 'sale'        // बिक्री
  | 'return'      // ग्राहक वापसी
  | 'damaged'     // खराब / टूटा-फूटा
  | 'audit'       // स्टॉक गिनती मिलान
  | 'correction'; // मैनुअल सुधार

export interface StockAdjustmentLog {
  id: string;
  itemId: string;
  itemName: string;
  previousQty: number;
  newQty: number;
  change: number;
  reason: StockChangeReason;
  note?: string;
  timestamp: string;
  userName: string;
}

export interface SaleCartItem {
  itemId: string;
  name: string;
  quantity: number;
  unit: UnitType;
  sellingPrice: number;
  costPrice: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'credit';

export interface PaymentDetails {
  upiRef?: string;
  upiId?: string;
  cashTendered?: number;
  cashChange?: number;
  cardType?: string;
  cardLast4?: string;
  cardTxnRef?: string;
  creditDueDate?: string;
  creditNotes?: string;
}

export interface SaleRecord {
  id: string;
  invoiceNo: string;
  items: SaleCartItem[];
  subtotal?: number;
  discount?: number;
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  paymentMethod: PaymentMethod;
  paymentDetails?: PaymentDetails;
  customerName?: string;
  customerPhone?: string;
  timestamp: string;
  userId: string;
  userName: string;
  notes?: string;
}

export type NotificationType = 'low_stock' | 'out_of_stock' | 'sale' | 'backup' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  itemId?: string;
}

export type LanguageCode = 'hi' | 'en' | 'hinglish';
export type ThemeMode = 'light' | 'dark';

export interface AppSettings {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  gstNumber?: string;
  upiId?: string; // UPI ID for QR code generation
  currency: string;
  defaultThreshold: number;
  language: LanguageCode;
  theme: ThemeMode;
  soundEnabled: boolean;
  voiceSpeed: number; // Speech playback rate (0.8 - 1.2)
  autoCloudSync: boolean;
  encryptionEnabled: boolean;
  notificationsEnabled: boolean; // Master toggle for alerts & notifications
  lowStockAlertsEnabled?: boolean; // Specific toggle for low stock
  outOfStockAlertsEnabled?: boolean; // Specific toggle for out of stock
  lastCloudBackup?: string;
  lastSyncTimestamp?: string;
}

export interface EncryptedDataPayload {
  version: number;
  encrypted: boolean;
  ciphertext: string; // Base64
  iv: string;         // Base64
  salt: string;       // Base64
  exportDate: string;
  metadata: {
    itemCount: number;
    salesCount: number;
    businessName: string;
  };
}

export interface KhataTransaction {
  id: string;
  customerId: string;
  type: 'give' | 'receive'; // 'give' = उधार दिया (+ Udhaar), 'receive' = जमा प्राप्त हुआ (- Jama)
  amount: number;
  date: string;
  dueDate?: string;
  invoiceNo?: string;
  notes?: string;
  paymentMode?: 'cash' | 'upi' | 'bank';
  recordedBy?: string;
}

export interface KhataCustomer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalGiven: number;
  totalReceived: number;
  balance: number; // Positive means customer owes shopkeeper
  lastTransactionDate: string;
  dueDate?: string;
  notes?: string;
  status: 'active' | 'cleared';
}
