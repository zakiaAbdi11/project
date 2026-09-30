import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import {
  Settings as SettingsIcon,
  Save,
  Database,
  Download,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileJson,
  Flame
} from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    restaurant_name: '',
    address: '',
    phone: '',
    currency_symbol: '$',
    tax_percentage: 8.5,
    receipt_header: '',
    receipt_footer: '',
  });

  const [backups, setBackups] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');

  useEffect(() => {
    fetchSettings();
    fetchBackups();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.error('[Settings Fetch Error]', err);
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await api.listBackups();
      if (res.backups) setBackups(res.backups);
    } catch (err) {
      console.error('[Backups Fetch Error]', err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError('');
    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to save settings.');
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true);
      setBackupMsg('');
      const res = await api.createBackup();
      if (res.success) {
        setBackupMsg(`✅ Backup created: ${res.backup?.filename} (${res.backup?.sizeKb} KB)`);
        fetchBackups();
      }
    } catch (err) {
      setBackupMsg(`❌ Backup failed: ${err.message}`);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (filename) => {
    const confirmed = window.confirm(
      `⚠️ WARNING: Restoring "${filename}" will REPLACE all current data in the database.\n\nThis action cannot be undone. Proceed?`
    );
    if (!confirmed) return;

    try {
      setIsRestoring(true);
      setBackupMsg('');
      const res = await api.restoreBackup(filename);
      if (res.success) {
        setBackupMsg(`✅ Database restored from: ${filename}. Please refresh the app.`);
      }
    } catch (err) {
      setBackupMsg(`❌ Restore failed: ${err.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8F8F8] overflow-y-auto">
      <Navbar title="System Settings & Backups" />

      <main className="p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#121212]">System Configuration</h2>
            <p className="text-xs text-neutral-500">Restaurant branding, tax rates, receipt footer, and local database backup</p>
          </div>
        </div>

        {/* Restaurant Settings Form */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center gap-3 bg-[#F8F8F8]">
            <Flame className="w-5 h-5 text-[#FF6B00]" />
            <div>
              <h3 className="font-bold text-base text-[#121212]">Restaurant Information & POS Configuration</h3>
              <p className="text-xs text-neutral-500">Applied to all receipts, reports, and POS displays</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="p-8 space-y-6">
            {saveSuccess && (
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>Settings saved successfully!</span>
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
                <AlertTriangle className="w-5 h-5" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  required
                  value={settings.restaurant_name}
                  onChange={(e) => setSettings({ ...settings, restaurant_name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8F8F8] border border-neutral-300 rounded-2xl text-sm text-[#121212] font-semibold focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
                  placeholder="e.g. The Rustic Flame Bistro"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8F8F8] border border-neutral-300 rounded-2xl text-sm focus:outline-none focus:border-[#FF6B00] transition"
                  placeholder="124 Downtown Boulevard..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8F8F8] border border-neutral-300 rounded-2xl text-sm focus:outline-none focus:border-[#FF6B00] transition"
                  placeholder="+1 (555) 234-5678"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={settings.currency_symbol}
                  onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8F8F8] border border-neutral-300 rounded-2xl text-sm focus:outline-none focus:border-[#FF6B00] transition"
                  placeholder="$"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Sales Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={settings.tax_percentage}
                  onChange={(e) => setSettings({ ...settings, tax_percentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-[#F8F8F8] border border-neutral-300 rounded-2xl text-sm focus:outline-none focus:border-[#FF6B00] transition"
                  placeholder="8.5"
                />
                <p className="text-[11px] text-neutral-400 mt-1.5">Applied automatically on every POS checkout transaction</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Receipt Header Message
                </label>
                <input
                  type="text"
                  value={settings.receipt_header}
                  onChange={(e) => setSettings({ ...settings, receipt_header: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8F8F8] border border-neutral-300 rounded-2xl text-sm focus:outline-none focus:border-[#FF6B00] transition"
                  placeholder="Welcome to our Bistro!"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Receipt Footer Message
                </label>
                <textarea
                  rows={2}
                  value={settings.receipt_footer}
                  onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8F8F8] border border-neutral-300 rounded-2xl text-sm focus:outline-none focus:border-[#FF6B00] transition resize-none"
                  placeholder="Thank you for dining with us! Please come again."
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-sm shadow-md shadow-[#FF6B00]/25 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        </div>

        {/* Database Backup & Restore */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center gap-3 bg-[#F8F8F8]">
            <Database className="w-5 h-5 text-[#FF6B00]" />
            <div>
              <h3 className="font-bold text-base text-[#121212]">Database Backup & Restore</h3>
              <p className="text-xs text-neutral-500">Create local JSON snapshots and restore from previous backups</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Backup message */}
            {backupMsg && (
              <div className={`p-4 rounded-2xl border text-sm font-semibold ${
                backupMsg.startsWith('✅')
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                {backupMsg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#F8F8F8] rounded-2xl border border-neutral-200">
              <div>
                <h4 className="font-bold text-sm text-[#121212]">Create New Backup Snapshot</h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Exports all collections (users, orders, inventory, menu) to a local JSON file stored in{' '}
                  <code className="font-mono bg-neutral-200 px-1 py-0.5 rounded text-[10px]">server/backups/</code>
                </p>
              </div>
              <button
                type="button"
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#121212] hover:bg-neutral-800 text-white font-bold text-sm transition shrink-0 disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${isCreatingBackup ? 'animate-bounce' : ''}`} />
                <span>{isCreatingBackup ? 'Creating...' : 'Create Backup Now'}</span>
              </button>
            </div>

            {/* Backup list */}
            {backups.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#121212]">Available Backup Files</h4>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {backups.map((backup) => (
                    <div
                      key={backup.filename}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200 hover:border-neutral-300 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-neutral-200 flex items-center justify-center shrink-0">
                          <FileJson className="w-5 h-5 text-neutral-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono font-bold text-xs text-[#121212] truncate">
                            {backup.filename}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-neutral-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(backup.createdAt).toLocaleString()}
                            </span>
                            <span>{backup.sizeKb} KB</span>
                            {backup.summary && (
                              <span>{backup.summary.orders || 0} orders · {backup.summary.menuItems || 0} menu items</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreBackup(backup.filename)}
                        disabled={isRestoring}
                        className="ml-4 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition shrink-0 disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {backups.length === 0 && (
              <p className="text-xs text-neutral-400 text-center py-4">
                No backup files found. Create your first backup above.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
