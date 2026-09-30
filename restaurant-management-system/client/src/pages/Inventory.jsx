import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StockAdjustModal from '../components/StockAdjustModal';
import { api } from '../services/api';
import {
  Boxes,
  AlertTriangle,
  ArrowUpDown,
  Search,
  PackageX,
  ClipboardList,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function Inventory() {
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'low' | 'out'
  const [showLogs, setShowLogs] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, settsRes] = await Promise.all([
        api.getInventory(),
        api.getSettings(),
      ]);
      if (invRes) setData(invRes);
      if (settsRes.settings) setSettings(settsRes.settings);
    } catch (err) {
      console.error('[Inventory Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.getInventoryLogs({ limit: 50 });
      if (res.logs) setLogs(res.logs);
    } catch (err) {
      console.error('[Logs Fetch Error]', err);
    }
  };

  const handleToggleLogs = async () => {
    if (!showLogs && logs.length === 0) {
      await fetchLogs();
    }
    setShowLogs(!showLogs);
  };

  const handleAdjustConfirm = async (adjustmentData) => {
    await api.adjustStock(adjustmentData);
    fetchData();
    if (showLogs) fetchLogs();
  };

  let displayItems = data?.items || [];

  if (filterMode === 'low') {
    displayItems = displayItems.filter((i) => i.stock_qty <= i.low_stock_threshold && i.stock_qty > 0);
  } else if (filterMode === 'out') {
    displayItems = displayItems.filter((i) => i.stock_qty <= 0);
  }

  if (searchQuery) {
    displayItems = displayItems.filter((i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const currency = settings?.currency_symbol || '$';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8F8F8] overflow-y-auto">
      <Navbar title="Inventory & Stock Control" />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#121212]">Stock Levels & Inventory Control</h2>
            <p className="text-xs text-neutral-500">Monitor quantities, restock, log waste, and get low-stock alerts</p>
          </div>
          <button
            type="button"
            onClick={handleToggleLogs}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs border border-neutral-200 transition"
          >
            <ClipboardList className="w-4 h-4 text-[#FF6B00]" />
            <span>{showLogs ? 'Hide' : 'Show'} Audit Logs</span>
            {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-5">
          {[
            {
              label: 'Total Items Tracked',
              value: data?.totalItems || 0,
              icon: Boxes,
              color: 'bg-neutral-100 text-neutral-700',
            },
            {
              label: 'Low Stock Alerts',
              value: data?.lowStockCount || 0,
              icon: AlertTriangle,
              color: data?.lowStockCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
            },
            {
              label: 'Out of Stock',
              value: data?.outOfStockCount || 0,
              icon: PackageX,
              color: data?.outOfStockCount > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700',
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">{s.label}</p>
                <p className="text-3xl font-black text-[#121212] mt-1">{s.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Audit Log Panel */}
        {showLogs && (
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-neutral-100">
              <h3 className="font-bold text-base text-[#121212]">Inventory Audit Log</h3>
              <p className="text-xs text-neutral-500">Every stock change, sale deduction, and restock recorded</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8F8F8] border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-5">Item</th>
                    <th className="py-3.5 px-5">Change</th>
                    <th className="py-3.5 px-5">Stock After</th>
                    <th className="py-3.5 px-5">Reason</th>
                    <th className="py-3.5 px-5">Staff</th>
                    <th className="py-3.5 px-5">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-neutral-400">No audit logs found.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id} className="hover:bg-neutral-50/70 transition">
                        <td className="py-3.5 px-5 font-bold text-[#121212]">
                          {log.menu_item_id?.name || 'Unknown Item'}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`font-bold text-sm ${log.change_qty > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {log.change_qty > 0 ? '+' : ''}{log.change_qty}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-[#121212]">{log.stock_after}</td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            log.reason === 'Order Sale' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            log.reason === 'Restock' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            log.reason === 'Waste / Damaged' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            log.reason === 'Order Cancelled Refund' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-neutral-100 text-neutral-700 border-neutral-200'
                          }`}>
                            {log.reason}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-neutral-600">
                          {log.user_id?.fullName || log.user_id?.username || 'System'}
                        </td>
                        <td className="py-3.5 px-5 text-neutral-400">
                          {new Date(log.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items by name..."
                className="w-full pl-10 pr-4 py-2 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
            <div className="flex items-center gap-2">
              {[
                { key: 'all', label: 'All Items' },
                { key: 'low', label: '⚠ Low Stock' },
                { key: 'out', label: '✕ Out of Stock' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilterMode(f.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    filterMode === f.key
                      ? 'bg-[#121212] text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F8F8] border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Menu Item</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Price</th>
                  <th className="py-3.5 px-6">Current Stock</th>
                  <th className="py-3.5 px-6">Low Stock At</th>
                  <th className="py-3.5 px-6 text-center">Stock Health</th>
                  <th className="py-3.5 px-6 text-center">Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {loading ? (
                  <tr><td colSpan="7" className="py-12 text-center text-neutral-400">Loading inventory...</td></tr>
                ) : displayItems.length === 0 ? (
                  <tr><td colSpan="7" className="py-12 text-center text-neutral-400">No items match the current filter.</td></tr>
                ) : (
                  displayItems.map((item) => {
                    const isOut = item.stock_qty <= 0;
                    const isLow = !isOut && item.stock_qty <= item.low_stock_threshold;
                    const stockPct = Math.min(100, (item.stock_qty / (item.low_stock_threshold * 4)) * 100);

                    return (
                      <tr key={item._id} className="hover:bg-neutral-50/80 transition">
                        <td className="py-4 px-6">
                          <span className="font-bold text-sm text-[#121212]">{item.name}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                            {item.category_id?.name || 'General'}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-[#121212]">
                          {currency}{item.price?.toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-xl font-black ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'}`}>
                            {item.stock_qty}
                          </span>
                          <span className="text-xs text-neutral-400 ml-1">units</span>
                        </td>
                        <td className="py-4 px-6 text-neutral-500 font-medium">{item.low_stock_threshold} units</td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.max(0, stockPct)}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isOut ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              isLow ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {isOut ? 'Out of Stock' : isLow ? 'Low — Restock' : 'Healthy'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => { setSelectedItem(item); setIsAdjustModalOpen(true); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-[#FF6B00] hover:text-[#FF6B00] text-neutral-600 text-[11px] font-bold transition"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            <span>Adjust</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <StockAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        item={selectedItem}
        onConfirm={handleAdjustConfirm}
      />
    </div>
  );
}
