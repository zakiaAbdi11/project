import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DashboardCard from '../components/DashboardCard';
import ReceiptModal from '../components/ReceiptModal';
import { api } from '../services/api';
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Grid3X3,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, settsRes] = await Promise.all([
        api.getDashboardMetrics(),
        api.getSettings(),
      ]);
      if (dashRes.metrics) setData(dashRes);
      if (settsRes.settings) setSettings(settsRes.settings);
    } catch (err) {
      console.error('[Dashboard Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const currency = settings?.currency_symbol || '$';
  const metrics = data?.metrics;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8F8F8] overflow-y-auto">
      <Navbar title="Executive Overview" />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#FF6B00] font-bold text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4" />
              <span>Offline Control Center</span>
            </div>
            <h1 className="text-2xl font-black text-[#121212]">
              {settings?.restaurant_name || 'Rustic Flame Bistro'}
            </h1>
            <p className="text-xs text-neutral-500 max-w-md">
              Real-time local POS metrics, table turnover rates, inventory alerts, and sales performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/pos"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-sm shadow-md shadow-[#FF6B00]/25 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Open POS Terminal</span>
            </Link>
            <Link
              to="/reports"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-sm transition"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </Link>
          </div>
        </div>

        {/* 4 Primary KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <DashboardCard
            title="Today's Sales"
            value={`${currency}${metrics?.todaySales?.toFixed(2) || '0.00'}`}
            subtitle="Completed POS transactions"
            icon={DollarSign}
            color="orange"
            badge="Today"
          />

          <DashboardCard
            title="Today's Orders"
            value={metrics?.todayOrdersCount || 0}
            subtitle={`All-Time: ${metrics?.allTimeOrdersCount || 0} orders`}
            icon={ShoppingBag}
            color="green"
            badge="Volume"
          />

          <DashboardCard
            title="Table Status"
            value={`${metrics?.tables?.occupied || 0} / ${metrics?.tables?.total || 0}`}
            subtitle={`${metrics?.tables?.available || 0} Available for Dining`}
            icon={Grid3X3}
            color="black"
            badge="Dine-In"
          />

          <DashboardCard
            title="Low Stock Alert"
            value={metrics?.lowStockCount || 0}
            subtitle={metrics?.lowStockCount > 0 ? 'Requires restocking' : 'All items well stocked'}
            icon={AlertTriangle}
            color={metrics?.lowStockCount > 0 ? 'amber' : 'green'}
            badge={metrics?.lowStockCount > 0 ? 'Action Needed' : 'Healthy'}
          />
        </div>

        {/* 2-Column Split: Top Selling Dishes & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Selling Dishes (1 Col) */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div>
                  <h3 className="font-bold text-base text-[#121212]">Top Selling Dishes</h3>
                  <p className="text-xs text-neutral-500">Most ordered items by popularity</p>
                </div>
                <Link
                  to="/menu"
                  className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-4 space-y-4">
                {(!data?.topSellingItems || data.topSellingItems.length === 0) ? (
                  <p className="text-xs text-neutral-400 py-6 text-center">No completed sales recorded yet.</p>
                ) : (
                  data.topSellingItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 border border-neutral-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#121212] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-[#121212] line-clamp-1">{item.name}</h4>
                          <span className="text-[11px] text-neutral-500">
                            {item.totalQuantity} units sold
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#FF6B00]">
                          {currency}{item.totalRevenue?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100">
              <Link
                to="/inventory"
                className="w-full py-2.5 rounded-xl border border-neutral-200 hover:border-neutral-400 text-neutral-700 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Manage Inventory & Thresholds</span>
              </Link>
            </div>
          </div>

          {/* Recent Orders Table (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div>
                  <h3 className="font-bold text-base text-[#121212]">Recent POS Orders</h3>
                  <p className="text-xs text-neutral-500">Latest completed receipts and tickets</p>
                </div>
                <Link
                  to="/orders"
                  className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
                >
                  <span>Orders Ledger</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Cashier</th>
                      <th className="py-2.5 px-3">Items</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {(!data?.recentOrders || data.recentOrders.length === 0) ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-neutral-400">
                          No recent transactions recorded.
                        </td>
                      </tr>
                    ) : (
                      data.recentOrders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-neutral-50/70 transition">
                          <td className="py-3 px-3 font-mono font-bold text-[#121212]">
                            {ord.order_number}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                              {ord.order_type} {ord.table_id ? `(T-${ord.table_id.table_number || ord.table_id})` : ''}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-neutral-600 font-medium">
                            {ord.user_id?.fullName || ord.user_id?.username || 'Staff'}
                          </td>
                          <td className="py-3 px-3 text-neutral-500">
                            {ord.items?.length || 0} items
                          </td>
                          <td className="py-3 px-3 text-right font-black text-[#121212]">
                            {currency}{ord.total?.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptOrder(ord)}
                              className="px-2.5 py-1 rounded-lg border border-neutral-200 hover:border-[#FF6B00] hover:text-[#FF6B00] text-neutral-600 text-[11px] font-bold inline-flex items-center gap-1 transition"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Showing last {data?.recentOrders?.length || 0} orders</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All transactions recorded locally</span>
              </span>
            </div>
          </div>
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
