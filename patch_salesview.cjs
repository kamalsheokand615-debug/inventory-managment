const fs = require('fs');
let content = fs.readFileSync('src/components/SalesView.tsx', 'utf8');

// Insert dropdown inside the right column
const insertionPoint = `            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">`;

const quickAddHTML = `            {/* Quick Add Product Dropdown */}
            <div className="mb-3">
              <select
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                value=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  const item = items.find(i => i.id === e.target.value);
                  if (item) addToCart(item);
                  e.target.value = "";
                }}
              >
                <option value="">+ {t.selectProduct}</option>
                {items.filter(i => i.quantity > 0).map(i => (
                  <option key={i.id} value={i.id}>
                    {settings.language === 'en' ? i.name : (i.nameHi || i.name)} ({i.quantity} {i.unit}) - {settings.currency}{i.sellingPrice}
                  </option>
                ))}
              </select>
            </div>

`;

content = content.replace(insertionPoint, quickAddHTML + insertionPoint);

fs.writeFileSync('src/components/SalesView.tsx', content);
