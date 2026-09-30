import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CategoryModal({ isOpen, onClose, onSave, category }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setError('');
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({ name, description }, category?._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-[#F8F8F8]">
          <h3 className="font-bold text-lg text-[#121212]">
            {category ? 'Edit Category' : 'Create Category'}
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
              Category Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wood-Fired Pizzas"
              className="w-full px-4 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description for kitchen & cashier classification"
              className="w-full px-4 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
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
              {isSubmitting ? 'Saving...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
