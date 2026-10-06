const fs = require('fs');
let content = fs.readFileSync('src/context/InventoryContext.tsx', 'utf8');

// The `t` variable is missing in InventoryContext but translations are being used.
// Let's add it near the top of the provider or remove the uses of t.
// Wait, the errors are about `t` not being defined where it's used inside the context methods.
// I will just define `t` inside the methods that need it, or at the top of the provider component.

content = content.replace(
  /const switchUser = useCallback\(\(userId: string, pin: string\): boolean => \{/,
  "const switchUser = useCallback((userId: string, pin: string): boolean => {\n    const t = translations[settings.language] || translations.hi;"
);

content = content.replace(
  /const addUser = useCallback\(\(name: string, role: UserRole, pin: string\): boolean => \{/,
  "const addUser = useCallback((name: string, role: UserRole, pin: string): boolean => {\n    const t = translations[settings.language] || translations.hi;"
);

content = content.replace(
  /const addItem = useCallback\(\(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>\) => \{/,
  "const addItem = useCallback((item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {\n    const t = translations[settings.language] || translations.hi;"
);

content = content.replace(
  /const deleteItem = useCallback\(\(id: string\) => \{/,
  "const deleteItem = useCallback((id: string) => {\n    const t = translations[settings.language] || translations.hi;"
);

content = content.replace(
  /const processSale = useCallback\(\(itemsToSell: \{ item: InventoryItem; quantity: number \}*, discountAmount: number = 0\): boolean => \{/,
  "const processSale = useCallback((itemsToSell: { item: InventoryItem; quantity: number }[], discountAmount: number = 0): boolean => {\n    const t = translations[settings.language] || translations.hi;"
);

content = content.replace(
  /const syncWithCloud = async \(\) => \{/,
  "const syncWithCloud = async () => {\n    const t = translations[settings.language] || translations.hi;"
);


fs.writeFileSync('src/context/InventoryContext.tsx', content);
