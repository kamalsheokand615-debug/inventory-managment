import React, { useState } from 'react';
import { 
  Package, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff,
  Moon, 
  Sun, 
  Lock, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Languages, 
  CloudCheck,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { translations } from '../utils/translations';
import { LanguageCode } from '../types';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenManualStock?: () => void;
  onOpenSpeakerModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications, onOpenManualStock }) => {
  const { 
    settings, 
    toggleTheme, 
    setLanguage, 
    currentUser, 
    lockApp, 
    isOnline, 
    isSpeaking, 
    speakSummary, 
    stopVoice, 
    notifications,
    syncWithCloud,
    activeTab,
    setActiveTab
  } = useInventory();

  const [isSyncing, setIsSyncing] = useState(false);
  const t = translations[settings.language] || translations.hi;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCloudSync = async () => {
    setIsSyncing(true);
    await syncWithCloud();
    setIsSyncing(false);
  };

  

  return (
    <header id="main-header" className="shrink-0 sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs dark:border-slate-800 dark:bg-slate-900/95">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          
          {/* Brand Logo & Name (shrink-0 so logo and text are never compressed or overlapped) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button 
              id="brand-logo-btn"
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 sm:gap-2.5 text-left focus:outline-hidden group shrink-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              </div>
              <div className="min-w-0 max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] md:max-w-none">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {settings.businessName || t.appTitle}
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                  {t.appSubtitle}
                </p>
              </div>
            </button>

            {/* Offline / Online indicator chip */}
            <div 
              id="network-status-badge"
              title={isOnline ? t.online : t.offline}
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
              }`}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden lg:inline">{t.online}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>{t.offline}</span>
                </>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links (>= xl) */}
          <nav className="hidden xl:flex items-center gap-1 shrink-0">
            {[
              { id: 'dashboard', label: t.dashboard },
              { id: 'inventory', label: t.inventory },
              { id: 'sales', label: t.sales },
              { id: 'khata', label: (t as any).khata || (settings.language === 'en' ? 'Credit (Khata)' : 'उधार (खाता)') },
              { id: 'reports', label: t.reports },
              { id: 'enterprise', label: settings.language === 'en' ? 'Enterprise Sync' : settings.language === 'hinglish' ? 'Enterprise Sync' : 'एंटरप्राइज सुइट' },
              { id: 'users', label: t.users },
              { id: 'settings', label: t.settings },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`nav-link-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Action Tools: shrink-0, clearly spaced and no overlap */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            
            {/* Manual Stock Management Quick Button */}
            {onOpenManualStock && (
              <button
                id="nav-manual-stock-btn"
                onClick={onOpenManualStock}
                title={t.manualStockManagement}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shrink-0 transition-all active:scale-95 whitespace-nowrap"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline">{t.manualStockManagement}</span>
                <span className="sm:hidden">{settings.language === 'en' ? 'Stock +/-' : 'स्टॉक (+/-)'}</span>
              </button>
            )}

            {/* Unified Speaker announcement button */}
            <button
              id="speaker-stock-summary-btn"
              onClick={isSpeaking ? stopVoice : speakSummary}
              title={isSpeaking ? t.stopSpeech : t.speakerStockAnnouncement}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium shrink-0 transition-all ${
                isSpeaking 
                  ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-500/20' 
                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline">{t.stopSpeech}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden md:inline font-semibold">{t.speakerStockAnnouncement}</span>
                </>
              )}
            </button>

            {/* Cloud Sync Button (visible on sm and larger) */}
            <button
              id="nav-cloud-sync-btn"
              onClick={handleCloudSync}
              disabled={isSyncing}
              title={t.cloudSync}
              className="hidden sm:flex p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <CloudCheck className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Notification Bell with ON/OFF Indicator */}
            <button
              id="nav-notifications-btn"
              onClick={onOpenNotifications}
              title={`${t.notifications} (${settings.notificationsEnabled === false ? (settings.language === 'en' ? 'Muted / OFF' : 'बंद / OFF') : (settings.language === 'en' ? 'Active / ON' : 'चालू / ON')})`}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors relative shrink-0 ${
                settings.notificationsEnabled === false
                  ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {settings.notificationsEnabled === false ? (
                <BellOff className="w-4 h-4 shrink-0 text-slate-400" />
              ) : (
                <Bell className="w-4 h-4 shrink-0" />
              )}
              {unreadCount > 0 && (
                <span className={`absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 ${
                  settings.notificationsEnabled === false ? 'bg-slate-400' : 'bg-rose-500'
                }`}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative shrink-0">
              <select
                id="language-switcher-select"
                value={settings.language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="text-[11px] sm:text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-1 px-1.5 font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                title={t.changeLangTitle}
              >
                <option value="hi">हिंदी</option>
                <option value="hinglish">Hinglish</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              id="dark-mode-toggle-btn"
              onClick={toggleTheme}
              title={settings.theme === 'dark' ? t.lightMode : t.darkMode}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* User Profile & Role with Lock */}
            <div className="flex items-center gap-1 pl-1 sm:pl-1.5 border-l border-slate-200 dark:border-slate-800 shrink-0">
              <button
                id="user-profile-btn"
                onClick={() => setActiveTab('users')}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg border text-xs font-semibold border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 shrink-0"
                title={currentUser.name}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline max-w-[70px] truncate">{currentUser.name.split(' ')[0]}</span>
              </button>

              <button
                id="lock-app-btn"
                onClick={lockApp}
                title={t.locked}
                className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
              >
                <Lock className="w-4 h-4 shrink-0" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
