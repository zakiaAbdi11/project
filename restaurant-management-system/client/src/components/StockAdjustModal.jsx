import React, { useState } from 'react';
import { X, AlertTriangle, ArrowUpDown } from 'lucide-react';

export default function StockAdjustModal({ isOpen, onClose, item, onConfirm }) {
  const [changeQty, setChangeQty] = useState('');
  const [reason, setReason] = useState('Restock');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const current = item.stock_qty || 0;
  const delta = parseInt(changeQty) || 0;
  const resultingStock = current + delta;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (delta === 0) {
      setError('Adjustment amount cannot be zero.');
      return;
    }
    if (resultingStock < 0) {
      setError(`Cannot reduce below 0. Resulting stock would be ${resultingStock}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm({
        menu_item_id: item._id,
        change_qty: delta,
        reason,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-[#F8F8F8]">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="font-bold text-lg text-[#121212]">Adjust Stock: {item.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Current Stock Banner */}
          <div className="p-4 bg-neutral-100 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">Current In-Stock:</span>
            <span className="text-xl font-extrabold text-[#121212]">{current} units</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
              Quantity to Add or Deduct
            </label>
            <p className="text-[11px] text-neutral-400 mb-1">
              Use positive numbers (e.g. 20) to add, or negative (e.g. -5) to deduct.
            </p>
            <input
              type="number"
              required
              value={changeQty}
              onChange={(e) => setChangeQty(e.target.value)}
              placeholder="e.g. 25 or -5"
              className="w-full px-4 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-lg font-bold focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
              Audit Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="Restock">Supplier Restock / New Delivery</option>
              <option value="Waste / Damaged">Kitchen Waste / Damaged Ingredients</option>
              <option value="Manual Adjustment">Physical Inventory Recount Adjustment</option>
            </select>
          </div>

          {/* Projected Result */}
          <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs">
            <span className="text-neutral-600 font-medium">Projected New Stock:</span>
            <span className={`font-black text-sm ${resultingStock < 0 ? 'text-rose-600' : 'text-[#FF6B00]'}`}>
              {resultingStock} units
            </span>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || delta === 0 || resultingStock < 0}
              className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-sm font-bold shadow-md shadow-[#FF6B00]/20 disabled:opacity-40 transition"
            >
              {isSubmitting ? 'Updating...' : 'Save Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
