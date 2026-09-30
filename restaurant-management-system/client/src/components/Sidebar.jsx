import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Receipt,
  BookOpen,
  Grid3X3,
  Boxes,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Flame,
  ShieldCheck,
  UserCircle2
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 ${
      isActive
        ? 'bg-[#FF6B00] text-white shadow-sm font-semibold'
        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
    }`;

  return (
    <aside className="w-64 bg-[#121212] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-neutral-800">
      {/* Top Brand Header */}
      <div>
        <div className="p-6 border-b border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B00] flex items-center justify-center text-white shadow-md shadow-[#FF6B00]/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white leading-tight">Rustic Flame</h1>
            <p className="text-xs text-neutral-400 font-mono tracking-wider uppercase">Offline POS & ERP</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-1">
          <div className="px-4 py-2 text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
            Point of Sale
          </div>

          <NavLink to="/pos" className={navItemClass}>
            <UtensilsCrossed className="w-5 h-5 shrink-0" />
            <span>Cashier POS</span>
          </NavLink>

          <NavLink to="/orders" className={navItemClass}>
            <Receipt className="w-5 h-5 shrink-0" />
            <span>Orders & Receipts</span>
          </NavLink>

          {/* Admin Restricted Navigation */}
          {isAdmin && (
            <>
              <div className="pt-5 px-4 py-2 text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                Administration
              </div>

              <NavLink to="/dashboard" className={navItemClass}>
                <LayoutDashboard className="w-5 h-5 shrink-0" />
                <span>Executive Dashboard</span>
              </NavLink>

              <NavLink to="/menu" className={navItemClass}>
                <BookOpen className="w-5 h-5 shrink-0" />
                <span>Menu & Categories</span>
              </NavLink>

              <NavLink to="/tables" className={navItemClass}>
                <Grid3X3 className="w-5 h-5 shrink-0" />
                <span>Table Management</span>
              </NavLink>

              <NavLink to="/inventory" className={navItemClass}>
                <Boxes className="w-5 h-5 shrink-0" />
                <span>Inventory & Stocks</span>
              </NavLink>

              <NavLink to="/reports" className={navItemClass}>
                <BarChart3 className="w-5 h-5 shrink-0" />
                <span>Sales & Analytics</span>
              </NavLink>

              <NavLink to="/users" className={navItemClass}>
                <Users className="w-5 h-5 shrink-0" />
                <span>Staff & Cashiers</span>
              </NavLink>

              <NavLink to="/settings" className={navItemClass}>
                <Settings className="w-5 h-5 shrink-0" />
                <span>System & Backups</span>
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* Footer User Profile & Logout */}
      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 p-3 bg-neutral-900/80 rounded-xl mb-3 border border-neutral-800">
          <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-white border border-neutral-700">
            {isAdmin ? <ShieldCheck className="w-5 h-5 text-[#FF6B00]" /> : <UserCircle2 className="w-5 h-5 text-amber-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.fullName || user?.username}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isAdmin ? 'bg-[#FF6B00]' : 'bg-emerald-500'
                }`}
              />
              <span className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
