import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import {
  Plus,
  Edit2,
  Trash2,
  Grid3X3,
  Users,
  CheckCircle2,
  X
} from 'lucide-react';

// Inline Table Modal
function TableModal({ isOpen, onClose, onSave, table }) {
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [status, setStatus] = useState('Available');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (table) {
      setTableNumber(table.table_number || '');
      setCapacity(String(table.capacity || 4));
      setStatus(table.status || 'Available');
    } else {
      setTableNumber('');
      setCapacity('4');
      setStatus('Available');
    }
    setError('');
  }, [table, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tableNumber.trim()) {
      setError('Table number is required.');
      return;
    }
    try {
      setSubmitting(true);
      await onSave({ table_number: tableNumber, capacity: Number(capacity), status }, table?._id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-[#F8F8F8]">
          <h3 className="font-bold text-lg text-[#121212]">
            {table ? `Edit Table ${table.table_number}` : 'Add New Table'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{error}</div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Table Number / Label</label>
            <input
              type="text"
              required
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. T-01, VIP-1, Bar-3"
              disabled={!!table}
              className="w-full px-4 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00] disabled:bg-neutral-100 disabled:text-neutral-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Seating Capacity</label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00]"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                  <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>
          </div>
          <div className="pt-3 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-100 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-sm font-bold shadow-md shadow-[#FF6B00]/20 disabled:opacity-50 transition">
              {submitting ? 'Saving...' : table ? 'Update Table' : 'Add Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await api.getTables();
      if (res.tables) setTables(res.tables);
    } catch (err) {
      console.error('[Tables Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (tableData, id) => {
    if (id) {
      await api.updateTable(id, tableData);
    } else {
      await api.createTable(tableData);
    }
    fetchTables();
  };

  const handleStatusChange = async (table, newStatus) => {
    try {
      await api.updateTableStatus(table._id, newStatus);
      fetchTables();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (table) => {
    if (table.status === 'Occupied') {
      alert('Cannot delete an occupied table with an active order.');
      return;
    }
    if (window.confirm(`Delete Table ${table.table_number}? This action is irreversible.`)) {
      try {
        await api.deleteTable(table._id);
        fetchTables();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const available = tables.filter((t) => t.status === 'Available').length;
  const occupied = tables.filter((t) => t.status === 'Occupied').length;
  const reserved = tables.filter((t) => t.status === 'Reserved').length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8F8F8] overflow-y-auto">
      <Navbar title="Table Management" />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#121212]">Dining Room Floor Plan</h2>
            <p className="text-xs text-neutral-500">Add, configure tables and manage real-time dining status</p>
          </div>
          <button
            type="button"
            onClick={() => { setSelectedTable(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-xs shadow-md shadow-[#FF6B00]/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Table</span>
          </button>
        </div>

        {/* Status Summary Bar */}
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: 'Available', count: available, color: 'bg-emerald-50 border-emerald-200 text-emerald-800', dot: 'bg-emerald-500' },
            { label: 'Occupied', count: occupied, color: 'bg-rose-50 border-rose-200 text-rose-800', dot: 'bg-rose-500' },
            { label: 'Reserved', count: reserved, color: 'bg-amber-50 border-amber-200 text-amber-800', dot: 'bg-amber-500' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-5 border ${s.color} flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full ${s.dot}`}></span>
                <span className="font-bold text-sm">{s.label}</span>
              </div>
              <span className="text-3xl font-black">{s.count}</span>
            </div>
          ))}
        </div>

        {/* Table Grid */}
        {loading ? (
          <div className="text-center py-12 text-neutral-400">Loading tables...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {tables.map((tbl) => {
              let statusRing = 'border-emerald-400 bg-emerald-50/30';
              let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              let dotColor = 'bg-emerald-500';
              if (tbl.status === 'Occupied') {
                statusRing = 'border-rose-400 bg-rose-50/30';
                statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                dotColor = 'bg-rose-500';
              }
              if (tbl.status === 'Reserved') {
                statusRing = 'border-amber-400 bg-amber-50/30';
                statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                dotColor = 'bg-amber-500';
              }

              return (
                <div key={tbl._id} className={`bg-white rounded-2xl border-2 p-5 flex flex-col justify-between h-44 shadow-xs hover:shadow-md transition ${statusRing}`}>
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-2xl font-black text-[#121212]">{tbl.table_number}</span>
                      <span className={`w-3 h-3 rounded-full mt-1 ${dotColor}`}></span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-neutral-500">
                      <Users className="w-3.5 h-3.5" />
                      <span>Capacity: {tbl.capacity}</span>
                    </div>
                    <span className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                      {tbl.status}
                    </span>
                    {tbl.status === 'Occupied' && tbl.current_order_id && (
                      <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                        #{tbl.current_order_id.order_number || 'Active Order'}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-3 pt-2 border-t border-neutral-200/60">
                    {tbl.status !== 'Available' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(tbl, 'Available')}
                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                      >
                        Free Up
                      </button>
                    )}
                    {tbl.status === 'Available' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(tbl, 'Reserved')}
                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
                      >
                        Reserve
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { setSelectedTable(tbl); setIsModalOpen(true); }}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:border-[#FF6B00] hover:text-[#FF6B00] transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tbl)}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:border-rose-500 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <TableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        table={selectedTable}
      />
    </div>
  );
}
