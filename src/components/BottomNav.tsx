import React from 'react';
import { LayoutGrid, Boxes, ShoppingCart, BarChart3, Settings, Landmark, Cpu } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { translations } from '../utils/translations';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, settings, notifications } = useInventory();
  const t = translations[settings.language] || translations.hi;

  const tabs = [
    { id: 'dashboard', label: settings.language === 'en' ? 'Dashboard' : settings.language === 'hinglish' ? 'Dashboard' : 'डैशबोर्ड', icon: LayoutGrid },
    { id: 'inventory', label: settings.language === 'en' ? 'Inventory' : settings.language === 'hinglish' ? 'Stock' : 'स्टॉक', icon: Boxes },
    { id: 'sales', label: settings.language === 'en' ? 'Sales' : settings.language === 'hinglish' ? 'Billing' : 'बिलिंग', icon: ShoppingCart },
    { id: 'khata', label: (t as any).khataNav || (settings.language === 'en' ? 'Credit' : settings.language === 'hinglish' ? 'Udhaar' : 'उधार'), icon: Landmark },
    { id: 'reports', label: settings.language === 'en' ? 'Reports' : settings.language === 'hinglish' ? 'Reports' : 'रिपोर्ट्स', icon: BarChart3 },
    { id: 'enterprise', label: settings.language === 'en' ? 'Enterprise' : settings.language === 'hinglish' ? 'Enterprise' : 'ऑटोमेशन', icon: Cpu },
    { id: 'settings', label: settings.language === 'en' ? 'Settings' : settings.language === 'hinglish' ? 'Settings' : 'सेटिंग्स', icon: Settings },
  ];

  const lowStockCount = notifications.filter(n => !n.read && (n.type === 'low_stock' || n.type === 'out_of_stock')).length;

  return (
    <nav 
      id="bottom-navigation-bar" 
      aria-label="Main Navigation"
      className="shrink-0 w-full xl:hidden bg-white/98 dark:bg-slate-900/98 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] z-40 select-none pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex items-center justify-around h-16 sm:h-18 px-1 sm:px-6 max-w-4xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-item-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 px-0.5 sm:px-1 text-center transition-all cursor-pointer group relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon 
                  className={`w-6 h-6 sm:w-6.5 sm:h-6.5 transition-transform duration-150 ${
                    isActive ? 'scale-105 stroke-[2.25]' : 'stroke-[1.75] group-hover:scale-105'
                  }`} 
                />
                {tab.id === 'inventory' && lowStockCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
              <span className={`text-[10px] sm:text-xs mt-1 tracking-tight whitespace-nowrap transition-colors ${
                isActive ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'font-medium'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
