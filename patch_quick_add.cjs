const fs = require('fs');
let content = fs.readFileSync('src/components/SalesView.tsx', 'utf8');

const stateCode = `  const [quickSearch, setQuickSearch] = useState('');
  const [showQuickDropdown, setShowQuickDropdown] = useState(false);
  const quickDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickDropdownRef.current && !quickDropdownRef.current.contains(event.target as Node)) {
        setShowQuickDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const quickSearchItems = items.filter(i => {
    if (i.quantity <= 0) return false;
    const q = quickSearch.toLowerCase().trim();
    if (!q) return true;
    return i.name.toLowerCase().includes(q) || (i.nameHi && i.nameHi.toLowerCase().includes(q)) || i.sku.toLowerCase().includes(q);
  });
`;

content = content.replace(
  /  \/\/ Filter products for adding to cart/,
  stateCode + "\n  // Filter products for adding to cart"
);

const originalDropdown = `            {/* Quick Add Product Dropdown */}
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
            </div>`;

const newDropdown = `            {/* Quick Add Product Dropdown with Typing */}
            <div className="mb-3 relative" ref={quickDropdownRef}>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                <input
                  type="text"
                  placeholder="+ "
                  value={quickSearch}
                  onFocus={() => setShowQuickDropdown(true)}
                  onChange={(e) => {
                    setQuickSearch(e.target.value);
                    setShowQuickDropdown(true);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 transition-shadow"
                />
              </div>

              {showQuickDropdown && (
                <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
                  {quickSearchItems.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                      No products found
                    </div>
                  ) : (
                    <div className="py-1">
                      {quickSearchItems.map(i => (
                        <button
                          key={i.id}
                          type="button"
                          onClick={() => {
                            addToCart(i);
                            setQuickSearch('');
                            setShowQuickDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors flex justify-between items-center"
                        >
                          <span className="truncate pr-2">
                            {settings.language === 'en' ? i.name : (i.nameHi || i.name)}
                          </span>
                          <span className="font-semibold shrink-0 text-emerald-600 dark:text-emerald-400">
                            {settings.currency}{i.sellingPrice}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>`;

content = content.replace(originalDropdown, newDropdown);

fs.writeFileSync('src/components/SalesView.tsx', content);
