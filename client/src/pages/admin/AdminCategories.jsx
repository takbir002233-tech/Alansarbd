import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ImageUploadField from '../../components/ImageUploadField';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Layers, 
  X, 
  Check, 
  AlertCircle,
  Tag,
  CornerDownRight
} from 'lucide-react';

export default function AdminCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Sparkles',
    image: '',
    priority_order: '1',
    subcategories: []
  });
  const [newSubInput, setNewSubInput] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setFormData({
      name: '',
      icon: 'Sparkles',
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
      priority_order: String(categories.length + 1),
      subcategories: []
    });
    setNewSubInput('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      icon: cat.icon || 'Sparkles',
      image: cat.image || '',
      priority_order: String(cat.priority_order || 1),
      subcategories: cat.subcategories ? [...cat.subcategories] : []
    });
    setNewSubInput('');
    setModalOpen(true);
  };

  const handleAddSubcategory = (e) => {
    e.preventDefault();
    if (!newSubInput.trim()) return;
    const newSub = {
      id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
      name: newSubInput.trim(),
      slug: newSubInput.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
    };
    setFormData(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, newSub]
    }));
    setNewSubInput('');
  };

  const handleRemoveSubcategory = (subId) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter(s => s.id !== subId)
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      alert('Please enter a category name (ক্যাটাগরির নাম লিখুন).');
      return;
    }

    setActionLoading(true);

    try {
      const url = editingCat ? `/api/categories/${editingCat.id}` : '/api/categories';
      const method = editingCat ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchCategories();
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirm(null);
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleReorder = async (id, direction) => {
    try {
      const res = await fetch(`/api/categories/${id}/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ direction })
      });
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error reordering category:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Catalog Taxonomy Manager</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Categories & Sub-Categories</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Add categories, upload photo files or paste links, manage sub-categories, and reorder with Up/Down buttons
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No categories found. Click Add New Category.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-4">Pin / Order</th>
                  <th className="p-4">Category Name & Photo</th>
                  <th className="p-4">Sub-Categories List</th>
                  <th className="p-4">Item Count</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {categories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Up/Down Priority Reorder */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleReorder(cat.id, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-400 rounded-lg"
                          title="Move Category Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-slate-300 px-1 text-xs">
                          {cat.priority_order || (idx + 1)}
                        </span>
                        <button
                          onClick={() => handleReorder(cat.id, 'down')}
                          disabled={idx === categories.length - 1}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-400 rounded-lg"
                          title="Move Category Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Name & Image */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center space-x-3">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-12 h-12 rounded-2xl object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-white text-xs">{cat.name}</h4>
                          <span className="text-[10px] text-amber-400/80 font-mono">/{cat.slug}</span>
                        </div>
                      </div>
                    </td>

                    {/* Subcategories list */}
                    <td className="p-4 align-middle">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {cat.subcategories && cat.subcategories.length > 0 ? (
                          cat.subcategories.map(sub => (
                            <span key={sub.id} className="bg-slate-800 text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-700 flex items-center">
                              <Tag className="w-2.5 h-2.5 mr-1 text-amber-400" />
                              {sub.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">No sub-categories yet</span>
                        )}
                      </div>
                    </td>

                    {/* Item count */}
                    <td className="p-4 align-middle">
                      <span className="text-slate-300 font-bold">{cat.item_count || 0} products</span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl"
                          title="Edit Category & Subcategories"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirm(cat.id)}
                          className="p-2 bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded-xl"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal with Prominent Name Field & Photo Upload/Link */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-amber-500/30 shadow-2xl p-6 sm:p-8 space-y-6 text-white animate-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  Taxonomy Control
                </span>
                <h3 className="text-base font-black text-white">
                  {editingCat ? 'Edit Fragrance Category & Sub-Categories' : 'Add New Category (নতুন ক্যাটাগরি যোগ করুন)'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5 text-xs">
              
              {/* 🏷️ Prominent Category Name / Title Field */}
              <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 rounded-2xl border-2 border-amber-500/50 shadow-md">
                <label className="text-xs font-black text-amber-300 block mb-1.5 flex items-center">
                  <Tag className="w-4 h-4 mr-1.5 text-amber-400" />
                  Category Name / Title (ক্যাটাগরির নাম) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. French & Western Perfumes / ফ্রেঞ্চ পারফিউম"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 text-sm font-bold rounded-xl border border-amber-500/40 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* 🖼️ Photo Upload (Device Browse) OR Direct Image Link */}
              <ImageUploadField
                label="Category Photo Image (ছবি আপলোড করুন বা লিংক দিন) *"
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                helper="Select photo from computer/phone OR paste image link directly."
              />

              {/* Sub-Categories Manager */}
              <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-3">
                <label className="font-bold text-amber-400 block">Sub-Categories under this Category (সাব-ক্যাটাগরি সমূহ)</label>
                
                {/* Existing Sub-Categories Chips */}
                <div className="flex flex-wrap gap-2">
                  {formData.subcategories.map(sub => (
                    <span
                      key={sub.id}
                      className="bg-slate-800 text-white text-xs font-semibold px-3 py-1 rounded-xl border border-slate-600 flex items-center space-x-1.5"
                    >
                      <span>{sub.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcategory(sub.id)}
                        className="text-rose-400 hover:text-rose-300 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Subcategory input */}
                <div className="flex space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add Subcategory (e.g. Men's Luxury EDP)..."
                    value={newSubInput}
                    onChange={(e) => setNewSubInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    + Add Sub
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl shadow-lg"
                >
                  {actionLoading ? 'Saving...' : editingCat ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 max-w-sm w-full p-6 rounded-3xl border border-slate-800 space-y-4 text-white text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold">Delete this Category?</h3>
            <p className="text-xs text-slate-400">
              The category and its subcategories will be removed from AL ANSAR storefront.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
