import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Key, 
  Phone, 
  Mail, 
  User, 
  Sparkles, 
  Layers, 
  ShoppingBag, 
  Package, 
  Users, 
  MessageSquare, 
  Settings, 
  LayoutDashboard, 
  Check, 
  Lock, 
  Eye, 
  EyeOff,
  UserX,
  ToggleLeft,
  ToggleRight,
  RotateCcw
} from 'lucide-react';

const PERMISSION_GROUPS = [
  {
    category: 'ড্যাশবোর্ড ও আর্থিক হিসাব (Dashboard)',
    icon: LayoutDashboard,
    permissions: [
      { key: 'dashboard.view', label: 'ড্যাশবোর্ড ভিউ', desc: 'অর্ডার সংখ্যা, গ্রাহক ও সার্বিক পরিসংখ্যান দেখা' },
      { key: 'dashboard.revenue', label: 'মোট রেভিনিউ ও আর্থিক হিসাব', desc: 'মোট বিক্রয়, আজকের ও সাপ্তাহিক টাকার হিসাব দেখা' }
    ]
  },
  {
    category: 'অর্ডার ও কুরিয়ার ট্র্যাকিং (Orders)',
    icon: Package,
    permissions: [
      { key: 'orders.view', label: 'অর্ডার তালিকা ও ভিউ', desc: 'সকল কাস্টমার অর্ডার ও বিস্তারিত দেখা' },
      { key: 'orders.status_update', label: 'অর্ডার স্ট্যাটাস পরিবর্তন', desc: 'অর্ডার কনফার্ম, শিপড, ডেলিভার্ড বা ক্যানসেল করা' },
      { key: 'orders.courier_link', label: 'কুরিয়ার ট্র্যাকিং ও লিংক', desc: 'কুরিয়ার ট্র্যাকিং কোড ও চালান লিংক যুক্ত/পরিবর্তন করা' }
    ]
  },
  {
    category: 'পণ্য ও ইনভেন্টরি (Products & Inventory)',
    icon: ShoppingBag,
    permissions: [
      { key: 'products.view', label: 'পণ্যের তালিকা দেখা', desc: 'সকল পণ্যের তালিকা ও বর্তমান স্টক দেখা' },
      { key: 'products.create', label: 'নতুন পণ্য আপলোড', desc: 'নতুন সুগন্ধি বা পণ্য সাইটে যুক্ত করা' },
      { key: 'products.edit', label: 'পণ্য ও স্টক এডিট', desc: 'পণ্যের দাম, ডিসকাউন্ট ও স্টক পরিবর্তন করা' },
      { key: 'products.delete', label: 'পণ্য ডিলিট', desc: 'সাইট থেকে পণ্য স্থায়ীভাবে মুছে ফেলা' }
    ]
  },
  {
    category: 'ক্যাটেগরি ও ভাউচার (Categories & Vouchers)',
    icon: Layers,
    permissions: [
      { key: 'categories.manage', label: 'ক্যাটেগরি নিয়ন্ত্রণ', desc: 'ক্যাটেগরি ও সাব-ক্যাটেগরি তৈরি, সাজানো ও ডিলিট' },
      { key: 'vouchers.manage', label: 'ভাউচার ও কুপন', desc: 'ডিসকাউন্ট প্রোমোকোড তৈরি ও সক্রিয়/নিষ্ক্রিয় করা' }
    ]
  },
  {
    category: 'গ্রাহক ও অ্যাক্টিভিটি (Customer Management)',
    icon: Users,
    permissions: [
      { key: 'customers.view', label: 'গ্রাহক তালিকা ও প্রোফাইল', desc: 'গ্রাহকদের সম্পূর্ণ তথ্য ও অর্ডার অ্যাক্টিভিটি দেখা' },
      { key: 'customers.block', label: 'গ্রাহক ব্লক / আনব্লক', desc: 'অপ্রীতিকর গ্রাহককে সাসপেন্ড বা আনব্লক করা' },
      { key: 'customers.edit_limit', label: 'পয়েন্ট ও ঋণ লিমিট এডিট', desc: 'ভিআইপি পয়েন্ট ও করযে হাসানা লিমিট বাড়ানো/কমানো' },
      { key: 'customers.delete', label: 'গ্রাহক অ্যাকাউন্ট ডিলিট', desc: 'গ্রাহকের অ্যাকাউন্ট স্থায়ীভাবে ডিলিট করা' },
      { key: 'customers.qard_applications', label: 'করযে হাসানা আবেদন', desc: 'গ্রাহকের সুদমুক্ত ঋণের আবেদন অনুমোদন/বাতিল' },
      { key: 'customers.loyalty_applications', label: 'লয়ালটি কার্ড আবেদন', desc: 'গ্রাহকের ভিআইপি মেম্বারশিপ আবেদন অনুমোদন' },
      { key: 'customers.appeals', label: 'আপিল পর্যালোচনা ও নিষ্পত্তি', desc: 'অ্যাকাউন্ট সাসপেনশন ও ডিলিট আপিল নিষ্পত্তি করা' }
    ]
  },
  {
    category: 'লাইভ সাপোর্ট ও সেটিংস (Support & CMS)',
    icon: MessageSquare,
    permissions: [
      { key: 'chat.manage', label: 'লাইভ চ্যাট সাপোর্ট ডেস্ক', desc: 'কাস্টমারদের সাথে সরাসরি লাইভ চ্যাটে কথা বলা' },
      { key: 'settings.manage', label: 'সাইট সেটিংস ও ব্যানার', desc: 'ব্যানার, বিকাশ/নগদ নম্বর ও গ্লোবাল কনফিগ পরিবর্তন' }
    ]
  },
  {
    category: 'রিফান্ড ও রিটার্ন ডেস্ক (Refunds & Returns)',
    icon: RotateCcw,
    permissions: [
      { key: 'refunds.manage', label: 'রিফান্ড আবেদন ও প্রসেসিং', desc: 'সকল কাস্টমার রিফান্ড আবেদন পর্যালোচনা, অনুমোদন ও প্রসেসিং করা' },
      { key: 'refunds.policy', label: 'রিফান্ড শর্তাবলী ও পলিসি', desc: 'রিফান্ড নীতিমালা, সময়সীমা ও প্রক্রিয়া এডিট ও সেভ করা' }
    ]
  }
];

