import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import UserModal from '../components/UserModal';
import { api } from '../services/api';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ShieldCheck,
  UserCircle2,
  CheckCircle2,
  XCircle,
  Users
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers({ role: roleFilter });
      if (res.users) setUsers(res.users);
    } catch (err) {
      console.error('[Users Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (userData, id) => {
    if (id) {
      await api.updateUser(id, userData);
    } else {
      await api.createUser(userData);
    }
    fetchUsers();
  };

  const handleResetPassword = async (id, newPassword) => {
    await api.resetPassword(id, newPassword);
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete user '${user.username}'?`)) return;
    try {
      await api.deleteUser(user._id);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateUser(user._id, { status: newStatus });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const s = searchQuery.toLowerCase();
    return u.username.includes(s) || u.fullName.toLowerCase().includes(s);
  });

  const admins = users.filter((u) => u.role === 'admin').length;
  const cashiers = users.filter((u) => u.role === 'cashier').length;
  const activeCount = users.filter((u) => u.status === 'active').length;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8F8F8] overflow-y-auto">
      <Navbar title="Staff & User Management" />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#121212]">Staff Accounts & Access Control</h2>
            <p className="text-xs text-neutral-500">Create cashiers, admins, reset passwords, and manage access roles</p>
          </div>
          <button
            type="button"
            onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-xs shadow-md shadow-[#FF6B00]/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Staff Account</span>
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: 'Total Staff', value: users.length, icon: Users, color: 'text-neutral-700 bg-neutral-100' },
            { label: 'Administrators', value: admins, icon: ShieldCheck, color: 'text-[#FF6B00] bg-[#FF6B00]/10' },
            { label: 'Active Accounts', value: activeCount, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50' },
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

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or username..."
                className="w-full pl-10 pr-4 py-2 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
            <div className="flex items-center gap-2">
              {['', 'admin', 'cashier'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    roleFilter === role
                      ? 'bg-[#121212] text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {role === '' ? 'All' : role === 'admin' ? 'Admins' : 'Cashiers'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F8F8] border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Staff Member</th>
                  <th className="py-3.5 px-6">Username</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-neutral-400">No staff accounts found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500 shrink-0">
                            {user.role === 'admin'
                              ? <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
                              : <UserCircle2 className="w-4 h-4 text-neutral-400" />
                            }
                          </div>
                          <span className="font-bold text-sm text-[#121212]">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-neutral-600">{user.username}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          user.role === 'admin'
                            ? 'bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                        }`}>
                          {user.role === 'admin' ? '⚑ Administrator' : '⊙ Cashier'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                            user.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {user.status === 'active'
                            ? <><CheckCircle2 className="w-3 h-3" /><span>Active</span></>
                            : <><XCircle className="w-3 h-3" /><span>Suspended</span></>
                          }
                        </button>
                      </td>
                      <td className="py-4 px-6 text-neutral-500">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                            className="p-1.5 rounded-lg border border-neutral-200 hover:border-[#FF6B00] hover:text-[#FF6B00] text-neutral-600 transition"
                            title="Edit user / Reset password"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            className="p-1.5 rounded-lg border border-neutral-200 hover:border-rose-500 hover:text-rose-600 text-neutral-400 transition"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        user={selectedUser}
        onResetPassword={handleResetPassword}
      />
    </div>
  );
}
