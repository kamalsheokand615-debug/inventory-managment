const fs = require('fs');
let content = fs.readFileSync('src/components/SalesView.tsx', 'utf8');

content = content.replace(
  /placeholder="\+ "/,
  'placeholder={"+ " + t.selectProduct}'
);

fs.writeFileSync('src/components/SalesView.tsx', content);