const ROLE_PRESETS = [
  {
    id: 'all',
    title: 'ফুল এক্সেস (Sub-Admin)',
    roleName: 'সাব-অ্যাডমিন',
    perms: PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key))
  },
  {
    id: 'moderator',
    title: 'মডারেটর (Moderator)',
    roleName: 'মডারেটর',
    perms: [
      'dashboard.view',
      'orders.view',
      'orders.status_update',
      'products.view',
      'products.edit',
      'customers.view',
      'customers.appeals',
      'chat.manage'
    ]
  },
  {
    id: 'inventory',
    title: 'ইনভেন্টরি ম্যানেজার',
    roleName: 'ইনভেন্টরি ম্যানেজার',
    perms: [
      'dashboard.view',
      'products.view',
      'products.create',
      'products.edit',
      'products.delete',
      'categories.manage'
    ]
  },
  {
    id: 'support',
    title: 'কাস্টমার সাপোর্ট',
    roleName: 'কাস্টমার সাপোর্ট',
    perms: [
      'chat.manage',
      'orders.view',
      'customers.view',
      'customers.appeals'
    ]
  },
  {
    id: 'dispatch',
    title: 'অর্ডার ও ডেলিভারি',
    roleName: 'ডেলিভারি এক্সিকিউটিভ',
    perms: [
      'orders.view',
      'orders.status_update',
      'orders.courier_link'
    ]
  }
];

