import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sparkles,
  Percent,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminVouchers() {
  const { token } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    min_spend: '',
    is_active: true,
    description: ''
  });

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vouchers');
      const data = await res.json();
      if (data.success) {
        setVouchers(data.vouchers || []);
      }
    } catch (err) {
      console.error('Error fetching vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleOpenAdd = () => {
    setEditingVoucher(null);
    setFormData({
      code: '',
      discount_type: 'percent',
      discount_value: '10',
      min_spend: '1000',
      is_active: true,
      description: 'Special discount voucher'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVoucher(v);
    setFormData({
      code: v.code,
      discount_type: v.discount_type,
      discount_value: String(v.discount_value),
      min_spend: String(v.min_spend || 0),
      is_active: !!v.is_active,
      description: v.description || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const url = editingVoucher ? `/api/vouchers/${editingVoucher.id}` : '/api/vouchers';
      const method = editingVoucher ? 'PUT' : 'POST';

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
        fetchVouchers();
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (err) {
      console.error('Error saving voucher:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this voucher code?')) return;

    try {
      const res = await fetch(`/api/vouchers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setVouchers(prev => prev.filter(v => v.id !== id));
      }
    } catch (err) {
      console.error('Error deleting voucher:', err);
    }
  };

  const handleToggleActive = async (v) => {
    try {
      const res = await fetch(`/api/vouchers/${v.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !v.is_active })
      });
      const data = await res.json();
      if (data.success) {
        setVouchers(prev =>
          prev.map(item => (item.id === v.id ? { ...item, is_active: !v.is_active } : item))
        );
      }
    } catch (err) {
      console.error('Error toggling voucher:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Promotion & Discounts</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Vouchers & Promo Codes</h1>
          <p className="text-xs text-slate-400 mt-0.5">Create and manage coupon codes for instant checkout discounts</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Voucher Code</span>
        </button>
      </div>

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-slate-400 text-xs">Loading vouchers...</div>
        ) : vouchers.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-400 text-xs">No vouchers created yet.</div>
        ) : (
          vouchers.map((v) => (
            <div
              key={v.id}
              className={`p-6 rounded-3xl border transition-all space-y-4 relative ${
                v.is_active
                  ? 'bg-slate-900 border-slate-800 hover:border-amber-500/50 shadow-xl'
                  : 'bg-slate-950 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  <span className="font-mono font-black text-lg text-white tracking-wider">
                    {v.code}
                  </span>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  v.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {v.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xl font-black text-amber-400">
                  {v.discount_type === 'percent' ? `${v.discount_value}% OFF` : `৳${Number(v.discount_value).toLocaleString()} OFF`}
                </p>
                <p className="text-xs text-slate-400">
                  Min spend: <strong className="text-slate-300">৳{Number(v.min_spend || 0).toLocaleString()}</strong>
                </p>
                {v.description && (
                  <p className="text-[11px] text-slate-500 italic mt-1">{v.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleToggleActive(v)}
                  className={`text-[11px] font-bold ${v.is_active ? 'text-amber-400 hover:underline' : 'text-emerald-400 hover:underline'}`}
                >
                  {v.is_active ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(v)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg"
                    title="Edit Voucher"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-900 text-rose-400 rounded-lg"
                    title="Delete Voucher"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 text-white animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingVoucher ? 'Edit Voucher Code' : 'Create New Voucher'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Voucher Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ANSAR10 or EID2026"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-mono uppercase font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Discount Type *</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Flat Amount (৳ BDT)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 10 or 300"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Minimum Order Amount (BDT)</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={formData.min_spend}
                  onChange={(e) => setFormData({ ...formData, min_spend: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 10% instant discount on orders above ৳1000"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-700 bg-slate-800"
                  />
                  <span>Active & Usable by Customers</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-slate-950 font-black text-xs rounded-xl shadow-lg"
                >
                  {actionLoading ? 'Saving...' : editingVoucher ? 'Update Voucher' : 'Save Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
