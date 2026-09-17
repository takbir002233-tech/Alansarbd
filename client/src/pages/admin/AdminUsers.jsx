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
  PackageCheck,
  Printer,
  Download,
  PlusCircle
} from 'lucide-react';
import AdminCustomerProfileModal from '../../components/AdminCustomerProfileModal';
import LuxuryLoyaltyCard from '../../components/LuxuryLoyaltyCard';

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
    email: '',
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

  // Selected VIP Review Modal
  const [selectedVipApp, setSelectedVipApp] = useState(null);
  const [vipAdminNotes, setVipAdminNotes] = useState('');

  // Selected Qard Review Modal
  const [selectedQardApp, setSelectedQardApp] = useState(null);
  const [qardApproveLimit, setQardApproveLimit] = useState(5000);
  const [qardAdminNotes, setQardAdminNotes] = useState('');

  // VIP Print Modal
  const [printCardUser, setPrintCardUser] = useState(null);

  // Extend Due Date Modal
  const [extendDueDateUser, setExtendDueDateUser] = useState(null);
  const [extendMonths, setExtendMonths] = useState(1);
  const [extendNotes, setExtendNotes] = useState('');

  // Repay Debt Modal
  const [repayDebtUser, setRepayDebtUser] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayNotes, setRepayNotes] = useState('');

  // Lightbox Zoom Photo
  const [zoomPhoto, setZoomPhoto] = useState(null);

  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (n) => String(n ?? '').replace(/[0-9]/g, d => bengaliDigits[+d]);

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
      email: user.email || '',
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

  // Extend debtor due date
  const handleExtendDueDate = async () => {
    if (!extendDueDateUser?.id) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${extendDueDateUser.id}/extend-qard-due`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          additional_months: Number(extendMonths) || 1,
          notes: extendNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`গ্রাহক "${extendDueDateUser.name}" এর ঋণ পরিশোধের মেয়াদ আরও ${extendMonths} মাস বৃদ্ধি করা হয়েছে!`);
        setExtendDueDateUser(null);
        fetchData();
      } else {
        alert(data.message || 'মেয়াদ বৃদ্ধি করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error(err);
      alert('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  // Repay debtor Qard debt
  const handleRepayDebt = async () => {
    if (!repayDebtUser?.id || !repayAmount) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${repayDebtUser.id}/repay-qard`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(repayAmount),
          notes: repayNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`গ্রাহক "${repayDebtUser.name}" এর ৳${Number(repayAmount).toLocaleString()} বকেয়া সফলভাবে সমন্বয় বা পরিশোধ করা হয়েছে!`);
        setRepayDebtUser(null);
        setRepayAmount('');
        fetchData();
      } else {
        alert(data.message || 'ঋণ সমন্বয় করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error(err);
      alert('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    const origTitle = document.title;
    document.title = `AL_ANSAR_VIP_CARD_${printCardUser?.loyalty_card_number || 'CARD'}`;
    window.print();
    setTimeout(() => { document.title = origTitle; }, 1000);
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
                    <th className="p-4">গ্রাহক</th>
                    <th className="p-4">যোগাযোগ ও ঠিকানা</th>
                    <th className="p-4">কেনাকাটা ও অর্ডার</th>
                    <th className="p-4">অ্যাকাউন্ট স্ট্যাটাস</th>
                    <th className="p-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredUsers.map((u) => {
                    const userLoyaltyApp = loyaltyApps.find(a => a.user_id === u.id || (a.phone && u.phone && a.phone === u.phone));
                    const userQardApp = qardApps.find(a => a.user_id === u.id || (a.phone && u.phone && a.phone === u.phone) || (a.nid_number && u.nid_number && a.nid_number === u.nid_number));
                    const isVipApproved = u.loyalty_card_approved || u.loyalty_card_status === 'Approved';
                    const isVipPending = u.loyalty_card_status === 'Pending' || userLoyaltyApp?.status === 'Pending';
                    const isVipDeclined = u.loyalty_card_status === 'Declined' || u.loyalty_card_status === 'Rejected' || userLoyaltyApp?.status === 'Rejected';

                    const isQardApproved = u.qard_status === 'Approved' || userQardApp?.status === 'Approved';
                    const isQardPending = u.qard_status === 'Pending' || userQardApp?.status === 'Pending';
                    const hasQardDebt = Boolean(u.has_unpaid_qard && u.qard_unpaid_amount > 0);

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Customer & Card Number */}
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-700 to-emerald-900 text-white flex items-center justify-center font-black shadow-md border border-amber-500/30 shrink-0 overflow-hidden">
                              {u.user_photo ? (
                                <img
                                  src={u.user_photo}
                                  alt={u.name}
                                  className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                                  onClick={() => setZoomPhoto(u.user_photo)}
                                  title="ছবি বড় করে দেখুন"
                                />
                              ) : (
                                u.name?.charAt(0)?.toUpperCase() || 'U'
                              )}
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
                              {u.nid_number && (
                                <p className="text-[10px] text-slate-400 font-mono">
                                  NID: {u.nid_number}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact & Address */}
                        <td className="p-4">
                          <p className="font-mono text-slate-200 font-bold">{u.phone || 'ফোন নেই'}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                          {u.address && (
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1" title={u.address}>
                              📍 {u.address} {u.city ? `(${u.city})` : ''}
                            </p>
                          )}
                        </td>

                        {/* Total Spent & Order Count */}
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

                        {/* Account Status */}
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.is_blocked ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {u.is_blocked ? '🚫 স্থগিত / সাসপেন্ড' : '✓ সক্রিয় একাউন্ট'}
                          </span>
                        </td>

                        {/* Comprehensive Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5 flex-wrap gap-y-1">
                            {/* Profile Modal Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenUserProfile(u)}
                              className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 transition-colors flex items-center space-x-1 cursor-pointer"
                              title="গ্রাহকের সম্পূর্ণ প্রোফাইল, সংরক্ষিত ৩টি ছবি ও অর্ডার হিস্ট্রি দেখুন"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span>প্রোফাইল</span>
                            </button>

                            {/* Edit Button */}
                            {hasPermission('customers.edit_limit') && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(u)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center space-x-1"
                                title="তথ্য ও লিমিট এডিট করুন"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>এডিট</span>
                              </button>
                            )}

                            {/* Suspend / Unblock */}
                            {hasPermission('customers.block') && u.role !== 'admin' && (
                              <button
                                type="button"
                                onClick={() => handleToggleBlock(u.id, u.name, u.is_blocked)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                  u.is_blocked
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/50'
                                }`}
                                title={u.is_blocked ? 'অ্যাকাউন্ট আনব্লক করুন' : 'অ্যাকাউন্ট সাসপেন্ড করুন'}
                              >
                                {u.is_blocked ? 'আনব্লক' : 'সাসপেন্ড'}
                              </button>
                            )}

                            {/* Delete User Account Button */}
                            {hasPermission('customers.delete') && u.role !== 'admin' && (
                              <button
                                type="button"
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
                    );
                  })}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">পূর্ণ নাম</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">ইমেইল অ্যাড্রেস</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white font-mono"
                  />
                </div>
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

      {/* FULL CUSTOMER PROFILE & DASHBOARD MODAL */}
      {viewingUser && (
        <AdminCustomerProfileModal
          isOpen={Boolean(viewingUser)}
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}

      {/* 👑 VIP LOYALTY APPLICATION REVIEW MODAL */}
      {selectedVipApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">ভিআইপি লয়ালটি মেম্বারশিপ আবেদন রিভিউ</h3>
                  <p className="text-[11px] text-slate-400">গ্রাহকের ৩টি ছবি ও ৳{selectedVipApp.payment_amount || 500} ফি ভেরিফাই করে অনুমোদন করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVipApp(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto max-h-[75vh] space-y-4 text-xs">
              {/* Applicant Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 block">আবেদনকারীর নাম:</span>
                  <span className="font-bold text-white text-sm">{selectedVipApp.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">মোবাইল নম্বর:</span>
                  <span className="font-mono font-bold text-amber-300">{selectedVipApp.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">জাতীয় পরিচয়পত্র (NID):</span>
                  <span className="font-mono font-bold text-slate-200">{selectedVipApp.nid_number || 'উল্লেখ নেই'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">ঠিকানা ও শহর:</span>
                  <span className="text-slate-200">{selectedVipApp.address || 'N/A'}, {selectedVipApp.city || 'ঢাকা'}</span>
                </div>
              </div>

              {/* 3 Photos Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  সংযুক্ত ৩টি ছবি (NID Front, Back & Selfie)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div
                    className="p-1 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer group"
                    onClick={() => selectedVipApp.nid_front_photo && setZoomPhoto(selectedVipApp.nid_front_photo)}
                  >
                    {selectedVipApp.nid_front_photo ? (
                      <img
                        src={selectedVipApp.nid_front_photo}
                        alt="NID Front"
                        className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-24 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-500">ছবি নেই</div>
                    )}
                    <span className="block text-center text-[10px] text-slate-400 font-bold mt-1">এনআইডি সামনে</span>
                  </div>

                  <div
                    className="p-1 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer group"
                    onClick={() => selectedVipApp.nid_back_photo && setZoomPhoto(selectedVipApp.nid_back_photo)}
                  >
                    {selectedVipApp.nid_back_photo ? (
                      <img
                        src={selectedVipApp.nid_back_photo}
                        alt="NID Back"
                        className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-24 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-500">ছবি নেই</div>
                    )}
                    <span className="block text-center text-[10px] text-slate-400 font-bold mt-1">এনআইডি পেছনে</span>
                  </div>

                  <div
                    className="p-1 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer group"
                    onClick={() => selectedVipApp.user_photo && setZoomPhoto(selectedVipApp.user_photo)}
                  >
                    {selectedVipApp.user_photo ? (
                      <img
                        src={selectedVipApp.user_photo}
                        alt="Selfie"
                        className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-24 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-500">ছবি নেই</div>
                    )}
                    <span className="block text-center text-[10px] text-slate-400 font-bold mt-1">আবেদনকারীর ছবি</span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-3.5 bg-amber-950/30 rounded-2xl border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-amber-300">
                    💳 আবেদন ফি: ৳{selectedVipApp.payment_amount || 500} ({selectedVipApp.payment_method?.toUpperCase() || 'MFS'})
                  </span>
                  <span className="text-[11px] text-slate-300 font-mono">
                    প্রেরক: <strong className="text-white">{selectedVipApp.sender_number || 'N/A'}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[11px] text-slate-400">ট্রানজেকশন আইডি (TrxID):</span>
                  <span className="px-2.5 py-0.5 bg-black/60 rounded-md font-mono font-black text-amber-300 text-xs border border-amber-500/30">
                    {selectedVipApp.transaction_id || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">অ্যাডমিন নোট / বার্তা (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যাচাই নোট লিখুন..."
                  value={vipAdminNotes}
                  onChange={(e) => setVipAdminNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedVipApp(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                বন্ধ করুন
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    handleLoyaltyStatusUpdate(selectedVipApp.id, 'Rejected', selectedVipApp.name);
                    setSelectedVipApp(null);
                  }}
                  className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/50 cursor-pointer"
                >
                  ✕ বাতিল করুন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleLoyaltyStatusUpdate(selectedVipApp.id, 'Approved', selectedVipApp.name);
                    setSelectedVipApp(null);
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md cursor-pointer"
                >
                  ✓ অনুমোদন ও কার্ড সক্রিয় করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🤝 QARD-E-HASANA APPLICATION REVIEW MODAL */}
      {selectedQardApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                  <HandHeart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">করযে হাসানা আবেদন ও NID যাচাই</h3>
                  <p className="text-[11px] text-slate-400">গ্রাহকের ৩টি ছবি ও তথ্যাদি যাচাই করে ক্রেডিট লিমিট অনুমোদন করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQardApp(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto max-h-[75vh] space-y-4 text-xs">
              {/* Applicant Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 block">আবেদনকারীর নাম:</span>
                  <span className="font-bold text-white text-sm">{selectedQardApp.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">মোবাইল নম্বর:</span>
                  <span className="font-mono font-bold text-emerald-300">{selectedQardApp.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">জাতীয় পরিচয়পত্র (NID):</span>
                  <span className="font-mono font-bold text-amber-300">{selectedQardApp.nid_number}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">কাঙ্ক্ষিত লিমিট:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">৳{(selectedQardApp.requested_limit || 5000).toLocaleString()}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-500 block">ঠিকানা:</span>
                  <span className="text-slate-200">{selectedQardApp.address || 'N/A'}</span>
                </div>
              </div>

              {/* 3 Photos Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  সংযুক্ত ৩টি ছবি (NID Front, Back & Selfie)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div
                    className="p-1 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer group"
                    onClick={() => selectedQardApp.nid_front_photo && setZoomPhoto(selectedQardApp.nid_front_photo)}
                  >
                    {selectedQardApp.nid_front_photo ? (
                      <img
                        src={selectedQardApp.nid_front_photo}
                        alt="NID Front"
                        className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-24 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-500">ছবি নেই</div>
                    )}
                    <span className="block text-center text-[10px] text-slate-400 font-bold mt-1">এনআইডি সামনে</span>
                  </div>

                  <div
                    className="p-1 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer group"
                    onClick={() => selectedQardApp.nid_back_photo && setZoomPhoto(selectedQardApp.nid_back_photo)}
                  >
                    {selectedQardApp.nid_back_photo ? (
                      <img
                        src={selectedQardApp.nid_back_photo}
                        alt="NID Back"
                        className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-24 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-500">ছবি নেই</div>
                    )}
                    <span className="block text-center text-[10px] text-slate-400 font-bold mt-1">এনআইডি পেছনে</span>
                  </div>

                  <div
                    className="p-1 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer group"
                    onClick={() => selectedQardApp.user_photo && setZoomPhoto(selectedQardApp.user_photo)}
                  >
                    {selectedQardApp.user_photo ? (
                      <img
                        src={selectedQardApp.user_photo}
                        alt="Selfie"
                        className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-24 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-500">ছবি নেই</div>
                    )}
                    <span className="block text-center text-[10px] text-slate-400 font-bold mt-1">আবেদনকারীর ছবি</span>
                  </div>
                </div>
              </div>

              {/* Payment Details if applicable */}
              {selectedQardApp.payment_amount > 0 && (
                <div className="p-3.5 bg-emerald-950/30 rounded-2xl border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-emerald-300">
                      💳 আবেদন ফি: ৳{selectedQardApp.payment_amount} ({selectedQardApp.payment_method?.toUpperCase() || 'MFS'})
                    </span>
                    <span className="text-[11px] text-slate-300 font-mono">
                      প্রেরক: <strong className="text-white">{selectedQardApp.sender_number || 'N/A'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="text-[11px] text-slate-400">ট্রানজেকশন আইডি (TrxID):</span>
                    <span className="px-2.5 py-0.5 bg-black/60 rounded-md font-mono font-black text-amber-300 text-xs border border-amber-500/30">
                      {selectedQardApp.transaction_id || 'N/A'}
                    </span>
                  </div>
                </div>
              )}

              {/* Approved Limit Input */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-emerald-400 block">
                  মঞ্জুরিকৃত করযে হাসানা ক্রেডিট লিমিট (টাকা) *
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={qardApproveLimit}
                    onChange={(e) => setQardApproveLimit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 rounded-xl border border-emerald-500/50 text-emerald-300 font-mono font-black text-sm focus:outline-none focus:border-emerald-400 pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">টাকা (৳)</span>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">অ্যাডমিন নোট / অনুমোদন বার্তা</label>
                <input
                  type="text"
                  placeholder="অনুমোদন বা ভেরিফিকেশন বার্তা লিখুন..."
                  value={qardAdminNotes}
                  onChange={(e) => setQardAdminNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedQardApp(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                বন্ধ করুন
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    handleQardReject(selectedQardApp.id, selectedQardApp.name);
                    setSelectedQardApp(null);
                  }}
                  className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/50 cursor-pointer"
                >
                  ✕ বাতিল
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/admin/qard-applications/${selectedQardApp.id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          status: 'Approved',
                          notes: qardAdminNotes || `এনআইডি (${selectedQardApp.nid_number}) সফলভাবে যাচাইকৃত। ৳${Number(qardApproveLimit).toLocaleString()} লিমিট মঞ্জুর হলো।`,
                          requested_limit: Number(qardApproveLimit)
                        })
                      });
                      const data = await res.json();
                      if (data.success) {
                        showToast(`আবেদনকারী "${selectedQardApp.name}" এর করযে হাসানা ৳${Number(qardApproveLimit).toLocaleString()} লিমিট অনুমোদিত হয়েছে!`);
                        setSelectedQardApp(null);
                        fetchData();
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
                >
                  ✓ ক্রেডিট অনুমোদন করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🖨️ VIP CARD PRINT & DOWNLOAD MODAL */}
      {printCardUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-auto">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 to-slate-950">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">গ্রাহক ভিআইপি কার্ড প্রিন্ট ও প্রিভিউ</h3>
              </div>
              <button
                type="button"
                onClick={() => setPrintCardUser(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-center">
                <LuxuryLoyaltyCard user={printCardUser} />
              </div>
              <p className="text-center text-[11px] text-slate-400">
                এই ডিজিটাল কার্ডটি গ্রাহকের প্রোফাইলেও সংরক্ষিত আছে। আপনি সরাসরি প্রিন্টার বা PDF হিসেবে সেভ করতে পারেন।
              </p>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPrintCardUser(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট / PDF সেভ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⏳ EXTEND QARD DUE DATE MODAL */}
      {extendDueDateUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">করযে হাসানা পরিশোধের মেয়াদ বৃদ্ধি</h3>
              </div>
              <button
                type="button"
                onClick={() => setExtendDueDateUser(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1 text-xs">
              <p className="font-bold text-white">{extendDueDateUser.name} ({extendDueDateUser.phone})</p>
              <p className="text-rose-400 font-mono font-bold">বর্তমান বকেয়া: ৳{Number(extendDueDateUser.qard_unpaid_amount || 0).toLocaleString()}</p>
              {extendDueDateUser.qard_due_date && (
                <p className="text-slate-400 font-mono text-[11px]">
                  বর্তমান শেষ তারিখ: {new Date(extendDueDateUser.qard_due_date).toLocaleDateString('bn-BD', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-300 block">অতিরিক্ত মেয়াদ যোগ করুন *</label>
              <select
                value={extendMonths}
                onChange={(e) => setExtendMonths(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-amber-300 font-bold focus:outline-none focus:border-amber-500"
              >
                <option value={1}>+ ১ মাস মেয়াদ বৃদ্ধি</option>
                <option value={2}>+ ২ মাস মেয়াদ বৃদ্ধি</option>
                <option value={3}>+ ৩ মাস মেয়াদ বৃদ্ধি</option>
                <option value={6}>+ ৬ মাস মেয়াদ বৃদ্ধি</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-300 block">অ্যাডমিন নোট / কারণ (ঐচ্ছিক)</label>
              <input
                type="text"
                placeholder="মেয়াদ বৃদ্ধির কারণ লিখুন..."
                value={extendNotes}
                onChange={(e) => setExtendNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setExtendDueDateUser(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleExtendDueDate}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center space-x-1"
              >
                {actionLoading ? 'প্রসেসিং...' : '✓ মেয়াদ বৃদ্ধি সংরক্ষণ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💰 REPAY QARD DEBT MODAL */}
      {repayDebtUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white">করযে হাসানা বকেয়া ঋণ সমন্বয় ও পরিশোধ</h3>
              </div>
              <button
                type="button"
                onClick={() => setRepayDebtUser(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1 text-xs">
              <p className="font-bold text-white">{repayDebtUser.name} ({repayDebtUser.phone})</p>
              <p className="text-rose-400 font-mono font-bold">বর্তমান বকেয়া: ৳{Number(repayDebtUser.qard_unpaid_amount || 0).toLocaleString()}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-emerald-400 block">পরিশোধিত টাকার পরিমাণ *</label>
              <input
                type="number"
                min="1"
                max={repayDebtUser.qard_unpaid_amount || 100000}
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 rounded-xl border border-emerald-500/50 text-emerald-300 font-mono font-black text-sm focus:outline-none focus:border-emerald-400"
              />
              <p className="text-[10px] text-slate-400">সম্পূর্ণ পরিশোধ করতে ৳{repayDebtUser.qard_unpaid_amount} বা আংশিক কিস্তি লিখুন।</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-300 block">পেমেন্ট মেমো / ট্রানজেকশন নোট (ঐচ্ছিক)</label>
              <input
                type="text"
                placeholder="নগদ পরিশোধ / বিকাশ TrxID ইত্যাদি..."
                value={repayNotes}
                onChange={(e) => setRepayNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRepayDebtUser(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleRepayDebt}
                disabled={actionLoading || !repayAmount}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center space-x-1"
              >
                {actionLoading ? 'সংরক্ষণ হচ্ছে...' : '✓ পরিশোধ সম্পন্ন করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 PHOTO ZOOM LIGHTBOX */}
      {zoomPhoto && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
          onClick={() => setZoomPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={zoomPhoto}
              alt="Zoomed document"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-2 border-slate-700"
            />
            <button
              type="button"
              onClick={() => setZoomPhoto(null)}
              className="absolute -top-3 -right-3 p-2 bg-slate-800 hover:bg-rose-600 text-white rounded-full shadow-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
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
