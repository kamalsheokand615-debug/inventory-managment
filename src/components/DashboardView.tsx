import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle, 
  TrendingUp, 
  Volume2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Sparkles, 
  Layers, 
  ArrowRight,
  RefreshCw,
  Zap,
  VolumeX,
  Boxes
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { translations } from '../utils/translations';
import { InventoryItem } from '../types';

interface DashboardViewProps {
  onOpenManualStock: (item?: InventoryItem) => void;
  onOpenAddItem: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenManualStock,
  onOpenAddItem,
}) => {
  const { 
    items, 
    sales, 
    settings, 
    speakItem, 
    speakSummary, 
    isSpeaking, 
    stopVoice, 
    setActiveTab 
  } = useInventory();

  const t = translations[settings.language] || translations.hi;

  // Stock calculations
  const totalItems = items.length;
  const outOfStockItems = items.filter(i => i.quantity === 0);
  const lowStockItems = items.filter(i => i.quantity > 0 && i.quantity <= i.minThreshold);
  const healthyStockItems = items.filter(i => i.quantity > i.minThreshold);

  // Depleted / Sold stock metric
  const totalSoldUnits = items.reduce((acc, i) => acc + (i.totalSold || 0), 0);
  const totalAvailableUnits = items.reduce((acc, i) => acc + i.quantity, 0);

  // Valuation
  const totalInventoryCost = items.reduce((acc, i) => acc + (i.costPrice * i.quantity), 0);
  const totalInventorySellingValue = items.reduce((acc, i) => acc + (i.sellingPrice * i.quantity), 0);
  const potentialProfit = totalInventorySellingValue - totalInventoryCost;

  // Today's Sales
  const today = new Date().toISOString().slice(0, 10);
  const todaySales = sales.filter(s => s.timestamp.startsWith(today));
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const todayProfit = todaySales.reduce((sum, s) => sum + s.totalProfit, 0);

  const urgentItems = [...outOfStockItems, ...lowStockItems];

  return (
    <div className="space-y-6">
      
      {/* Hero Stock Announcement & Voice Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 sm:p-6 shadow-lg shadow-emerald-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.smartVoiceInventory}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {settings.businessName} - {t.stockStatus}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              {urgentItems.length > 0 
                ? t.urgentAttentionMessage.replace('{outOfStock}', outOfStockItems.length.toString()).replace('{lowStock}', lowStockItems.length.toString())
                : t.stockHealthyMessage
              }
            </p>
          </div>

          {/* Speaker Action Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={isSpeaking ? stopVoice : speakSummary}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                isSpeaking
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-white text-emerald-800 hover:bg-emerald-50 hover:shadow-lg'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-5 h-5" />
                  <span>{t.stopSpeech}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 text-emerald-600" />
                  <span>{t.announceAll} {t.speakerText}</span>
                </>
              )}
            </button>

            <button
              onClick={() => onOpenManualStock()}
              className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-sm border border-white/20 transition-all"
            >
              <Boxes className="w-4 h-4" />
              <span>{t.manualStockManagement}</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Items */}
        <div 
          onClick={() => setActiveTab('inventory')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t.totalItems}</span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalItems}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({totalAvailableUnits} {t.unitsAvailable})
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>{healthyStockItems.length} {t.atSafeLevel}</span>
          </p>
        </div>

        {/* Out of Stock */}
        <div 
          onClick={() => setActiveTab('inventory')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/60 shadow-xs hover:border-rose-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-semibold">{t.outOfStock} ({t.zeroPlain})</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {outOfStockItems.length}
            </span>
            <span className="text-xs text-rose-500/80 font-medium">{t.itemsFinished}</span>
          </div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{t.needToOrderImmediately}</span>
          </p>
        </div>

        {/* Low Stock */}
        <div 
          onClick={() => setActiveTab('inventory')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-950/60 shadow-xs hover:border-amber-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-semibold">{t.lowStock}</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {lowStockItems.length}
            </span>
            <span className="text-xs text-amber-600/80 font-medium">{t.belowAlertLimit}</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            <span>{t.aboutToFinishSoon}</span>
          </p>
        </div>

        {/* Depleted / Sold */}
        <div 
          onClick={() => setActiveTab('reports')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t.depletedStock}</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalSoldUnits}
            </span>
            <span className="text-xs text-slate-500 font-medium">{t.unitsSold}</span>
          </div>
          <p className="text-[11px] text-sky-600 dark:text-sky-400 mt-1.5 font-medium">
            {t.totalStockConsumptionTrack}
          </p>
        </div>

      </div>

      {/* Secondary Financial & Sales Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Inventory Value */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.inventoryValue}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {settings.currency}{totalInventoryCost.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 font-medium">({t.purchasePrice})</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
            <span>{t.sellingPriceLabel}: {settings.currency}{totalInventorySellingValue.toLocaleString('en-IN')}</span>
            <span className="font-bold">+{settings.currency}{potentialProfit.toLocaleString('en-IN')} {t.profitLabel}</span>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.todaySales}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {settings.currency}{todayRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 font-medium">({todaySales.length} {t.billsCount})</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>{t.todaysNetProfit}:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">+{settings.currency}{todayProfit.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t.quickActions}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('sales')}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{t.newSale}</span>
            </button>
            <button
              onClick={onOpenAddItem}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addItem}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Urgent Attention: Low Stock & Out of Stock Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {t.urgentAttentionTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.urgentAttentionSub}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('inventory')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{t.viewAllInventory}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {urgentItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-2 opacity-80" />
            <p className="font-bold text-slate-700 dark:text-slate-300">{t.greatNoItemsLow}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t.inventoryFullyStocked}</p>
          </div>
        ) : (
          <>
            {/* Mobile Card List (< sm screens) */}
            <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
              {urgentItems.map((item) => (
                <div key={item.id} className="p-3 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {settings.language === 'en' ? item.name : (item.nameHi || item.name)}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">{item.category}</p>
                    </div>
                    {item.quantity === 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 shrink-0">
                        {t.outOfStock}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 shrink-0">
                        {t.lowStock}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                    <div>
                      <span className="text-slate-500">{t.currentStock}: </span>
                      <span className={`font-black ${item.quantity === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {t.minimumLimit}: {item.minThreshold} {item.unit}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => speakItem(item)}
                      title={t.speakerStockAnnouncement}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 min-h-[38px]"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{t.speakerText}</span>
                    </button>

                    <button
                      onClick={() => onOpenManualStock(item)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs min-h-[38px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.addStockBtn}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tablet & Desktop Table (>= sm screens) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">{t.itemName}</th>
                    <th className="py-3 px-3">{t.categoryLabel}</th>
                    <th className="py-3 px-3">{t.currentStock}</th>
                    <th className="py-3 px-3">{t.minimumLimit}</th>
                    <th className="py-3 px-3">{t.statusCol}</th>
                    <th className="py-3 px-4 text-right">{t.actionLabel}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {urgentItems.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {settings.language === 'en' ? item.name : (item.nameHi || item.name)}
                        </div>
                        {settings.language !== 'en' && item.nameHi && (
                          <div className="text-[11px] text-slate-400 font-medium">
                            {item.name}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {item.category}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`font-black text-sm ${item.quantity === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-500">
                        {item.minThreshold} {item.unit}
                      </td>

                      <td className="py-3 px-3">
                        {item.quantity === 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                            {t.outOfStock}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            {t.lowStock}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Speaker button to announce this single item's stock */}
                          <button
                            onClick={() => speakItem(item)}
                            title={t.speakerStockAnnouncement}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          {/* Quick Manual Restock (+/-) */}
                          <button
                            onClick={() => onOpenManualStock(item)}
                            title={t.adjustStock}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t.addStockBtn}</span>
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
