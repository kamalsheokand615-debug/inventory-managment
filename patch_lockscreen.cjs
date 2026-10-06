const fs = require('fs');
let content = fs.readFileSync('src/components/LockScreen.tsx', 'utf8');

content = content.replace(
  /\{t\.currentRole\} \/ \{t\.switchUser\}/g,
  "{t.switchUser}"
);

content = content.replace(
  /\{t\.testPinMsg\} <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">1234<\/span> \(\{t\.adminRole\}\)/g,
  "{t.testPinMsg} <span className=\"font-mono text-emerald-600 dark:text-emerald-400 font-bold\">1234</span>"
);

// Also remove "User Role Switcher Dropdown" comment
content = content.replace(/\{\/\* User Role Switcher Dropdown \*\/\}/g, "{/* Profile Switcher */}");

fs.writeFileSync('src/components/LockScreen.tsx', content);
