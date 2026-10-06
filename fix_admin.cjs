const fs = require('fs');
let content = fs.readFileSync('src/components/UsersView.tsx', 'utf8');

// The replacement was: content = content.replace(/newUserRole,/g, "'admin',");
// So `const [newUserRole, ...` became `const ['admin', ...`
// Also `addUser(newUserName.trim(), newUserRole, ...)` became `addUser(newUserName.trim(), 'admin', ...)`

content = content.replace(/const \['admin', setNewUserRole\] = useState<UserRole>\('staff'\);/g, "");

fs.writeFileSync('src/components/UsersView.tsx', content);
