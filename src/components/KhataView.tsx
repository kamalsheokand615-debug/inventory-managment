import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Plus, Phone, Calendar, ArrowUpRight, ArrowDownLeft, 
  Share2, Printer, CheckCircle, AlertTriangle, Clock, Trash2, 
  CreditCard, Banknote, QrCode, FileText, ChevronRight, X, 
  MessageSquare, UserPlus, RefreshCw, Landmark, IndianRupee, Eye
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { KhataCustomer, KhataTransaction } from '../types';
import { translations } from '../utils/translations';

// Default mock customers so the user immediately sees a live, functional system
const INITIAL_KHATA_CUSTOMERS: KhataCustomer[] = [
  {
    id: 'cust-1',
    name: 'रमेश कुमार (शर्मा जी)',
    phone: '9876543210',
    address: 'दुकान नं. 14, मेन मार्केट',
    totalGiven: 3200,
    totalReceived: 1500,
    balance: 1700,
    lastTransactionDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    notes: 'पुराने भरोसेमंद ग्राहक, हर माह 10 तारीख को हिसाब',
    status: 'active'
  },
  {
    id: 'cust-2',
    name: 'सुरेश वर्मा (इलेक्ट्रिकल)',
    phone: '9812345678',
    address: 'वार्ड 5, स्टेशन रोड',
    totalGiven: 4500,
    totalReceived: 4500,
    balance: 0,
    lastTransactionDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    notes: 'पूरा हिसाब चुकता कर दिया',
    status: 'cleared'
  },
  {
    id: 'cust-3',
    name: 'राजेश पटेल',
    phone: '9923456789',
    address: 'मकान नं. 42, पटेल चौक',
    totalGiven: 2850,
    totalReceived: 500,
    balance: 2350,
    lastTransactionDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // Overdue
    notes: 'देय तिथि समाप्त हो चुकी है, रिमाइंडर भेजें',
    status: 'active'
  }
];

const INITIAL_KHATA_TXNS: KhataTransaction[] = [
  {
    id: 'txn-1',
    customerId: 'cust-1',
    type: 'give',
    amount: 2000,
    date: new Date(Date.now() - 86400000 * 12).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    invoiceNo: 'INV-88210',
    notes: 'किराना सामान (आटा, तेल, चीनी)',
    recordedBy: 'Admin'
  },
  {
    id: 'txn-2',
    customerId: 'cust-1',
    type: 'give',
    amount: 1200,
    date: new Date(Date.now() - 86400000 * 6).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    notes: 'मसाले व दाल पैकेट',
    recordedBy: 'Admin'
  },
  {
    id: 'txn-3',
    customerId: 'cust-1',
    type: 'receive',
    amount: 1500,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    paymentMode: 'upi',
    notes: 'PhonePe द्वारा जमा प्राप्त',
    recordedBy: 'Admin'
  },
  {
    id: 'txn-4',
    customerId: 'cust-2',
    type: 'give',
    amount: 4500,
    date: new Date(Date.now() - 86400000 * 15).toISOString(),
    invoiceNo: 'INV-88190',
    notes: 'दुकान का सामान',
    recordedBy: 'Admin'
  },
  {
    id: 'txn-5',
    customerId: 'cust-2',
    type: 'receive',
    amount: 4500,
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    paymentMode: 'cash',
    notes: 'नकद पूर्ण भुगतान प्राप्त',
    recordedBy: 'Admin'
  },
  {
    id: 'txn-6',
    customerId: 'cust-3',
    type: 'give',
    amount: 2850,
    date: new Date(Date.now() - 86400000 * 10).toISOString(),
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    invoiceNo: 'INV-88150',
    notes: 'राशन सामान',
    recordedBy: 'Admin'
  },
  {
    id: 'txn-7',
    customerId: 'cust-3',
    type: 'receive',
    amount: 500,
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    paymentMode: 'cash',
    notes: 'आंशिक नकद जमा',
    recordedBy: 'Admin'
  }
];

