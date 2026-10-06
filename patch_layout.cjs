const fs = require('fs');

// 1. Fix App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  /<div className="h-\[100dvh\] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">/,
  '<div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">'
);
appContent = appContent.replace(
  /<main className="flex-1 overflow-y-auto w-full">\s*<div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-6 lg:pb-8">/,
  '<main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-8">'
);
appContent = appContent.replace(
  /<\/div>\s*<\/main>/,
  '</main>'
);
fs.writeFileSync('src/App.tsx', appContent);


// 2. Fix BottomNav.tsx
let navContent = fs.readFileSync('src/components/BottomNav.tsx', 'utf8');
navContent = navContent.replace(
  /className="lg:hidden shrink-0 z-40 bg-white\/95 dark:bg-slate-900\/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 pb-safe pb-2"/,
  'className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"'
);
fs.writeFileSync('src/components/BottomNav.tsx', navContent);


// 3. Fix Navbar.tsx
let headerContent = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
headerContent = headerContent.replace(
  /className="shrink-0 sticky top-0 z-40 w-full border-b border-slate-200 bg-white\/95 backdrop-blur shadow-xs dark:border-slate-800 dark:bg-slate-900\/95"/,
  'className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm dark:border-slate-800 dark:bg-slate-900/95"'
);
fs.writeFileSync('src/components/Navbar.tsx', headerContent);

