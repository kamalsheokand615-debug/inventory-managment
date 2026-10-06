const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

content = content.replace(
  /<header id="main-header" className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white\/95 backdrop-blur shadow-xs dark:border-slate-800 dark:bg-slate-900\/95">/,
  '<header id="main-header" className="shrink-0 sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs dark:border-slate-800 dark:bg-slate-900/95">'
);

fs.writeFileSync('src/components/Navbar.tsx', content);
