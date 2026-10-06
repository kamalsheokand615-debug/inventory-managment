import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  UserPlus, 
  Lock, 
  Check, 
  AlertCircle, 
  User, 
  ShieldAlert,
  Edit2
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { translations } from '../utils/translations';
import { UserRole } from '../types';

export const UsersView: React.FC = () => {
  const { users, currentUser, switchUser, addUser, updateUserPin, settings } = useInventory();
  const t = translations[settings.language] || translations.hi;

  const [switchUserId, setSwitchUserId] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [switchError, setSwitchError] = useState<string>('');
  
  // New user form state
  const [newUserName, setNewUserName] = useState('');
  
  const [newUserPin, setNewUserPin] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);

  // Change PIN modal state
  const [selectedUserForPin, setSelectedUserForPin] = useState<string | null>(null);
  const [updatedPin, setUpdatedPin] = useState('');

  const handleSwitch = (userId: string) => {
    setSwitchUserId(userId);
    setPinInput('');
    setSwitchError('');
  };

  const confirmSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchUserId || !pinInput) return;

    const success = switchUser(switchUserId, pinInput);
    if (success) {
      setSwitchUserId('');
      setPinInput('');
      setSwitchError('');
    } else {
      setSwitchError(t.incorrectPin);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || newUserPin.length < 4) return;
    addUser(newUserName.trim(), 'admin', newUserPin.trim());
    setNewUserName('');
    setNewUserPin('');
    setShowAddUser(false);
  };

  const handleSavePin = (userId: string) => {
    if (updatedPin.length < 4) return;
    updateUserPin(userId, updatedPin);
    setSelectedUserForPin(null);
    setUpdatedPin('');
  };

  const roleLabels: Record<UserRole, { title: string; desc: string; color: string }> = {
    admin: {
      title: t.admin,
      desc: t.roleAdminDesc,
      color: 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
    },
    manager: {
      title: t.manager,
      desc: t.roleManagerDesc,
      color: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
    },
    staff: {
      title: t.staff,
      desc: t.roleStaffDesc,
      color: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300',
    },
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>User Accounts (Multi-Store)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create completely separate profiles. Each profile has its own private data, stock, and billing.
          </p>
        </div>

        {true && (
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addNewUser}</span>
          </button>
        )}
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs animate-in fade-in">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
            {t.createNewUserAccount}
          </h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">{t.nameField}</label>
              <input
                type="text"
                required
                placeholder={t.exName}
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">{t.fourDigitPin}</label>
              <input
                type="password"
                required
                maxLength={6}
                placeholder={t.exPin}
                value={newUserPin}
                onChange={(e) => setNewUserPin(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-3 flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
              >
                {t.createAccountBtn}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Users List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.map((user) => {
          const isCurrent = user.id === currentUser.id;
          

          return (
            <div 
              key={user.id}
              className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between ${
                isCurrent 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
                  : 'border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-emerald-300 text-emerald-800 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
    STORE PROFILE
  </span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{t.activeTag}</span>
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Independent Data & Settings
                </p>

                {/* PIN info (Visible only to Admin or self) */}
                <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                  <span>{t.pinSecurity}: <strong>••••</strong></span>
                  <button
                    onClick={() => setSelectedUserForPin(user.id)}
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{t.changePin}</span>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                {isCurrent ? (
                  <div className="py-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {t.currentlyLoggedInAs}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSwitch(user.id)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t.switchToThisAccount}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Switch User PIN Modal */}
      {switchUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              {t.enterPin}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              "{users.find(u => u.id === switchUserId)?.name}" {t.enterPinToAccess}
            </p>

            <form onSubmit={confirmSwitch} className="space-y-4">
              <input
                type="password"
                autoFocus
                required
                maxLength={6}
                placeholder={t.fourDigitPinInput}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-center font-mono text-xl tracking-widest bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />

              {switchError && (
                <p className="text-xs text-rose-500 font-semibold text-center">
                  {switchError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSwitchUserId('')}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  {t.switchBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {selectedUserForPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
              {t.setNewPin}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              "{users.find(u => u.id === selectedUserForPin)?.name}" {t.enterNewPinFor}
            </p>

            <div className="space-y-4">
              <input
                type="password"
                autoFocus
                maxLength={6}
                placeholder={`${t.newPrefix} ${t.fourDigitPinInput}`}
                value={updatedPin}
                onChange={(e) => setUpdatedPin(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-center font-mono text-xl tracking-widest bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPin(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePin(selectedUserForPin)}
                  disabled={updatedPin.length < 4}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  {t.securePinBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
      

    </div>
  );
};
