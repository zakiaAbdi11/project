import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, ShieldCheck, UserCheck, Lock, User, AlertCircle, Wifi } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(username, password);
      if (res.user?.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/pos');
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('failed to fetch')) {
        setError('Cannot connect to POS server on port 5000. Please ensure the backend is running (run start-server.bat or cd server && npm run dev).');
      } else {
        setError(err.message || 'Invalid username or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('cashier');
      setPassword('cashier123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-6 text-[#121212]">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-neutral-200">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FF6B00]/25">
            <Flame className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-[#121212] tracking-tight">The Rustic Flame</h1>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Offline Restaurant Management & POS System
          </p>

          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Wifi className="w-3.5 h-3.5" />
            <span>Local Database Connected (100% Offline)</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter staff username"
                className="w-full pl-12 pr-4 py-3 bg-[#F8F8F8] border border-neutral-300 rounded-2xl text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter security password"
                className="w-full pl-12 pr-4 py-3 bg-[#F8F8F8] border border-neutral-300 rounded-2xl text-sm font-semibold text-[#121212] focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-sm tracking-wide shadow-md shadow-[#FF6B00]/30 hover:shadow-lg hover:shadow-[#FF6B00]/40 transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Terminal'}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-neutral-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 text-center mb-3">
            Quick One-Click Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillQuickCredentials('admin')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-neutral-300 bg-[#F8F8F8] hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition"
            >
              <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
              <span>Admin (All Access)</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('cashier')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-neutral-300 bg-[#F8F8F8] hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Cashier (POS Only)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
