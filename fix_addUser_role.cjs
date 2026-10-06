const fs = require('fs');
let content = fs.readFileSync('src/context/InventoryContext.tsx', 'utf8');

const oldAddUser = `  const addUser = useCallback((name: string, role: UserAccount['role'], pin: string) => {
    const newUser: UserAccount = {
      id: \`user-\${Date.now()}\`,
      name,
      role,
      pin,
      storeId: currentStoreId,
    };
    setUsers(prev => [...prev, newUser]);
  }, [currentStoreId]);`;

const newAddUser = `  const addUser = useCallback((name: string, role: UserAccount['role'], pin: string) => {
    const newId = \`user-\${Date.now()}\`;
    const newUser: UserAccount = {
      id: newId,
      name,
      role,
      pin,
      storeId: role === 'admin' ? newId : currentStoreId,
    };
    setUsers(prev => [...prev, newUser]);
  }, [currentStoreId]);`;

content = content.replace(oldAddUser, newAddUser);

fs.writeFileSync('src/context/InventoryContext.tsx', content);
