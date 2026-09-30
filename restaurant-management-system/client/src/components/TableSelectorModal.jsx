import React from 'react';
import { X, Users, Check, AlertCircle } from 'lucide-react';

export default function TableSelectorModal({
  isOpen,
  onClose,
  tables,
  selectedTable,
  onSelectTable,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-[#F8F8F8]">
          <div>
            <h3 className="text-lg font-bold text-[#121212]">Select Dining Table</h3>
            <p className="text-xs text-neutral-500">Assign order to an available dining table</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Legend */}
        <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-6 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-neutral-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="text-neutral-700">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-neutral-700">Reserved</span>
          </div>
        </div>

        {/* Table Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tables.map((tbl) => {
            const isSelected = selectedTable?._id === tbl._id;
            const isAvailable = tbl.status === 'Available';

            let statusBg = 'bg-emerald-50 border-emerald-200 text-emerald-800';
            if (tbl.status === 'Occupied') statusBg = 'bg-rose-50 border-rose-200 text-rose-800';
            if (tbl.status === 'Reserved') statusBg = 'bg-amber-50 border-amber-200 text-amber-800';

            return (
              <button
                key={tbl._id}
                type="button"
                onClick={() => {
                  if (isAvailable || isSelected) {
                    onSelectTable(tbl);
                    onClose();
                  }
                }}
                disabled={!isAvailable && !isSelected}
                className={`relative p-5 rounded-2xl border-2 text-left transition flex flex-col justify-between h-32 ${
                  isSelected
                    ? 'border-[#FF6B00] bg-orange-50/50 shadow-md ring-2 ring-[#FF6B00]/30'
                    : isAvailable
                    ? 'border-neutral-200 bg-white hover:border-[#FF6B00] hover:shadow-sm cursor-pointer'
                    : 'border-neutral-200 bg-neutral-100/70 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-lg text-[#121212]">{tbl.table_number}</span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-3" />
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>Up to {tbl.capacity} Guests</span>
                  </div>

                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBg}`}
                  >
                    {tbl.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-[#F8F8F8] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-sm hover:bg-neutral-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
