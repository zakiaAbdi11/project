import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import POSCart from '../components/POSCart';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';
import TableSelectorModal from '../components/TableSelectorModal';
import { api } from '../services/api';
import { Search, Flame, Utensils, AlertTriangle, Plus, Check } from 'lucide-react';

export default function CashierPOS() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [settings, setSettings] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('Dine-In');
  const [selectedTable, setSelectedTable] = useState(null);
  const [discount, setDiscount] = useState(0);

  // Modals
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch initial data
  useEffect(() => {
    loadPOSData();
  }, []);

  const loadPOSData = async () => {
    try {
      const [catsRes, itemsRes, tablesRes, settsRes] = await Promise.all([
        api.getCategories(),
        api.getMenuItems({ availableOnly: 'true' }),
        api.getTables(),
        api.getSettings(),
      ]);

      if (catsRes.categories) setCategories(catsRes.categories);
      if (itemsRes.items) setMenuItems(itemsRes.items);
      if (tablesRes.tables) setTables(tablesRes.tables);
      if (settsRes.settings) setSettings(settsRes.settings);
    } catch (err) {
      console.error('[POS Load Error]', err);
      setErrorMsg('Failed to load menu or table data from local server.');
    }
  };

  // Add Item to Cart
  const handleAddToCart = (item) => {
    if (item.stock_qty <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((i) => i._id === item._id);
      if (existing) {
        if (existing.quantity >= item.stock_qty) {
          alert(`Maximum available stock reached for ${item.name} (${item.stock_qty} available)`);
          return prevCart;
        }
        return prevCart.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  // Update Cart Quantity
  const handleUpdateQty = (itemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item._id === itemId) {
          return { ...item, quantity: Math.min(item.stock_qty, newQty) };
        }
        return item;
      })
    );
  };

  // Remove from Cart
  const handleRemoveItem = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== itemId));
  };

  // Clear Cart
  const handleClearCart = () => {
    if (cart.length > 0 && window.confirm('Clear all items from the current cart?')) {
      setCart([]);
      setDiscount(0);
      setSelectedTable(null);
    }
  };

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = settings?.tax_percentage || 8.5;
  const discountVal = Math.min(subtotal, Math.max(0, Number(discount) || 0));
  const taxableSubtotal = Math.max(0, subtotal - discountVal);
  const taxAmount = Number(((taxableSubtotal * taxRate) / 100).toFixed(2));
  const grandTotal = Number((taxableSubtotal + taxAmount).toFixed(2));

  // Open Checkout
  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    if (orderType === 'Dine-In' && !selectedTable) {
      setIsTableModalOpen(true);
      return;
    }
    setIsPaymentModalOpen(true);
  };

  // Confirm Payment & Submit Order
  const handleConfirmPayment = async ({ amount_paid, payment_method, notes }) => {
    try {
      setIsProcessingOrder(true);
      setErrorMsg('');

      const payload = {
        table_id: orderType === 'Dine-In' ? selectedTable?._id : null,
        order_type: orderType,
        items: cart.map((i) => ({
          menu_item_id: i._id,
          quantity: i.quantity,
        })),
        discount: discountVal,
        amount_paid,
        payment_method,
        notes,
      };

      const res = await api.createOrder(payload);

      if (res.success && res.order) {
        setCompletedOrder(res.order);
        setIsPaymentModalOpen(false);
        setIsReceiptModalOpen(true);

        // Reset cart
        setCart([]);
        setDiscount(0);
        setSelectedTable(null);

        // Refresh tables & items (stock changes)
        loadPOSData();
      }
    } catch (err) {
      alert(`Order Processing Error: ${err.message}`);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // Filter menu items by category and search
  const filteredItems = menuItems.filter((item) => {
    const matchesCat =
      selectedCategory === 'ALL' ||
      item.category_id?._id === selectedCategory ||
      item.category_id === selectedCategory;

    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F8F8]">
      <Navbar title="Point of Sale Terminal" />

      {/* Main POS Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center Section: Category Pills, Search, Food Grid */}
        <div className="flex-1 flex flex-col overflow-hidden p-6 gap-5">
          {/* Search Bar & Stats */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, pizzas, burgers, drinks..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-300 rounded-2xl text-sm font-medium text-[#121212] focus:outline-none focus:border-[#FF6B00] shadow-xs transition"
              />
            </div>

            {orderType === 'Dine-In' && selectedTable && (
              <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 border border-[#FF6B00]/30 rounded-2xl text-xs font-bold text-[#FF6B00]">
                <span>Selected: Table {selectedTable.table_number}</span>
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(true)}
                  className="underline hover:text-[#E05E00]"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                selectedCategory === 'ALL'
                  ? 'bg-[#121212] text-white shadow-sm'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400'
              }`}
            >
              All Items ({menuItems.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
                  selectedCategory === cat._id
                    ? 'bg-[#FF6B00] text-white shadow-sm shadow-[#FF6B00]/25'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Food Items Card Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                <Utensils className="w-10 h-10 mb-2 text-neutral-300" />
                <p className="font-bold text-base text-[#121212]">No dishes match your filter</p>
                <p className="text-xs text-neutral-500 mt-1">Try another category or clear search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => {
                  const inCart = cart.find((c) => c._id === item._id);
                  const isOutOfStock = item.stock_qty <= 0;
                  const isLowStock = item.stock_qty <= item.low_stock_threshold && !isOutOfStock;

                  return (
                    <div
                      key={item._id}
                      onClick={() => !isOutOfStock && handleAddToCart(item)}
                      className={`group relative bg-white rounded-2xl border border-neutral-200 p-3.5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md ${
                        isOutOfStock
                          ? 'opacity-60 cursor-not-allowed bg-neutral-100/50'
                          : 'cursor-pointer hover:border-[#FF6B00] hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Image / Header Container */}
                      <div className="relative w-full h-32 rounded-xl bg-neutral-100 overflow-hidden mb-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-300">
                            <Utensils className="w-10 h-10" />
                          </div>
                        )}

                        {/* Category Tag */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white tracking-wide uppercase">
                          {item.category_id?.name || 'Dish'}
                        </div>

                        {/* In Cart Indicator */}
                        {inCart && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FF6B00] text-white flex items-center justify-center font-bold text-xs shadow-md">
                            {inCart.quantity}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <h4 className="font-bold text-sm text-[#121212] leading-tight group-hover:text-[#FF6B00] transition line-clamp-1">
                          {item.name}
                        </h4>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                          <span className="text-base font-black text-[#121212]">
                            {settings?.currency_symbol || '$'}{item.price.toFixed(2)}
                          </span>

                          {/* Stock Status Badge */}
                          {isOutOfStock ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              Sold Out
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              Low ({item.stock_qty})
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {item.stock_qty} left
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: POS Cart Panel */}
        <POSCart
          cart={cart}
          orderType={orderType}
          setOrderType={setOrderType}
          selectedTable={selectedTable}
          onOpenTableModal={() => setIsTableModalOpen(true)}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          discount={discount}
          setDiscount={setDiscount}
          taxRate={taxRate}
          currency={settings?.currency_symbol || '$'}
          onCheckout={handleStartCheckout}
        />
      </div>

      {/* Modals */}
      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        tables={tables}
        selectedTable={selectedTable}
        onSelectTable={(table) => setSelectedTable(table)}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={grandTotal}
        onConfirmPayment={handleConfirmPayment}
        isProcessing={isProcessingOrder}
        currency={settings?.currency_symbol || '$'}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        order={completedOrder}
        settings={settings}
      />
    </div>
  );
}
