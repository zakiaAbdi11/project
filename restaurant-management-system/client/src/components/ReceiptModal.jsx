import React from 'react';
import { Printer, X, CheckCircle, Utensils } from 'lucide-react';

export default function ReceiptModal({ order, settings, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const currency = settings?.currency_symbol || '$';
  const restaurantName = settings?.restaurant_name || 'Rustic Flame Bistro';
  const address = settings?.address || '124 Downtown Boulevard';
  const phone = settings?.phone || '+1 (555) 234-5678';
  const footerText = settings?.receipt_footer || 'Thank you for your visit!';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-[#F8F8F8]">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
            <CheckCircle className="w-5 h-5" />
            <span>Order Paid & Completed</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Receipt Content (Scrollable in UI, targeted by @media print) */}
        <div className="p-6 overflow-y-auto flex justify-center bg-neutral-100">
          <div
            id="thermal-receipt-print-area"
            className="w-full bg-white p-6 shadow-sm border border-neutral-300 font-mono text-xs text-[#121212] leading-relaxed"
          >
            {/* Header */}
            <div className="text-center pb-4 border-b border-dashed border-neutral-400">
              <h2 className="font-extrabold text-base uppercase tracking-wider">{restaurantName}</h2>
              <p className="text-[11px] text-neutral-600">{address}</p>
              <p className="text-[11px] text-neutral-600">Tel: {phone}</p>
            </div>

            {/* Order Meta */}
            <div className="py-3 border-b border-dashed border-neutral-400 space-y-1 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>Order No:</span>
                <span>{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(order.createdAt || Date.now()).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-bold">{order.order_type} {order.table_id ? `(Table ${order.table_id.table_number || order.table_id})` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{order.user_id?.fullName || order.user_id?.username || 'Staff'}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="py-3 border-b border-dashed border-neutral-400">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-neutral-300 pb-1 font-bold">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dotted divide-neutral-200">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="py-1">
                      <td className="py-1.5 pr-1 font-medium">{item.name}</td>
                      <td className="py-1.5 text-center">{item.quantity}</td>
                      <td className="py-1.5 text-right">{currency}{item.price?.toFixed(2)}</td>
                      <td className="py-1.5 text-right font-semibold">{currency}{item.subtotal?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Calculation */}
            <div className="py-3 border-b border-dashed border-neutral-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{currency}{order.subtotal?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-{currency}{order.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax ({order.tax_percentage || settings?.tax_percentage || 0}%):</span>
                <span>{currency}{order.tax_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-neutral-300">
                <span>TOTAL:</span>
                <span>{currency}{order.total?.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-3 border-b border-dashed border-neutral-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-semibold">{order.payment_method || 'Cash'}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Tendered:</span>
                <span className="font-semibold">{currency}{order.amount_paid?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-xs pt-1">
                <span>CHANGE GIVEN:</span>
                <span className="text-[#FF6B00]">{currency}{order.change_given?.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 text-[10px] text-neutral-500 space-y-1">
              <p className="font-semibold">{footerText}</p>
              <p>*** 100% Offline POS System ***</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-5 border-t border-neutral-200 bg-white flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-medium text-sm transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-semibold text-sm shadow-md shadow-[#FF6B00]/20 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print 80mm Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
