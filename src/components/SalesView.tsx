import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  CreditCard, 
  Banknote, 
  QrCode, 
  CheckCircle, 
  Receipt, 
  User, 
  Phone,
  ArrowRight,
  Package,
  History,
  Boxes,
  FileDown, 
  Loader2, 
  Check,
  Copy,
  Edit3,
  Calendar,
  Percent,
  Tag,
  AlertCircle,
  X,
  Clock,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Users,
  Sparkles
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { SaleCartItem, PaymentMethod, PaymentDetails, SaleRecord, InventoryItem } from '../types';
import { translations } from '../utils/translations';
import { downloadInvoicePDF, printReceiptElement } from '../utils/pdfGenerator';

export const SalesView: React.FC = () => {
  const { items, recordSale, sales, settings, setActiveTab } = useInventory();
  const t = translations[settings.language] || translations.hi;

  const [activeSubTab, setActiveSubTab] = useState<'billing' | 'history'>('billing');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<SaleCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [completedInvoice, setCompletedInvoice] = useState<SaleRecord | null>(null);
  const [mobilePosTab, setMobilePosTab] = useState<'products' | 'cart'>('products');

  // Payment Method Specific States
  const [upiRef, setUpiRef] = useState('');
  const [activeUpiId, setActiveUpiId] = useState(settings.upiId || 'store@upi');
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [tempUpiId, setTempUpiId] = useState(settings.upiId || 'store@upi');
  const [upiCopied, setUpiCopied] = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);
  const [showBigQr, setShowBigQr] = useState(false);

  // Cash States
  const [cashTendered, setCashTendered] = useState('');

  // Card States
  const [cardType, setCardType] = useState('Debit Card');
  const [cardLast4, setCardLast4] = useState('');
  const [cardTxnRef, setCardTxnRef] = useState('');
  const [cardApproved, setCardApproved] = useState(true);

  // Udhaar (Credit) States
  const getDefaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };
  const [creditDueDate, setCreditDueDate] = useState(getDefaultDueDate());
  const [creditNotes, setCreditNotes] = useState('');

  // Extra Bars: Discount & Notes & Customer Suggestions
  const [showDiscountBar, setShowDiscountBar] = useState(false);
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  const [discountValue, setDiscountValue] = useState('');

  const [showNotesBar, setShowNotesBar] = useState(false);
  const [showRecentCustomers, setShowRecentCustomers] = useState(false);

  const [quickSearch, setQuickSearch] = useState('');
  const [showQuickDropdown, setShowQuickDropdown] = useState(false);
  const quickDropdownRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessToast, setPdfSuccessToast] = useState(false);

  // Sync activeUpiId when settings change
  useEffect(() => {
    if (settings.upiId) {
      setActiveUpiId(settings.upiId);
      setTempUpiId(settings.upiId);
    }
  }, [settings.upiId]);

  // Recent unique customers from sales history
  const recentCustomers: Array<{ name: string; phone: string }> = Array.from(
    new Map<string, { name: string; phone: string }>(
      sales
        .filter(s => Boolean(s.customerName && s.customerName.trim() && s.customerName !== t.counterCustomer))
        .map(s => [
          s.customerName!.trim().toLowerCase() + '_' + (s.customerPhone || ''),
          { name: s.customerName!.trim(), phone: s.customerPhone || '' }
        ])
    ).values()
  ).slice(0, 8);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Discount calculation
  const parsedDiscount = Math.max(0, Number(discountValue) || 0);
  const discountAmount = discountType === 'flat'
    ? Math.min(parsedDiscount, cartSubtotal)
    : Math.round((cartSubtotal * Math.min(100, parsedDiscount)) / 100);
  const totalAmount = Math.max(0, cartSubtotal - discountAmount);

  // Cash change calculation
  const cashTenderedNum = Number(cashTendered) || 0;
  const cashChange = cashTenderedNum >= totalAmount ? cashTenderedNum - totalAmount : 0;
  const cashShortage = cashTenderedNum < totalAmount && cashTenderedNum > 0 ? totalAmount - cashTenderedNum : 0;

  // Generate dynamic UPI Payment URL & QR
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(activeUpiId)}&pn=${encodeURIComponent(settings.businessName || 'Store')}&am=${totalAmount.toFixed(2)}&cu=INR&tn=Bill-${Date.now().toString().slice(-4)}`;
  const upiQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiPayUrl)}&bgcolor=ffffff&color=0f172a&margin=4`;
  const bigUpiQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiPayUrl)}&bgcolor=ffffff&color=0f172a&margin=6`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickDropdownRef.current && !quickDropdownRef.current.contains(event.target as Node)) {
        setShowQuickDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const quickSearchItems = items.filter(i => {
    if (i.quantity <= 0) return false;
    const q = quickSearch.toLowerCase().trim();
    if (!q) return true;
    return i.name.toLowerCase().includes(q) || (i.nameHi && i.nameHi.toLowerCase().includes(q)) || i.sku.toLowerCase().includes(q);
  });

  // Filter products for adding to cart
  const availableItems = items.filter(i => {
    const q = searchQuery.toLowerCase().trim();
    return !q || i.name.toLowerCase().includes(q) || (i.nameHi && i.nameHi.toLowerCase().includes(q)) || i.sku.toLowerCase().includes(q);
  });

  // Add item to cart
  const addToCart = (item: InventoryItem) => {
    if (item.quantity <= 0) return;

    setCart(prev => {
      const existing = prev.find(c => c.itemId === item.id);
      if (existing) {
        if (existing.quantity >= item.quantity) return prev; // Cannot exceed stock
        return prev.map(c => c.itemId === item.id 
          ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.sellingPrice }
          : c
        );
      } else {
        return [...prev, {
          itemId: item.id,
          name: settings.language === 'en' ? item.name : (item.nameHi || item.name),
          quantity: 1,
          unit: item.unit,
          sellingPrice: item.sellingPrice,
          costPrice: item.costPrice,
          subtotal: item.sellingPrice,
        }];
      }
    });
  };

  const updateCartQuantity = (itemId: string, newQty: number) => {
    const invItem = items.find(i => i.id === itemId);
    if (!invItem) return;

    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }

    const clampedQty = Math.min(newQty, invItem.quantity);
    setCart(prev => prev.map(c => c.itemId === itemId 
      ? { ...c, quantity: clampedQty, subtotal: clampedQty * c.sellingPrice }
      : c
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.itemId !== itemId));
  };

  const clearCart = () => {
    if (cart.length > 0 && confirm('क्या आप कार्ट खाली करना चाहते हैं? (Clear cart?)')) {
      setCart([]);
    }
  };

  const handleCompleteSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (paymentMethod === 'credit' && !customerName.trim()) {
      alert('उधार (खाता) बिल के लिए ग्राहक का नाम दर्ज करना अनिवार्य है।');
      return;
    }

    const paymentDetails: PaymentDetails = {
      upiRef: paymentMethod === 'upi' ? upiRef.trim() : undefined,
      upiId: paymentMethod === 'upi' ? (activeUpiId.trim() || 'store@upi') : undefined,
      cashTendered: paymentMethod === 'cash' ? (cashTenderedNum || totalAmount) : undefined,
      cashChange: paymentMethod === 'cash' ? cashChange : undefined,
      cardType: paymentMethod === 'card' ? cardType : undefined,
      cardLast4: paymentMethod === 'card' ? cardLast4.trim() : undefined,
      cardTxnRef: paymentMethod === 'card' ? cardTxnRef.trim() : undefined,
      creditDueDate: paymentMethod === 'credit' ? creditDueDate : undefined,
      creditNotes: paymentMethod === 'credit' ? creditNotes.trim() : undefined,
    };

    const success = recordSale(
      cart, 
      paymentMethod, 
      customerName, 
      customerPhone, 
      notes, 
      discountAmount, 
      paymentDetails
    );

    if (success) {
      const newSaleRecord: SaleRecord = {
        id: `sale-${Date.now()}`,
        invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
        items: [...cart],
        subtotal: cartSubtotal,
        discount: discountAmount,
        totalAmount,
        totalCost: cart.reduce((sum, i) => sum + (i.costPrice * i.quantity), 0),
        totalProfit: totalAmount - cart.reduce((sum, i) => sum + (i.costPrice * i.quantity), 0),
        paymentMethod,
        paymentDetails,
        customerName: customerName || t.counterCustomer,
        customerPhone,
        timestamp: new Date().toISOString(),
        userId: 'active-user',
        userName: t.storeOperator,
        notes,
      };

      setCompletedInvoice(newSaleRecord);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      setUpiRef('');
      setUpiVerified(false);
      setCashTendered('');
      setCardLast4('');
      setCardTxnRef('');
      setCreditNotes('');
      setDiscountValue('');
      setShowDiscountBar(false);
      setShowNotesBar(false);
      setShowRecentCustomers(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!receiptRef.current || !completedInvoice) return;
    setIsGeneratingPdf(true);
    try {
      const ok = await downloadInvoicePDF(receiptRef.current, completedInvoice, settings);
      if (ok) {
        setPdfSuccessToast(true);
        setTimeout(() => setPdfSuccessToast(false), 3500);
      }
    } catch (e) {
      console.error('PDF creation error:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    if (receiptRef.current) {
      printReceiptElement(receiptRef.current);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header & Sub-Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.sales}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.salesDesc}
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('billing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'billing'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{t.newSale}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t.recentSales} ({sales.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'billing' ? (
        <div className="space-y-3">
          {/* Mobile tab switcher for POS: Products vs Cart */}
          <div className="flex md:hidden bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMobilePosTab('products')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mobilePosTab === 'products'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>{t.products} ({availableItems.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setMobilePosTab('cart')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all relative ${
                mobilePosTab === 'cart'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{t.cart}</span>
              {cart.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-start">
            
            {/* Left Column: Product Selection Grid */}
            <div className={`md:col-span-7 space-y-4 ${mobilePosTab === 'products' ? 'block' : 'hidden md:block'}`}>
              
              {/* Search items */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`${t.searchItemBarcode} (स्कैन कर एंटर दबाएं)`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const query = searchQuery.trim().toLowerCase();
                      if (!query) return;
                      // Find item with exact SKU match or exact ID match
                      const match = items.find(i => 
                        i.sku.toLowerCase() === query || 
                        i.id.toLowerCase() === query ||
                        i.name.toLowerCase() === query
                      );
                      if (match) {
                        if (match.quantity > 0) {
                          addToCart(match);
                          setSearchQuery('');
                          // Give user a brief tactile toast or audio if possible
                        } else {
                          alert(`⚠️ उत्पाद "${match.name}" स्टॉक में नहीं है!`);
                        }
                      } else {
                        // Look for partial match if exactly one item matches
                        const partials = items.filter(i => 
                          i.name.toLowerCase().includes(query) || 
                          i.sku.toLowerCase().includes(query)
                        );
                        if (partials.length === 1 && partials[0].quantity > 0) {
                          addToCart(partials[0]);
                          setSearchQuery('');
                        }
                      }
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 shadow-xs font-bold"
                />
              </div>

              {/* Product Quick-Click Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[560px] overflow-y-auto pr-1">
                {availableItems.map((item) => {
                  const isOutOfStock = item.quantity <= 0;
                  const inCart = cart.find(c => c.itemId === item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => addToCart(item)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all relative ${
                        isOutOfStock
                          ? 'opacity-40 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 cursor-not-allowed'
                          : inCart
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 hover:shadow-xs'
                      }`}
                    >
                      {inCart && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                          {inCart.quantity}
                        </span>
                      )}

                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                          {settings.language === 'en' ? item.name : (item.nameHi || item.name)}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {item.category}
                        </p>
                      </div>

                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                          {settings.currency}{item.sellingPrice}
                        </span>
                        <span className={`text-[10px] font-semibold ${
                          isOutOfStock 
                            ? 'text-rose-500' 
                            : item.quantity <= item.minThreshold 
                              ? 'text-amber-500' 
                              : 'text-slate-400'
                        }`}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Right Column: Billing Cart & Checkout */}
            <div className={`md:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 flex flex-col ${mobilePosTab === 'cart' ? 'block' : 'hidden md:block'}`}>
            
            {/* Quick Add Product Dropdown with Typing */}
            <div className="mb-3 relative" ref={quickDropdownRef}>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                <input
                  type="text"
                  placeholder={"+ " + t.selectProduct}
                  value={quickSearch}
                  onFocus={() => setShowQuickDropdown(true)}
                  onChange={(e) => {
                    setQuickSearch(e.target.value);
                    setShowQuickDropdown(true);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 transition-shadow"
                />
              </div>

              {showQuickDropdown && (
                <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
                  {quickSearchItems.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                      {t.noItemsFound}
                    </div>
                  ) : (
                    <div className="py-1">
                      {quickSearchItems.map(i => (
                        <button
                          key={i.id}
                          type="button"
                          onClick={() => {
                            addToCart(i);
                            setQuickSearch('');
                            setShowQuickDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors flex justify-between items-center"
                        >
                          <span className="truncate pr-2">
                            {settings.language === 'en' ? i.name : (i.nameHi || i.name)}
                          </span>
                          <span className="font-semibold shrink-0 text-emerald-600 dark:text-emerald-400">
                            {settings.currency}{i.sellingPrice}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {t.cart} ({cart.length})
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:underline font-semibold"
                >
                  {t.clearBtn}
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto mb-4 divide-y divide-slate-100 dark:divide-slate-800/60">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold">{t.cartEmpty}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.addProductsFromLeft}</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.itemId} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {settings.currency}{item.sellingPrice} / {item.unit}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.itemId, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-700 dark:text-slate-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.itemId, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-700 dark:text-slate-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[60px]">
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        {settings.currency}{item.subtotal}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.itemId)}
                        className="text-[10px] text-rose-500 hover:underline"
                      >
                        {t.removeBtn}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Details & Recent Customers Bar */}
            <div className="mb-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {t.customerDetails}
                </span>
                {recentCustomers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowRecentCustomers(!showRecentCustomers)}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Users className="w-3 h-3" />
                    <span>पिछले ग्राहक ({recentCustomers.length})</span>
                    {showRecentCustomers ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                  </button>
                )}
              </div>

              {/* Recent Customers Quick Chips */}
              {showRecentCustomers && recentCustomers.length > 0 && (
                <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap gap-1.5 animate-in fade-in duration-150">
                  {recentCustomers.map((cust, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCustomerName(cust.name);
                        if (cust.phone) setCustomerPhone(cust.phone);
                        setShowRecentCustomers(false);
                      }}
                      className="text-[10px] font-medium px-2 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1"
                    >
                      <span>{cust.name}</span>
                      {cust.phone && <span className="text-[9px] text-slate-400">({cust.phone})</span>}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    {t.customerName} {paymentMethod === 'credit' && <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative">
                    <User className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t.customerName}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full pl-7 pr-2 py-1.5 rounded-lg border text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800 transition-colors ${
                        paymentMethod === 'credit' && !customerName.trim()
                          ? 'border-rose-400 ring-1 ring-rose-300 dark:border-rose-500'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    {t.customerPhone}
                  </label>
                  <div className="relative">
                    <Phone className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t.customerPhone}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Extra Action Bars: Discount Bar & Bill Note Bar */}
            <div className="mb-3 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDiscountBar(!showDiscountBar)}
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    discountAmount > 0
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold'
                      : showDiscountBar
                        ? 'border-slate-400 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span>
                    {discountAmount > 0 ? `छूट: -${settings.currency}${discountAmount}` : '% छूट (Discount) जोड़ें'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowNotesBar(!showNotesBar)}
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    notes.trim()
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold'
                      : showNotesBar
                        ? 'border-slate-400 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{notes.trim() ? 'नोट जुड़ा है' : '+ बिल नोट / रिमार्क'}</span>
                </button>
              </div>

              {/* Expandable Discount Bar */}
              {showDiscountBar && (
                <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">
                      छूट कॉन्फ़िगर करें (Discount)
                    </span>
                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-emerald-200 dark:border-emerald-700">
                      <button
                        type="button"
                        onClick={() => setDiscountType('flat')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                          discountType === 'flat'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        ₹ फ्लैट (Cash)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('percent')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                          discountType === 'percent'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        % प्रतिशत
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        {discountType === 'flat' ? settings.currency : '%'}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={discountType === 'percent' ? 100 : cartSubtotal}
                        placeholder={discountType === 'flat' ? '50' : '10'}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    {discountValue && (
                      <button
                        type="button"
                        onClick={() => setDiscountValue('')}
                        className="px-2 py-1.5 text-xs text-rose-600 hover:underline font-semibold"
                      >
                        हटाएं
                      </button>
                    )}
                  </div>

                  {/* Preset Discount Chips */}
                  <div className="flex flex-wrap gap-1">
                    {discountType === 'flat'
                      ? [10, 20, 50, 100].map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setDiscountValue(String(v))}
                            className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100"
                          >
                            ₹{v}
                          </button>
                        ))
                      : [5, 10, 15, 20].map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setDiscountValue(String(v))}
                            className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100"
                          >
                            {v}%
                          </button>
                        ))}
                  </div>
                </div>
              )}

              {/* Expandable Bill Note Bar */}
              {showNotesBar && (
                <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                  <label className="text-[10px] font-bold text-indigo-950 dark:text-indigo-200 block">
                    बिल पर विशेष नोट / टिप्पणी
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. 7 दिन में रिटर्न मान्य, वारंटी कार्ड दिया"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="mb-3">
              <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                {t.paymentMode}
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'upi', label: 'UPI / QR', icon: QrCode },
                  { id: 'cash', label: t.cash, icon: Banknote },
                  { id: 'card', label: t.card, icon: CreditCard },
                ].map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === pm.id
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-semibold">{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Link to Dedicated Udhaar (Khata) Section */}
              <div className="mt-2.5 p-2 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300 shrink-0">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-purple-950 dark:text-purple-200 truncate">
                      उधार व बही-खाता प्रबंधन
                    </p>
                    <p className="text-[9px] text-purple-700 dark:text-purple-400 truncate">
                      ग्राहकों का बकाया हिसाब अलग सेक्शन में देखें
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('khata')}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold shrink-0 transition-colors shadow-2xs cursor-pointer"
                >
                  खाता खोलें →
                </button>
              </div>
            </div>

            {/* Working Interactive Panel Based on Selected Payment Method */}
            <div className="mb-4">
              {/* 1. UPI / QR WORKING PANEL */}
              {paymentMethod === 'upi' && (
                <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                        UPI / QR कोड भुगतान
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBigQr(true)}
                      className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold hover:underline flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-md"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>बड़ा QR दिखाएं</span>
                    </button>
                  </div>

                  {/* QR Preview & Store UPI Details */}
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                    <div 
                      onClick={() => setShowBigQr(true)}
                      className="w-16 h-16 shrink-0 bg-white p-1 rounded-md border border-slate-200 cursor-pointer hover:border-indigo-500 transition-all flex items-center justify-center relative group"
                      title="क्लिक करके बड़ा QR देखें"
                    >
                      <img 
                        src={upiQrImageUrl} 
                        alt="UPI QR Code" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-md flex items-center justify-center text-white transition-opacity">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-slate-500 font-medium">स्कैन योग्य राशि:</div>
                      <div className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
                        {settings.currency}{totalAmount.toLocaleString('en-IN')}
                      </div>
                      
                      {/* UPI ID display & copy / inline edit */}
                      {isEditingUpi ? (
                        <div className="mt-1 flex items-center gap-1">
                          <input
                            type="text"
                            value={tempUpiId}
                            onChange={(e) => setTempUpiId(e.target.value)}
                            placeholder="store@upi"
                            className="text-[10px] px-1.5 py-0.5 rounded border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono w-28"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveUpiId(tempUpiId.trim() || 'store@upi');
                              setIsEditingUpi(false);
                            }}
                            className="text-[9px] px-1.5 py-0.5 bg-indigo-600 text-white rounded font-bold"
                          >
                            ओके
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300 font-mono truncate">
                          <span className="truncate max-w-[120px]" title={activeUpiId}>{activeUpiId}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(activeUpiId);
                              setUpiCopied(true);
                              setTimeout(() => setUpiCopied(false), 2000);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 p-0.5 rounded hover:bg-indigo-50"
                            title="UPI ID कॉपी करें"
                          >
                            {upiCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingUpi(true)}
                            className="text-[9px] text-slate-400 hover:text-indigo-600 ml-0.5"
                            title="UPI ID बदलें"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* UTR / Transaction Ref Input */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      12-अंक UTR / Txn Ref No. (वैकल्पिक)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. 428192038102"
                      value={upiRef}
                      onChange={(e) => setUpiRef(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  {/* Payment Received Verified Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer pt-0.5 select-none">
                    <input
                      type="checkbox"
                      checked={upiVerified}
                      onChange={(e) => setUpiVerified(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
                    />
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      ग्राहक से UPI भुगतान प्राप्त हुआ (Verified)
                    </span>
                  </label>
                </div>
              )}

              {/* 2. CASH (नकद) WORKING PANEL */}
              {paymentMethod === 'cash' && (
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                        नकद भुगतान एवं छुट्टे (Cash & Change)
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold">
                      देय: {settings.currency}{totalAmount}
                    </span>
                  </div>

                  {/* Quick Preset Cash Buttons */}
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-slate-500 mr-0.5">त्वरित नकद:</span>
                    <button
                      type="button"
                      onClick={() => setCashTendered(String(totalAmount))}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 hover:bg-amber-100"
                    >
                      पूरा ({settings.currency}{totalAmount})
                    </button>
                    {[100, 200, 500, 1000, 2000].filter(n => n >= totalAmount || totalAmount === 0).map(note => (
                      <button
                        key={note}
                        type="button"
                        onClick={() => setCashTendered(String(note))}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                      >
                        {settings.currency}{note}
                      </button>
                    ))}
                  </div>

                  {/* Cash Received Input */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      ग्राहक ने कितने रुपये दिए (Cash Tendered):
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        {settings.currency}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder={String(totalAmount)}
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        className="w-full pl-6 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Real-time Change & Balance Box */}
                  {cashTenderedNum > 0 && (
                    <div className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-between ${
                      cashChange > 0 
                        ? 'bg-emerald-100/90 border-emerald-300 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200'
                        : cashShortage > 0 
                          ? 'bg-rose-100/90 border-rose-300 text-rose-950 dark:bg-rose-950/60 dark:text-rose-200'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}>
                      {cashChange > 0 ? (
                        <>
                          <span>ग्राहक को वापसी छुट्टे:</span>
                          <span className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-400">
                            {settings.currency}{cashChange}
                          </span>
                        </>
                      ) : cashShortage > 0 ? (
                        <>
                          <span>बाकी / कम राशि:</span>
                          <span className="text-sm font-mono font-black text-rose-700 dark:text-rose-400">
                            {settings.currency}{cashShortage}
                          </span>
                        </>
                      ) : (
                        <span>पूरा नकद प्राप्त (Exact Cash Tendered)</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 3. CARD WORKING PANEL */}
              {paymentMethod === 'card' && (
                <div className="p-3 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-xl space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <span className="text-xs font-bold text-sky-950 dark:text-sky-200">
                        कार्ड स्वाइप / मशीन पेमेंट
                      </span>
                    </div>
                  </div>

                  {/* Card Type Chips */}
                  <div className="flex flex-wrap gap-1">
                    {['Debit Card', 'Credit Card', 'RuPay', 'Visa', 'Mastercard'].map((ct) => (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => setCardType(ct)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                          cardType === ct
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {ct}
                      </button>
                    ))}
                  </div>

                  {/* Card Last 4 & Slip Ref */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        कार्ड अंतिम 4 अंक
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="उदा. 4012"
                        value={cardLast4}
                        onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        POS स्लिप / Approval ID
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. TXN-8941"
                        value={cardTxnRef}
                        onChange={(e) => setCardTxnRef(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Approved Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer pt-0.5 select-none">
                    <input
                      type="checkbox"
                      checked={cardApproved}
                      onChange={(e) => setCardApproved(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 dark:border-slate-700"
                    />
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      मशीन द्वारा कार्ड स्वाइप सफल (Approved)
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Subtotal, Discount & Total Amount Breakdown */}
            <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>उपकुल (Subtotal):</span>
                  <span className="font-mono">{settings.currency}{cartSubtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>छूट (Discount {discountType === 'percent' ? `${discountValue}%` : ''}):</span>
                    <span className="font-mono">-{settings.currency}{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {t.totalPayable}:
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {settings.currency}{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleCompleteSale}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{t.completeSale}</span>
              </button>
            </div>

          </div>

          </div>

          {/* Floating Cart Checkout Button for Mobile when in products view */}
          {mobilePosTab === 'products' && cart.length > 0 && (
            <div className="md:hidden sticky bottom-2 z-20 pt-1">
              <button
                type="button"
                onClick={() => setMobilePosTab('cart')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-700/25 flex items-center justify-between active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-black">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                  <span>{t.cart} ({t.itemsPlain})</span>
                </div>
                <div className="flex items-center gap-1.5 font-black text-sm">
                  <span>{settings.currency}{totalAmount}</span>
                  <span>→ {t.completeSale}</span>
                </div>
              </button>
            </div>
          )}

        </div>
      ) : (
        /* History Tab */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t.recentSales}
            </h3>
            <span className="text-xs text-slate-500">{t.totalBillsRecordedPlain.replace('{count}', sales.length.toString())}</span>
          </div>

          {sales.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">{t.noSalesRecorded}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">{t.invoiceNo}</th>
                    <th className="py-3 px-3">{t.dateAndTime}</th>
                    <th className="py-3 px-3">{t.customerPlain}</th>
                    <th className="py-3 px-3">{t.goodsItems}</th>
                    <th className="py-3 px-3">{t.payment}</th>
                    <th className="py-3 px-3">{t.amount}</th>
                    <th className="py-3 px-3 text-emerald-600">{t.profitLabel}</th>
                    <th className="py-3 px-4 text-right">{t.receipt}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {sale.invoiceNo}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-xs">
                        {new Date(sale.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium">
                        {sale.customerName || t.counterCustomer}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {sale.items.length} {t.itemsPlain} ({sale.items.reduce((s, i) => s + i.quantity, 0)} {t.totalPlain})
                      </td>
                      <td className="py-3 px-3 uppercase text-[11px] font-bold text-slate-500">
                        {sale.paymentMethod}
                      </td>
                      <td className="py-3 px-3 font-black text-slate-900 dark:text-white">
                        {settings.currency}{sale.totalAmount}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                        +{settings.currency}{sale.totalProfit}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setCompletedInvoice(sale)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{t.billStr}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {completedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl p-4 sm:p-5 relative animate-in zoom-in-95 my-auto max-h-[95vh] flex flex-col">
            
            {/* Download Success Banner */}
            {pdfSuccessToast && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in duration-200">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>बिल PDF आपके सिस्टम में सफलतापूर्वक सेव हो गया!</span>
              </div>
            )}

            {/* Scrollable Printable Receipt Canvas Area */}
            <div className="overflow-y-auto max-h-[70vh] pr-1 pb-1">
              <div 
                ref={receiptRef} 
                id="printable-receipt" 
                className="p-4 sm:p-5 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-xs"
              >
                
                {/* Store Header */}
                <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {settings.businessName || 'My Store'}
                  </h3>
                  {settings.businessAddress && (
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                      {settings.businessAddress}
                    </p>
                  )}
                  {settings.businessPhone && (
                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                      {t.phonePrefix} {settings.businessPhone}
                    </p>
                  )}
                  {settings.gstNumber && (
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      GSTIN: {settings.gstNumber}
                    </p>
                  )}
                </div>

                {/* Bill Meta */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700 mb-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span>{t.billNoPrefix} <strong className="font-mono text-slate-900">{completedInvoice.invoiceNo}</strong></span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(completedInvoice.timestamp).toLocaleDateString()} {new Date(completedInvoice.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-1 text-[11px]">
                    <span>{t.customerPrefix} <strong className="text-slate-900">{completedInvoice.customerName || t.counterCustomer}</strong></span>
                    {completedInvoice.customerPhone && (
                      <span>{completedInvoice.customerPhone}</span>
                    )}
                  </div>
                  {completedInvoice.userName && (
                    <div className="text-[10px] text-slate-400 text-right">
                      {t.storeOperator}: {completedInvoice.userName}
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden my-3">
                  <div className="flex justify-between bg-slate-100 py-1.5 px-2.5 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                    <span className="w-1/2">{t.goodsItems}</span>
                    <span className="w-1/4 text-center">{t.qtyXRate}</span>
                    <span className="w-1/4 text-right">{t.totalPlain}</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {completedInvoice.items.map((it, i) => (
                      <div key={i} className="flex justify-between items-center py-2 px-2.5 text-xs text-slate-800">
                        <div className="w-1/2 pr-1">
                          <p className="font-semibold text-slate-900 leading-snug">{it.name}</p>
                          {it.barcode && <span className="text-[10px] text-slate-400 font-mono">#{it.barcode}</span>}
                        </div>
                        <div className="w-1/4 text-center text-[11px] text-slate-600 font-mono">
                          {it.quantity} {it.unit} x {settings.currency}{it.sellingPrice}
                        </div>
                        <div className="w-1/4 text-right font-bold text-slate-900 font-mono">
                          {settings.currency}{it.subtotal.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculation Breakdown & Total */}
                <div className="space-y-1.5 text-xs border-t border-dashed border-slate-300 pt-2.5">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>कुल वस्तुएं (Items):</span>
                    <span>{completedInvoice.items.length} ({completedInvoice.items.reduce((s, it) => s + it.quantity, 0)} कुल मात्रा)</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>उपकुल (Subtotal):</span>
                    <span>{settings.currency}{(completedInvoice.subtotal ?? completedInvoice.items.reduce((s, it) => s + it.subtotal, 0)).toFixed(2)}</span>
                  </div>
                  {completedInvoice.discount && completedInvoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold text-[11px]">
                      <span>छूट (Discount):</span>
                      <span>-{settings.currency}{completedInvoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Total Highlight */}
                  <div className="flex justify-between items-baseline font-black text-base sm:text-lg bg-emerald-50 text-emerald-900 p-2.5 rounded-lg border border-emerald-200 mt-2">
                    <span>{t.totalPayable}:</span>
                    <span className="font-mono text-emerald-700">{settings.currency}{completedInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Status & Specific Details */}
                <div className="mt-3 pt-2 text-center border-t border-slate-100 space-y-1.5">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <CheckCircle className="w-3 h-3" />
                    <span>भुगतान माध्यम: {completedInvoice.paymentMethod.toUpperCase()} (सफल)</span>
                  </div>

                  {/* Payment Details Meta */}
                  {completedInvoice.paymentDetails && (
                    <div className="p-2 bg-slate-50 rounded-lg text-[10px] text-slate-600 text-left border border-slate-200 space-y-0.5">
                      {completedInvoice.paymentMethod === 'upi' && (
                        <>
                          <div className="font-bold text-indigo-700">UPI भुगतान विवरण:</div>
                          {completedInvoice.paymentDetails.upiId && (
                            <div>UPI ID: <span className="font-mono font-semibold">{completedInvoice.paymentDetails.upiId}</span></div>
                          )}
                          {completedInvoice.paymentDetails.upiRef && (
                            <div>UTR / Txn Ref: <span className="font-mono font-semibold text-slate-900">{completedInvoice.paymentDetails.upiRef}</span></div>
                          )}
                        </>
                      )}

                      {completedInvoice.paymentMethod === 'cash' && (
                        <>
                          <div className="font-bold text-amber-700">नकद भुगतान विवरण:</div>
                          {completedInvoice.paymentDetails.cashTendered !== undefined && (
                            <div>प्राप्त नकद: <span className="font-mono font-semibold">{settings.currency}{completedInvoice.paymentDetails.cashTendered}</span></div>
                          )}
                          {completedInvoice.paymentDetails.cashChange !== undefined && completedInvoice.paymentDetails.cashChange > 0 && (
                            <div className="text-emerald-700 font-bold">वापसी छुट्टे (Change Given): <span className="font-mono">{settings.currency}{completedInvoice.paymentDetails.cashChange}</span></div>
                          )}
                        </>
                      )}

                      {completedInvoice.paymentMethod === 'card' && (
                        <>
                          <div className="font-bold text-sky-700">कार्ड भुगतान विवरण:</div>
                          <div>कार्ड प्रकार: <span className="font-semibold">{completedInvoice.paymentDetails.cardType || 'Card'}</span></div>
                          {completedInvoice.paymentDetails.cardLast4 && (
                            <div>कार्ड अंतिम अंक: <span className="font-mono font-bold">**** {completedInvoice.paymentDetails.cardLast4}</span></div>
                          )}
                          {completedInvoice.paymentDetails.cardTxnRef && (
                            <div>POS स्लिप Ref: <span className="font-mono">{completedInvoice.paymentDetails.cardTxnRef}</span></div>
                          )}
                        </>
                      )}

                      {completedInvoice.paymentMethod === 'credit' && (
                        <>
                          <div className="font-bold text-purple-700">बही-खाता (उधार) प्रविष्टि:</div>
                          {completedInvoice.paymentDetails.creditDueDate && (
                            <div>देय तिथि (Due Date): <span className="font-semibold text-rose-700">{completedInvoice.paymentDetails.creditDueDate}</span></div>
                          )}
                          {completedInvoice.paymentDetails.creditNotes && (
                            <div>खाता नोट: <span className="italic">{completedInvoice.paymentDetails.creditNotes}</span></div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {completedInvoice.notes && (
                    <p className="text-[10px] text-slate-500 italic">
                      नोट: {completedInvoice.notes}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 font-medium">
                    {t.thankYouVisitAgain}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    कंप्यूटर जनरेटेड बिल - इन्वेंटरी साथी
                  </p>
                </div>

              </div>
            </div>

            {/* Action Buttons: PDF Download + Print + Close */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-2 border-t border-slate-200 shrink-0">
              <button
                onClick={() => setCompletedInvoice(null)}
                className="py-2.5 px-3 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-100 transition-colors order-3 sm:order-1"
              >
                {t.closeBtn}
              </button>
              
              <button
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 order-2"
                title="सीधा प्रिंट करें"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>{t.printBill}</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all disabled:opacity-60 order-1 sm:order-3"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.generatingPdf}</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>{t.downloadBillPdf}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Big Fullscreen UPI QR Code Modal */}
      {showBigQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 relative flex flex-col items-center text-center animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowBigQr(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {settings.businessName || 'दुकान का QR कोड'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              किसी भी UPI ऐप (GPay, PhonePe, Paytm, BHIM) से स्कैन करें
            </p>

            {/* Big QR Display Container */}
            <div className="my-5 p-4 bg-white rounded-2xl border-2 border-indigo-500/30 shadow-lg flex items-center justify-center">
              <img
                src={bigUpiQrImageUrl}
                alt="Big UPI QR Code"
                className="w-56 h-56 object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Amount Badge */}
            <div className="w-full py-2.5 px-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-100 dark:border-indigo-900/60 mb-3">
              <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
                कुल भुगतान राशि (Payable Amount):
              </div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {settings.currency}{totalAmount.toLocaleString('en-IN')}
              </div>
            </div>

            {/* UPI ID */}
            <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mb-4">
              <span>UPI ID:</span>
              <strong className="text-slate-800 dark:text-slate-200">{activeUpiId}</strong>
            </div>

            <button
              type="button"
              onClick={() => setShowBigQr(false)}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
            >
              बंद करें (Close)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
