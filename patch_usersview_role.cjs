const fs = require('fs');
let content = fs.readFileSync('src/components/UsersView.tsx', 'utf8');

content = content.replace(
  /currentUser\.role === 'admin' &&/g,
  "true &&"
);

// I should also remove the roleLabels entirely to be safe and clean.
content = content.replace(/const roleLabels.*?\]\};\s*$/m, "");

fs.writeFileSync('src/components/UsersView.tsx', content);