export default function AdminStaffManagement() {
  const { token, isSuperAdmin } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    custom_role: 'মডারেটর',
    permissions: []
  });

  // Delete confirmation modal state
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStaffList(data.staff || []);
      } else {
        setErrorMessage(data.message || 'স্টাফ তালিকা আনতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.error('Fetch staff error:', err);
      setErrorMessage('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && isSuperAdmin) {
      fetchStaff();
    }
  }, [token, isSuperAdmin]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      custom_role: 'মডারেটর',
      permissions: [
        'dashboard.view',
        'orders.view',
        'orders.status_update',
        'products.view',
        'products.edit',
        'customers.view',
        'chat.manage'
      ]
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff) => {
    setEditingId(staff.id);
    setFormData({
      name: staff.name || '',
      phone: staff.phone || '',
      email: staff.email || '',
      password: '', // Leave empty to keep existing password
      custom_role: staff.custom_role || 'মডারেটর',
      permissions: Array.isArray(staff.permissions) ? staff.permissions : []
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      custom_role: preset.roleName,
      permissions: preset.perms
    }));
  };

  const handleTogglePermission = (permKey) => {
    setFormData(prev => {
      const current = prev.permissions;
      if (current.includes(permKey)) {
        return { ...prev, permissions: current.filter(k => k !== permKey) };
      } else {
        return { ...prev, permissions: [...current, permKey] };
      }
    });
  };

  const handleToggleCategory = (group) => {
    const groupPermKeys = group.permissions.map(p => p.key);
    const allSelected = groupPermKeys.every(k => formData.permissions.includes(k));

    setFormData(prev => {
      let updated;
      if (allSelected) {
        // Uncheck all in group
        updated = prev.permissions.filter(k => !groupPermKeys.includes(k));
      } else {
        // Add missing from group
        const toAdd = groupPermKeys.filter(k => !prev.permissions.includes(k));
        updated = [...prev.permissions, ...toAdd];
      }
      return { ...prev, permissions: updated };
    });
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      if (!formData.name.trim()) throw new Error('স্টাফের নাম প্রদান করুন।');
      if (!formData.phone.trim()) throw new Error('মোবাইল নম্বর প্রদান করুন।');
      if (!editingId && (!formData.password || formData.password.length < 6)) {
        throw new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      }

      const url = editingId ? `/api/admin/staff/${editingId}` : '/api/admin/staff';
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        custom_role: formData.custom_role.trim() || 'মডারেটর',
        permissions: formData.permissions
      };
      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
      }

      showToast(data.message || 'স্টাফ অ্যাকাউন্ট সফলভাবে সংরক্ষণ করা হয়েছে!');
      setIsModalOpen(false);
      fetchStaff();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBlock = async (staff) => {
    try {
      const newStatus = !staff.is_blocked;
      const res = await fetch(`/api/admin/staff/${staff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_blocked: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(newStatus ? `"${staff.name}" অ্যাকাউন্ট স্থগিত করা হয়েছে।` : `"${staff.name}" অ্যাকাউন্ট সক্রিয় করা হয়েছে।`);
        setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, is_blocked: newStatus } : s));
      } else {
        setErrorMessage(data.message);
      }
    } catch (err) {
      console.error('Toggle block error:', err);
      setErrorMessage('স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে।');
    }
  };

  const handleDeleteStaff = async () => {
    if (!deletingStaff) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/staff/${deletingStaff.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`"${deletingStaff.name}" অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।`);
        setStaffList(prev => prev.filter(s => s.id !== deletingStaff.id));
        setDeletingStaff(null);
      } else {
        setErrorMessage(data.message);
      }
    } catch (err) {
      console.error('Delete staff error:', err);
      setErrorMessage('অ্যাকাউন্ট মুছতে সমস্যা হয়েছে।');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredStaff = staffList.filter(s => {
    const q = searchTerm.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.phone || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.custom_role || '').toLowerCase().includes(q)
    );
  });

  if (!isSuperAdmin) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">প্রবেশাধিকার সংরক্ষিত</h2>
        <p className="text-xs">শুধুমাত্র মূল সুপার অ্যাডমিন স্টাফ অ্যাকাউন্ট ও পারমিশন কন্ট্রোল করতে পারবেন।</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/90 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 border border-emerald-400/40 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <span className="text-xs tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              স্টাফ ও মডারেটর পারমিশন কন্ট্রোল
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            মূল অ্যাডমিন হিসেবে আপনার সুবিধামতো সাব-অ্যাডমিন, মডারেটর বা ইনভেন্টরি কিপার তৈরি করুন এবং নির্দিষ্ট প্রতিটি পার্ট আলাদা আলাদাভাবে অনুমতি দিন।
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ নতুন সাব-অ্যাডমিন / স্টাফ যুক্ত করুন</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-rose-400 text-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Counter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="নাম, ফোন বা রোল দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold self-end sm:self-center">
          মোট অনুমোদিত স্টাফ: <span className="text-amber-400 font-bold">{staffList.length}</span> জন
        </div>
      </div>

      {/* Staff Members List */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">স্টাফ তালিকা লোড হচ্ছে...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">কোনো সাব-অ্যাডমিন বা স্টাফ একাউন্ট পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500">
              উপরের "+ নতুন সাব-অ্যাডমিন / স্টাফ যুক্ত করুন" বাটনে ক্লিক করে নতুন স্টাফ একাউন্ট তৈরি করুন।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-4 px-5">স্টাফ ও যোগাযোগের তথ্য</th>
                  <th className="py-4 px-4">পদবী / কাস্টম রোল</th>
                  <th className="py-4 px-4">অনুমোদিত পারমিশন</th>
                  <th className="py-4 px-4">অ্যাকাউন্ট স্ট্যাটাস</th>
                  <th className="py-4 px-5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredStaff.map((staff) => {
                  const perms = Array.isArray(staff.permissions) ? staff.permissions : [];
                  const isAll = perms.includes('*') || perms.length >= 17;
                  return (
                    <tr key={staff.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-sm shrink-0">
                            {staff.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center space-x-1.5">
                              <span>{staff.name}</span>
                              {staff.is_blocked && (
                                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30">
                                  স্থগিত
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                              <span className="flex items-center space-x-1">
                                <Phone className="w-3 h-3 text-slate-500" />
                                <span>{staff.phone}</span>
                              </span>
                              {staff.email && (
                                <span className="flex items-center space-x-1">
                                  <Mail className="w-3 h-3 text-slate-500" />
                                  <span>{staff.email}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {staff.custom_role || 'মডারেটর'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {isAll ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ✓ ফুল এক্সেস (সব পারমিশন)
                          </span>
                        ) : perms.length === 0 ? (
                          <span className="text-[11px] text-slate-500 italic">কোনো পারমিশন নেই</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                              {perms.length} টি পারমিশন সক্রিয়
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[180px] self-center">
                              ({perms.slice(0, 3).join(', ')}{perms.length > 3 ? '...' : ''})
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleBlock(staff)}
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                            staff.is_blocked
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                          }`}
                          title={staff.is_blocked ? 'সক্রিয় করতে ক্লিক করুন' : 'স্থগিত করতে ক্লিক করুন'}
                        >
                          {staff.is_blocked ? (
                            <>
                              <ToggleLeft className="w-3.5 h-3.5" />
                              <span>নিষ্ক্রিয়</span>
                            </>
                          ) : (
                            <>
                              <ToggleRight className="w-3.5 h-3.5" />
                              <span>সক্রিয়</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(staff)}
                            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors"
                            title="পারমিশন ও তথ্য এডিট করুন"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingStaff(staff)}
                            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                            title="অ্যাকাউন্ট ডিলিট করুন"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* CREATE / EDIT STAFF MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center space-x-3">
                <span className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-black text-white">
                    {editingId ? 'স্টাফ পারমিশন ও তথ্য এডিট করুন' : 'নতুন সাব-অ্যাডমিন / স্টাফ একাউন্ট তৈরি'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    সুনির্দিষ্ট পারমিশন বাছাই করে স্টাফের অ্যাক্সেস সীমা নির্ধারণ করুন।
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStaff} className="space-y-6">
              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    স্টাফের পূর্ণ নাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মোঃ সাব্বির আহমেদ"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ১১ ডিজিটের মোবাইল নম্বর (লগইন আইডি) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    placeholder="যেমন: 017xxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ইমেইল ঠিকানা (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    placeholder="staff@alansar.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>{editingId ? 'নতুন পাসওয়ার্ড (পরিবর্তন না করলে খালি রাখুন)' : 'লগইন পাসওয়ার্ড *'}</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      {showPassword ? 'লুকান' : 'দেখান'}
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingId}
                      placeholder={editingId ? 'পরিবর্তন করতে চাইলে নতুন পাসওয়ার্ড লিখুন' : 'কমপক্ষে ৬ অক্ষর'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
                    />
                    <Key className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Custom Designation & Role Presets */}
              <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-white">
                      পদবীর নাম (Custom Role Title) *
                    </label>
                    <p className="text-[11px] text-slate-400">
                      আপনার ইচ্ছামতো যেকোনো পদবীর নাম লিখুন (যেমন: মডারেটর, ইনভেন্টরি কিপার, ইত্যাদি)
                    </p>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="মডারেটর"
                    value={formData.custom_role}
                    onChange={(e) => setFormData({ ...formData, custom_role: e.target.value })}
                    className="w-full md:w-56 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500/80"
                  />
                </div>

                {/* Quick 1-Click Role Presets */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    এক ক্লিকে প্রিসেট পারমিশন সেট করুন:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {ROLE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-900 hover:bg-amber-500/10 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/30 transition-colors"
                      >
                        ⚡ {preset.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Granular Permissions Checklist Grouped by Category */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    নির্দিষ্ট পারমিশন তালিকা ({formData.permissions.length} টি নির্বাচিত)
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, permissions: PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key)) })}
                      className="text-[10px] font-bold text-amber-400 hover:underline"
                    >
                      সব সিলেক্ট করুন
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, permissions: [] })}
                      className="text-[10px] font-bold text-slate-400 hover:underline"
                    >
                      সব আনচেক করুন
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PERMISSION_GROUPS.map((group, gIdx) => {
                    const GroupIcon = group.icon;
                    const groupKeys = group.permissions.map(p => p.key);
                    const allGroupSelected = groupKeys.every(k => formData.permissions.includes(k));

                    return (
                      <div
                        key={gIdx}
                        className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between"
                      >
                        <div>
                          {/* Group Header */}
                          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800/80">
                            <div className="flex items-center space-x-2">
                              <GroupIcon className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-bold text-white">{group.category}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleCategory(group)}
                              className="text-[10px] font-bold text-slate-400 hover:text-amber-400 transition-colors"
                            >
                              {allGroupSelected ? 'আনচেক' : 'সব দিন'}
                            </button>
                          </div>

                          {/* Individual Checkboxes */}
                          <div className="space-y-2.5">
                            {group.permissions.map((perm) => {
                              const isChecked = formData.permissions.includes(perm.key);
                              return (
                                <label
                                  key={perm.key}
                                  className={`flex items-start space-x-2.5 p-2 rounded-xl cursor-pointer transition-colors ${
                                    isChecked
                                      ? 'bg-amber-500/10 border border-amber-500/30'
                                      : 'hover:bg-slate-900 border border-transparent'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleTogglePermission(perm.key)}
                                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                  />
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-slate-200 block">
                                      {perm.label}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block leading-tight">
                                      {perm.desc}
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'সংরক্ষণ হচ্ছে...' : editingId ? 'আপডেট সম্পন্ন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">স্টাফ অ্যাকাউন্ট ডিলিট নিশ্চিতকরণ</h3>
              <p className="text-xs text-slate-400 mt-1">
                আপনি কি নিশ্চিতভাবে <span className="font-bold text-amber-400">"{deletingStaff.name}"</span> ({deletingStaff.custom_role}) অ্যাকাউন্টটি মুছে ফেলতে চান? এই কর্মীকে অ্যাডমিন প্যানেল থেকে স্থায়ীভাবে সরিয়ে দেওয়া হবে।
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStaff(null)}
                disabled={deleteLoading}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                না, ফিরে যান
              </button>
              <button
                type="button"
                onClick={handleDeleteStaff}
                disabled={deleteLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, স্থায়ীভাবে ডিলিট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
