const fs = require('fs');
let content = fs.readFileSync('src/components/UsersView.tsx', 'utf8');

content = content.replace(
  /<span className=\{`px-2\.5 py-0\.5 rounded-full text-\[11px\] font-bold border \$\{roleInfo\.color\}`\}>[\s\S]*?<\/span>/,
  `<span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-emerald-300 text-emerald-800 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
    STORE PROFILE
  </span>`
);

content = content.replace(
  /\{roleInfo\.desc\}/,
  "Independent Data & Settings"
);

fs.writeFileSync('src/components/UsersView.tsx', content);
