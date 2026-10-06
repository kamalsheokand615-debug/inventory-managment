const fs = require('fs');
let content = fs.readFileSync('src/components/BottomNav.tsx', 'utf8');

content = content.replace(
  /className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white\/95 dark:bg-slate-900\/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 pb-safe"/,
  'className="lg:hidden shrink-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 pb-safe pb-2"'
);

fs.writeFileSync('src/components/BottomNav.tsx', content);
