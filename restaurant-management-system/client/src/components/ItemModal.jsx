import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

export default function ItemModal({ isOpen, onClose, onSave, item, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    stock_qty: '',
    low_stock_threshold: '5',
    is_available: true,
    image_url: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category_id: item.category_id?._id || item.category_id || '',
        price: item.price !== undefined ? item.price : '',
        stock_qty: item.stock_qty !== undefined ? item.stock_qty : '',
        low_stock_threshold: item.low_stock_threshold !== undefined ? item.low_stock_threshold : '5',
        is_available: item.is_available !== undefined ? item.is_available : true,
        image_url: item.image_url || '',
      });
      setPreview(item.image_url || '');
    } else {
      setFormData({
        name: '',
        category_id: categories[0]?._id || '',
        price: '',
        stock_qty: '20',
        low_stock_threshold: '5',
        is_available: true,
        image_url: '',
      });
      setPreview('');
    }
    setSelectedFile(null);
    setError('');
  }, [item, categories, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.category_id || formData.price === '') {
      setError('Please provide dish name, category, and price.');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category_id', formData.category_id);
      data.append('price', formData.price);
      data.append('stock_qty', formData.stock_qty);
      data.append('low_stock_threshold', formData.low_stock_threshold);
      data.append('is_available', formData.is_available);
      if (formData.image_url && !selectedFile) {
        data.append('image_url', formData.image_url);
      }
      if (selectedFile) {
        data.append('image', selectedFile);
      }

      await onSave(data, item?._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save menu item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-[#F8F8F8]">
          <h3 className="font-bold text-lg text-[#121212]">
            {item ? 'Edit Menu Dish' : 'Add New Menu Item'}
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
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Dish Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00]"
              placeholder="e.g. Wagyu Truffle Burger"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Category</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00]"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Stock Qty</label>
              <input
                type="number"
                min="0"
                value={formData.stock_qty}
                onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00]"
                placeholder="20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Low Stock Alert At</label>
              <input
                type="number"
                min="1"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#FF6B00]"
                placeholder="5"
              />
            </div>
          </div>

          {/* Image Upload or URL */}
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Food Image</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-neutral-100 border border-neutral-300 overflow-hidden flex items-center justify-center shrink-0">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-neutral-400" />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-neutral-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#FF6B00]/10 file:text-[#FF6B00] hover:file:bg-[#FF6B00]/20"
                />
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value });
                    if (!selectedFile) setPreview(e.target.value);
                  }}
                  placeholder="Or enter image URL path..."
                  className="w-full px-3 py-1.5 bg-[#F8F8F8] border border-neutral-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00]"
            />
            <label htmlFor="is_available" className="text-xs font-semibold text-[#121212]">
              Dish is currently available on POS menu
            </label>
          </div>

          <div className="p-4 border-t border-neutral-100 flex items-center justify-end gap-3 pt-4">
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
              {isSubmitting ? 'Saving...' : item ? 'Update Dish' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
