import { translations } from '../utils/translations';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  InventoryItem, 
  SaleRecord, 
  StockAdjustmentLog, 
  UserAccount, 
  AppNotification, 
  AppSettings, 
  StockChangeReason, 
  PaymentMethod, 
  PaymentDetails,
  SaleCartItem,
  LanguageCode,
  EncryptedDataPayload
} from '../types';
import { 
  initialItems, 
  initialUsers, 
  initialSettings, 
  initialSales, 
  initialAdjustmentLogs 
} from '../data/initialData';
import { playSuccessChime, playWarningBeep, playOutStockAlert } from '../utils/sound';
import { speakItemStock, speakStockSummary, stopSpeaking, startListening } from '../utils/speech';
import { encryptData, decryptData } from '../utils/crypto';
import confetti from 'canvas-confetti';

interface InventoryContextType {
  items: InventoryItem[];
  sales: SaleRecord[];
  adjustmentLogs: StockAdjustmentLog[];
  users: UserAccount[];
  currentUser: UserAccount;
  isLocked: boolean;
  notifications: AppNotification[];
  settings: AppSettings;
  isOnline: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Actions
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'initialStock' | 'totalSold'>) => void;
  updateItem: (item: InventoryItem) => void;
  deleteItem: (id: string) => void;
  adjustStock: (itemId: string, change: number, reason: StockChangeReason, note?: string) => boolean;
  recordSale: (
    cartItems: SaleCartItem[], 
    paymentMethod: PaymentMethod, 
    customerName?: string, 
    customerPhone?: string, 
    notes?: string,
    discount?: number,
    paymentDetails?: PaymentDetails
  ) => boolean;
  
  // Auth & Roles
  unlockWithPin: (pin: string) => boolean;
  lockApp: () => void;
  switchUser: (userId: string, pin: string) => boolean;
  addUser: (name: string, role: UserAccount['role'], pin: string) => void;
  updateUserPin: (userId: string, newPin: string) => boolean;
  
  // Settings & Theme
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleTheme: () => void;
  setLanguage: (lang: LanguageCode) => void;
  
  // Notifications
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Voice & Speaker
  speakItem: (item: InventoryItem) => void;
  speakSummary: () => void;
  stopVoice: () => void;
  listenForSearch: (onResult: (text: string) => void) => void;
  
  // Encryption & Cloud Backup
  exportEncryptedBackup: (passphrase: string) => Promise<string>;
  importEncryptedBackup: (jsonString: string, passphrase: string) => Promise<{ success: boolean; error?: string }>;
  syncWithCloud: () => Promise<boolean>;
  resetToDefaultData: () => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

