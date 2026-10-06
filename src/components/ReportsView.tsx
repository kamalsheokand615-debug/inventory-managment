import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  Printer, 
  ArrowUpRight, 
  Layers, 
  DollarSign, 
  Percent,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { translations } from '../utils/translations';

export const ReportsView: React.FC = () => {
  const { items, sales, settings } = useInventory();
  const t = translations[settings.language] || translations.hi;

  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Filter sales by selected time period
  const now = new Date();
  const filteredSales = sales.filter(s => {
    const saleDate = new Date(s.timestamp);
    if (timeFilter === 'today') {
      return saleDate.toDateString() === now.toDateString();
    } else if (timeFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return saleDate >= oneWeekAgo;
    } else if (timeFilter === 'month') {
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalCost = filteredSales.reduce((sum, s) => sum + s.totalCost, 0);
  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Aggregate item sales
  const itemSalesMap: Record<string, { name: string; quantity: number; revenue: number; profit: number }> = {};
  filteredSales.forEach(sale => {
    sale.items.forEach(it => {
      if (!itemSalesMap[it.itemId]) {
        itemSalesMap[it.itemId] = { name: it.name, quantity: 0, revenue: 0, profit: 0 };
      }
      itemSalesMap[it.itemId].quantity += it.quantity;
      itemSalesMap[it.itemId].revenue += it.subtotal;
      itemSalesMap[it.itemId].profit += (it.subtotal - (it.costPrice * it.quantity));
    });
  });

  const topSellingItems = Object.values(itemSalesMap).sort((a, b) => b.quantity - a.quantity);

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  items.forEach(i => {
    const sold = i.totalSold || 0;
    categoryMap[i.category] = (categoryMap[i.category] || 0) + sold;
  });
  const categoryList = Object.entries(categoryMap).map(([category, count]) => ({ category, count }));

  // Export CSV function
  const handleExportCSV = () => {
    const headers = [t.invoiceNo, t.dateAndTime, t.customerPlain, t.amount, t.cost, t.profitLabel, t.payment];
    const rows = filteredSales.map(s => [
      s.invoiceNo,
      new Date(s.timestamp).toLocaleDateString(),
      `"${s.customerName || t.counterCustomer}"`,
      s.totalAmount,
      s.totalCost,
      s.totalProfit,
      s.paymentMethod.toUpperCase()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventory_Sales_Report_${timeFilter}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t.salesReport}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.reportsDesc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter Pills */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'today', label: t.filterToday },
              { id: 'week', label: t.filterWeek },
              { id: 'month', label: t.filterMonth },
              { id: 'all', label: t.filterAllTime },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTimeFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeFilter === f.id
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportReport}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.totalRevenue}</p>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {settings.currency}{totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{filteredSales.length} {t.salesBills}</p>
        </div>

        {/* Total Cost */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.totalCost}</p>
          <div className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
            {settings.currency}{totalCost.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{t.purchaseCostPrice}</p>
        </div>

        {/* Net Profit */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{t.netProfit}</p>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            +{settings.currency}{netProfit.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-1 font-semibold">{t.netEarnings}</p>
        </div>

        {/* Profit Margin % */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.profitMarginPercent}</p>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {profitMargin}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full" 
              style={{ width: `${Math.min(100, profitMargin * 2)}%` }} 
            />
          </div>
        </div>

      </div>

      {/* Stock Depletion Tracker */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t.stockStatusReport}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.stockStatusReportDesc}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {items.length} {t.productsListed}
          </span>
        </div>

        {/* Mobile View for Stock Depletion (< sm) */}
        <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
          {items.map((item) => {
            const totalCalculated = item.quantity + (item.totalSold || 0);
            const percentSold = totalCalculated > 0 ? Math.round(((item.totalSold || 0) / totalCalculated) * 100) : 0;
            const isOut = item.quantity === 0;
            const isLow = item.quantity > 0 && item.quantity <= item.minThreshold;

            return (
              <div key={item.id} className="p-3 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {settings.language === 'en' ? item.name : (item.nameHi || item.name)}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">{item.category}</span>
                  </div>
                  {isOut ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      {t.outOfStock}
                    </span>
                  ) : isLow ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                      {t.lowStock}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {t.healthyStock}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                  <div>
                    <span className="text-slate-400 text-[11px] block">{t.availableStockDetail}</span>
                    <span className={`font-black text-sm ${isOut ? 'text-rose-600 dark:text-rose-400' : isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">{t.depletedSold}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.totalSold || 0} {item.unit}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{t.depletionProgress}</span>
                    <span className="font-bold">{percentSold}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        percentSold > 80 ? 'bg-rose-500' : percentSold > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentSold}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tablet & Desktop View (>= sm) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">{t.productNameCol}</th>
                <th className="py-3 px-3">{t.availableStockDetail}</th>
                <th className="py-3 px-3">{t.depletedStockDetail}</th>
                <th className="py-3 px-3">{t.depletionProgress}</th>
                <th className="py-3 px-3">{t.statusCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {items.map((item) => {
                const totalCalculated = item.quantity + (item.totalSold || 0);
                const percentSold = totalCalculated > 0 ? Math.round(((item.totalSold || 0) / totalCalculated) * 100) : 0;
                const isOut = item.quantity === 0;
                const isLow = item.quantity > 0 && item.quantity <= item.minThreshold;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {settings.language === 'en' ? item.name : (item.nameHi || item.name)}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.category}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`font-black text-sm ${isOut ? 'text-rose-600 dark:text-rose-400' : isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                        {item.quantity} {item.unit}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {item.totalSold || 0} {item.unit} {t.depletedSold}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-28 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              percentSold > 80 ? 'bg-rose-500' : percentSold > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percentSold}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          {percentSold}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                          {t.outOfStock}
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          {t.lowStock}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {t.healthyStock}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Selling Products and Category Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Top Selling Items */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.topSellingItems}</span>
          </h3>

          {topSellingItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">{t.noSalesInPeriod}</p>
          ) : (
            <div className="space-y-3">
              {topSellingItems.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {settings.currency}{item.revenue}
                    </span>
                    <span className="text-xs text-slate-400 ml-1.5">({item.quantity} {t.sold})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>{t.categoryDistribution}</span>
          </h3>

          <div className="space-y-3">
            {categoryList.map((cat, idx) => {
              const maxCount = Math.max(...categoryList.map(c => c.count), 1);
              const widthPct = Math.round((cat.count / maxCount) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{cat.category}</span>
                    <span className="text-slate-500">{cat.count} {t.unitsConsumed}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-sky-500 h-full rounded-full transition-all"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
