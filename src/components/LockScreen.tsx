import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, Delete, UserCheck } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { translations } from '../utils/translations';
import { playClickBeep } from '../utils/sound';

export const LockScreen: React.FC = () => {
  const { isLocked, unlockWithPin, currentUser, users, switchUser, settings } = useInventory();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(currentUser.id);

  const t = translations[settings.language] || translations.hi;

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    playClickBeep();
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    playClickBeep();
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    let success = false;
    if (selectedUserId !== currentUser.id) {
      success = switchUser(selectedUserId, pin);
    } else {
      success = unlockWithPin(pin);
    }

    if (success) {
      setPin('');
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  const activeUser = users.find(u => u.id === selectedUserId) || currentUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center">
        
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-inner">
          <Lock className="w-8 h-8 animate-pulse" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {settings.businessName || t.appTitle}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          {t.locked} - {t.enterPin}
        </p>

        {/* Profile Switcher */}
        <div className="w-full mb-4">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {t.switchUser}
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {users.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedUserId(u.id);
                  setPin('');
                  setError(false);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1 shrink-0 ${
                  selectedUserId === u.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <UserCheck className="w-3 h-3" />
                <span className="truncate">{u.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* PIN Circles Display */}
        <div className="flex justify-center gap-3 my-3">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                idx < pin.length
                  ? 'bg-emerald-600 border-emerald-600 scale-110'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium my-1 animate-bounce flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            {t.incorrectPin}
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[260px] my-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-lg transition-transform active:scale-95 flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="h-12 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 font-semibold text-xs transition-colors flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-lg transition-transform active:scale-95 flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-transform active:scale-95 flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Unlock Button */}
        <button
          type="button"
          onClick={() => handleUnlock()}
          disabled={pin.length < 4}
          className="w-full max-w-[260px] py-3 mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          <Unlock className="w-4 h-4" />
          <span>{t.unlock}</span>
        </button>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 text-center">
          {t.testPinMsg} <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">1234</span>
        </p>

      </div>
    </div>
  );
};
