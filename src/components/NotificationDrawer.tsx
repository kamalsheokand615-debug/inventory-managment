import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  BellOff, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  Cloud, 
  Trash2, 
  ArrowRight, 
  CheckCheck, 
  Sliders, 
  Volume2, 
  VolumeX, 
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { translations } from '../utils/translations';
import { playClickBeep } from '../utils/sound';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (itemId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ 
  isOpen, 
  onClose,
  onSelectProduct
}) => {
  const { 
    notifications, 
    clearAllNotifications, 
    markNotificationAsRead, 
    settings, 
    updateSettings, 
    setActiveTab 
  } = useInventory();
  
  const t = translations[settings.language] || translations.hi;
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts'>('all');
  const [showPreferences, setShowPreferences] = useState(false);

  if (!isOpen) return null;

  const isNotificationsEnabled = settings.notificationsEnabled !== false;
  const isLowStockAlertsEnabled = settings.lowStockAlertsEnabled !== false;
  const isOutOfStockAlertsEnabled = settings.outOfStockAlertsEnabled !== false;

  const handleToggleMasterNotifications = () => {
    playClickBeep();
    updateSettings({
      notificationsEnabled: !isNotificationsEnabled
    });
  };

  const handleToggleLowStock = () => {
    playClickBeep();
    updateSettings({
      lowStockAlertsEnabled: !isLowStockAlertsEnabled
    });
  };

  const handleToggleOutOfStock = () => {
    playClickBeep();
    updateSettings({
      outOfStockAlertsEnabled: !isOutOfStockAlertsEnabled
    });
  };

  const handleToggleSound = () => {
    playClickBeep();
    updateSettings({
      soundEnabled: !settings.soundEnabled
    });
  };

  const handleMarkAllRead = () => {
    playClickBeep();
    notifications.forEach(n => {
      if (!n.read) markNotificationAsRead(n.id);
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock':
        return <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
      case 'low_stock':
        return <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />;
      case 'sale':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'backup':
        return <Cloud className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500 shrink-0" />;
    }
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'alerts') return n.type === 'low_stock' || n.type === 'out_of_stock';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl transition-colors ${
              isNotificationsEnabled 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}>
              {isNotificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                {t.notifications}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isNotificationsEnabled 
                  ? (unreadCount > 0 ? `${unreadCount} ${settings.language === 'en' ? 'unread alerts' : 'अपठित सूचनाएं'}` : (settings.language === 'en' ? 'All caught up' : 'सब अपडेटेड है'))
                  : (settings.language === 'en' ? 'Notifications Muted' : 'सूचनाएं बंद (Muted) हैं')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                title={settings.language === 'en' ? 'Mark all as read' : 'सभी पढ़ा हुआ मार्क करें'}
                className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                title={t.clearAll}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Master ON / OFF Toggle Banner */}
        <div className="p-3.5 mx-3.5 mt-3 rounded-2xl border transition-all shadow-xs bg-slate-50/90 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                isNotificationsEnabled 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {isNotificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {settings.language === 'en' ? 'Notifications & Alerts' : 'सूचनाएं एवं स्टॉक अलर्ट'}
                  </span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isNotificationsEnabled 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}>
                    {isNotificationsEnabled ? (settings.language === 'en' ? 'ON' : 'चालू (ON)') : (settings.language === 'en' ? 'OFF' : 'बंद (OFF)')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isNotificationsEnabled 
                    ? (settings.language === 'en' ? 'Stock alerts are active' : 'कम और खत्म स्टॉक पर अलर्ट मिलेगा')
                    : (settings.language === 'en' ? 'Notifications are paused' : 'नए अलर्ट अस्थायी रूप से रोके गए हैं')}
                </p>
              </div>
            </div>

            {/* Sliding Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isNotificationsEnabled}
              onClick={handleToggleMasterNotifications}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isNotificationsEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Collapsible Granular Alert Controls */}
          <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShowPreferences(prev => !prev)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-0.5"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>{settings.language === 'en' ? 'Alert Customization' : 'अलर्ट प्रकार सेट करें (विस्तृत)'}</span>
              </span>
              {showPreferences ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showPreferences && (
              <div className="mt-2 space-y-2 pt-1 animate-in fade-in duration-150">
                {/* Out of Stock Alert Toggle */}
                <div className="flex items-center justify-between py-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                    <span>{settings.language === 'en' ? 'Out of stock alerts' : 'आउट ऑफ स्टॉक (खत्म माल) अलर्ट'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleOutOfStock}
                    disabled={!isNotificationsEnabled}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                      !isNotificationsEnabled 
                        ? 'opacity-40 cursor-not-allowed'
                        : isOutOfStockAlertsEnabled
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                        : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isOutOfStockAlertsEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Low Stock Alert Toggle */}
                <div className="flex items-center justify-between py-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>{settings.language === 'en' ? 'Low stock threshold alerts' : 'कम स्टॉक (न्यूनतम सीमा) अलर्ट'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleLowStock}
                    disabled={!isNotificationsEnabled}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                      !isNotificationsEnabled 
                        ? 'opacity-40 cursor-not-allowed'
                        : isLowStockAlertsEnabled
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isLowStockAlertsEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Alert Sound Toggle */}
                <div className="flex items-center justify-between py-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-500" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{settings.language === 'en' ? 'Alert sound chime' : 'अलर्ट ध्वनि (बीप साउंड)'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleSound}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                      settings.soundEnabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {settings.soundEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-3.5 pt-3 pb-1 flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {settings.language === 'en' ? 'All' : 'सभी'} ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filter === 'unread'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {settings.language === 'en' ? 'Unread' : 'अपठित'} ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('alerts')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filter === 'alerts'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {settings.language === 'en' ? 'Stock Alerts' : 'स्टॉक अलर्ट'}
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
          {!isNotificationsEnabled && (
            <div className="p-3 mb-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-center gap-2.5 text-xs">
              <BellOff className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                {settings.language === 'en' 
                  ? 'Notifications are currently turned OFF. Toggle the switch above to resume receiving alerts.' 
                  : 'सूचनाएं वर्तमान में बंद (OFF) हैं। नए अलर्ट प्राप्त करने के लिए ऊपर दिए स्विच को चालू करें।'}
              </span>
            </div>
          )}

          {filteredNotifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 opacity-60" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {filter === 'unread' 
                  ? (settings.language === 'en' ? 'No unread notifications' : 'कोई नई अपठित सूचना नहीं है')
                  : t.noNotifications}
              </p>
              <p className="text-xs text-slate-500 mt-1">{t.storeStockSafeMsg}</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  notif.read 
                    ? 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100' 
                    : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                }`}
              >
                {getIcon(notif.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.itemId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(notif.id);
                        onClose();
                        setActiveTab('inventory');
                        if (onSelectProduct) onSelectProduct(notif.itemId!);
                      }}
                      className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 shadow-xs transition-colors"
                    >
                      <span>{t.viewAndUpdateStock}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
