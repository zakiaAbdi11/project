import React, { useState, useEffect } from 'react';
import { X, DollarSign, ArrowRight, Coins, AlertCircle } from 'lucide-react';

export default function PaymentModal({
  isOpen,
  onClose,
  total,
  onConfirmPayment,
  isProcessing,
  currency = '$',
}) {
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');

  // Default to exact amount on open
  useEffect(() => {
    if (isOpen) {
      setAmountPaid(total.toFixed(2));
      setNotes('');
    }
  }, [isOpen, total]);

  if (!isOpen) return null;

  const paidNum = parseFloat(amountPaid) || 0;
  const change = Math.max(0, paidNum - total);
  const isSufficient = paidNum >= total;

  const quickAmounts = [
    { label: 'Exact', value: total },
    { label: '$10', value: 10 },
    { label: '$20', value: 20 },
    { label: '$50', value: 50 },
    { label: '$100', value: 100 },
  ];

  const handleQuickAdd = (val) => {
    setAmountPaid(val.toFixed(2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isSufficient) return;
    onConfirmPayment({
      amount_paid: paidNum,
      payment_method: 'Cash',
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-[#F8F8F8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#121212]">Process Cash Payment</h3>
              <p className="text-xs text-neutral-500">Fast offline cash checkout & change calculator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Total Due Banner */}
          <div className="bg-[#121212] text-white p-5 rounded-2xl flex items-center justify-between shadow-inner">
            <div>
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Amount Due</span>
              <div className="text-3xl font-extrabold text-[#FF6B00]">
                {currency}{total.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-400">Method</span>
              <div className="text-sm font-semibold flex items-center justify-end gap-1.5 mt-0.5 text-white">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Cash Payment</span>
              </div>
            </div>
          </div>

          {/* Quick Cash Buttons */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Quick Cash Select</label>
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map((qa, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickAdd(qa.value)}
                  className={`py-2.5 rounded-xl font-bold text-sm border transition ${
                    paidNum === qa.value
                      ? 'bg-[#121212] text-white border-[#121212]'
                      : 'bg-[#F8F8F8] text-neutral-800 border-neutral-200 hover:border-[#FF6B00] hover:text-[#FF6B00]'
                  }`}
                >
                  {qa.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Tendered Input */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5">
              Cash Tendered ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-neutral-400">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full pl-9 pr-4 py-3.5 bg-[#F8F8F8] border border-neutral-300 rounded-2xl text-2xl font-extrabold text-[#121212] focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
                placeholder="0.00"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Live Change Box */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              !isSufficient
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isSufficient ? (
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                ) : (
                  <Coins className="w-5 h-5 text-emerald-600" />
                )}
                <span className="text-sm font-semibold">
                  {!isSufficient ? 'Underpaid Amount:' : 'Change to Return:'}
                </span>
              </div>
              <span className="text-2xl font-black">
                {currency}{Math.abs(paidNum - total).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Optional Order Note */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
              Order Note (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extra napkins, no onions"
              className="w-full px-4 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm text-[#121212] focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-sm hover:bg-neutral-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isSufficient || isProcessing}
              className={`flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition ${
                !isSufficient || isProcessing
                  ? 'bg-neutral-300 cursor-not-allowed shadow-none'
                  : 'bg-[#FF6B00] hover:bg-[#E05E00] shadow-[#FF6B00]/30 hover:shadow-[#FF6B00]/40'
              }`}
            >
              <span>{isProcessing ? 'Processing Order...' : 'Confirm & Print Receipt'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
