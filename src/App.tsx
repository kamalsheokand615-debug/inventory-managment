import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { SalesView } from './components/SalesView';
import { KhataView } from './components/KhataView';
import { ReportsView } from './components/ReportsView';
import { UsersView } from './components/UsersView';
import { SettingsView } from './components/SettingsView';
import { EnterpriseView } from './components/EnterpriseView';
import { ManualStockModal } from './components/ManualStockModal';
import { ItemFormModal } from './components/ItemFormModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LockScreen } from './components/LockScreen';
import { InventoryItem } from './types';

const MainAppContent: React.FC = () => {
  const { activeTab } = useInventory();

  // Modal states
  const [isManualStockOpen, setIsManualStockOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<InventoryItem | null>(null);

  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleOpenManualStock = (item?: InventoryItem) => {
    setSelectedStockItem(item || null);
    setIsManualStockOpen(true);
  };

  const handleOpenAddItem = () => {
    setEditingItem(null);
    setIsItemFormOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsItemFormOpen(true);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Top Navigation Bar */}
      <Navbar 
        onOpenNotifications={() => setIsNotificationsOpen(true)} 
        onOpenManualStock={() => handleOpenManualStock()}
      />

      {/* Main Content Area: scrolls independently between Top Navbar & Bottom Navigation Bar */}
      <main className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden overscroll-y-contain">
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-6">
          {activeTab === 'dashboard' && (
            <DashboardView 
              onOpenManualStock={handleOpenManualStock}
              onOpenAddItem={handleOpenAddItem}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView 
              onOpenManualStock={handleOpenManualStock}
              onOpenAddItem={handleOpenAddItem}
              onEditItem={handleEditItem}
            />
          )}

          {activeTab === 'sales' && (
            <SalesView />
          )}

          {activeTab === 'khata' && (
            <KhataView />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {activeTab === 'enterprise' && (
            <EnterpriseView />
          )}

          {activeTab === 'users' && (
            <UsersView />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar: fixed at the bottom */}
      <BottomNav />

      {/* Modals */}
      <ManualStockModal
        isOpen={isManualStockOpen}
        onClose={() => setIsManualStockOpen(false)}
        selectedItem={selectedStockItem}
        onOpenAddItem={handleOpenAddItem}
      />

      <ItemFormModal
        isOpen={isItemFormOpen}
        onClose={() => setIsItemFormOpen(false)}
        editingItem={editingItem}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectProduct={(itemId) => {
          // Handled inside drawer
        }}
      />

      {/* PIN Security Screen */}
      <LockScreen />

    </div>
  );
};

export default function App() {
  return (
    <InventoryProvider>
      <MainAppContent />
    </InventoryProvider>
  );
}
