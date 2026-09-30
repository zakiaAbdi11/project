import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  Users,
  UtensilsCrossed,
  Calendar,
  RefreshCw
} from 'lucide-react';

// Simple Bar Chart using pure CSS
function SimpleBarChart({ data, keyX, keyY, color = '#FF6B00', currency = '$' }) {
  if (!data || data.length === 0) {
    return <p className="text-xs text-neutral-400 text-center py-8">No data available for this period.</p>;
  }

  const maxVal = Math.max(...data.map((d) => d[keyY] || 0), 1);

  return (
    <div className="flex items-end gap-1.5 h-36 w-full overflow-x-auto pb-1">
      {data.map((item, idx) => {
        const pct = ((item[keyY] || 0) / maxVal) * 100;
        return (
          <div key={idx} className="flex flex-col items-center gap-1 min-w-[32px] flex-1 group">
            <div className="relative w-full flex justify-center">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#121212] text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10">
                {currency}{(item[keyY] || 0).toFixed(2)}
              </div>
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${Math.max(pct, 2)}%`,
                  minHeight: '4px',
                  maxHeight: '100%',
                  backgroundColor: color,
                  opacity: 0.8 + (pct / maxVal) * 0.2,
                }}
              />
            </div>
            <span className="text-[9px] text-neutral-400 font-medium truncate max-w-full text-center">
              {String(item[keyX] || '').slice(-5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Reports() {
  const [period, setPeriod] = useState('weekly');
  const [reportData, setReportData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const [reportRes, settsRes] = await Promise.all([
        api.getSalesReport({ period }),
        api.getSettings(),
      ]);
      if (reportRes) setReportData(reportRes);
      if (settsRes.settings) setSettings(settsRes.settings);
    } catch (err) {
      console.error('[Reports Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const currency = settings?.currency_symbol || '$';
  const summary = reportData?.summary;
  const salesOverTime = reportData?.salesOverTime || [];
  const salesByCashier = reportData?.salesByCashier || [];
  const salesByType = reportData?.salesByType || [];
  const productPopularity = reportData?.productPopularity || [];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8F8F8] overflow-y-auto">
      <Navbar title="Sales Analytics & Reports" />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header & Period Selector */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#121212]">Sales Performance Analytics</h2>
            <p className="text-xs text-neutral-500">Revenue trends, product popularity, and cashier performance</p>
          </div>
          <div className="flex items-center gap-2">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                  period === p
                    ? 'bg-[#FF6B00] text-white shadow-xs shadow-[#FF6B00]/25'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {p === 'daily' ? 'Today' : p === 'weekly' ? 'This Week' : 'Last 30 Days'}
              </button>
            ))}
            <button
              type="button"
              onClick={fetchReport}
              className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 transition text-neutral-600"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              label: 'Total Revenue',
              value: `${currency}${summary?.totalRevenue?.toFixed(2) || '0.00'}`,
              icon: DollarSign,
              color: 'text-[#FF6B00] bg-[#FF6B00]/10',
            },
            {
              label: 'Total Orders',
              value: summary?.totalOrders || 0,
              icon: ShoppingBag,
              color: 'text-emerald-700 bg-emerald-50',
            },
            {
              label: 'Avg. Order Value',
              value: `${currency}${summary?.avgOrderValue?.toFixed(2) || '0.00'}`,
              icon: TrendingUp,
              color: 'text-blue-700 bg-blue-50',
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">{s.label}</p>
                <p className="text-2xl font-black text-[#121212] mt-1">{s.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Over Time Chart */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base text-[#121212]">Revenue Over Time</h3>
              <p className="text-xs text-neutral-500 capitalize">{period === 'daily' ? "Today's hourly breakdown" : period === 'weekly' ? 'Last 7 days' : 'Last 30 days'}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="w-3 h-3 rounded bg-[#FF6B00]"></span>
              <span>Daily Revenue ({currency})</span>
            </div>
          </div>
          {loading ? (
            <div className="h-36 flex items-center justify-center text-neutral-400 text-xs">Loading chart data...</div>
          ) : (
            <SimpleBarChart
              data={salesOverTime}
              keyX="_id"
              keyY="totalSales"
              color="#FF6B00"
              currency={currency}
            />
          )}
        </div>

        {/* 3-Column Bottom: Cashier Sales, Product Popularity, Order Type Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales by Cashier */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
              <Users className="w-5 h-5 text-[#FF6B00]" />
              <div>
                <h3 className="font-bold text-sm text-[#121212]">Sales by Cashier</h3>
                <p className="text-[11px] text-neutral-500">Revenue performance per staff</p>
              </div>
            </div>
            <div className="space-y-3">
              {salesByCashier.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">No sales data.</p>
              ) : (
                salesByCashier.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#121212] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-xs text-[#121212] leading-tight">{c.cashierName || c.username || 'Staff'}</p>
                        <p className="text-[10px] text-neutral-500">{c.ordersCount} orders</p>
                      </div>
                    </div>
                    <span className="font-black text-sm text-[#FF6B00]">
                      {currency}{c.totalSales?.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Product Popularity */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
              <Award className="w-5 h-5 text-[#FF6B00]" />
              <div>
                <h3 className="font-bold text-sm text-[#121212]">Top Products</h3>
                <p className="text-[11px] text-neutral-500">Best-selling dishes this period</p>
              </div>
            </div>
            <div className="space-y-3">
              {productPopularity.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">No product data.</p>
              ) : (
                productPopularity.slice(0, 6).map((p, idx) => {
                  const maxQty = productPopularity[0]?.totalQuantity || 1;
                  const pct = (p.totalQuantity / maxQty) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#121212] truncate pr-2 max-w-[160px]">{p.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-neutral-500">{p.totalQuantity} sold</span>
                          <span className="font-bold text-[#FF6B00]">{currency}{p.totalRevenue?.toFixed(0)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF6B00] rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Order Type Split */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
              <UtensilsCrossed className="w-5 h-5 text-[#FF6B00]" />
              <div>
                <h3 className="font-bold text-sm text-[#121212]">Order Type Split</h3>
                <p className="text-[11px] text-neutral-500">Dine-In vs Takeaway revenue</p>
              </div>
            </div>
            <div className="space-y-4">
              {salesByType.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">No data for this period.</p>
              ) : (
                salesByType.map((t, idx) => {
                  const total = salesByType.reduce((s, x) => s + x.totalSales, 0) || 1;
                  const pct = ((t.totalSales / total) * 100).toFixed(1);
                  const color = t._id === 'Dine-In' ? '#FF6B00' : '#121212';
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                          <span className="font-bold text-[#121212]">{t._id}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-neutral-500">{t.ordersCount} orders</span>
                          <span className="font-black text-[#121212]">{currency}{t.totalSales?.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-400 text-right">{pct}% of revenue</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Summary Bottom Total */}
            {summary && (
              <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium">Period Total:</span>
                <span className="text-lg font-black text-[#121212]">{currency}{summary.totalRevenue?.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
