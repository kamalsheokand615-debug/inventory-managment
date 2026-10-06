import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Volume2, 
  ArrowRight, 
  PackageCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Layers, 
  SlidersHorizontal,
  PackagePlus,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { InventoryItem, StockChangeReason } from '../types';
import { translations } from '../utils/translations';
import { playClickBeep } from '../utils/sound';

interface ManualStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: InventoryItem | null;
  onOpenAddItem?: () => void;
}

export const ManualStockModal: React.FC<ManualStockModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  onOpenAddItem,
}) => {
  const { items, adjustStock, speakItem, settings, resetToDefaultData } = useInventory();
  const t = translations[settings.language] || translations.hi;

  const [activeItemId, setActiveItemId] = useState<string>('');
  const [mode, setMode] = useState<'add' | 'subtract' | 'set'>('add');
  const [changeAmount, setChangeAmount] = useState<number>(1);
  const [targetStock, setTargetStock] = useState<number>(0);
  const [reason, setReason] = useState<StockChangeReason>('purchase');
  const [note, setNote] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync state whenever modal opens or selected item changes
  useEffect(() => {
    if (isOpen) {
      if (selectedItem) {
        setActiveItemId(selectedItem.id);
        setTargetStock(selectedItem.quantity);
      } else if (items.length > 0) {
        // If current activeItemId is not in items, default to the first one
        if (!items.some(i => i.id === activeItemId)) {
          setActiveItemId(items[0].id);
          setTargetStock(items[0].quantity);
        }
      }
      setMode('add');
      setChangeAmount(1);
      setReason('purchase');
      setNote('');
      setSearchQuery('');
    }
  }, [isOpen, selectedItem, items]);

  if (!isOpen) return null;

  // Handle empty items scenario gracefully
  if (items.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.manualStockManagement}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {settings.language === 'en' 
                ? 'No products available in the inventory yet to adjust stock.'
                : 'स्टॉक अपडेट करने के लिए दुकान में अभी कोई सामान मौजूद नहीं है।'}
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            {onOpenAddItem && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddItem();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <PackagePlus className="w-4 h-4" />
                <span>{t.addItem}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                resetToDefaultData();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{settings.language === 'en' ? 'Load Sample Products' : 'नमूना उत्पाद लोड करें'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = items.find(i => i.id === activeItemId) || items[0];

  // Calculations
  let calculatedNewQty = currentItem.quantity;
  let finalChange = 0;

  if (mode === 'add') {
    calculatedNewQty = currentItem.quantity + changeAmount;
    finalChange = changeAmount;
  } else if (mode === 'subtract') {
    const safeAmount = Math.min(changeAmount, currentItem.quantity);
    calculatedNewQty = Math.max(0, currentItem.quantity - safeAmount);
    finalChange = -safeAmount;
  } else if (mode === 'set') {
    calculatedNewQty = Math.max(0, targetStock);
    finalChange = calculatedNewQty - currentItem.quantity;
  }

  const handleModeChange = (newMode: 'add' | 'subtract' | 'set') => {
    playClickBeep();
    setMode(newMode);
    if (newMode === 'add') {
      setReason('purchase');
      setChangeAmount(prev => prev > 0 ? prev : 1);
    } else if (newMode === 'subtract') {
      setReason('damaged');
      setChangeAmount(prev => prev > 0 ? Math.min(prev, currentItem.quantity || 1) : 1);
    } else {
      setReason('audit');
      setTargetStock(currentItem.quantity);
    }
  };

  const handleQuickAdd = (amt: number) => {
    playClickBeep();
    setMode('add');
    setChangeAmount(amt);
    setReason('purchase');
  };

  const handleQuickSubtract = (amt: number) => {
    playClickBeep();
    setMode('subtract');
    const safeAmt = Math.min(amt, currentItem.quantity);
    setChangeAmount(safeAmt);
    setReason('damaged');
  };

  const handleQuickSet = (val: number) => {
    playClickBeep();
    setMode('set');
    setTargetStock(Math.max(0, val));
    setReason('audit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalChange === 0 && mode !== 'set') {
      onClose();
      return;
    }
    adjustStock(currentItem.id, finalChange, reason, note);
    onClose();
  };

  // Filtered items for dropdown
  const filteredProducts = searchQuery.trim()
    ? items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.nameHi && item.nameHi.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg my-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                {t.manualStockManagement}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {settings.language === 'en' ? 'Inward, Outward & Direct Stock Count' : 'स्टॉक जोड़ना, घटाना एवं सीधा मिलान (+/-)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Select Product */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.selectProduct}
              </label>
              {items.length > 4 && (
                <span className="text-[11px] text-slate-400">
                  {items.length} {t.productsCount}
                </span>
              )}
            </div>

            {/* Quick search input if more than 5 products */}
            {items.length > 5 && (
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={settings.language === 'en' ? 'Filter products by name or SKU...' : 'सामान खोजें...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            )}

            <select
              value={activeItemId}
              onChange={(e) => {
                const newId = e.target.value;
                setActiveItemId(newId);
                const found = items.find(i => i.id === newId);
                if (found) {
                  setTargetStock(found.quantity);
                  if (mode === 'subtract' && changeAmount > found.quantity) {
                    setChangeAmount(Math.max(1, found.quantity));
                  }
                }
              }}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-colors"
            >
              {filteredProducts.map(item => {
                const displayName = settings.language === 'en' 
                  ? item.name 
                  : (item.nameHi ? `${item.nameHi} (${item.name})` : item.name);
                return (
                  <option key={item.id} value={item.id}>
                    {displayName} — [{item.quantity} {item.unit}]
                  </option>
                );
              })}
            </select>
          </div>

          {/* Current Stock Banner with Voice Audio Announcement */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.currentStock}</p>
              <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentItem.quantity}
                </span>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {currentItem.unit}
                </span>
                {currentItem.quantity === 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                    {t.outOfStock}
                  </span>
                ) : currentItem.quantity <= currentItem.minThreshold ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    {t.lowStock}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {t.healthyStock}
                  </span>
                )}
              </div>
            </div>

            {/* Speaker Button to Hear Aloud */}
            <button
              type="button"
              onClick={() => speakItem(currentItem)}
              title={t.speakStatus}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm text-xs font-semibold active:scale-95 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>{t.speakerText}</span>
            </button>
          </div>

          {/* 3 Clear Mode Selector Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {settings.language === 'en' ? 'Stock Adjustment Mode' : 'स्टॉक बदलाव का प्रकार चुनें'}
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700">
              
              {/* Add Tab */}
              <button
                type="button"
                onClick={() => handleModeChange('add')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  mode === 'add'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{settings.language === 'en' ? '+ Add' : '+ माल जोड़ें'}</span>
              </button>

              {/* Subtract Tab */}
              <button
                type="button"
                onClick={() => handleModeChange('subtract')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  mode === 'subtract'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>{settings.language === 'en' ? '- Reduce' : '- माल घटाएं'}</span>
              </button>

              {/* Direct Set Tab */}
              <button
                type="button"
                onClick={() => handleModeChange('set')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  mode === 'set'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{settings.language === 'en' ? '= Set Exact' : '= सीधा सेट करें'}</span>
              </button>
            </div>
          </div>

          {/* Mode-Specific Quantity Controller */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            
            {/* Mode 1 & 2: Add or Subtract Amount */}
            {mode !== 'set' ? (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {mode === 'add' 
                      ? (settings.language === 'en' ? 'Quantity to Add (+)' : 'कितनी मात्रा जोड़नी है (+)') 
                      : (settings.language === 'en' ? 'Quantity to Reduce (-)' : 'कितनी मात्रा घटानी है (-)')}
                  </label>
                  <span className="text-xs text-slate-500 font-semibold">
                    {currentItem.unit}
                  </span>
                </div>

                {/* Big Number Input with Plus/Minus */}
                <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => {
                      playClickBeep();
                      setChangeAmount(prev => Math.max(1, prev - 1));
                    }}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={mode === 'subtract' ? currentItem.quantity : undefined}
                    value={changeAmount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      if (mode === 'subtract') {
                        setChangeAmount(Math.min(Math.max(1, val), currentItem.quantity));
                      } else {
                        setChangeAmount(Math.max(1, val));
                      }
                    }}
                    className="w-full text-center py-2 text-lg font-black bg-transparent text-slate-900 dark:text-white focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playClickBeep();
                      if (mode === 'subtract' && changeAmount >= currentItem.quantity) return;
                      setChangeAmount(prev => prev + 1);
                    }}
                    disabled={mode === 'subtract' && changeAmount >= currentItem.quantity}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Selection Shortcuts */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-xs font-semibold text-slate-500 mr-1">
                    {t.quickAdjust}:
                  </span>
                  {mode === 'add' ? (
                    [1, 5, 10, 25, 50, 100].map(amt => (
                      <button
                        key={`add-${amt}`}
                        type="button"
                        onClick={() => handleQuickAdd(amt)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                          changeAmount === amt
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        +{amt}
                      </button>
                    ))
                  ) : (
                    [1, 2, 5, 10, 20, 50]
                      .filter(amt => amt <= currentItem.quantity)
                      .map(amt => (
                        <button
                          key={`sub-${amt}`}
                          type="button"
                          onClick={() => handleQuickSubtract(amt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                            changeAmount === amt
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          -{amt}
                        </button>
                      ))
                  )}
                </div>
              </>
            ) : (
              /* Mode 3: Set Exact Stock */
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {settings.language === 'en' ? 'Target Exact Stock (Current Physical Count)' : 'नया कुल सटीक स्टॉक (गिनती अनुसार)'}
                  </label>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                    {currentItem.unit}
                  </span>
                </div>

                <div className="flex items-center rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => {
                      playClickBeep();
                      setTargetStock(prev => Math.max(0, prev - 1));
                    }}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={targetStock}
                    onChange={(e) => setTargetStock(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-center py-2 text-lg font-black bg-transparent text-indigo-900 dark:text-indigo-200 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playClickBeep();
                      setTargetStock(prev => prev + 1);
                    }}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Set Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-xs font-semibold text-slate-500 mr-1">
                    {settings.language === 'en' ? 'Quick Set:' : 'त्वरित सेट:'}
                  </span>
                  {[0, currentItem.minThreshold, currentItem.minThreshold * 2, 20, 50].map(val => (
                    <button
                      key={`set-${val}`}
                      type="button"
                      onClick={() => handleQuickSet(val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                        targetStock === val
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
                      }`}
                    >
                      {val === 0 ? '0 (Out of stock)' : val}
                    </button>
                  ))}
                </div>
              </>
            )}

          </div>

          {/* Reason & Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.reason}
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as StockChangeReason)}
                className="w-full py-2 px-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="purchase">{t.reasonPurchase} (+ माल आया)</option>
                <option value="damaged">{t.reasonDamaged} (- खराब/एक्सपायर्ड)</option>
                <option value="sale">{t.reasonSale} (- बिक्री)</option>
                <option value="return">{t.reasonReturn} (+ ग्राहक वापसी)</option>
                <option value="audit">{t.reasonAudit} (= ऑडिट मिलान)</option>
                <option value="correction">{t.reasonCorrection} (+/- सुधार)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.noteOptional}
              </label>
              <input
                type="text"
                placeholder={settings.language === 'en' ? 'Bill no, supplier, or note...' : 'बिल नंबर या टिप्पणी...'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Real-time Calculation Result Preview */}
          <div className={`p-3 rounded-xl border flex items-center justify-between ${
            finalChange > 0 
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' 
              : finalChange < 0 
              ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800' 
              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
          }`}>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {t.currentPlain || 'वर्तमान'}: <strong className="text-slate-900 dark:text-white">{currentItem.quantity} {currentItem.unit}</strong>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-900 dark:text-white">
                {t.newStockPlain || 'नया स्टॉक'}: <span className="text-sm font-black underline">{calculatedNewQty} {currentItem.unit}</span>
              </span>
            </div>

            <div className={`text-xs font-black px-2.5 py-1 rounded-lg ${
              finalChange > 0 
                ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200' 
                : finalChange < 0 
                ? 'bg-rose-200 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200' 
                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            }`}>
              {finalChange > 0 ? `+${finalChange}` : finalChange} {currentItem.unit}
            </div>
          </div>

          {/* Submitting Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                finalChange >= 0 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' 
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>{t.saveStock}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
