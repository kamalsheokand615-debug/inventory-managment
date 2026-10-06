import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  ShieldCheck, 
  Cloud, 
  Download, 
  Upload, 
  Lock, 
  Moon, 
  Sun, 
  Volume2, 
  RotateCcw, 
  Check, 
  AlertCircle,
  Wifi,
  FileCheck,
  ArrowRight,
  Bell,
  BellOff
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { translations } from '../utils/translations';
import { LanguageCode } from '../types';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    toggleTheme, 
    setLanguage, 
    exportEncryptedBackup, 
    importEncryptedBackup, 
    syncWithCloud, 
    resetToDefaultData, 
    items, 
    sales,
    isOnline,
    currentUser,
    setActiveTab
  } = useInventory();

  const t = translations[settings.language] || translations.hi;

  // Form states
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [businessPhone, setBusinessPhone] = useState(settings.businessPhone);
  const [businessAddress, setBusinessAddress] = useState(settings.businessAddress);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber || '');
  const [upiId, setUpiId] = useState(settings.upiId || '');
  const [currency, setCurrency] = useState(settings.currency);
  const [defaultThreshold, setDefaultThreshold] = useState(settings.defaultThreshold);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);

  // Backup & Encryption states
  const [passphrase, setPassphrase] = useState('');
  const [restorePassphrase, setRestorePassphrase] = useState('');
  const [restoreJson, setRestoreJson] = useState('');
  const [restoreStatus, setRestoreStatus] = useState<{ success?: boolean; msg?: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveBusinessSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName,
      businessPhone,
      businessAddress,
      gstNumber,
      upiId: upiId.trim(),
      currency,
      defaultThreshold: Number(defaultThreshold) || 5,
      soundEnabled,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = async () => {
    if (!passphrase.trim()) {
      alert(t.backupPassphrasePrompt);
      return;
    }
    setIsExporting(true);
    try {
      const json = await exportEncryptedBackup(passphrase.trim());
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_sathi_encrypted_backup_${new Date().toISOString().slice(0, 10)}.enc.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPassphrase('');
    } catch (err) {
      alert(t.encryptionError);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRestoreJson(content);
    };
    reader.readAsText(file);
  };

  const handleRestoreBackup = async () => {
    if (!restoreJson) {
      alert(t.selectBackupFilePrompt);
      return;
    }
    if (!restorePassphrase) {
      alert(t.decryptionPasswordPrompt);
      return;
    }

    const result = await importEncryptedBackup(restoreJson, restorePassphrase);
    if (result.success) {
      setRestoreStatus({ success: true, msg: t.backupRestoredSuccess });
      setRestoreJson('');
      setRestorePassphrase('');
    } else {
      setRestoreStatus({ success: false, msg: result.error || t.restoreFailed });
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncWithCloud();
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>{t.settings} {t.andCustomization}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.settingsDesc}
        </p>
      </div>

      {/* Business Details Form */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {t.businessProfile}
          </h3>
        </div>

        <form onSubmit={handleSaveBusinessSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                {t.businessNameLabel}
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                {t.mobileNumberLabel}
              </label>
              <input
                type="text"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                {t.fullAddressLabel}
              </label>
              <input
                type="text"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                {t.gstinLabel}
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="22AAAAA0000A1Z5"
                className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1 flex items-center justify-between">
                <span>दुकान का UPI ID (QR बिलिंग हेतु)</span>
                <span className="text-[10px] text-emerald-600 font-normal">GPay / PhonePe / Paytm</span>
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@upi या 9876543210@paytm"
                className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {t.currencyLabel}
                </label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-center font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {t.defaultLowStockLabel}
                </label>
                <input
                  type="number"
                  min="1"
                  value={defaultThreshold}
                  onChange={(e) => setDefaultThreshold(parseInt(e.target.value) || 5)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-center font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            {savedSuccess ? (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>{t.settingsSaved}</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>

      {/* Language, Theme & Sound Controls */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
          {t.languageAndDisplay}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Language Selector */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
              {t.languageLabel}
            </label>
            <select
              value={settings.language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value="hi">{t.hindiLang}</option>
              <option value="hinglish">{t.hinglishLang}</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Theme Mode */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t.darkLightMode}
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="mt-2 py-2 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-bold flex items-center justify-center gap-2 text-slate-800 dark:text-slate-200"
            >
              {settings.theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>{t.switchToLight}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" />
                  <span>{t.switchToDark}</span>
                </>
              )}
            </button>
          </div>

          {/* Audio Chime Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t.audioWarning}
            </span>
            <button
              type="button"
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`mt-2 py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 ${
                settings.soundEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-300 dark:border-slate-600'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{settings.soundEnabled ? t.soundOn : t.soundOff}</span>
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {settings.language === 'en' ? 'Stock Notifications' : 'स्टॉक सूचनाएं व अलर्ट'}
            </span>
            <button
              type="button"
              onClick={() => updateSettings({ notificationsEnabled: settings.notificationsEnabled === false ? true : false })}
              className={`mt-2 py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                settings.notificationsEnabled !== false
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {settings.notificationsEnabled !== false ? (
                <>
                  <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{settings.language === 'en' ? 'Alerts ON' : 'सूचनाएं चालू (ON)'}</span>
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>{settings.language === 'en' ? 'Alerts OFF' : 'सूचनाएं बंद (OFF)'}</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* User Accounts & Multi-Store Profile Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {t.users} ({currentUser.name})
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch between store profiles, staff accounts, or change PIN security.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Manage Profiles</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* End-to-End Encryption & Cloud Backup */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.endToEndEncryption} & {t.cloudBackup}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.encryptionNote}
            </p>
          </div>
        </div>

        {/* Cloud Sync Status */}
        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.cloudSync} {t.activeStatus}</span>
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
              {t.lastSyncPlain}: {settings.lastSyncTimestamp ? new Date(settings.lastSyncTimestamp).toLocaleString() : t.todayPlain}
            </p>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs shrink-0"
          >
            <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? t.syncing : t.syncedNow}</span>
          </button>
        </div>

        {/* Export Encrypted Backup */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <Download className="w-4 h-4 text-emerald-600" />
            <span>{t.downloadEncryptedBackupFile}</span>
          </h4>
          <p className="text-xs text-slate-500">
            {t.backupFileDesc}
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder={t.backupPasswordPlaceholder}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              disabled={isExporting}
              className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? t.preparing : t.downloadBtn}</span>
            </button>
          </div>
        </div>

        {/* Restore from Encrypted Backup */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-sky-600" />
            <span>{t.restoreDataFromBackup}</span>
          </h4>

          <div className="space-y-2">
            <input
              type="file"
              accept=".json,.enc"
              onChange={handleFileUpload}
              className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />

            {restoreJson && (
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <input
                  type="password"
                  placeholder="{t.enterFilePassword}"
                  value={restorePassphrase}
                  onChange={(e) => setRestorePassphrase(e.target.value)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleRestoreBackup}
                  className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shrink-0"
                >
                  {t.restoreBtn}
                </button>
              </div>
            )}

            {restoreStatus && (
              <p className={`text-xs font-semibold ${restoreStatus.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                {restoreStatus.msg}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Offline Status & Reset Demo Data */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-emerald-600" />
            <span>{t.offlineStorageStatus}</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {items.length} {t.goodsText}, {sales.length} {t.salesRecordSafe}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm(t.resetDemoDataPrompt)) {
              resetToDefaultData();
              alert(t.demoDataResetSuccess);
            }
          }}
          className="py-2 px-3.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.resetSampleData}</span>
        </button>
      </div>

    </div>
  );
};
