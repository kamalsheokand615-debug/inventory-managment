const fs = require('fs');
let content = fs.readFileSync('src/components/UsersView.tsx', 'utf8');

// The dropdown was left behind when I removed the state.
content = content.replace(
  /<div>\s*<label className="text-xs font-semibold text-slate-500 block mb-1">\{t\.roleField\}<\/label>\s*<select\s*value=\{newUserRole\}\s*onChange=\{\(e\) => setNewUserRole\(e\.target\.value as UserRole\)\}\s*className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"\s*>\s*<option value="staff">\{t\.staff\}<\/option>\s*<option value="manager">\{t\.manager\}<\/option>\s*<option value="admin">\{t\.admin\}<\/option>\s*<\/select>\s*<\/div>/g,
  ""
);

fs.writeFileSync('src/components/UsersView.tsx', content);
