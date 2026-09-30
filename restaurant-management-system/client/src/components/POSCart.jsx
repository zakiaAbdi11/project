import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  Utensils,
  ShoppingBag as BagIcon,
  ChevronRight,
  Receipt
} from 'lucide-react';

export default function POSCart({
  cart,
  orderType,
  setOrderType,
  selectedTable,
  onOpenTableModal,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  discount,
  setDiscount,
  taxRate = 8.5,
  currency = '$',
  onCheckout,
}) {
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountVal = Math.min(subtotal, Math.max(0, Number(discount) || 0));
  const taxableSubtotal = Math.max(0, subtotal - discountVal);
  const taxAmount = Number(((taxableSubtotal * taxRate) / 100).toFixed(2));
  const total = Number((taxableSubtotal + taxAmount).toFixed(2));

  return (
    <div className="w-96 bg-white border-l border-neutral-200 flex flex-col h-full shrink-0">
      {/* Header & Order Type Switcher */}
      <div className="p-5 border-b border-neutral-200 space-y-3 bg-[#F8F8F8]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="font-bold text-base text-[#121212]">Current Order</h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-200 text-neutral-800">
            {cart.reduce((sum, i) => sum + i.quantity, 0)} Items
          </span>
        </div>

        {/* Order Type Toggle: Dine-In vs Takeaway */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-200 rounded-xl">
          <button
            type="button"
            onClick={() => setOrderType('Dine-In')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition ${
              orderType === 'Dine-In'
                ? 'bg-white text-[#121212] shadow-sm'
                : 'text-neutral-600 hover:text-[#121212]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Dine-In</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderType('Takeaway')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition ${
              orderType === 'Takeaway'
                ? 'bg-white text-[#121212] shadow-sm'
                : 'text-neutral-600 hover:text-[#121212]'
            }`}
          >
            <BagIcon className="w-3.5 h-3.5" />
            <span>Takeaway</span>
          </button>
        </div>

        {/* Dine-In Table Selector Button */}
        {orderType === 'Dine-In' && (
          <button
            type="button"
            onClick={onOpenTableModal}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-300 bg-white hover:border-[#FF6B00] transition group text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]"></span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Table
                </span>
                <span className="text-xs font-bold text-[#121212]">
                  {selectedTable ? `Table ${selectedTable.table_number}` : 'Select a Table...'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#FF6B00] group-hover:translate-x-0.5 transition" />
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
              <Receipt className="w-7 h-7 text-neutral-300" />
            </div>
            <p className="font-bold text-sm text-[#121212]">Cart is Empty</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-[180px]">
              Tap dishes from the menu to build an order.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item._id}
              className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col gap-2 hover:border-neutral-300 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-[#121212] leading-snug">{item.name}</h4>
                  <span className="text-xs text-neutral-500">
                    {currency}{item.price.toFixed(2)} each
                  </span>
                </div>
                <div className="font-bold text-xs text-[#121212]">
                  {currency}{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60">
                <button
                  type="button"
                  onClick={() => onRemoveItem(item._id)}
                  className="text-neutral-400 hover:text-rose-600 transition p-1"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2 bg-white rounded-lg border border-neutral-200 p-0.5">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item._id, item.quantity - 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-[#121212]">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item._id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock_qty}
                    className="w-6 h-6 rounded flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Checkout */}
      {cart.length > 0 && (
        <div className="p-5 border-t border-neutral-200 bg-white space-y-3">
          {/* Subtotal, Discount & Tax breakdown */}
          <div className="space-y-1.5 text-xs text-neutral-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-[#121212]">{currency}{subtotal.toFixed(2)}</span>
            </div>

            {/* Discount toggle/input */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDiscountInput(!showDiscountInput)}
                className="flex items-center gap-1 text-[#FF6B00] hover:underline font-semibold"
              >
                <Tag className="w-3 h-3" />
                <span>{discountVal > 0 ? `Discount: -${currency}${discountVal.toFixed(2)}` : '+ Add Discount'}</span>
              </button>
            </div>

            {showDiscountInput && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="Discount $"
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowDiscountInput(false)}
                  className="text-[11px] font-bold text-neutral-500 hover:text-neutral-800"
                >
                  Done
                </button>
              </div>
            )}

            <div className="flex justify-between">
              <span>Tax ({taxRate}%):</span>
              <span className="font-semibold text-[#121212]">{currency}{taxAmount.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-[#121212]">Total Due:</span>
              <span className="text-2xl font-black text-[#FF6B00]">{currency}{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={onClearCart}
              className="py-3 rounded-xl border border-neutral-300 text-neutral-600 hover:bg-neutral-100 hover:text-rose-600 font-semibold text-xs transition"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onCheckout}
              disabled={orderType === 'Dine-In' && !selectedTable}
              className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-[#FF6B00]/25 transition"
            >
              <span>{orderType === 'Dine-In' && !selectedTable ? 'Choose Table' : 'Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
