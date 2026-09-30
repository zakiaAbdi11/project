import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ItemModal from '../components/ItemModal';
import CategoryModal from '../components/CategoryModal';
import { api } from '../services/api';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  FolderPlus,
  Utensils,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState(null);

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedCatId]);

  const loadData = async () => {
    try {
      const [catsRes, itemsRes, settsRes] = await Promise.all([
        api.getCategories(),
        api.getMenuItems({ category: selectedCatId }),
        api.getSettings(),
      ]);
      if (catsRes.categories) setCategories(catsRes.categories);
      if (itemsRes.items) setMenuItems(itemsRes.items);
      if (settsRes.settings) setSettings(settsRes.settings);
    } catch (err) {
      console.error('[Menu Load Error]', err);
    }
  };

  const handleSaveItem = async (formData, id) => {
    if (id) {
      await api.updateMenuItem(id, formData);
    } else {
      await api.createMenuItem(formData);
    }
    loadData();
  };

  const handleDeleteItem = async (item) => {
    if (window.confirm(`Are you sure you want to delete dish '${item.name}'?`)) {
      try {
        await api.deleteMenuItem(item._id);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await api.toggleItemAvailability(item._id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveCategory = async (categoryData, id) => {
    if (id) {
      await api.updateCategory(id, categoryData);
    } else {
      await api.createCategory(categoryData);
    }
    loadData();
  };

  const handleDeleteCategory = async (cat) => {
    if (window.confirm(`Delete category '${cat.name}'?`)) {
      try {
        await api.deleteCategory(cat._id);
        if (selectedCatId === cat._id) setSelectedCatId('');
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const currency = settings?.currency_symbol || '$';

  const filteredItems = menuItems.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8F8F8] overflow-y-auto">
      <Navbar title="Menu & Category Management" />

      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Control Bar */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#121212]">Catalog & Food Offerings</h2>
            <p className="text-xs text-neutral-500">Configure prices, menu categories, dish availability, and images</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setIsCategoryModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 hover:border-neutral-500 font-bold text-xs text-neutral-800 transition"
            >
              <FolderPlus className="w-4 h-4 text-[#FF6B00]" />
              <span>New Category</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedItem(null);
                setIsItemModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-xs shadow-md shadow-[#FF6B00]/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>
        </div>

        {/* Categories Strip */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Filter by Category
            </span>
            <span className="text-xs text-neutral-500">{categories.length} Categories Registered</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedCatId('')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedCatId === ''
                  ? 'bg-[#121212] text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All Categories ({menuItems.length})
            </button>

            {categories.map((c) => (
              <div key={c._id} className="relative group shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedCatId(c._id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition pr-8 ${
                    selectedCatId === c._id
                      ? 'bg-[#FF6B00] text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {c.name}
                </button>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(c);
                      setIsCategoryModalOpen(true);
                    }}
                    className="p-1 text-neutral-400 hover:text-white"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Items Table */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 relative max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes by name..."
                className="w-full pl-10 pr-4 py-2 bg-[#F8F8F8] border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <span className="text-xs font-bold text-neutral-500">
              Showing {filteredItems.length} Dishes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F8F8] border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Dish</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Price</th>
                  <th className="py-3.5 px-6">In Stock</th>
                  <th className="py-3.5 px-6 text-center">Availability (86)</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-neutral-400">
                      No menu items found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isLow = item.stock_qty <= item.low_stock_threshold;
                    return (
                      <tr key={item._id} className="hover:bg-neutral-50/80 transition">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                  <Utensils className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <span className="font-bold text-sm text-[#121212]">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                            {item.category_id?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-black text-sm text-[#121212]">
                          {currency}{item.price?.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#121212]">{item.stock_qty}</span>
                            {isLow && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Low
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(item)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition inline-flex items-center gap-1.5 ${
                              item.is_available
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                            }`}
                          >
                            {item.is_available ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>86'd / Hidden</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsItemModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-neutral-200 hover:border-[#FF6B00] hover:text-[#FF6B00] text-neutral-600 transition"
                              title="Edit Item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item)}
                              className="p-1.5 rounded-lg border border-neutral-200 hover:border-rose-500 hover:text-rose-600 text-neutral-400 transition"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Item Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        item={selectedItem}
        categories={categories}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={selectedCategory}
      />
    </div>
  );
}
