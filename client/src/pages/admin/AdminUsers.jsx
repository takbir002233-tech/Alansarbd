import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
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
  RefreshCw
} from 'lucide-react';

export default function AdminUsers() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // users, qard, appeals
  const [users, setUsers] = useState([]);
  const [qardApps, setQardApps] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [successToast, setSuccessToast] = useState('');
  
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
      const [usersRes, qardRes, appealsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/qard-applications', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/account-appeals', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const usersData = await usersRes.json();
      const qardData = await qardRes.json();
      const appealsData = await appealsRes.json();

      if (usersData.success) setUsers(usersData.users || []);
      if (qardData.success) setQardApps(qardData.applications || []);
      if (appealsData.success) setAppeals(appealsData.appeals || []);
    } catch (err) {
      console.error('Error fetching admin users data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

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
    if (!confirm(`আপনি কি "${name}" এর করযে হাসানা আবেদনটি প্রত্যাখ্যান করতে চান?`)) return;

    try {
      const res = await fetch(`/api/admin/qard-applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Rejected', notes: 'জাতীয় পরিচয়পত্র তথ্যে অসঙ্গতি থাকায় আবেদনটি বাতিল করা হয়েছে।' })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`আবেদনটি প্রত্যাখ্যান করা হয়েছে।`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Account Appeal Status Update (1-click Unblock)
  const handleAppealStatusUpdate = async (appealId, status, userName) => {
    try {
      const res = await fetch(`/api/admin/account-appeals/${appealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status, 
          admin_reply: status === 'Resolved' 
            ? 'অ্যাকাউন্ট রিভিউ সফল হয়েছে এবং অ্যাকাউন্টটি সম্পূর্ণ সক্রিয় ও আনব্লক করা হয়েছে।' 
            : 'আপিল পর্যালোচনা করে স্থগিতাদেশ বজায় রাখা হলো।' 
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(status === 'Resolved' ? `গ্রাহক "${userName}" কে ১-ক্লিকে আনব্লক করা হয়েছে!` : `আপিলটি বাতিল করা হয়েছে।`);
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
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'users' ? 'bg-amber-600 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>গ্রাহক ও লয়ালটি ({users.length})</span>
          </button>

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
                        <p className="text-[10px] text-slate-400">{u.orders_count || 0} টি অর্ডার</p>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.is_blocked ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {u.is_blocked ? '🚫 স্থগিত / সাসপেন্ড' : '✓ সক্রিয় একাউন্ট'}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBlock(u.id, u.name, u.is_blocked)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              u.is_blocked
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/50'
                            }`}
                          >
                            {u.is_blocked ? 'আনব্লক' : 'সাসপেন্ড'}
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                        >
                          এডিট / লিমিট
                        </button>
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

      {/* TAB 3: SUSPENDED ACCOUNT APPEALS DESK */}
      {activeTab === 'appeals' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl border border-rose-900/40 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-rose-400" /> স্থগিত গ্রাহক অ্যাকাউন্ট রিভিউ আপিল ({appeals.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  যেসব একাউন্ট সাময়িক বন্ধ/ব্যান রয়েছে তাদের রিভিউ আবেদন পর্যালোচনা করে ১-ক্লিকে আনব্লক করতে পারেন।
                </p>
              </div>

              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 self-start sm:self-auto">
                অপেক্ষমাণ আপিল: {pendingAppealsCount} টি
              </span>
            </div>

            {appeals.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center">কোনো স্থগিত অ্যাকাউন্টের আপিল আবেদন জমা নেই।</p>
            ) : (
              <div className="space-y-4">
                {appeals.map(appeal => (
                  <div key={appeal.id} className="p-5 sm:p-6 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-4 text-xs shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700 gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm">{appeal.user_name || 'গ্রাহক'}</h4>
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
                          {appeal.status === 'Resolved' ? '✓ নিষ্পত্তি (আনব্লকড)' : appeal.status === 'Rejected' ? '✕ বাতিল' : '⏳ পর্যালোচনার অপেক্ষায়'}
                        </span>

                        {appeal.status === 'Under Review' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAppealStatusUpdate(appeal.id, 'Resolved', appeal.user_name || 'গ্রাহক')}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                            >
                              ✓ ১-ক্লিকে আনব্লক করুন
                            </button>
                            <button
                              onClick={() => handleAppealStatusUpdate(appeal.id, 'Rejected', appeal.user_name || 'গ্রাহক')}
                              className="px-3.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold rounded-xl border border-rose-700/50 cursor-pointer transition-colors"
                            >
                              ✕ প্রত্যাখ্যান
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 text-amber-100 leading-relaxed">
                      <strong className="text-amber-400 block mb-1">গ্রাহকের আপিল বার্তা ও ব্যাখ্যা:</strong>
                      {appeal.reason}
                    </div>

                    {appeal.admin_reply && (
                      <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/40 text-emerald-300">
                        <strong>অ্যাডমিন উত্তর:</strong> {appeal.admin_reply}
                      </div>
                    )}
                  </div>
                ))}
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
    </div>
  );
}
