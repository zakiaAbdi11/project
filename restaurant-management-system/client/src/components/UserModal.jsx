import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Key } from 'lucide-react';

export default function UserModal({ isOpen, onClose, onSave, user, onResetPassword }) {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'cashier',
    status: 'active',
  });
  const [resetPwd, setResetPwd] = useState('');
  const [showResetBox, setShowResetBox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        fullName: user.fullName || '',
        password: '',
        role: user.role || 'cashier',
        status: user.status || 'active',
      });
      setShowResetBox(false);
      setResetPwd('');
    } else {
      setFormData({
        username: '',
        fullName: '',
        password: '',
        role: 'cashier',
        status: 'active',
      });
    }
    setError('');
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user && !formData.password) {
      setError('Password is required for new user creation.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(formData, user?._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async () => {
    if (!resetPwd || resetPwd.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    try {
      setIsSubmitting(true);
      await onResetPassword(user._id, resetPwd);
      setShowResetBox(false);
      setResetPwd('');
      alert('Password reset successfully!');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-[#F8F8F8]">
          <h3 className="font-bold text-lg text-[#121212]">
            {user ? `Edit Staff Member (${user.username})` : 'Create Staff / Cashier'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-4 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
              Username (Login ID)
            </label>
            <input
              type="text"
              required
              disabled={!!user}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g. cashier2"
              className="w-full px-4 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm disabled:bg-neutral-100 disabled:text-neutral-500 focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          {!user && (
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                Initial Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 4 characters"
                className="w-full px-4 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="cashier">Cashier (POS Only)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive / Suspended</option>
              </select>
            </div>
          </div>

          {/* Reset Password accordion for existing user */}
          {user && (
            <div className="pt-2 border-t border-neutral-200">
              {!showResetBox ? (
                <button
                  type="button"
                  onClick={() => setShowResetBox(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#FF6B00] hover:underline"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Reset Staff Password</span>
                </button>
              ) : (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <span className="text-xs font-bold text-[#121212] block">Enter New Password:</span>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={resetPwd}
                      onChange={(e) => setResetPwd(e.target.value)}
                      placeholder="New password..."
                      className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handlePasswordResetSubmit}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-[#121212] text-white rounded-lg text-xs font-bold hover:bg-neutral-800"
                    >
                      Update
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-sm font-bold shadow-md shadow-[#FF6B00]/20 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Saving...' : user ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
