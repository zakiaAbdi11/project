import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CashierPOS from './pages/CashierPOS';
import Orders from './pages/Orders';
import Menu from './pages/Menu';
import Tables from './pages/Tables';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';

// ─── Protected Layout (requires authentication) ───────────────────────────────
function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] mx-auto flex items-center justify-center animate-pulse">
            <span className="text-white font-black text-lg">R</span>
          </div>
          <p className="text-xs font-semibold text-neutral-400">Connecting to local POS server...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F8F8]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

// ─── Admin-Only Guard ─────────────────────────────────────────────────────────
function AdminRoute() {
  const { isAdmin, loading } = useAuth();

  if (loading) return null;

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400 min-h-screen bg-[#F8F8F8]">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4">
          <span className="text-rose-600 font-black text-2xl">!</span>
        </div>
        <h2 className="font-bold text-lg text-[#121212]">Access Restricted</h2>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs">
          This page requires Administrator privileges. Please contact your system admin.
        </p>
      </div>
    );
  }

  return <Outlet />;
}

// ─── App Router ───────────────────────────────────────────────────────────────
function AppRouter() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  return (
    <Routes>
      {/* Public: Login */}
      <Route
        path="/login"
        element={
          !isAuthenticated
            ? <Login />
            : <Navigate to={isAdmin ? '/dashboard' : '/pos'} replace />
        }
      />

      {/* Protected: Requires authenticated JWT */}
      <Route element={<ProtectedLayout />}>
        {/* ── Shared: Both Admin and Cashier ── */}
        <Route path="/pos" element={<CashierPOS />} />
        <Route path="/orders" element={<Orders />} />

        {/* ── Admin-Only Routes ── */}
        <Route element={<AdminRoute />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch-all: redirect to role-appropriate home */}
        <Route path="*" element={<Navigate to={isAdmin ? '/dashboard' : '/pos'} replace />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
