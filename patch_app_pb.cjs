const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /pb-24 lg:pb-8/,
  'pb-6 lg:pb-8'
);

fs.writeFileSync('src/App.tsx', content);
