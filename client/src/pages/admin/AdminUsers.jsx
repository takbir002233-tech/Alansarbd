import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  User,
  Search, 
  ShieldBan, 
  ShieldCheck, 
  Edit, 
  MapPin, 
  Phone, 
  Mail, 
  ShoppingBag, 
  AlertCircle,
  X,
  HandHeart,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  Check,
  RefreshCw,
  Eye,
  Trash2,
  Package,
  Calendar,
  TrendingUp,
  PackageCheck
} from 'lucide-react';

export default function AdminUsers() {
  const { token, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // users, qard, loyalty, appeals
  const [users, setUsers] = useState([]);
  const [qardApps, setQardApps] = useState([]);
  const [loyaltyApps, setLoyaltyApps] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const canViewUsers = hasPermission('customers.view');
  const canViewQard = hasPermission('customers.qard_applications');
  const canViewLoyalty = hasPermission('customers.loyalty_applications');
  const canViewAppeals = hasPermission('customers.appeals');

  // Auto-switch to first permitted tab
  useEffect(() => {
    const allowed = [];
    if (canViewUsers) allowed.push('users');
    if (canViewQard) allowed.push('qard');
    if (canViewLoyalty) allowed.push('loyalty');
    if (canViewAppeals) allowed.push('appeals');
    if (allowed.length > 0 && !allowed.includes(activeTab)) {
      setActiveTab(allowed[0]);
    }
  }, [canViewUsers, canViewQard, canViewLoyalty, canViewAppeals, activeTab]);

  // User Profile & Activity View Modal
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // User Deletion Modal State
  const [deletingUser, setDeletingUser] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  
  // User Edit Modal
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    role: 'user',
    loyalty_points: 100,
    loyalty_tier: 'Gold VIP',
    loyalty_card_number: '',
    qard_credit_limit: 5000
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Qard Custom Approval Modal
  const [approvingApp, setApprovingApp] = useState(null);
  const [approvedLimitInput, setApprovedLimitInput] = useState(5000);
  const [approvedNotesInput, setApprovedNotesInput] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const promises = [];

      if (canViewUsers) {
        promises.push(
          fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setUsers(d.users || []); })
            .catch(() => {})
        );
      }
      if (canViewQard) {
        promises.push(
          fetch('/api/admin/qard-applications', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setQardApps(d.applications || []); })
            .catch(() => {})
        );
      }
      if (canViewAppeals) {
        promises.push(
          fetch('/api/admin/account-appeals', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setAppeals(d.appeals || []); })
            .catch(() => {})
        );
      }
      if (canViewLoyalty) {
        promises.push(
          fetch('/api/admin/loyalty-applications', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setLoyaltyApps(d.applications || []); })
            .catch(() => {})
        );
      }

      await Promise.all(promises);
    } catch (err) {
      console.error('Error fetching admin users data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, canViewUsers, canViewQard, canViewAppeals, canViewLoyalty]);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleToggleBlock = async (userId, userName, currentBlocked) => {
    const actionName = currentBlocked ? 'সক্রিয় / আনব্লক' : 'স্থগিত / সাসপেন্ড';
    if (!confirm(`আপনি কি নিশ্চিত যে গ্রাহক "${userName}" কে ${actionName} করতে চান?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-block`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, is_blocked: data.user.is_blocked } : u))
        );
        showToast(`গ্রাহক "${userName}" সফলভাবে ${currentBlocked ? 'আনব্লক' : 'সাসপেন্ড'} করা হয়েছে!`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error toggling block state:', err);
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      role: user.role || 'user',
      loyalty_points: user.loyalty_points || 100,
      loyalty_tier: user.loyalty_tier || 'Gold VIP',
      loyalty_card_number: user.loyalty_card_number || `ANSAR-VIP-${user.id.slice(0, 4)}-2026`,
      qard_credit_limit: user.qard_credit_limit || 5000
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();
      if (data.success) {
        setEditingUser(null);
        showToast(`গ্রাহক "${editFormData.name}" এর তথ্য ও লয়ালটি লিমিট আপডেট হয়েছে!`);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error updating user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // View User Full Profile & Activity History
  const handleOpenUserProfile = async (user) => {
    setViewingUser(user);
    setViewingDetails(null);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setViewingDetails(data);
      }
    } catch (err) {
      console.error('Error loading user details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Confirm and Execute User Deletion
  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`গ্রাহক "${deletingUser.name}" এর অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে!`);
        setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
        if (viewingUser && viewingUser.id === deletingUser.id) {
          setViewingUser(null);
        }
        setDeletingUser(null);
      } else {
        alert(data.message || 'অ্যাকাউন্ট ডিলিট করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('অ্যাকাউন্ট ডিলিট করার সময় ত্রুটি ঘটেছে');
    } finally {
      setDeletingLoading(false);
    }
  };


  // Open Qard Approval Modal
  const handleOpenQardApprove = (app) => {
    setApprovingApp(app);
    setApprovedLimitInput(app.requested_limit || 5000);
    setApprovedNotesInput(`এনআইডি (${app.nid_number}) সফলভাবে যাচাইকৃত। ৳${(app.requested_limit || 5000).toLocaleString()} করযে হাসানা লিমিট মঞ্জুর করা হলো।`);
  };

  // Submit Qard Approval
  const handleSubmitQardApprove = async (e) => {
    e.preventDefault();
    if (!approvingApp) return;

    try {
      const res = await fetch(`/api/admin/qard-applications/${approvingApp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'Approved',
          notes: approvedNotesInput,
          requested_limit: Number(approvedLimitInput)
        })
      });
      const data = await res.json();
      if (data.success) {
        setApprovingApp(null);
        showToast(`আবেদনকারী "${approvingApp.name}" এর করযে হাসানা ৳${Number(approvedLimitInput).toLocaleString()} লিমিট অনুমোদিত হয়েছে!`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reject Qard Application
  const handleQardReject = async (appId, name) => {
    const customReason = prompt(`"${name}" এর করযে হাসানা আবেদনটি প্রত্যাখ্যানের কারণ লিখুন (ঐচ্ছিক):`, 'জাতীয় পরিচয়পত্র তথ্যে অসঙ্গতি থাকায় আবেদনটি বাতিল করা হয়েছে।');
    if (customReason === null) return;

    try {
      const res = await fetch(`/api/admin/qard-applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Rejected', notes: customReason.trim() || 'জাতীয় পরিচয়পত্র তথ্যে অসঙ্গতি থাকায় আবেদনটি বাতিল করা হয়েছে।' })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`"${name}" এর করযে হাসানা আবেদনটি প্রত্যাখ্যান করা হয়েছে।`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Account Appeal Status Update (1-click Unblock or Approve Deletion)
  const handleAppealStatusUpdate = async (appealId, status, userName, isDeletionAppeal = false) => {
    if (isDeletionAppeal && status === 'Resolved') {
      const confirmDelete = window.confirm(`আপনি কি নিশ্চিত যে গ্রাহক "${userName}" এর অ্যাকাউন্ট বাতিলের আবেদন অনুমোদন করে অ্যাকাউন্টটি চিরতরে ডিলিট করতে চান?`);
      if (!confirmDelete) return;
    }

    let defaultReply = '';
    if (isDeletionAppeal) {
      defaultReply = status === 'Resolved'
        ? 'অ্যাকাউন্ট বাতিলের আবেদন অনুমোদিত হয়েছে এবং অ্যাকাউন্টটি সম্পূর্ণ মুছে ফেলা হয়েছে।'
        : 'অ্যাকাউন্ট বাতিলের আবেদনটি বাতিল করা হলো।';
    } else {
      defaultReply = status === 'Resolved'
        ? 'অ্যাকাউন্ট রিভিউ সফল হয়েছে এবং অ্যাকাউন্টটি সম্পূর্ণ সক্রিয় ও আনব্লক করা হয়েছে।'
        : 'আপিল পর্যালোচনা করে স্থগিতাদেশ বজায় রাখা হলো।';
    }

    try {
      const res = await fetch(`/api/admin/account-appeals/${appealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status, 
          admin_reply: defaultReply
        })
      });
      const data = await res.json();
      if (data.success) {
        if (isDeletionAppeal) {
          showToast(status === 'Resolved' ? `গ্রাহক "${userName}" এর আবেদন অনুমোদিত ও অ্যাকাউন্ট ডিলিট হয়েছে!` : `আপিলটি বাতিল করা হয়েছে।`);
        } else {
          showToast(status === 'Resolved' ? `গ্রাহক "${userName}" কে ১-ক্লিকে আনব্লক করা হয়েছে!` : `আপিলটি বাতিল করা হয়েছে।`);
        }
        fetchData();
      } else {
        alert(data.message || 'আপডেট করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      console.error('Error updating appeal:', err);
      alert('আপিল আপডেট করতে ত্রুটি ঘটেছে');
    }
  };

  // Loyalty Card Status Update (1-click Approve / Reject)
  const handleLoyaltyStatusUpdate = async (appId, status, applicantName) => {
    let customNotes = status === 'Approved' 
      ? 'আবেদন যাচাই সম্পন্ন হয়েছে এবং ডিজিটাল লয়ালটি কার্ড সক্রিয় করা হয়েছে।' 
      : 'তথ্য অসম্পূর্ণ থাকায় আবেদনটি বাতিল করা হয়েছে।';

    if (status !== 'Approved') {
      const inputReason = prompt(`"${applicantName}" এর লয়ালটি কার্ড আবেদন বাতিলের কারণ লিখুন (ঐচ্ছিক):`, customNotes);
      if (inputReason === null) return;
      customNotes = inputReason.trim() || customNotes;
    }

    try {
      const res = await fetch(`/api/admin/loyalty-applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status, 
          notes: customNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(status === 'Approved' 
          ? `গ্রাহক "${applicantName}" এর লয়ালটি কার্ড অনুমোদন করা হয়েছে ও সক্রিয় হয়েছে!` 
          : `গ্রাহক "${applicantName}" এর লয়ালটি আবেদনটি বাতিল করা হয়েছে।`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(
    u =>
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone || '').includes(searchTerm) ||
      (u.loyalty_card_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingQardCount = qardApps.filter(a => a.status === 'Pending').length;
  const pendingLoyaltyCount = loyaltyApps.filter(a => a.status === 'Pending').length;
  const pendingAppealsCount = appeals.filter(a => a.status === 'Under Review').length;

  return (
    <div className="space-y-6 animate-in fade-in max-w-7xl font-sans">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center space-x-2 animate-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-200" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">মাস্টার কাস্টমার কন্ট্রোল</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">গ্রাহক তালিকা, ভিআইপি লয়ালটি ও করযে হাসানা আবেদন</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            লয়ালটি পয়েন্ট/কার্ড এডিট, করযে হাসানা NID আবেদন যাচাই ও স্থগিত অ্যাকাউন্টের আপিল নিষ্পত্তি করুন
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto shadow-xl">
          {canViewUsers && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'users' ? 'bg-amber-600 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>গ্রাহক ও লয়ালটি ({users.length})</span>
            </button>
          )}

          {canViewQard && (
            <button
              onClick={() => setActiveTab('qard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'qard' ? 'bg-emerald-700 text-white shadow-md font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <HandHeart className="w-3.5 h-3.5" />
              <span>করযে হাসানা আবেদন</span>
              {pendingQardCount > 0 && (
                <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {pendingQardCount}
                </span>
              )}
            </button>
          )}

          {canViewLoyalty && (
            <button
              onClick={() => setActiveTab('loyalty')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'loyalty' ? 'bg-amber-600 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>লয়ালটি কার্ড আবেদন ({loyaltyApps.length})</span>
              {pendingLoyaltyCount > 0 && (
                <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {pendingLoyaltyCount}
                </span>
              )}
            </button>
          )}

          {canViewAppeals && (
            <button
              onClick={() => setActiveTab('appeals')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'appeals' ? 'bg-rose-700 text-white shadow-md font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>আপিল আবেদন</span>
              {pendingAppealsCount > 0 && (
                <span className="bg-rose-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black animate-pulse">
                  {pendingAppealsCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: USERS & VIP LOYALTY CARDS */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Search Bar & Refresh */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="গ্রাহকের নাম, ইমেইল, ফোন বা কার্ড নম্বর খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 text-xs rounded-2xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-md"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>

            <button
              onClick={fetchData}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-800 transition-colors cursor-pointer"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">গ্রাহক ও কার্ড নম্বর</th>
                    <th className="p-4">যোগাযোগ</th>
                    <th className="p-4">ভিআইপি লয়ালটি টায়ার ও পয়েন্ট</th>
                    <th className="p-4">করযে হাসানা ক্রেডিট লিমিট</th>
                    <th className="p-4">মোট কেনাকাটা</th>
                    <th className="p-4">স্ট্যাটাস</th>
                    <th className="p-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-700 to-emerald-900 text-white flex items-center justify-center font-black shadow-md border border-amber-500/30">
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-white flex items-center">
                              {u.name}
                              {u.role === 'admin' && (
                                <span className="ml-2 px-2 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded-md border border-amber-500/30">
                                  ADMIN
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-amber-300 font-mono font-bold">
                              💳 {u.loyalty_card_number || `ANSAR-VIP-${u.id.slice(0, 4)}-2026`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-mono text-slate-200">{u.phone || 'ফোন নেই'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-black text-amber-400 block text-xs">
                            {u.loyalty_points || 100} পয়েন্ট
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 inline-block">
                            ⭐ {u.loyalty_tier || 'Gold VIP'}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-mono font-black text-emerald-400 text-xs block">
                          ৳{(u.qard_credit_limit || 5000).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {u.qard_status === 'Approved' ? '✓ অনুমোদিত স্কিম' : 'স্ট্যান্ডার্ড লিমিট'}
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-white">৳{(u.total_spent || 0).toLocaleString()}</p>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-300 font-mono font-bold">{u.orders_count || 0} টি অর্ডার</span>
                          {u.cancelled_orders_count > 0 && (
                            <span className="text-[10px] text-rose-400 font-mono font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/25" title="গ্রাহক বাতিল করেছেন">
                              {u.cancelled_orders_count} বাতিল
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.is_blocked ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {u.is_blocked ? '🚫 স্থগিত / সাসপেন্ড' : '✓ সক্রিয় একাউন্ট'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* View Profile & Order Activity Button */}
                          <button
                            onClick={() => handleOpenUserProfile(u)}
                            className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 transition-colors flex items-center space-x-1 cursor-pointer"
                            title="গ্রাহকের প্রোফাইল ও অর্ডার অ্যাক্টিভিটি দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>প্রোফাইল</span>
                          </button>

                          {hasPermission('customers.block') && u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleBlock(u.id, u.name, u.is_blocked)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                u.is_blocked
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/50'
                              }`}
                            >
                              {u.is_blocked ? 'আনব্লক' : 'সাসপেন্ড'}
                            </button>
                          )}

                          {hasPermission('customers.edit_limit') && (
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                              title="তথ্য ও লিমিট এডিট করুন"
                            >
                              এডিট
                            </button>
                          )}

                          {hasPermission('customers.delete') && u.role !== 'admin' && (
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="p-1.5 bg-slate-800/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700 hover:border-rose-700/50 transition-colors cursor-pointer"
                              title="অ্যাকাউন্ট স্থায়ীভাবে ডিলিট করুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QARD-E-HASANA APPLICATIONS DESK */}
      {activeTab === 'qard' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl border border-emerald-900/40 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center">
                  <HandHeart className="w-4 h-4 mr-2 text-emerald-400" /> করযে হাসানা NID আবেদন সমূহ ({qardApps.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  গ্রাহকদের জমা দেওয়া জাতীয় পরিচয়পত্র (NID) নম্বর ও মাসিক আয় যাচাই করে ক্রেডিট লিমিট অনুমোদন করুন।
                </p>
              </div>

              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 self-start sm:self-auto">
                অপেক্ষমাণ আবেদন: {pendingQardCount} টি
              </span>
            </div>

            {qardApps.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center">এখনো কোনো করযে হাসানা আবেদন জমা পড়েনি।</p>
            ) : (
              <div className="space-y-4">
                {qardApps.map(app => (
                  <div key={app.id} className="p-5 sm:p-6 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-4 text-xs shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700/80 gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm">{app.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">({new Date(app.created_at).toLocaleDateString('bn-BD')})</span>
                        </div>
                        <p className="text-slate-400 font-mono mt-0.5">
                          মোবাইল: <strong className="text-slate-200">{app.phone}</strong> • NID: <strong className="text-amber-300 font-black">{app.nid_number}</strong>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          app.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        }`}>
                          {app.status === 'Approved' ? '✓ অনুমোদিত' : app.status === 'Rejected' ? '✕ প্রত্যাখ্যাত' : '⏳ যাচাইয়ের অপেক্ষায়'}
                        </span>

                        {app.status === 'Pending' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenQardApprove(app)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                            >
                              ✓ অনুমোদন করুন
                            </button>
                            <button
                              onClick={() => handleQardReject(app.id, app.name)}
                              className="px-3.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold rounded-xl border border-rose-700/50 cursor-pointer transition-colors"
                            >
                              ✕ বাতিল
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60">
                        <span className="text-slate-400 block text-[10px]">কাঙ্ক্ষিত ঋণ লিমিট:</span>
                        <span className="font-black text-emerald-400 text-sm">৳{(app.requested_limit || 5000).toLocaleString()}</span>
                      </div>

                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60">
                        <span className="text-slate-400 block text-[10px]">মাসিক আয় / পেশা:</span>
                        <span className="font-bold text-slate-200">{app.monthly_income ? `৳${Number(app.monthly_income).toLocaleString()}` : 'উল্লেখ নেই'}</span>
                      </div>

                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60">
                        <span className="text-slate-400 block text-[10px]">ঠিকানা:</span>
                        <span className="text-slate-200">{app.address || 'N/A'}</span>
                      </div>

                      {app.payment_amount > 0 && (
                        <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-700/60 sm:col-span-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-amber-400 font-bold text-[11px]">
                              💳 আবেদন ফি: ৳{app.payment_amount} ({app.payment_method?.toUpperCase() || 'MFS'})
                            </span>
                            <span className="text-slate-300 font-mono text-[11px]">
                              প্রেরক: <strong className="text-white">{app.sender_number || 'N/A'}</strong>
                            </span>
                            <span className="text-slate-300 font-mono text-[11px]">
                              TrxID: <strong className="text-amber-300 bg-black/40 px-2 py-0.5 rounded font-mono font-bold">{app.transaction_id || 'N/A'}</strong>
                            </span>
                          </div>
                        </div>
                      )}

                      {app.notes && (
                        <div className="sm:col-span-3 p-3 bg-slate-900 rounded-xl border border-slate-700 text-amber-200 leading-relaxed">
                          <strong>অঙ্গীকার ও আবেদনকারীর বার্তা:</strong> {app.notes}
                        </div>
                      )}

                      {app.admin_notes && (
                        <div className="sm:col-span-3 p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-800/40 text-emerald-300">
                          <strong>অ্যাডমিন নোট:</strong> {app.admin_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: LOYALTY CARD APPLICATIONS */}
      {activeTab === 'loyalty' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl border border-amber-900/40 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-amber-400" /> আল আনসার ডিজিটাল লয়ালটি কার্ড আবেদন সমূহ ({loyaltyApps.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  গ্রাহকদের জমা দেওয়া আবেদন যাচাই করে অনুমোদন করুন। অনুমোদনের সাথে সাথে গ্রাহকের প্রোফাইলে বারকোডসহ লাক্সারি কার্ড সক্রিয় হয়ে যাবে।
                </p>
              </div>

              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 self-start sm:self-auto">
                অপেক্ষমাণ আবেদন: {pendingLoyaltyCount} টি
              </span>
            </div>

            {loyaltyApps.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center">এখনো কোনো লয়ালটি কার্ড আবেদন জমা পড়েনি।</p>
            ) : (
              <div className="space-y-4">
                {loyaltyApps.map(app => (
                  <div key={app.id} className="p-5 sm:p-6 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-4 text-xs shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700/80 gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm">{app.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">({new Date(app.created_at).toLocaleDateString('bn-BD')})</span>
                        </div>
                        <p className="text-slate-400 font-mono mt-0.5">
                          মোবাইল: <strong className="text-slate-200">{app.phone}</strong>
                          {app.email && <span> • ইমেইল: <strong className="text-slate-200">{app.email}</strong></span>}
                          {app.nid_number && <span> • NID: <strong className="text-amber-300 font-bold">{app.nid_number}</strong></span>}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          app.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        }`}>
                          {app.status === 'Approved' ? '✓ কার্ড সক্রিয় ও অনুমোদিত' : app.status === 'Rejected' ? '✕ প্রত্যাখ্যাত' : '⏳ অনুমোদনের অপেক্ষায়'}
                        </span>

                        {app.status === 'Pending' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleLoyaltyStatusUpdate(app.id, 'Approved', app.name)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl shadow-md cursor-pointer transition-all"
                            >
                              ✓ অনুমোদন ও কার্ড সক্রিয় করুন
                            </button>
                            <button
                              onClick={() => handleLoyaltyStatusUpdate(app.id, 'Rejected', app.name)}
                              className="px-3.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold rounded-xl border border-rose-700/50 cursor-pointer transition-colors"
                            >
                              ✕ বাতিল
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60">
                        <span className="text-slate-400 block text-[10px]">ডেলিভারি ঠিকানা:</span>
                        <span className="font-bold text-slate-200">{app.address || 'ঠিকানা দেওয়া হয়নি'}</span>
                      </div>

                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60">
                        <span className="text-slate-400 block text-[10px]">শহর / জেলা:</span>
                        <span className="font-bold text-slate-200">{app.city || 'ঢাকা'}</span>
                      </div>

                      {app.admin_notes && (
                        <div className="sm:col-span-2 p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-800/40 text-emerald-300">
                          <strong>অ্যাডমিন নোট:</strong> {app.admin_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SUSPENDED ACCOUNT & DELETION APPEALS DESK */}
      {activeTab === 'appeals' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl border border-rose-900/40 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-rose-400" /> গ্রাহক আপিল ও অ্যাকাউন্ট বাতিলের আবেদন সমূহ ({appeals.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  স্থগিত একাউন্টের রিভিউ এবং VIP/করযে হাসানা গ্রাহকদের অ্যাকাউন্ট ডিলিট আপিল আবেদনসমূহ পর্যালোচনা করুন।
                </p>
              </div>

              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 self-start sm:self-auto">
                অপেক্ষমাণ আপিল: {pendingAppealsCount} টি
              </span>
            </div>

            {appeals.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center">কোনো আপিল বা অ্যাকাউন্ট বাতিলের আবেদন জমা নেই।</p>
            ) : (
              <div className="space-y-4">
                {appeals.map(appeal => {
                  const isDeletion = appeal.appeal_type === 'account_deletion';
                  return (
                    <div key={appeal.id} className={`p-5 sm:p-6 rounded-2xl border space-y-4 text-xs shadow-lg ${
                      isDeletion ? 'bg-slate-800/95 border-rose-900/60 ring-1 ring-rose-500/20' : 'bg-slate-800/80 border-slate-700'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700 gap-3">
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <h4 className="font-bold text-white text-sm">{appeal.user_name || 'গ্রাহক'}</h4>
                            {isDeletion ? (
                              <span className="text-[10px] font-black text-rose-300 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/40 flex items-center space-x-1">
                                <Trash2 className="w-3 h-3 text-rose-400" />
                                <span>অ্যাকাউন্ট ডিলিট আবেদন</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                                🔒 স্থগিত অ্যাকাউন্ট রিভিউ
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">({new Date(appeal.created_at).toLocaleDateString('bn-BD')})</span>
                          </div>
                          <p className="text-slate-400 font-mono mt-0.5">
                            ইমেইল / মোবাইল: <strong className="text-amber-300">{appeal.user_email || appeal.user_phone}</strong>
                          </p>
                        </div>

                        <div className="flex items-center space-x-2.5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            appeal.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            appeal.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          }`}>
                            {appeal.status === 'Resolved' 
                              ? (isDeletion ? '✓ ডিলিট সম্পন্ন' : '✓ নিষ্পত্তি (আনব্লকড)') 
                              : appeal.status === 'Rejected' 
                              ? '✕ বাতিল' 
                              : '⏳ পর্যালোচনার অপেক্ষায়'}
                          </span>

                          {appeal.status === 'Under Review' && (
                            <div className="flex items-center space-x-2">
                              {isDeletion ? (
                                <button
                                  onClick={() => handleAppealStatusUpdate(appeal.id, 'Resolved', appeal.user_name || 'গ্রাহক', true)}
                                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-md cursor-pointer transition-colors flex items-center space-x-1.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>✓ অনুমোদন ও ডিলিট</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAppealStatusUpdate(appeal.id, 'Resolved', appeal.user_name || 'গ্রাহক', false)}
                                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                                >
                                  ✓ ১-ক্লিকে আনব্লক করুন
                                </button>
                              )}
                              <button
                                onClick={() => handleAppealStatusUpdate(appeal.id, 'Rejected', appeal.user_name || 'গ্রাহক', isDeletion)}
                                className="px-3.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold rounded-xl border border-rose-700/50 cursor-pointer transition-colors"
                              >
                                ✕ বাতিল
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* If Account Deletion Appeal, show VIP Card and Qard status */}
                      {isDeletion && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-700/60 text-slate-300">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                              VIP কার্ড: <strong className="text-amber-300 font-mono">{appeal.loyalty_card_number || 'সক্রিয়'}</strong> (পয়েন্ট: <strong className="text-emerald-400">{appeal.loyalty_points || 0}</strong>)
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <HandHeart className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                              করযে হাসানা লিমিট: <strong className="text-emerald-300 font-mono">৳{(appeal.qard_limit || 0).toLocaleString()}</strong>
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 text-amber-100 leading-relaxed">
                        <strong className="text-amber-400 block mb-1">
                          {isDeletion ? 'অ্যাকাউন্ট বাতিলের কারণ ও গ্রাহকের আবেদন বার্তা:' : 'গ্রাহকের আপিল বার্তা ও ব্যাখ্যা:'}
                        </strong>
                        {appeal.reason}
                      </div>

                      {appeal.admin_reply && (
                        <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/40 text-emerald-300">
                          <strong>অ্যাডমিন উত্তর / স্ট্যাটাস:</strong> {appeal.admin_reply}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QARD APPROVAL MODAL */}
      {approvingApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center">
                <HandHeart className="w-4 h-4 mr-2 text-emerald-400" /> করযে হাসানা অনুমোদন ও ক্রেডিট নির্ধারণ
              </h3>
              <button onClick={() => setApprovingApp(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitQardApprove} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                <p className="font-bold text-white">{approvingApp.name} ({approvingApp.phone})</p>
                <p className="text-slate-400 font-mono">NID: <span className="text-amber-300 font-bold">{approvingApp.nid_number}</span></p>
                <p className="text-slate-400">কাঙ্ক্ষিত পরিমাণ: ৳{(approvingApp.requested_limit || 5000).toLocaleString()}</p>
              </div>

              <div>
                <label className="font-bold text-emerald-400 block mb-1">মঞ্জুরিকৃত করযে হাসানা ক্রেডিট লিমিট (টাকা) *</label>
                <input
                  type="number"
                  required
                  value={approvedLimitInput}
                  onChange={(e) => setApprovedLimitInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-emerald-300 font-mono font-black text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">অনুমোদন বার্তা / অ্যাডমিন নোট</label>
                <textarea
                  rows={2}
                  value={approvedNotesInput}
                  onChange={(e) => setApprovedNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApprovingApp(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg cursor-pointer"
                >
                  ✓ ক্রেডিট অনুমোদন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER & LOYALTY MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-amber-400" /> গ্রাহক তথ্য, ভিআইপি কার্ড ও করযে লিমিট পরিবর্তন
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">পূর্ণ নাম</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-amber-400 block mb-1">ভিআইপি লয়ালটি টায়ার</label>
                  <select
                    value={editFormData.loyalty_tier}
                    onChange={(e) => setEditFormData({ ...editFormData, loyalty_tier: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-amber-300 font-bold"
                  >
                    <option value="Silver Patron">Silver Patron</option>
                    <option value="Gold VIP">Gold VIP</option>
                    <option value="Platinum Royal">Platinum Royal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-amber-400 block mb-1">রিওয়ার্ড পয়েন্ট ব্যালেন্স</label>
                  <input
                    type="number"
                    value={editFormData.loyalty_points}
                    onChange={(e) => setEditFormData({ ...editFormData, loyalty_points: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-amber-300 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-emerald-400 block mb-1">করযে হাসানা ক্রেডিট লিমিট (টাকা)</label>
                  <input
                    type="number"
                    value={editFormData.qard_credit_limit}
                    onChange={(e) => setEditFormData({ ...editFormData, qard_credit_limit: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-emerald-300 font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">ঠিকানা</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white"
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl shadow-md cursor-pointer"
                >
                  {actionLoading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER PROFILE & ACTIVITY DETAILS MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] my-auto">
            
            {/* Modal Top Header */}
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">গ্রাহক প্রোফাইল ও অ্যাক্টিভিটি হিস্ট্রি</h3>
                  <p className="text-[11px] text-slate-400">গ্রাহকের ড্যাশবোর্ডের মতো বিস্তারিত তথ্য, অর্ডার পরিসংখ্যান ও ট্র্যাকিং</p>
                </div>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Profile Card Banner (Same as User Dashboard Header) */}
              <div className="bg-gradient-to-r from-slate-950 via-emerald-950/60 to-slate-950 rounded-2xl p-4 sm:p-5 border border-amber-900/40 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-emerald-700 text-slate-950 font-black text-xl flex items-center justify-center shadow-md ring-2 ring-amber-400/40 shrink-0">
                    {viewingUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h4 className="text-base font-black text-white">{viewingUser.name}</h4>
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        {viewingUser.loyalty_tier || 'Gold VIP Patron'}
                      </span>
                      {viewingUser.is_blocked ? (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                          🚫 স্থগিত / সাসপেন্ড
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          ✓ সক্রিয় অ্যাকাউন্ট
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 mt-1 font-mono text-[11px]">
                      📞 {viewingUser.phone || 'ফোন নেই'} {viewingUser.email ? `• ✉️ ${viewingUser.email}` : ''}
                    </p>
                    {viewingUser.created_at && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        🗓️ নিবন্ধিত: {new Date(viewingUser.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">ডিজিটাল লয়ালটি কার্ড</span>
                  <p className="font-mono font-bold text-amber-400 text-xs mt-0.5">
                    💳 {viewingUser.loyalty_card_number || `ANSAR-VIP-${viewingUser.id.slice(0, 4)}-2026`}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
                    ⭐ {viewingUser.loyalty_points || 100} পয়েন্ট অর্জিত
                  </p>
                </div>
              </div>

              {/* Delivery Address & Qard Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400" /> ডিফল্ট ডেলিভারি ঠিকানা
                  </span>
                  <p className="text-white font-medium text-xs pt-0.5">
                    {viewingUser.address || 'ঠিকানা দেওয়া হয়নি'}
                  </p>
                  <p className="text-slate-400 font-mono text-[11px]">
                    শহর/জেলা: <strong className="text-slate-200">{viewingUser.city || 'অনির্দিষ্ট'}</strong> {viewingUser.postal_code ? `• পোস্টকোড: ${viewingUser.postal_code}` : ''}
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center uppercase tracking-wider">
                    <HandHeart className="w-3.5 h-3.5 mr-1 text-emerald-400" /> করযে হাসানা স্কিম লিমিট
                  </span>
                  <p className="text-emerald-400 font-black font-mono text-sm pt-0.5">
                    ৳{(viewingUser.qard_credit_limit || 5000).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    স্ট্যাটাস: <strong className="text-slate-200">{viewingUser.qard_status === 'Approved' ? '✓ অনুমোদিত' : 'সাধারণ স্কিম'}</strong>
                  </p>
                </div>
              </div>

              {/* Order Statistics 4-Card Overview */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> অর্ডার পরিসংখ্যান ও অ্যাক্টিভিটি
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block">মোট অর্ডার</span>
                    <span className="text-lg font-black text-white font-mono block mt-0.5">
                      {viewingDetails?.stats?.total_orders ?? viewingUser.orders_count ?? 0} <span className="text-xs font-normal text-slate-400">টি</span>
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-rose-900/40 bg-rose-950/10">
                    <span className="text-[10px] font-bold text-rose-400 block">বাতিলকৃত অর্ডার</span>
                    <span className="text-lg font-black text-rose-400 font-mono block mt-0.5">
                      {viewingDetails?.stats?.cancelled_orders ?? viewingUser.cancelled_orders_count ?? 0} <span className="text-xs font-normal text-rose-300">টি</span>
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-emerald-900/40 bg-emerald-950/10">
                    <span className="text-[10px] font-bold text-emerald-400 block">সফল ডেলিভারি</span>
                    <span className="text-lg font-black text-emerald-400 font-mono block mt-0.5">
                      {viewingDetails?.stats?.delivered_orders ?? viewingUser.delivered_orders_count ?? 0} <span className="text-xs font-normal text-emerald-300">টি</span>
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-amber-900/40 bg-amber-950/10">
                    <span className="text-[10px] font-bold text-amber-400 block">মোট কেনাকাটা</span>
                    <span className="text-lg font-black text-amber-300 font-mono block mt-0.5">
                      ৳{(viewingDetails?.stats?.total_spent ?? viewingUser.total_spent ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Cancelled Order Notice if > 0 */}
                {(viewingDetails?.stats?.cancelled_orders > 0 || viewingUser.cancelled_orders_count > 0) && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300 text-[11px] flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      ⚠️ <strong>ক্যান্সেলেশন অ্যালার্ট:</strong> এই গ্রাহক এ পর্যন্ত সর্বমোট <strong>{viewingDetails?.stats?.cancelled_orders ?? viewingUser.cancelled_orders_count} টি অর্ডার বাতিল</strong> করেছেন।
                    </span>
                  </div>
                )}
              </div>

              {/* User Order List & Activity Log */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                    <Package className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> অর্ডারের বিস্তারিত ইতিহাস ({viewingDetails?.orders?.length || 0})
                  </h5>
                </div>

                {loadingDetails ? (
                  <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span>অর্ডার হিস্ট্রি লোড হচ্ছে...</span>
                  </div>
                ) : viewingDetails?.orders && viewingDetails.orders.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {viewingDetails.orders.map((ord) => (
                      <div key={ord.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-white text-xs">#{ord.order_code}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'Cancelled' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              ord.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              ord.status === 'Shipped' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                              ord.status === 'Processing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              ord.status === 'Confirmed' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {ord.status}
                            </span>
                          </div>

                          <div className="flex items-center space-x-3 text-[11px]">
                            <span className="text-slate-400 font-mono">
                              {ord.created_at ? new Date(ord.created_at).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            <span className="font-mono font-black text-amber-400">৳{ord.total_amount}</span>
                            <span className="text-[10px] text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                              {ord.payment_method}
                            </span>
                          </div>
                        </div>

                        {/* Order Items List */}
                        {Array.isArray(ord.items) && ord.items.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/60">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-[10px]">
                                <span className="text-slate-200 font-medium truncate max-w-[150px]">{it.title}</span>
                                <span className="text-amber-400 font-mono font-black">×{it.quantity || 1} টি</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                    এই গ্রাহকের এখনও কোনো অর্ডার রেকর্ড নেই।
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                {hasPermission('customers.delete') && viewingUser.role !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      const u = viewingUser;
                      setViewingUser(null);
                      setDeletingUser(u);
                    }}
                    className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/40 transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>অ্যাকাউন্ট মুছুন</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const u = viewingUser;
                    setViewingUser(null);
                    handleOpenEdit(u);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                >
                  তথ্য ও লিমিট এডিট
                </button>
                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN USER DELETE CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-900/50 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলতে চান?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                আপনি কি নিশ্চিত যে গ্রাহক <strong className="text-white font-bold">{deletingUser.name}</strong> ({deletingUser.phone || deletingUser.email}) এর অ্যাকাউন্টটি চিরতরে ডিলিট করতে চান?
              </p>
              <div className="mt-3 p-3 bg-rose-950/40 rounded-xl border border-rose-800/40 text-[11px] text-rose-300">
                ⚠️ <strong>সতর্কতা:</strong> এই কাজটি ফিরিয়ে নেওয়া যাবে না। গ্রাহকের অ্যাকাউন্ট তথ্য স্থায়ীভাবে মুছে যাবে।
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={deletingLoading}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={deletingLoading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/20 cursor-pointer flex items-center justify-center space-x-1.5"
              >
                {deletingLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>স্থায়ীভাবে ডিলিট</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
