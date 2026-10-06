const fs = require('fs');

let content = fs.readFileSync('src/context/InventoryContext.tsx', 'utf8');

const oldSwitchUser = `  const switchUser = useCallback((userId: string, pin: string): boolean => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return false;
    if (targetUser.pin === pin || pin === '1234') {
      setCurrentUser(targetUser);
      setIsLocked(false);
      if (settings.soundEnabled) playSuccessChime();
      return true;
    }
    return false;
  }, [users, settings.soundEnabled]);`;

const newSwitchUser = `  const switchUser = useCallback((userId: string, pin: string): boolean => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return false;
    if (targetUser.pin === pin || pin === '1234') {
      const newStoreId = targetUser.storeId || targetUser.id;
      const currentStoreIdToCompare = currentUser.storeId || currentUser.id;
      
      // Load new store data if switching to a different store
      if (newStoreId !== currentStoreIdToCompare) {
        try {
          const savedItems = localStorage.getItem(\`\${STORAGE_KEYS.ITEMS}_\${newStoreId}\`);
          setItems(savedItems ? JSON.parse(savedItems) : []);
          
          const savedSales = localStorage.getItem(\`\${STORAGE_KEYS.SALES}_\${newStoreId}\`);
          setSales(savedSales ? JSON.parse(savedSales) : []);
          
          const savedLogs = localStorage.getItem(\`\${STORAGE_KEYS.LOGS}_\${newStoreId}\`);
          setAdjustmentLogs(savedLogs ? JSON.parse(savedLogs) : []);
          
          const savedSettings = localStorage.getItem(\`\${STORAGE_KEYS.SETTINGS}_\${newStoreId}\`);
          setSettings(savedSettings ? { ...initialSettings, ...JSON.parse(savedSettings) } : initialSettings);
          
          const savedNotifs = localStorage.getItem(\`store_notifications_\${newStoreId}\`);
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
  }, [users, settings.soundEnabled, currentUser]);`;

content = content.replace(oldSwitchUser, newSwitchUser);

fs.writeFileSync('src/context/InventoryContext.tsx', content);
