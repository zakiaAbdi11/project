import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wifi, WifiOff, Clock, Sparkles } from 'lucide-react';

export default function Navbar({ title = 'Point of Sale' }) {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-18 bg-white border-b border-neutral-200 px-8 flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-xl font-bold text-[#121212] tracking-tight">{title}</h2>
        <p className="text-xs text-neutral-500 font-medium">Offline Restaurant Management System</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Offline Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Wifi className="w-3.5 h-3.5" />
          <span>Offline First (Localhost:5000)</span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-2 text-sm text-[#121212] font-mono bg-[#F8F8F8] px-3.5 py-1.5 rounded-xl border border-neutral-200">
          <Clock className="w-4 h-4 text-[#FF6B00]" />
          <span>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-neutral-400 font-sans text-xs pl-1 border-l border-neutral-300">
            {time.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Staff Pill */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-neutral-200">
          <div className="text-right">
            <div className="text-xs font-semibold text-[#121212]">{user?.fullName}</div>
            <div className="text-[11px] font-medium text-[#FF6B00] uppercase tracking-wider">{user?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