export const KhataView: React.FC = () => {
  const { settings, sales, currentUser } = useInventory();
  const t = (translations[settings.language] || translations.hi) as any;
  const dateLocale = settings.language === 'en' ? 'en-US' : 'hi-IN';

  // Persistence keys based on store
  const storageKeyCust = `inv_khata_customers_${currentUser?.storeId || 'default'}`;
  const storageKeyTxn = `inv_khata_txns_${currentUser?.storeId || 'default'}`;

  // State
  const [customers, setCustomers] = useState<KhataCustomer[]>(() => {
    try {
      const saved = localStorage.getItem(storageKeyCust);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_KHATA_CUSTOMERS;
  });

  const [transactions, setTransactions] = useState<KhataTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(storageKeyTxn);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_KHATA_TXNS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKeyCust, JSON.stringify(customers));
    } catch (e) {
      console.error(e);
    }
  }, [customers, storageKeyCust]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKeyTxn, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions, storageKeyTxn]);

  // Sync any previous sales with paymentMethod === 'credit'
  useEffect(() => {
    const creditSales = sales.filter(s => s.paymentMethod === 'credit');
    if (!creditSales.length) return;

    setCustomers(prevCusts => {
      const updated = [...prevCusts];
      creditSales.forEach(sale => {
        const custName = sale.customerName || 'अज्ञात ग्राहक';
        const custPhone = sale.customerPhone || '';
        let existing = updated.find(c => 
          (custPhone && c.phone === custPhone) || 
          c.name.toLowerCase() === custName.toLowerCase()
        );

        if (!existing) {
          existing = {
            id: `cust-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: custName,
            phone: custPhone,
            totalGiven: sale.totalAmount,
            totalReceived: 0,
            balance: sale.totalAmount,
            lastTransactionDate: sale.timestamp,
            dueDate: sale.paymentDetails?.creditDueDate,
            notes: sale.paymentDetails?.creditNotes || `बिल: ${sale.invoiceNo}`,
            status: 'active'
          };
          updated.push(existing);
        }
      });
      return updated;
    });
  }, [sales]);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'overdue' | 'cleared'>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Modals
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [modalTxnType, setModalTxnType] = useState<'give' | 'receive'>('give');

  // Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');
  const [newCustInitialBalance, setNewCustInitialBalance] = useState('');

  // Transaction Form State
  const [txnTargetCustomerId, setTxnTargetCustomerId] = useState('');
  const [txnAmount, setTxnAmount] = useState('');
  const [txnDueDate, setTxnDueDate] = useState('');
  const [txnNotes, setTxnNotes] = useState('');
  const [txnPaymentMode, setTxnPaymentMode] = useState<'cash' | 'upi' | 'bank'>('cash');
  const [txnInvoiceNo, setTxnInvoiceNo] = useState('');

  // Selected customer object
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Customer transactions
  const customerTransactions = useMemo(() => {
    if (!selectedCustomerId) return [];
    return transactions
      .filter(t => t.customerId === selectedCustomerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedCustomerId]);

  // Summary Metrics
  const stats = useMemo(() => {
    const totalBalance = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);
    const activeDebtors = customers.filter(c => c.balance > 0).length;
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueCount = customers.filter(c => c.balance > 0 && c.dueDate && c.dueDate < todayStr).length;
    
    // Total received this month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const receivedThisMonth = transactions
      .filter(t => t.type === 'receive' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalBalance,
      activeDebtors,
      overdueCount,
      receivedThisMonth,
      totalCustomers: customers.length
    };
  }, [customers, transactions]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const todayStr = new Date().toISOString().split('T')[0];

    return customers.filter(cust => {
      const matchesSearch = 
        cust.name.toLowerCase().includes(query) ||
        (cust.phone && cust.phone.includes(query)) ||
        (cust.address && cust.address.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (filterType === 'pending') return cust.balance > 0;
      if (filterType === 'overdue') return cust.balance > 0 && cust.dueDate && cust.dueDate < todayStr;
      if (filterType === 'cleared') return cust.balance <= 0;

      return true;
    }).sort((a, b) => b.balance - a.balance);
  }, [customers, searchQuery, filterType]);

  // Set default selected customer if none selected on desktop
  useEffect(() => {
    if (!selectedCustomerId && filteredCustomers.length > 0 && window.innerWidth >= 1024) {
      setSelectedCustomerId(filteredCustomers[0].id);
    }
  }, [filteredCustomers, selectedCustomerId]);

  // Open transaction modal helper
  const handleOpenTxnModal = (type: 'give' | 'receive', custId?: string) => {
    setModalTxnType(type);
    setTxnTargetCustomerId(custId || selectedCustomerId || (customers[0]?.id || ''));
    setTxnAmount('');
    setTxnNotes('');
    setTxnInvoiceNo('');
    setTxnPaymentMode('cash');
    
    // Default due date: +15 days for 'give'
    if (type === 'give') {
      const d = new Date();
      d.setDate(d.getDate() + 15);
      setTxnDueDate(d.toISOString().split('T')[0]);
    } else {
      setTxnDueDate('');
    }
    
    setShowTransactionModal(true);
  };

  // Add Customer Handler
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      alert(t.enterCustNameAlert || 'कृपया ग्राहक का नाम दर्ज करें');
      return;
    }

    const initBal = parseFloat(newCustInitialBalance) || 0;
    const newId = `cust-${Date.now()}`;
    const now = new Date().toISOString();

    const newCustomer: KhataCustomer = {
      id: newId,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim(),
      notes: newCustNotes.trim(),
      totalGiven: initBal > 0 ? initBal : 0,
      totalReceived: 0,
      balance: initBal,
      lastTransactionDate: now,
      status: initBal > 0 ? 'active' : 'cleared'
    };

    setCustomers(prev => [newCustomer, ...prev]);

    // If initial balance was entered, record an opening balance txn
    if (initBal > 0) {
      const initialTxn: KhataTransaction = {
        id: `txn-${Date.now()}`,
        customerId: newId,
        type: 'give',
        amount: initBal,
        date: now,
        notes: t.openingBalanceTxnNote || 'शुरुआती पुराना बकाया (Opening Balance)',
        recordedBy: currentUser.name
      };
      setTransactions(prev => [initialTxn, ...prev]);
    }

    // Reset form
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustNotes('');
    setNewCustInitialBalance('');
    setShowAddCustomerModal(false);
    setSelectedCustomerId(newId);
  };

  // Record Transaction Handler
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txnAmount);
    if (!amountNum || amountNum <= 0) {
      alert(t.enterValidAmountAlert || 'कृपया मान्य राशि दर्ज करें');
      return;
    }
    if (!txnTargetCustomerId) {
      alert(t.selectCustAlert || 'कृपया ग्राहक चुनें');
      return;
    }

    const now = new Date().toISOString();
    const newTxn: KhataTransaction = {
      id: `txn-${Date.now()}`,
      customerId: txnTargetCustomerId,
      type: modalTxnType,
      amount: amountNum,
      date: now,
      dueDate: modalTxnType === 'give' ? txnDueDate : undefined,
      notes: txnNotes.trim(),
      invoiceNo: txnInvoiceNo.trim() || undefined,
      paymentMode: modalTxnType === 'receive' ? txnPaymentMode : undefined,
      recordedBy: currentUser.name
    };

    // Update transactions list
    setTransactions(prev => [newTxn, ...prev]);

    // Update customer balance & summary
    setCustomers(prev => prev.map(c => {
      if (c.id === txnTargetCustomerId) {
        const newGiven = modalTxnType === 'give' ? c.totalGiven + amountNum : c.totalGiven;
        const newReceived = modalTxnType === 'receive' ? c.totalReceived + amountNum : c.totalReceived;
        const newBalance = newGiven - newReceived;
        return {
          ...c,
          totalGiven: newGiven,
          totalReceived: newReceived,
          balance: newBalance,
          lastTransactionDate: now,
          dueDate: modalTxnType === 'give' && txnDueDate ? txnDueDate : c.dueDate,
          status: newBalance > 0 ? 'active' : 'cleared'
        };
      }
      return c;
    }));

    setShowTransactionModal(false);
    setSelectedCustomerId(txnTargetCustomerId);
  };

  // Delete Customer
  const handleDeleteCustomer = (id: string, name: string) => {
    const confirmTemplate = t.deleteCustomerConfirmMsg || 'क्या आप ग्राहक "{name}" का सम्पूर्ण खाता व लेन-देन विवरण हटाना चाहते हैं?';
    if (confirm(confirmTemplate.replace('{name}', name))) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      setTransactions(prev => prev.filter(t => t.customerId !== id));
      if (selectedCustomerId === id) setSelectedCustomerId(null);
    }
  };

  // WhatsApp Reminder Link
  const handleWhatsAppReminder = (customer: KhataCustomer) => {
    if (!customer.phone) {
      alert(t.noPhoneAlertMsg || 'इस ग्राहक का मोबाइल नंबर दर्ज नहीं है। कृपया पहले नंबर जोड़ें।');
      return;
    }
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const storeName = settings.businessName || (settings.language === 'en' ? 'Our Store' : 'हमारी दुकान');
    
    let message = '';
    if (settings.language === 'en') {
      message = `${t.whatsappHello || 'Hello'} ${customer.name},\nYour total outstanding balance with ${storeName} is ${settings.currency}${customer.balance.toLocaleString('en-IN')}.\nPlease make payment at your earliest convenience.\nThank you!\n- ${storeName}`;
    } else if (settings.language === 'hinglish') {
      message = `${t.whatsappHello || 'Namaste'} ${customer.name} ${t.whatsappJi || 'ji'},\n${storeName} ${t.whatsappDueMsg || 'se aapka total baaki udhaar'} ${settings.currency}${customer.balance.toLocaleString('en-IN')} ${t.whatsappPleasePay || 'hai.\nKripya payment clear karein.\nDhanyawad!'}\n- ${storeName}`;
    } else {
      message = `${t.whatsappHello || 'नमस्ते'} ${customer.name} ${t.whatsappJi || 'जी'},\n${storeName} ${t.whatsappDueMsg || 'से आपका कुल बकाया उधार'} ${settings.currency}${customer.balance.toLocaleString('en-IN')} ${t.whatsappPleasePay || 'है।\nकृपया यथाशीघ्र भुगतान करें।\nधन्यवाद!'}\n- ${storeName}`;
    }

    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Print Passbook / Statement
  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16">
      {/* Top Header & Fast Action Buttons */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>{t.khataTitle || 'उधार एवं बही-खाता (Khata Book)'}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    {t.khataBadge || 'बही-खाता'}
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.khataSubtitle || 'ग्राहकों का उधार, वसूली हिसाब, तारीख और रिमाइंडर का सम्पूर्ण प्रबंधन'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="add-khata-customer-btn"
              onClick={() => setShowAddCustomerModal(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.newCustomerBtn || '+ नया ग्राहक'}</span>
            </button>

            <button
              id="give-credit-btn"
              onClick={() => handleOpenTxnModal('give')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{t.giveCreditBtn || '+ उधार दिया'}</span>
            </button>

            <button
              id="receive-jama-btn"
              onClick={() => handleOpenTxnModal('receive')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>{t.receiveJamaBtn || '- जमा मिला'}</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60">
            <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1">
              <span className="text-[11px] font-bold">{t.totalOutstandingCredit || 'कुल बाकी उधार'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-rose-900 dark:text-rose-200 font-mono">
              {settings.currency}{stats.totalBalance.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">
              {stats.activeDebtors} {t.customersWithDue || 'ग्राहकों पर बकाया'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
              <span className="text-[11px] font-bold">{t.receivedThisMonth || 'इस माह जमा वसूली'}</span>
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-emerald-900 dark:text-emerald-200 font-mono">
              {settings.currency}{stats.receivedThisMonth.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              {t.receivedViaCashUpi || 'कैश व UPI से प्राप्त'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
              <span className="text-[11px] font-bold">{t.overdueTitle || 'देय तिथि पार (Overdue)'}</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-amber-900 dark:text-amber-200 font-mono">
              {stats.overdueCount}
            </div>
            <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
              {t.overdueSubtitle || 'समय पर भुगतान नहीं आया'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/60">
            <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 mb-1">
              <span className="text-[11px] font-bold">{t.totalKhataCustomers || 'कुल खाता ग्राहक'}</span>
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-purple-900 dark:text-purple-200 font-mono">
              {stats.totalCustomers}
            </div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">
              {t.activeAccountHolders || 'सक्रिय खाता धारक'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Split: Left = Customer Directory, Right = Passbook & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Customer Directory (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col min-h-[500px] shadow-xs">
          {/* Search & Filters */}
          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="khata-customer-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchKhataPlaceholder || 'ग्राहक का नाम, मोबाइल नंबर या पता खोजें...'}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: t.filterAllKhata || 'सभी' },
                { id: 'pending', label: t.filterPendingKhata || 'बाकी उधार' },
                { id: 'overdue', label: t.filterOverdueKhata || 'समय पार' },
                { id: 'cleared', label: t.filterClearedKhata || 'चुकता' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                    filterType === f.id
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[580px]">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.noCustomerFound || 'कोई खाता ग्राहक नहीं मिला'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t.noCustomerSubtext || 'ऊपर दिए गए "+ नया ग्राहक" बटन से नया उधार खाता शुरू करें'}
                </p>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t.addNewCustomerPrompt || 'नया ग्राहक जोड़ें'}</span>
                </button>
              </div>
            ) : (
              filteredCustomers.map(cust => {
                const isSelected = cust.id === selectedCustomerId;
                const isOverdue = cust.balance > 0 && cust.dueDate && cust.dueDate < new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`pt-2 first:pt-0 p-2.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-purple-400 bg-purple-50/70 dark:bg-purple-950/40 dark:border-purple-800 shadow-2xs'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {cust.name}
                          </span>
                          {isOverdue && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              {t.badgeOverdue || 'तारीख पार'}
                            </span>
                          )}
                          {cust.balance <= 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              {t.badgeCleared || 'चुकता'}
                            </span>
                          )}
                        </div>

                        {cust.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{cust.phone}</span>
                          </div>
                        )}

                        {cust.dueDate && cust.balance > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{t.dueLabel || 'देय:'} {new Date(cust.dueDate).toLocaleDateString(dateLocale)}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`text-xs sm:text-sm font-black font-mono ${
                          cust.balance > 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {settings.currency}{Math.abs(cust.balance).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[9px] font-semibold text-slate-400">
                          {cust.balance > 0 ? (t.pendingCreditLabel || 'बाकी उधार') : (t.clearedLabel || 'चुकता')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Customer Passbook / Ledger Details (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col min-h-[500px]">
          {selectedCustomer ? (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Customer Profile Banner */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                      {selectedCustomer.name}
                    </h2>
                    {selectedCustomer.balance > 0 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {t.badgeOutstanding || 'बकाया उधार'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {t.badgeSettled || 'हिसाब चुकता'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                    {selectedCustomer.phone && (
                      <a 
                        href={`tel:${selectedCustomer.phone}`} 
                        className="inline-flex items-center gap-1 hover:text-purple-600 transition-colors"
                      >
                        <Phone className="w-3 h-3 text-purple-500" />
                        <span>{selectedCustomer.phone}</span>
                      </a>
                    )}
                    {selectedCustomer.address && (
                      <span className="text-slate-400 truncate max-w-[200px]">
                        • {selectedCustomer.address}
                      </span>
                    )}
                    {selectedCustomer.dueDate && selectedCustomer.balance > 0 && (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        • {t.dueDateLabel || 'देय तिथि'}: {new Date(selectedCustomer.dueDate).toLocaleDateString(dateLocale)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Outstanding Balance Spotlight */}
                <div className="sm:text-right shrink-0 p-2.5 sm:p-0 bg-white sm:bg-transparent dark:bg-slate-900 sm:dark:bg-transparent rounded-xl border sm:border-none border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {t.totalRemainingBalance || 'कुल शेष बाकी'}
                  </div>
                  <div className={`text-xl sm:text-2xl font-black font-mono ${
                    selectedCustomer.balance > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {settings.currency}{selectedCustomer.balance.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Action Toolbar for Customer */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleOpenTxnModal('give', selectedCustomer.id)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{t.giveCreditGoodsBtn || '+ उधार दिया (सामान)'}</span>
                </button>

                <button
                  onClick={() => handleOpenTxnModal('receive', selectedCustomer.id)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>{t.receivePaymentBtn || '- जमा मिला (भुगतान)'}</span>
                </button>

                {selectedCustomer.balance > 0 && selectedCustomer.phone && (
                  <button
                    onClick={() => handleWhatsAppReminder(selectedCustomer)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all cursor-pointer"
                    title={t.whatsappReminderTooltip || 'WhatsApp पर तकादा / रिमाइंडर भेजें'}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">{t.whatsappReminder || 'व्हाट्सएप रिमाइंडर'}</span>
                  </button>
                )}

                <button
                  onClick={handlePrintStatement}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer ml-auto"
                  title={t.printStatementTooltip || 'खाता पर्ची प्रिंट करें'}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{t.printStatement || 'पर्ची प्रिंट'}</span>
                </button>

                <button
                  onClick={() => handleDeleteCustomer(selectedCustomer.id, selectedCustomer.name)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title={t.deleteAccountTooltip || 'खाता हटाएं'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Ledger Passbook Table */}
              <div className="flex-1 flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{t.ledgerHistoryTitle || 'खाता बही लेन-देन इतिहास (Passbook)'}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {customerTransactions.length} {t.transactionsCount || 'लेन-देन'}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-slate-100 dark:divide-slate-800">
                  {customerTransactions.length === 0 ? (
                    <div className="text-center py-10 px-4 text-xs text-slate-400">
                      {t.noTxnForCustomer || 'इस ग्राहक का कोई लेन-देन अभी दर्ज नहीं है।'}
                    </div>
                  ) : (
                    customerTransactions.map(txn => {
                      const isGive = txn.type === 'give';

                      return (
                        <div 
                          key={txn.id} 
                          className="p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isGive
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}>
                              {isGive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                            </div>

                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                                <span>{isGive ? (t.creditGivenEntry || 'उधार दिया (+ Udhaar)') : (t.paymentReceivedEntry || 'जमा प्राप्त (- Jama)')}</span>
                                {txn.paymentMode && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                                    {txn.paymentMode}
                                  </span>
                                )}
                                {txn.invoiceNo && (
                                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                                    {txn.invoiceNo}
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {txn.notes || (isGive ? (t.defaultCreditNote || 'उधार बिल') : (t.defaultReceiveNote || 'भुगतान प्राप्ति'))}
                              </p>

                              <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>{new Date(txn.date).toLocaleString(dateLocale)}</span>
                                {txn.dueDate && (
                                  <span className="text-rose-500">
                                    {t.dueLabel || 'देय:'} {new Date(txn.dueDate).toLocaleDateString(dateLocale)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className={`font-mono text-sm font-black ${
                              isGive ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {isGive ? '+' : '-'}{settings.currency}{txn.amount.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {t.recordedByLabel || 'दर्जकर्ता:'} {txn.recordedBy || 'Admin'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t.selectCustomerToView || 'ग्राहक चुनें'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                {t.selectCustomerToViewSub || 'बाएं मेनू से किसी भी ग्राहक पर क्लिक करके उनका सम्पूर्ण बही-खाता व लेन-देन विवरण देखें'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD NEW CUSTOMER */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.addNewCustomerModalTitle || 'नया उधार ग्राहक जोड़ें'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.customerNameField || 'ग्राहक का नाम'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.customerNamePlaceholder || 'उदा. रमेश कुमार'}
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.mobileNumberField || 'मोबाइल नंबर (Phone)'}
                </label>
                <input
                  type="text"
                  placeholder={t.mobileNumberPlaceholder || '10 अंकों का मोबाइल नंबर'}
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.addressLocationField || 'पता / लोकेशन (वैकल्पिक)'}
                </label>
                <input
                  type="text"
                  placeholder={t.addressPlaceholder || 'उदा. मेन मार्केट, दुकान नं. 5'}
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.oldBalanceInitialField || 'पुराना बकाया / शुरुआती राशि'} ({settings.currency})
                </label>
                <input
                  type="number"
                  placeholder={t.oldBalanceInitialPlaceholder || '0 (यदि पहले से कोई पुराना उधार हो)'}
                  value={newCustInitialBalance}
                  onChange={(e) => setNewCustInitialBalance(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.accountNotesField || 'खाता टिप्पणी / सन्दर्भ'}
                </label>
                <input
                  type="text"
                  placeholder={t.accountNotesPlaceholder || 'उदा. हर महीने 1 तारीख को भुगतान करता है'}
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {t.cancelBtn || 'रद्द करें'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {t.createKhataAccountBtn || t.createAccountBtn || 'खाता बनाएं'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TRANSACTION (+ UDHAAR or - JAMA) */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  modalTxnType === 'give'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {modalTxnType === 'give' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {modalTxnType === 'give' ? (t.recordGiveCreditModalTitle || '+ नया उधार दर्ज करें') : (t.recordReceiveModalTitle || '- जमा राशि दर्ज करें')}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {modalTxnType === 'give' ? (t.recordGiveCreditSub || 'ग्राहक के खाते में उधार जोड़ेगा') : (t.recordReceiveSub || 'ग्राहक का बकाया उधार घटाएगा')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3">
              {/* Customer Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.selectCustomerField || 'ग्राहक चुनें'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={txnTargetCustomerId}
                  onChange={(e) => setTxnTargetCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">{t.selectCustomerPlaceholder || '-- ग्राहक का चयन करें --'}</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''} - {t.dueLabel || 'बाकी'}: {settings.currency}{c.balance}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.amountField || 'राशि (Amount)'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">
                    {settings.currency}
                  </span>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    placeholder="0.00"
                    value={txnAmount}
                    onChange={(e) => setTxnAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Payment Mode for 'receive' */}
              {modalTxnType === 'receive' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.paymentModeField || 'भुगतान माध्यम (Payment Mode)'}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'cash', label: t.cashPaymentMode || 'नकद (Cash)' },
                      { id: 'upi', label: t.upiPaymentMode || 'UPI / QR' },
                      { id: 'bank', label: t.bankPaymentMode || 'बैंक ट्रांसफर' }
                    ].map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setTxnPaymentMode(pm.id as any)}
                        className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                          txnPaymentMode === pm.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Due Date for 'give' */}
              {modalTxnType === 'give' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t.paymentDueDateField || 'भुगतान देय तिथि (Due Date)'}
                    </label>
                    <div className="flex items-center gap-1">
                      {[7, 15, 30].map(days => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + days);
                            setTxnDueDate(d.toISOString().split('T')[0]);
                          }}
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          +{days} {t.daysSuffix || 'दिन'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="date"
                    value={txnDueDate}
                    onChange={(e) => setTxnDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {/* Invoice / Bill No & Notes */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.invoiceNoField || 'बिल नंबर (वैकल्पिक)'}
                  </label>
                  <input
                    type="text"
                    placeholder="INV-001"
                    value={txnInvoiceNo}
                    onChange={(e) => setTxnInvoiceNo(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.notesItemsField || 'विवरण / सामान'}
                  </label>
                  <input
                    type="text"
                    placeholder={t.notesItemsPlaceholder || 'उदा. राशन / नकद भुगतान'}
                    value={txnNotes}
                    onChange={(e) => setTxnNotes(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {t.cancelBtn || 'रद्द करें'}
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer ${
                    modalTxnType === 'give'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {modalTxnType === 'give' ? (t.addCreditBtn || '+ उधार जोड़ें') : (t.recordJamaBtn || '- जमा दर्ज करें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default KhataView;
