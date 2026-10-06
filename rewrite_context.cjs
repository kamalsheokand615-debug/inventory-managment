const fs = require('fs');

let content = fs.readFileSync('src/context/InventoryContext.tsx', 'utf8');

// The block we want to replace is from `const [items` down to `const [settings`.
// We will replace the whole initialization block and the useEffects that save them.

const startPattern = `  // Load from localStorage or defaults\n  const [items, setItems] = useState<InventoryItem\\[\\]>\\(\\(\\) => \\{`;
const searchRegex = new RegExp("  // Load from localStorage or defaults[\\s\\S]*?  const \\[isListening, setIsListening\\] = useState<boolean>\\(false\\);");

const replacement = `  // Load from localStorage or defaults
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
      const saved = localStorage.getItem(\`\${STORAGE_KEYS.ITEMS}_\${currentStoreId}\`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(\`\${STORAGE_KEYS.SALES}_\${currentStoreId}\`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [adjustmentLogs, setAdjustmentLogs] = useState<StockAdjustmentLog[]>(() => {
    try {
      const saved = localStorage.getItem(\`\${STORAGE_KEYS.LOGS}_\${currentStoreId}\`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(\`\${STORAGE_KEYS.SETTINGS}_\${currentStoreId}\`);
      return saved ? { ...initialSettings, ...JSON.parse(saved) } : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(\`store_notifications_\${currentStoreId}\`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);`;

content = content.replace(searchRegex, replacement);

fs.writeFileSync('src/context/InventoryContext.tsx', content);
