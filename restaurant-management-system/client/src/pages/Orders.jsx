import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ReceiptModal from '../components/ReceiptModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Receipt,
  Search,
  Filter,
  Printer,
  Ban,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Orders() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [typeFilter, statusFilter, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [ordersRes, settsRes] = await Promise.all([
        api.getOrders({
          order_type: typeFilter,
          status: statusFilter,
          page,
          limit: 15,
        }),
        api.getSettings(),
      ]);

      if (ordersRes.orders) {
        setOrders(ordersRes.orders);
        setTotalPages(ordersRes.totalPages || 1);
      }
      if (settsRes.settings) setSettings(settsRes.settings);
    } catch (err) {
      console.error('[Orders Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!isAdmin) return;
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel order ${order.order_number}? This will restore food inventory stock and release the dining table.`
    );
    if (!confirmCancel) return;

    try {
      const res = await api.cancelOrder(order._id);
      if (res.success) {
        alert(`Order ${order.order_number} has been cancelled and stock refunded.`);
        fetchOrders();
      }
    } catch (err) {
      alert(`Cancellation failed: ${err.message}`);
    }
  };

  const currency = settings?.currency_symbol || '$';

  const filteredOrders = orders.filter((ord) => {
    if (!searchQuery) return true;
    const matchNo = ord.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCashier = ord.user_id?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchNo || matchCashier;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8F8F8] overflow-y-auto">
      <Navbar title="Orders & Receipt Ledger" />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Filter & Search Bar */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number or cashier name..."
              className="w-full pl-12 pr-4 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-2xl text-sm focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="">All Order Types</option>
              <option value="Dine-In">Dine-In</option>
              <option value="Takeaway">Takeaway</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#121212]">Transaction History</h3>
              <p className="text-xs text-neutral-500">Every printed receipt and processed transaction</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-neutral-100 rounded-full text-neutral-700">
              {filteredOrders.length} Orders Listed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F8F8] border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Order #</th>
                  <th className="py-3.5 px-6">Date & Time</th>
                  <th className="py-3.5 px-6">Cashier</th>
                  <th className="py-3.5 px-6">Type / Table</th>
                  <th className="py-3.5 px-6">Items Ordered</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-neutral-400">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-4 px-6 font-mono font-bold text-[#121212]">
                        {ord.order_number}
                      </td>
                      <td className="py-4 px-6 text-neutral-500">
                        {new Date(ord.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 px-6 font-medium text-[#121212]">
                        {ord.user_id?.fullName || ord.user_id?.username || 'Staff'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                          {ord.order_type} {ord.table_id ? `(Table ${ord.table_id.table_number || ord.table_id})` : ''}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-neutral-600">
                        <span title={ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}>
                          {ord.items.length} dishes ({ord.items.reduce((s, i) => s + i.quantity, 0)} items)
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-sm text-[#121212]">
                        {currency}{ord.total?.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {ord.status === 'Completed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            <span>Paid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptOrder(ord)}
                            className="p-1.5 rounded-lg border border-neutral-200 hover:border-[#FF6B00] hover:text-[#FF6B00] text-neutral-600 transition"
                            title="View / Print Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {isAdmin && ord.status === 'Completed' && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(ord)}
                              className="p-1.5 rounded-lg border border-neutral-200 hover:border-rose-500 hover:text-rose-600 text-neutral-400 transition"
                              title="Cancel Order & Refund Stock"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded-lg border border-neutral-300 disabled:opacity-30 hover:bg-neutral-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded-lg border border-neutral-300 disabled:opacity-30 hover:bg-neutral-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
        order={selectedReceiptOrder}
        settings={settings}
      />
    </div>
  );
}
