const fs = require('fs');
let content = fs.readFileSync('src/components/UsersView.tsx', 'utf8');

// The card rendering loops over users
// const roleInfo = roleLabels[user.role];
const findCard = `              const roleInfo = roleLabels[user.role];
              const isCurrent = currentUser.id === user.id;`;

const replaceCard = `              const isCurrent = currentUser.id === user.id;`;

content = content.replace(findCard, replaceCard);

content = content.replace(/const roleInfo = roleLabels\[user\.role\];/g, "");

content = content.replace(/<span className=\{`inline-flex items-center px-2 py-0\.5 rounded text-\[10px\] font-bold border \$\{roleInfo\.color\}`\}>\s*\{roleInfo\.title\}\s*<\/span>/g, `<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                      Store Profile
                    </span>`);

content = content.replace(/<p className="text-xs text-slate-500 mt-2">\s*\{roleInfo\.desc\}\s*<\/p>/g, `<p className="text-xs text-slate-500 mt-2">
                      Independent Data & Settings
                    </p>`);

// Remove permissions matrix
content = content.replace(/\{\/\* Permissions Matrix \*\/\}/g, "");
content = content.replace(/<div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">[\s\S]*?<\/table>\s*<\/div>\s*<\/div>/, "");

fs.writeFileSync('src/components/UsersView.tsx', content);
