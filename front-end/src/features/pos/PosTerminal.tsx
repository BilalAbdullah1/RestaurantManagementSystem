import React, { useState, useMemo } from 'react';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import { toast } from '../../components/ui/Toast';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  CreditCard, 
  Banknote, 
  Layers, 
  Clock, 
  User, 
  Sparkles, 
  CheckCircle2, 
  Flame,
  Coffee,
  Pizza,
  Wine,
  IceCream,
  Percent,
  Printer
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  dietary: 'Veg' | 'Non-Veg' | 'Beverage';
  preparationTime: number;
  isAvailable: boolean;
  image?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
  specialInstructions?: string;
}

export default function PosTerminal() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderType, setOrderType] = useState<'DineIn' | 'Takeaway' | 'Delivery'>('DineIn');
  const [selectedTable, setSelectedTable] = useState<string>('T-01');
  const [customerName, setCustomerName] = useState<string>('Walk-in Guest');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Online'>('Cash');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Sample Categories
  const categories = [
    { id: 'All', name: 'All Items', icon: <Layers className="w-4 h-4" /> },
    { id: 'Starters', name: 'Appetizers & Starters', icon: <Flame className="w-4 h-4" /> },
    { id: 'MainCourse', name: 'Main Course', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'FastFood', name: 'Burgers & Pizza', icon: <Pizza className="w-4 h-4" /> },
    { id: 'Beverages', name: 'Beverages & Mocktails', icon: <Wine className="w-4 h-4" /> },
    { id: 'Desserts', name: 'Desserts & Sweets', icon: <IceCream className="w-4 h-4" /> },
    { id: 'HotDrinks', name: 'Tea & Coffee', icon: <Coffee className="w-4 h-4" /> },
  ];

  // Available Menu Catalog
  const menuCatalog: MenuItem[] = [
    { id: 'm-1', name: 'Crispy Buffalo Wings', category: 'Starters', price: 650, dietary: 'Non-Veg', preparationTime: 12, isAvailable: true },
    { id: 'm-2', name: 'Garlic Parmesan Fries', category: 'Starters', price: 380, dietary: 'Veg', preparationTime: 8, isAvailable: true },
    { id: 'm-3', name: 'Loaded Beef Nachos', category: 'Starters', price: 720, dietary: 'Non-Veg', preparationTime: 10, isAvailable: true },
    { id: 'm-4', name: 'Grilled Chicken Steak (Mushroom Sauce)', category: 'MainCourse', price: 1450, dietary: 'Non-Veg', preparationTime: 20, isAvailable: true },
    { id: 'm-5', name: 'Royal Mutton Karahi (Full)', category: 'MainCourse', price: 2800, dietary: 'Non-Veg', preparationTime: 25, isAvailable: true },
    { id: 'm-6', name: 'Paneer Makhani Handi', category: 'MainCourse', price: 950, dietary: 'Veg', preparationTime: 18, isAvailable: true },
    { id: 'm-7', name: 'Double Smash Beef Burger', category: 'FastFood', price: 890, dietary: 'Non-Veg', preparationTime: 15, isAvailable: true },
    { id: 'm-8', name: 'Thin Crust Pepperoni Pizza', category: 'FastFood', price: 1350, dietary: 'Non-Veg', preparationTime: 16, isAvailable: true },
    { id: 'm-9', name: 'Classic Margherita Pizza', category: 'FastFood', price: 1100, dietary: 'Veg', preparationTime: 14, isAvailable: true },
    { id: 'm-10', name: 'Mint Lemonade Chiller', category: 'Beverages', price: 290, dietary: 'Beverage', preparationTime: 5, isAvailable: true },
    { id: 'm-11', name: 'Blue Lagoon Mocktail', category: 'Beverages', price: 380, dietary: 'Beverage', preparationTime: 5, isAvailable: true },
    { id: 'm-12', name: 'Sizzling Hot Brownie with Gelato', category: 'Desserts', price: 550, dietary: 'Veg', preparationTime: 8, isAvailable: true },
    { id: 'm-13', name: 'Spanish Latte (Iced)', category: 'HotDrinks', price: 460, dietary: 'Beverage', preparationTime: 6, isAvailable: true },
    { id: 'm-14', name: 'Karak Doodh Patti Chai', category: 'HotDrinks', price: 180, dietary: 'Beverage', preparationTime: 6, isAvailable: true },
  ];

  const tableOptions = [
    { value: 'T-01', label: 'Table T-01 (Ground Floor - 4 Seats)' },
    { value: 'T-02', label: 'Table T-02 (Ground Floor - 2 Seats)' },
    { value: 'T-03', label: 'Table T-03 (Family Hall - 6 Seats)' },
    { value: 'T-04', label: 'Table T-04 (Outdoor Terrace - 4 Seats)' },
    { value: 'VIP-01', label: 'VIP Lounge VIP-01 (Private - 8 Seats)' },
  ];

  // Filtering
  const filteredItems = useMemo(() => {
    return menuCatalog.filter(item => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const taxRate = 0.16; // 16% GST / Sales Tax
  const taxAmount = Math.round(subtotal * taxRate);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      toast.error('Order cart is empty! Select items to proceed.');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCheckoutOpen(false);
      clearCart();
      toast.success(`Order #RMS-${Math.floor(1000 + Math.random() * 9000)} created & KOT sent to Kitchen!`);
    }, 1000);
  };

  return (
    <>
      <PageMeta title="POS Terminal & Quick Order" description="Restaurant Point of Sale Station" />

      <div className="w-full space-y-6 animate-in fade-in duration-300 max-w-[1700px] mx-auto pb-12">
        <Breadcrumb items={[{ label: 'Operations' }, { label: 'Point of Sale (POS) Terminal' }]} />

        {/* TOP STAT CARDS */}
        <StatCards
          stats={[
            { title: 'Today POS Sales', value: 'PKR 142,850', icon: <Receipt className="w-5 h-5" />, theme: 'brand' },
            { title: 'Active Tables', value: '18 / 24 Occupied', icon: <UtensilsCrossed className="w-5 h-5" />, theme: 'success' },
            { title: 'Pending KOT Orders', value: '7 In Kitchen', icon: <Clock className="w-5 h-5" />, theme: 'warning' },
            { title: 'Avg Ticket Value', value: 'PKR 2,460', icon: <Sparkles className="w-5 h-5" />, theme: 'indigo' },
          ]}
        />

        {/* MAIN SPLIT POS LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: MENU EXPLORER & CATEGORIES (8 COLS) */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* SEARCH & ORDER TYPE TOOLBAR */}
            <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dishes, burgers, drinks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white"
                />
              </div>

              {/* ORDER TYPE SELECTOR */}
              <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full sm:w-auto">
                {(['DineIn', 'Takeaway', 'Delivery'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      orderType === type
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {type === 'DineIn' ? '🍽️ Dine-in' : type === 'Takeaway' ? '🥡 Takeaway' : '🛵 Delivery'}
                  </button>
                ))}
              </div>
            </div>

            {/* CATEGORY CHIPS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 scale-[1.02]'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  {cat.icon}
                  {cat.name}
                </button>
              ))}
            </div>

            {/* MENU ITEMS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg ${
                        item.dietary === 'Veg'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : item.dietary === 'Non-Veg'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          : 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800'
                      }`}>
                        {item.dietary}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        {item.preparationTime}m
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      Category: {item.category}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-base font-extrabold text-gray-900 dark:text-white">
                      PKR {item.price.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: LIVE ORDER CART & BILLING PANEL (4 COLS) */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xl space-y-6 sticky top-24">
            
            {/* CART HEADER */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Current Order</h3>
                  <p className="text-xs text-gray-400 font-medium">{cart.length} item{cart.length !== 1 ? 's' : ''} in cart</p>
                </div>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* TABLE & GUEST SELECTION */}
            <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              {orderType === 'DineIn' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                    Select Dining Table
                  </label>
                  <SearchableSelect
                    options={tableOptions}
                    value={selectedTable}
                    onChange={(val) => setSelectedTable(val)}
                    placeholder="Select Table..."
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                  Customer / Guest Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Guest name..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* CART ITEMS LIST */}
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <UtensilsCrossed className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700 mb-2" />
                  <p className="text-sm font-semibold">Your cart is empty</p>
                  <p className="text-xs mt-1">Click dishes from the menu to start order.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">PKR {item.price} each</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-extrabold text-gray-900 dark:text-white w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <p className="text-xs font-extrabold text-gray-900 dark:text-white">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* BILL SUMMARY */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Subtotal:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>GST / Tax (16%):</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">PKR {taxAmount.toLocaleString()}</span>
              </div>
              
              {/* DISCOUNT SELECTOR */}
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-brand-500" />
                  Discount:
                </span>
                <div className="flex items-center gap-1">
                  {[0, 5, 10, 15].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercent(pct)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        discountPercent === pct
                          ? 'bg-brand-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Discount ({discountPercent}%):</span>
                  <span>- PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-800 text-sm font-extrabold text-gray-900 dark:text-white">
                <span>Grand Total:</span>
                <span className="text-xl text-brand-600 dark:text-brand-400">
                  PKR {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={cart.length === 0}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Place Order & Send KOT (PKR {grandTotal.toLocaleString()})
              </button>
            </div>
          </div>
        </div>

        {/* CHECKOUT MODAL */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800 space-y-6">
              
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-brand-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Settle & Bill Order</h3>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order Type:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{orderType}</span>
                  </div>
                  {orderType === 'DineIn' && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Assigned Table:</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{selectedTable}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Guest:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{customerName}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700 text-sm font-extrabold">
                    <span>Payable Amount:</span>
                    <span className="text-brand-600 dark:text-brand-400 text-base">
                      PKR {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* PAYMENT METHOD SELECTOR */}
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Cash', label: 'Cash', icon: <Banknote className="w-4 h-4" /> },
                      { id: 'Card', label: 'Credit Card', icon: <CreditCard className="w-4 h-4" /> },
                      { id: 'Online', label: 'Online / QR', icon: <Sparkles className="w-4 h-4" /> },
                    ].map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === pm.id
                            ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400'
                            : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pm.icon}
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? 'Processing...' : (
                    <>
                      <Printer className="w-4 h-4" />
                      Complete & Print
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}