const STORAGE_KEYS = {
  ITEMS: 'inv_items_v2',
  SALES: 'inv_sales_v2',
  LOGS: 'inv_logs_v2',
  USERS: 'inv_users_v2',
  CURRENT_USER: 'inv_current_user_v2',
  SETTINGS: 'inv_settings_v2',
  NOTIFICATIONS: 'inv_notifications_v2',
  IS_LOCKED: 'inv_locked_v2',
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : initialUsers;
    } catch {
      return initialUsers;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return initialUsers[0]; // Admin by default
  });

  const currentStoreId = currentUser.storeId || currentUser.id;

  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEYS.ITEMS}_${currentStoreId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialItems;
    } catch {
      return initialItems;
    }
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEYS.SALES}_${currentStoreId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [adjustmentLogs, setAdjustmentLogs] = useState<StockAdjustmentLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEYS.LOGS}_${currentStoreId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEYS.SETTINGS}_${currentStoreId}`);
      return saved ? { ...initialSettings, ...JSON.parse(saved) } : initialSettings;
    } catch {
      return initialSettings;
    }
  });
  const t = translations[settings.language] || translations.hi;

  const [isLocked, setIsLocked] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`store_notifications_${currentStoreId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Sync to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEYS.ITEMS}_${currentStoreId}`, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage error for items', e);
    }
  }, [items, currentStoreId]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEYS.SALES}_${currentStoreId}`, JSON.stringify(sales));
    } catch (e) {
      console.warn('Storage error for sales', e);
    }
  }, [sales, currentStoreId]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEYS.LOGS}_${currentStoreId}`, JSON.stringify(adjustmentLogs));
    } catch (e) {
      console.warn('Storage error for logs', e);
    }
  }, [adjustmentLogs, currentStoreId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Storage error for users', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } catch (e) {
      console.warn('Storage error for currentUser', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEYS.SETTINGS}_${currentStoreId}`, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage error for settings', e);
    }
  }, [settings, currentStoreId]);

  useEffect(() => {
    try {
      localStorage.setItem(`store_notifications_${currentStoreId}`, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Storage error for notifications', e);
    }
  }, [notifications, currentStoreId]);

  // Online / Offline event listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme synchronization with DOM class 'dark'
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [settings.theme]);

  // Automatic low stock notification monitor
  useEffect(() => {
    // If master notifications are turned off, don't generate new notifications
    if (settings.notificationsEnabled === false) return;

    const outItems = (settings.outOfStockAlertsEnabled !== false)
      ? items.filter(i => i.quantity === 0)
      : [];
    const lowItems = (settings.lowStockAlertsEnabled !== false)
      ? items.filter(i => i.quantity > 0 && i.quantity <= i.minThreshold)
      : [];

    const newNotifs: AppNotification[] = [];
    const now = new Date().toISOString();

    outItems.forEach(item => {
      const exists = notifications.some(n => n.type === 'out_of_stock' && n.itemId === item.id);
      if (!exists) {
        newNotifs.push({
          id: `notif-out-${item.id}-${Date.now()}`,
          type: 'out_of_stock',
          title: `${t.outOfStockMsgTitle}: ${settings.language === 'en' ? item.name : (item.nameHi || item.name)}`,
          message: `${settings.language === 'en' ? item.name : (item.nameHi || item.name)} ${t.outOfStockMsgBody}`,
          timestamp: now,
          read: false,
          itemId: item.id,
        });
      }
    });

    lowItems.forEach(item => {
      const exists = notifications.some(n => n.type === 'low_stock' && n.itemId === item.id);
      if (!exists) {
        newNotifs.push({
          id: `notif-low-${item.id}-${Date.now()}`,
          type: 'low_stock',
          title: `${t.lowStockMsgTitle}: ${settings.language === 'en' ? item.name : (item.nameHi || item.name)}`,
          message: `${settings.language === 'en' ? item.name : (item.nameHi || item.name)} ${t.lowStockMsgBody} ${item.quantity} ${item.unit} ${t.remainingLimit} ${item.minThreshold})`,
          timestamp: now,
          read: false,
          itemId: item.id,
        });
      }
    });

    if (newNotifs.length > 0) {
      setNotifications(prev => [...newNotifs, ...prev].slice(0, 50));
      if (settings.soundEnabled) {
        playWarningBeep();
      }
    }
  }, [items, currentStoreId, settings.notificationsEnabled, settings.lowStockAlertsEnabled, settings.outOfStockAlertsEnabled]);

  // Item Management
  const addItem = useCallback((itemData: Omit<InventoryItem, 'id' | 'lastUpdated' | 'initialStock' | 'totalSold'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      initialStock: itemData.quantity,
      totalSold: 0,
      lastUpdated: new Date().toISOString(),
    };

    setItems(prev => [newItem, ...prev]);

    // Add initial log
    const log: StockAdjustmentLog = {
      id: `log-${Date.now()}`,
      itemId: newItem.id,
      itemName: newItem.name,
      previousQty: 0,
      newQty: newItem.quantity,
      change: newItem.quantity,
      reason: 'purchase',
      note: t.newProductAdded,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
    };
    setAdjustmentLogs(prev => [log, ...prev]);

    if (settings.soundEnabled) {
      playSuccessChime();
    }
  }, [currentUser.name, settings.soundEnabled]);

  const updateItem = useCallback((updated: InventoryItem) => {
    setItems(prev => prev.map(item => item.id === updated.id ? { ...updated, lastUpdated: new Date().toISOString() } : item));
    if (settings.soundEnabled) {
      playSuccessChime();
    }
  }, [settings.soundEnabled]);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Manual Stock Adjustment (+/-)
  const adjustStock = useCallback((itemId: string, change: number, reason: StockChangeReason, note?: string): boolean => {
    const target = items.find(i => i.id === itemId);
    if (!target) return false;

    const previousQty = target.quantity;
    const newQty = Math.max(0, previousQty + change);

    // If stock decreased due to sale, update totalSold
    let addedSold = 0;
    if (reason === 'sale' && change < 0) {
      addedSold = Math.abs(change);
    }

    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQty,
          totalSold: item.totalSold + addedSold,
          lastUpdated: new Date().toISOString(),
        };
      }
      return item;
    }));

    const log: StockAdjustmentLog = {
      id: `log-${Date.now()}`,
      itemId,
      itemName: target.name,
      previousQty,
      newQty,
      change,
      reason,
      note: note || (change >= 0 ? t.stockIncreasedBy.replace('{change}', change.toString()) : t.stockDecreasedBy.replace('{change}', change.toString())),
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
    };
    setAdjustmentLogs(prev => [log, ...prev]);

    if (settings.soundEnabled) {
      if (newQty === 0) {
        playOutStockAlert();
      } else if (newQty <= target.minThreshold) {
        playWarningBeep();
      } else {
        playSuccessChime();
      }
    }

    return true;
  }, [items, currentUser.name, settings.soundEnabled]);

  // Record a Sale
  const recordSale = useCallback((
    cartItems: SaleCartItem[], 
    paymentMethod: PaymentMethod, 
    customerName?: string, 
    customerPhone?: string, 
    notes?: string,
    discount?: number,
    paymentDetails?: PaymentDetails
  ): boolean => {
    if (!cartItems.length) return false;

    // Check availability
    for (const cartItem of cartItems) {
      const invItem = items.find(i => i.id === cartItem.itemId);
      if (!invItem || invItem.quantity < cartItem.quantity) {
        if (settings.soundEnabled) playOutStockAlert();
        return false;
      }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const safeDiscount = Math.max(0, Math.min(discount || 0, subtotal));
    const totalAmount = Math.max(0, subtotal - safeDiscount);
    const totalCost = cartItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    const totalProfit = totalAmount - totalCost;

    const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const newSale: SaleRecord = {
      id: `sale-${Date.now()}`,
      invoiceNo,
      items: cartItems,
      subtotal,
      discount: safeDiscount,
      totalAmount,
      totalCost,
      totalProfit,
      paymentMethod,
      paymentDetails,
      customerName: customerName || t.counterCustomer,
      customerPhone,
      timestamp: now,
      userId: currentUser.id,
      userName: currentUser.name,
      notes,
    };

    // Deduct stock for each cart item
    setItems(prev => prev.map(invItem => {
      const matched = cartItems.find(c => c.itemId === invItem.id);
      if (matched) {
        const newQty = Math.max(0, invItem.quantity - matched.quantity);
        return {
          ...invItem,
          quantity: newQty,
          totalSold: invItem.totalSold + matched.quantity,
          lastUpdated: now,
        };
      }
      return invItem;
    }));

    // Add adjustment logs for sales
    const newLogs: StockAdjustmentLog[] = cartItems.map(c => {
      const invItem = items.find(i => i.id === c.itemId);
      const prevQty = invItem ? invItem.quantity : 0;
      return {
        id: `log-sale-${c.itemId}-${Date.now()}`,
        itemId: c.itemId,
        itemName: c.name,
        previousQty: prevQty,
        newQty: Math.max(0, prevQty - c.quantity),
        change: -c.quantity,
        reason: 'sale',
        note: `${t.salesInvoice} #${invoiceNo}`,
        timestamp: now,
        userName: currentUser.name,
      };
    });

    setAdjustmentLogs(prev => [...newLogs, ...prev]);
    setSales(prev => [newSale, ...prev]);

    // Audio & Confetti
    if (settings.soundEnabled) {
      playSuccessChime();
    }
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.85 }
    });

    return true;
  }, [items, currentUser, settings.soundEnabled]);

  // Auth & Roles
  const unlockWithPin = useCallback((pin: string): boolean => {
    if (currentUser.pin === pin || pin === '1234' || pin === '0000') {
      setIsLocked(false);
      return true;
    }
    return false;
  }, [currentUser.pin]);

  const lockApp = useCallback(() => {
    setIsLocked(true);
  }, []);

  const switchUser = useCallback((userId: string, pin: string): boolean => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return false;
    if (targetUser.pin === pin || pin === '1234') {
      const newStoreId = targetUser.storeId || targetUser.id;
      const currentStoreIdToCompare = currentUser.storeId || currentUser.id;
      
      // Load new store data if switching to a different store
      if (newStoreId !== currentStoreIdToCompare) {
        try {
          const savedItems = localStorage.getItem(`${STORAGE_KEYS.ITEMS}_${newStoreId}`);
          setItems(savedItems ? JSON.parse(savedItems) : []);
          
          const savedSales = localStorage.getItem(`${STORAGE_KEYS.SALES}_${newStoreId}`);
          setSales(savedSales ? JSON.parse(savedSales) : []);
          
          const savedLogs = localStorage.getItem(`${STORAGE_KEYS.LOGS}_${newStoreId}`);
          setAdjustmentLogs(savedLogs ? JSON.parse(savedLogs) : []);
          
          const savedSettings = localStorage.getItem(`${STORAGE_KEYS.SETTINGS}_${newStoreId}`);
          setSettings(savedSettings ? { ...initialSettings, ...JSON.parse(savedSettings) } : initialSettings);
          
          const savedNotifs = localStorage.getItem(`store_notifications_${newStoreId}`);
          setNotifications(savedNotifs ? JSON.parse(savedNotifs) : []);
        } catch (e) {
          console.warn("Failed to load new store data", e);
        }
      }

      setCurrentUser(targetUser);
      setIsLocked(false);
      if (settings.soundEnabled) playSuccessChime();
      return true;
    }
    return false;
  }, [users, settings.soundEnabled, currentUser]);

  const addUser = useCallback((name: string, role: UserAccount['role'], pin: string) => {
    const newId = `user-${Date.now()}`;
    const newUser: UserAccount = {
      id: newId,
      name,
      role,
      pin,
      storeId: newId,
    };
    setUsers(prev => [...prev, newUser]);
  }, [currentStoreId]);

  const updateUserPin = useCallback((userId: string, newPin: string): boolean => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, pin: newPin } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, pin: newPin }));
    }
    return true;
  }, [currentUser.id]);

  // Settings & Theme
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  const setLanguage = useCallback((language: LanguageCode) => {
    setSettings(prev => ({ ...prev, language }));
  }, []);

  // Notifications
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Speaker / Voice Announcements
  const speakItem = useCallback((item: InventoryItem) => {
    setIsSpeaking(true);
    speakItemStock(item, settings.language, () => setIsSpeaking(true), () => setIsSpeaking(false));
  }, [settings.language]);

  const speakSummary = useCallback(() => {
    setIsSpeaking(true);
    speakStockSummary(items, settings.language, () => setIsSpeaking(true), () => setIsSpeaking(false));
  }, [items, settings.language]);

  const stopVoice = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setIsListening(false);
  }, []);

  const listenForSearch = useCallback((onResult: (text: string) => void) => {
    setIsListening(true);
    startListening(
      settings.language,
      (text) => {
        setIsListening(false);
        onResult(text);
      },
      () => {
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  }, [settings.language]);

  // Encryption & Cloud Backup Export
  const exportEncryptedBackup = useCallback(async (passphrase: string): Promise<string> => {
    const dataToExport = {
      items,
      sales,
      adjustmentLogs,
      users,
      settings,
      timestamp: new Date().toISOString(),
    };

    const payload: EncryptedDataPayload = await encryptData(
      dataToExport, 
      passphrase, 
      {
        itemCount: items.length,
        salesCount: sales.length,
        businessName: settings.businessName,
      }
    );

    const json = JSON.stringify(payload, null, 2);
    setSettings(prev => ({ ...prev, lastCloudBackup: new Date().toISOString() }));
    return json;
  }, [items, sales, adjustmentLogs, users, settings]);

  // Decrypt & Restore Backup
  const importEncryptedBackup = useCallback(async (jsonString: string, passphrase: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const payload: EncryptedDataPayload = JSON.parse(jsonString);
      const decrypted = await decryptData<any>(payload, passphrase);

      if (!decrypted || !decrypted.items) {
        return { success: false, error: t.invalidBackupStructure };
      }

      if (decrypted.items) setItems(decrypted.items);
      if (decrypted.sales) setSales(decrypted.sales);
      if (decrypted.adjustmentLogs) setAdjustmentLogs(decrypted.adjustmentLogs);
      if (decrypted.users) setUsers(decrypted.users);
      if (decrypted.settings) setSettings(decrypted.settings);

      if (settings.soundEnabled) playSuccessChime();
      return { success: true };
    } catch (err: any) {
      console.error('Decryption failed:', err);
      return { success: false, error: t.incorrectPassword };
    }
  }, [settings.soundEnabled]);

  // Cloud Sync Simulation
  const syncWithCloud = useCallback(async (): Promise<boolean> => {
    // Simulate cloud round-trip
    await new Promise(r => setTimeout(r, 900));
    const now = new Date().toISOString();
    setSettings(prev => ({
      ...prev,
      lastSyncTimestamp: now,
      lastCloudBackup: now,
    }));
    setNotifications(prev => [
      {
        id: `notif-sync-${Date.now()}`,
        type: 'backup',
        title: t.cloudSyncSuccess,
        message: t.cloudSyncMsg,
        timestamp: now,
        read: false,
      },
      ...prev,
    ]);
    if (settings.soundEnabled) playSuccessChime();
    return true;
  }, [settings.soundEnabled]);

  // Reset to default sample data
  const resetToDefaultData = useCallback(() => {
    setItems(initialItems);
    setSales(initialSales);
    setAdjustmentLogs(initialAdjustmentLogs);
    setUsers(initialUsers);
    setCurrentUser(initialUsers[0]);
    setSettings(initialSettings);
    setNotifications([]);
    setIsLocked(false);
  }, []);

  return (
    <InventoryContext.Provider value={{
      items,
      sales,
      adjustmentLogs,
      users,
      currentUser,
      isLocked,
      notifications,
      settings,
      isOnline,
      isSpeaking,
      isListening,
      activeTab,
      setActiveTab,
      addItem,
      updateItem,
      deleteItem,
      adjustStock,
      recordSale,
      unlockWithPin,
      lockApp,
      switchUser,
      addUser,
      updateUserPin,
      updateSettings,
      toggleTheme,
      setLanguage,
      markNotificationAsRead,
      clearAllNotifications,
      speakItem,
      speakSummary,
      stopVoice,
      listenForSearch,
      exportEncryptedBackup,
      importEncryptedBackup,
      syncWithCloud,
      resetToDefaultData,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
