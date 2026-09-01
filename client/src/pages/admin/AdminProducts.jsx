import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ImageUploadField from '../../components/ImageUploadField';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Star, 
  ShoppingBag, 
  X, 
  Check, 
  AlertCircle,
  Sparkles,
  Percent,
  Truck,
  Package,
  Power,
  RotateCcw,
  Tag,
  ListPlus,
  HelpCircle
} from 'lucide-react';

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stockEditId, setStockEditId] = useState(null);
  const [inlineStockVal, setInlineStockVal] = useState('');

  // Main Form State
  const [formData, setFormData] = useState({
    title: '',
    category_id: 'cat_perfumes',
    subcategory_id: '',
    price: '',
    discount_price: '',
    stock: '15',
    thumbnail: '',
    description: '',
    is_featured: false,
    is_free_delivery: false,
    priority_order: '1'
  });

  // Dynamic Specification Points List: Array of { key: string, value: string }
  const [specsList, setSpecsList] = useState([
    { key: 'Brand', value: 'AL ANSAR Luxury Collection' },
    { key: 'Type', value: 'Eau de Parfum (EDP)' },
    { key: 'Volume', value: '100ml / 3.4 fl oz' },
    { key: 'Longevity', value: '14 - 18 Hours' }
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (prodData.success) setProducts(prodData.products || []);
      if (catData.success) setCategories(catData.categories || []);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    const firstCat = categories[0];
    setFormData({
      title: '',
      category_id: firstCat?.id || 'cat_perfumes',
      subcategory_id: firstCat?.subcategories?.[0]?.id || '',
      price: '',
      discount_price: '',
      stock: '20',
      thumbnail: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      description: '',
      is_featured: false,
      is_free_delivery: false,
      priority_order: String(products.length + 1)
    });
    setSpecsList([
      { key: 'Brand', value: 'AL ANSAR Luxury Collection' },
      { key: 'Type', value: 'Eau de Parfum (EDP)' },
      { key: 'Volume', value: '100ml / 3.4 fl oz' },
      { key: 'Longevity', value: '14 - 18 Hours' }
    ]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      title: prod.title || '',
      category_id: prod.category_id || 'cat_perfumes',
      subcategory_id: prod.subcategory_id || '',
      price: String(prod.price || ''),
      discount_price: prod.discount_price ? String(prod.discount_price) : '',
      stock: String(prod.stock !== undefined ? prod.stock : 15),
      thumbnail: prod.thumbnail || '',
      description: prod.description || '',
      is_featured: !!prod.is_featured,
      is_free_delivery: !!prod.is_free_delivery,
      priority_order: String(prod.priority_order || 1)
    });

    // Convert specs object to array
    if (prod.specs && typeof prod.specs === 'object') {
      const arr = Object.entries(prod.specs).map(([k, v]) => ({ key: k, value: String(v) }));
      setSpecsList(arr.length > 0 ? arr : [{ key: 'Brand', value: 'AL ANSAR' }]);
    } else {
      setSpecsList([{ key: 'Brand', value: 'AL ANSAR' }]);
    }

    setModalOpen(true);
  };

  // Specs Points Handlers
  const handleAddSpecRow = () => {
    setSpecsList(prev => [...prev, { key: '', value: '' }]);
  };

  const handleSpecChange = (index, field, val) => {
    setSpecsList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleRemoveSpecRow = (index) => {
    setSpecsList(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddPresetSpec = (presetKey, defaultValue = '') => {
    setSpecsList(prev => {
      if (prev.some(p => p.key.toLowerCase() === presetKey.toLowerCase())) return prev;
      return [...prev, { key: presetKey, value: defaultValue }];
    });
  };

  const handleToggleStock = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}/toggle-stock`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts(prev => prev.map(p => p.id === id ? data.product : p));
      }
    } catch (err) {
      console.error('Error toggling stock:', err);
    }
  };

  const handleSaveInlineStock = async (id) => {
    if (inlineStockVal === '' || isNaN(Number(inlineStockVal))) {
      setStockEditId(null);
      return;
    }
    try {
      const res = await fetch(`/api/products/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stock: Number(inlineStockVal) })
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts(prev => prev.map(p => p.id === id ? data.product : p));
      }
    } catch (err) {
      console.error('Error updating inline stock:', err);
    } finally {
      setStockEditId(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.title.trim()) {
      alert('Please enter a valid product name or title (প্রোডাক্টের নাম লিখুন).');
      return;
    }

    // Convert specsList array back to clean key-value object
    const finalSpecs = {};
    specsList.forEach(item => {
      if (item.key && item.key.trim()) {
        finalSpecs[item.key.trim()] = item.value ? item.value.trim() : '';
      }
    });

    setActionLoading(true);

    try {
      const payload = {
        ...formData,
        specs: finalSpecs
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchData();
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirm(null);
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleReorder = async (id, direction) => {
    try {
      const res = await fetch(`/api/products/${id}/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ direction })
      });
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error reordering product:', err);
    }
  };

  const selectedCategoryObj = categories.find(c => c.id === formData.category_id);

  // Live Auto Discount Calculation Preview
  const numRegular = Number(formData.price) || 0;
  const numSale = Number(formData.discount_price) || 0;
  const hasLiveDiscount = numRegular > 0 && numSale > 0 && numSale < numRegular;
  const liveDiscountPercent = hasLiveDiscount ? Math.round(((numRegular - numSale) / numRegular) * 100) : 0;
  const liveSavings = hasLiveDiscount ? (numRegular - numSale) : 0;

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Inventory & Specs Control</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Product Catalog & Specifications</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Add/edit product names, dynamic specification points (Volume, Longevity, Box Material), photo uploads, and live discounts
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Fragrance / Gift</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by perfume name, attar type, or gift combo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-amber-400/90 font-bold hidden sm:inline">
          {products.length} products listed
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-4">Pin / Order</th>
                  <th className="p-4">Product Info & Name</th>
                  <th className="p-4">Category & Subcategory</th>
                  <th className="p-4">Pricing & Auto Discount</th>
                  <th className="p-4">Stock Status & Quantity</th>
                  <th className="p-4">Stock Out Toggle</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.map((prod, idx) => {
                  const hasDiscount = prod.discount_price && Number(prod.discount_price) < Number(prod.price);
                  const discountPct = hasDiscount ? Math.round(((prod.price - prod.discount_price) / prod.price) * 100) : 0;
                  const savings = hasDiscount ? (Number(prod.price) - Number(prod.discount_price)) : 0;
                  const cat = categories.find(c => c.id === prod.category_id);
                  const subCat = cat?.subcategories?.find(s => s.id === prod.subcategory_id);
                  const stockNum = Number(prod.stock) !== undefined ? Number(prod.stock) : 0;
                  const isOut = stockNum <= 0;

                  return (
                    <tr key={prod.id} className={`hover:bg-slate-800/40 transition-colors ${isOut ? 'bg-slate-950/40 opacity-75' : ''}`}>
                      
                      {/* Priority Move Up/Down */}
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleReorder(prod.id, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-400 rounded-lg"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono font-bold text-slate-300 px-1 text-xs">
                            {prod.priority_order || (idx + 1)}
                          </span>
                          <button
                            onClick={() => handleReorder(prod.id, 'down')}
                            disabled={idx === filteredProducts.length - 1}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-400 rounded-lg"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Product Info & Name */}
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-3 max-w-sm">
                          <img
                            src={prod.thumbnail}
                            alt={prod.title}
                            className="w-12 h-12 rounded-2xl object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-xs truncate">{prod.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              {prod.is_featured && (
                                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                                  Featured
                                </span>
                              )}
                              {prod.is_free_delivery && (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  Free Delivery
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Subcategory */}
                      <td className="p-4 align-middle">
                        <div>
                          <span className="text-slate-200 font-bold text-xs block">
                            {cat?.name || prod.category_id}
                          </span>
                          {subCat && (
                            <span className="text-[11px] text-amber-400 font-medium">
                              ↳ {subCat.name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Pricing & Auto Discount Display in Admin */}
                      <td className="p-4 align-middle">
                        <div className="space-y-1">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-white font-black text-xs">
                              ৳{(prod.discount_price || prod.price).toLocaleString()}
                            </span>
                            {hasDiscount && (
                              <span className="text-[11px] text-slate-500 line-through">
                                ৳{prod.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          
                          {/* Auto Discount Percent & Savings Badge */}
                          {hasDiscount ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/40 w-fit">
                                {discountPct}% OFF • Save ৳{savings.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">Regular (No Discount)</span>
                          )}
                        </div>
                      </td>

                      {/* Stock Status & Inline Quick Editor */}
                      <td className="p-4 align-middle">
                        {stockEditId === prod.id ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              autoFocus
                              value={inlineStockVal}
                              onChange={(e) => setInlineStockVal(e.target.value)}
                              className="w-16 px-2 py-1 bg-slate-800 text-xs rounded border border-amber-400 text-white font-mono font-bold"
                            />
                            <button
                              onClick={() => handleSaveInlineStock(prod.id)}
                              className="p-1 bg-emerald-600 text-white rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setStockEditId(null)}
                              className="p-1 bg-slate-700 text-slate-300 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setStockEditId(prod.id);
                              setInlineStockVal(String(stockNum));
                            }}
                            className="cursor-pointer group flex items-center space-x-1.5"
                            title="Click to edit stock quantity"
                          >
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center ${
                              isOut
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : stockNum <= 5
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {isOut ? '❌ Stock Out (0)' : `✓ ${stockNum} in stock`}
                            </span>
                            <Edit3 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </td>

                      {/* 1-Click Stock In / Out Toggle Button */}
                      <td className="p-4 align-middle">
                        <button
                          onClick={() => handleToggleStock(prod.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center space-x-1.5 ${
                            isOut
                              ? 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40'
                              : 'bg-rose-900/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-600/40'
                          }`}
                          title={isOut ? 'Click to Restock (Set to 15)' : 'Click to Mark Out of Stock (Set to 0)'}
                        >
                          {isOut ? (
                            <>
                              <RotateCcw className="w-3 h-3" />
                              <span>Restock (স্টক ইন)</span>
                            </>
                          ) : (
                            <>
                              <Power className="w-3 h-3" />
                              <span>Stock Out (স্টক আউট)</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirm(prod.id)}
                            className="p-2 bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded-xl"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal with Dynamic Points & Specs Manager */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-amber-500/40 shadow-2xl text-white animate-in zoom-in-95 overflow-hidden">
            
            {/* Modal Sticky Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  {editingProduct ? 'Inventory & Specs Editor' : 'New Catalog Item'}
                </span>
                <h3 className="text-lg font-black text-white">
                  {editingProduct ? 'Edit Fragrance / Gift Details' : 'Add New Fragrance / Gift (নতুন প্রোডাক্ট যোগ করুন)'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* 🏷️ 1. PROMINENT PRODUCT NAME / TITLE FIELD */}
              <div className="p-4 bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/50 rounded-2xl border-2 border-amber-500/60 shadow-lg">
                <label className="text-xs font-black text-amber-300 block mb-1.5 flex items-center">
                  <Tag className="w-4 h-4 mr-1.5 text-amber-400" />
                  Product Name / Title (প্রোডাক্টের নাম বা টাইটেল) *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. AL ANSAR Royal Crown Oud Eau de Parfum (100ml) / আল আনসার রয়্যাল ক্রাউন উদ"
                  className="w-full px-4 py-3 bg-slate-950 text-sm font-bold rounded-xl border border-amber-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* 🏷️ 2. CATEGORY & SUBCATEGORY SELECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Parent Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      const catObj = categories.find(c => c.id === newCatId);
                      setFormData({ 
                        ...formData, 
                        category_id: newCatId,
                        subcategory_id: catObj?.subcategories?.[0]?.id || ''
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Subcategory</label>
                  <select
                    value={formData.subcategory_id}
                    onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- No Subcategory / General --</option>
                    {selectedCategoryObj?.subcategories?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 💰 3. PRICING & AUTO DISCOUNT DISPLAY */}
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Regular Price / আগের মূল্য (BDT) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 4500"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-300 block mb-1">
                      Sale Price / বর্তমান মূল্য (BDT)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 3600 (ডিসকাউন্ট মূল্য)"
                      value={formData.discount_price}
                      onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-mono font-bold text-amber-300"
                    />
                  </div>
                </div>

                {/* Live Auto-Discount Calculation Preview Box */}
                {hasLiveDiscount && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
                    <span className="font-bold flex items-center">
                      <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" />
                      Auto-Calculated Discount: <strong className="text-amber-300 ml-1 font-black text-sm">{liveDiscountPercent}% OFF</strong>
                    </span>
                    <span className="bg-emerald-900 px-3 py-1 rounded-full font-black text-xs border border-emerald-400/40">
                      Customer Saves: ৳{liveSavings.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* 📦 4. STOCK QUANTITY */}
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 flex items-center">
                    <Package className="w-4 h-4 mr-1.5 text-amber-400" />
                    Available Stock Quantity / স্টকে আছে (Units) *
                  </label>
                  <span className="text-[11px] text-slate-400">Set 0 to mark Out of Stock</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 bg-slate-900 text-sm font-bold font-mono rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, stock: '0' })}
                    className="px-3 py-2 bg-rose-900/60 hover:bg-rose-800 text-rose-300 text-xs font-bold rounded-xl"
                  >
                    Set 0 (Stock Out)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, stock: '25' })}
                    className="px-3 py-2 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-xs font-bold rounded-xl"
                  >
                    Set 25 (In Stock)
                  </button>
                </div>
              </div>

              {/* 🖼️ 5. DUAL PHOTO UPLOAD OR DIRECT LINK */}
              <ImageUploadField
                label="Product Photo / Image (ছবি আপলোড বা লিংক) *"
                value={formData.thumbnail}
                onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                helper="Browse photo file from your device OR paste direct image link."
              />

              {/* 📝 6. PRODUCT DESCRIPTION */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Product Description (পণ্যের ডেসক্রিপশন / বিবরণ)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description, highlights, usage instructions, or gift box details..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 📋 7. DYNAMIC SPECIFICATION POINTS & FEATURES MANAGER (USER SCREENSHOTS) */}
              <div className="p-5 bg-gradient-to-b from-slate-800/90 to-slate-900 rounded-2xl border-2 border-amber-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700">
                  <div>
                    <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center">
                      <ListPlus className="w-4 h-4 mr-1.5 text-amber-400" />
                      Specification Points Table (আলাদা পয়েন্ট ও স্পেসিফিকেশন)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Add, edit, or delete any point rows (যেমন: Brand, Type, Volume, Longevity, Box Material, Contents)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-1 shadow-md cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Custom Point</span>
                  </button>
                </div>

                {/* Quick 1-Click Preset Template Chips */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 self-center mr-1">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleAddPresetSpec('Volume', '100ml / 3.4 fl oz')}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold rounded-lg border border-slate-600"
                  >
                    + Volume
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetSpec('Longevity', '14 - 18 Hours')}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] font-bold rounded-lg border border-slate-600"
                  >
                    + Longevity
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetSpec('Type', 'Eau de Parfum (EDP)')}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg border border-slate-600"
                  >
                    + Type
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetSpec('Box Material', 'Polished Mahogany Wood with Brass Latch')}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold rounded-lg border border-slate-600"
                  >
                    + Box Material
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetSpec('Includes', '3x 12ml Crystal Attar Bottles + Premium Tasbih + Gift Box')}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg border border-slate-600"
                  >
                    + Includes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetSpec('Contents', '50ml Perfume + 150ml Body Mist + 200g Soy Scented Candle')}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-rose-300 text-[10px] font-bold rounded-lg border border-slate-600"
                  >
                    + Contents
                  </button>
                </div>

                {/* Editable Key-Value Points List */}
                <div className="space-y-2.5">
                  {specsList.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-700">
                      
                      {/* Left: Point Title / Key */}
                      <input
                        type="text"
                        placeholder="পয়েন্টের নাম (e.g. Volume)"
                        value={item.key}
                        onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                        className="w-1/3 px-3 py-1.5 bg-slate-900 text-xs font-bold text-amber-300 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
                      />

                      <span className="text-slate-500 font-bold">:</span>

                      {/* Right: Point Value */}
                      <input
                        type="text"
                        placeholder="পয়েন্টের বিবরণ (e.g. 100ml / 3.4 fl oz)"
                        value={item.value}
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-900 text-xs text-white rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 font-medium"
                      />

                      {/* Delete Point Row Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecRow(idx)}
                        className="p-1.5 bg-rose-900/40 hover:bg-rose-800 text-rose-300 rounded-lg transition-colors flex-shrink-0"
                        title="Delete this point"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🚚 8. TOGGLES (FREE DELIVERY & FEATURED) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl">
                  <label className="flex items-center space-x-2.5 text-xs font-bold text-emerald-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_free_delivery}
                      onChange={(e) => setFormData({ ...formData, is_free_delivery: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-500 bg-slate-800"
                    />
                    <span className="flex items-center">
                      <Truck className="w-4 h-4 mr-1.5 text-emerald-400" />
                      Enable Free Delivery (৳0 ডেলিভারি চার্জ)
                    </span>
                  </label>
                </div>

                <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl">
                  <label className="flex items-center space-x-2.5 text-xs font-bold text-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-500 bg-slate-800"
                    />
                    <span className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" />
                      Mark as Royal Select / Featured
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-7 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : editingProduct ? 'Update Product & Points' : 'Create Product & Save Points'}
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
            <h3 className="text-base font-bold">Delete this product?</h3>
            <p className="text-xs text-slate-400">
              The item will be removed from AL ANSAR catalog immediately.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirm)}
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
