import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Volume2, 
  Edit, 
  Trash2, 
  Mic, 
  MicOff, 
  Filter, 
  Package, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle, 
  ArrowUpDown,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { InventoryItem } from '../types';
import { translations } from '../utils/translations';

interface InventoryViewProps {
  onOpenManualStock: (item?: InventoryItem) => void;
  onOpenAddItem: () => void;
  onEditItem: (item: InventoryItem) => void;
  initialSelectedItemId?: string | null;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenManualStock,
  onOpenAddItem,
  onEditItem,
}) => {
  const { 
    items, 
    deleteItem, 
    speakItem, 
    listenForSearch, 
    isListening, 
    stopVoice, 
    settings, 
    currentUser 
  } = useInventory();

  const t = translations[settings.language] || translations.hi;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'price'>('quantity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];

  // Voice search handler
  const handleVoiceSearch = () => {
    if (isListening) {
      stopVoice();
    } else {
      listenForSearch((transcript) => {
        setSearchQuery(transcript);
      });
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    // Search match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.nameHi && item.nameHi.toLowerCase().includes(q)) ||
      item.sku.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);

    // Category match
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'out_of_stock') {
      matchesStatus = item.quantity === 0;
    } else if (statusFilter === 'low_stock') {
      matchesStatus = item.quantity > 0 && item.quantity <= item.minThreshold;
    } else if (statusFilter === 'in_stock') {
      matchesStatus = item.quantity > item.minThreshold;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'quantity') {
      comparison = a.quantity - b.quantity;
    } else if (sortBy === 'price') {
      comparison = a.sellingPrice - b.sellingPrice;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const canEdit = true;

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.inventory}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
              {filteredItems.length} {t.productsCount}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.inventoryDesc}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onOpenManualStock()}
            className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.manualStockManagement} (+/-)</span>
          </button>

          {canEdit && (
            <button
              onClick={onOpenAddItem}
              className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addItem}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar & Voice Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
        
        {/* Search input with microphone */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
          <button
            type="button"
            onClick={handleVoiceSearch}
            title={isListening ? t.listening : t.voiceSearch}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="md:col-span-6 flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: t.filterAll, count: items.length },
            { id: 'in_stock', label: t.inStock, count: items.filter(i => i.quantity > i.minThreshold).length },
            { id: 'low_stock', label: t.lowStock, count: items.filter(i => i.quantity > 0 && i.quantity <= i.minThreshold).length },
            { id: 'out_of_stock', label: t.outOfStock, count: items.filter(i => i.quantity === 0).length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* Category Horizontal Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat === 'All' ? t.allCategories : cat}
          </button>
        ))}
      </div>

      {/* Main Inventory Table / Card Display */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {sortedItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-60" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">{t.noItemsFound}</p>
            <p className="text-xs text-slate-500 mt-1">{t.changeSearchTerm}</p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout (< sm) */}
            <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
              {sortedItems.map((item) => {
                const isOut = item.quantity === 0;
                const isLow = item.quantity > 0 && item.quantity <= item.minThreshold;
                const totalRecorded = item.quantity + (item.totalSold || 0);
                const soldPercent = totalRecorded > 0 ? Math.round(((item.totalSold || 0) / totalRecorded) * 100) : 0;

                return (
                  <div key={item.id} className="p-3 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {settings.language === 'en' ? item.name : (item.nameHi || item.name)}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">{item.sku}</span>
                        </div>
                      </div>
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 shrink-0">
                          {t.outOfStock}
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 shrink-0">
                          {t.lowStock}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                          {t.inStock}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px] block">{t.currentStock}</span>
                        <span className={`text-base font-black ${isOut ? 'text-rose-600 dark:text-rose-400' : isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                          {item.quantity} {item.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{t.alertLimit}: {item.minThreshold} {item.unit}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">{t.sellingPrice}</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          {settings.currency}{item.sellingPrice}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{t.cost}: {settings.currency}{item.costPrice}</span>
                      </div>
                    </div>

                    {/* Consumption progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>{item.totalSold || 0} {item.unit} {t.sold}</span>
                        <span>{soldPercent}% {t.consumption}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, soldPercent)}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => speakItem(item)}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1 min-h-[38px]"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{t.speakerText}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenManualStock(item)}
                          className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 min-h-[38px]"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>+/-</span>
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[38px] min-w-[38px] flex items-center justify-center"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`${t.confirmDeleteItem} - ${item.name}`)) {
                              deleteItem(item.id);
                            }
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 min-h-[38px] min-w-[38px] flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tablet & Desktop Table (>= sm) */}
            <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">{t.itemNameAndCode}</th>
                  <th className="py-3 px-3">{t.category}</th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => {
                      setSortBy('quantity');
                      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                    }}>
                      <span>{t.currentStock}</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3">{t.depletedOrSold}</th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => {
                      setSortBy('price');
                      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                    }}>
                      <span>{t.priceCostAndSelling}</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3">{t.status}</th>
                  <th className="py-3 px-4 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sortedItems.map((item) => {
                  const isOut = item.quantity === 0;
                  const isLow = item.quantity > 0 && item.quantity <= item.minThreshold;
                  
                  // Calculate depletion %
                  const totalRecorded = item.quantity + (item.totalSold || 0);
                  const soldPercent = totalRecorded > 0 ? Math.round(((item.totalSold || 0) / totalRecorded) * 100) : 0;

                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {settings.language === 'en' ? item.name : (item.nameHi || item.name)}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          {settings.language !== 'en' && item.nameHi && <span>{item.name}</span>}
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">
                            {item.sku}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium">
                        {item.category}
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-3">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-base font-black ${
                            isOut 
                              ? 'text-rose-600 dark:text-rose-400' 
                              : isLow 
                                ? 'text-amber-600 dark:text-amber-400' 
                                : 'text-slate-900 dark:text-white'
                          }`}>
                            {item.quantity}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {item.unit}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {t.alertLimit}: {item.minThreshold} {item.unit}
                        </span>
                      </td>

                      {/* Depleted / Sold */}
                      <td className="py-3 px-3">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {item.totalSold || 0} {item.unit} {t.sold}
                        </div>
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, soldPercent)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {soldPercent}% {t.consumption}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {settings.currency}{item.sellingPrice}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {t.cost}: {settings.currency}{item.costPrice} 
                          <span className="text-emerald-600 dark:text-emerald-400 ml-1 font-semibold">
                            (+{settings.currency}{item.sellingPrice - item.costPrice})
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3">
                        {isOut ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 whitespace-nowrap inline-flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3" />
                            <span>{t.outOfStock}</span>
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 whitespace-nowrap inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{t.lowStock}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 whitespace-nowrap inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>{t.inStock}</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                          
                          {/* Speaker Button: Announce this stock aloud! */}
                          <button
                            onClick={() => speakItem(item)}
                            title={t.speakerStockAnnouncement}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          {/* Quick Adjust +/- Modal */}
                          <button
                            onClick={() => onOpenManualStock(item)}
                            title={t.adjustStock}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>

                          {/* Edit Item */}
                          {canEdit && (
                            <button
                              onClick={() => onEditItem(item)}
                              title={t.editItem}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Item (Admin only) */}
                          {true && (
                            <button
                              onClick={() => {
                                if (confirm(`${t.confirmDeleteItem} - ${item.name}`)) {
                                  deleteItem(item.id);
                                }
                              }}
                              title={t.deleteItem}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

    </div>
  );
};
