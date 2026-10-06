const fs = require('fs');
let content = fs.readFileSync('tsconfig.json', 'utf8');

content = content.replace(
  /"noEmit": true/,
  '"noEmit": true\n  },\n  "exclude": ["dist", "node_modules"]'
);
content = content.replace(
  /}\s*}/,
  '}\n}'
);

fs.writeFileSync('tsconfig.json', content);
