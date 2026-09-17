import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { 
  RotateCcw, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Check, 
  X, 
  ArrowUpRight, 
  FileText, 
  CreditCard, 
  Phone, 
  ExternalLink, 
  RefreshCw, 
  Save, 
  Settings, 
  HelpCircle,
  Package,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function AdminRefunds() {
  const { token, hasPermission } = useAuth();
  const { socket } = useSocket();

  const [activeSubTab, setActiveSubTab] = useState('requests'); // 'requests' | 'policy'
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Review & Action Modal State
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'approve' | 'process' | 'complete' | 'reject' | null
  const [adminNotes, setAdminNotes] = useState('');
  const [refundTrxId, setRefundTrxId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  // Policy Settings State
  const [policyForm, setPolicyForm] = useState({
    refund_policy_title: '',
    refund_policy_badge: '',
    refund_policy_terms: '',
    refund_process_steps: '',
    refund_window_days: 7,
    refund_support_phone: '',
    refund_support_email: ''
  });
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policySaving, setPolicySaving] = useState(false);
  const [policySuccess, setPolicySuccess] = useState(null);
  const [policyError, setPolicyError] = useState(null);

  // Helper for Bengali Digits
  const toBengaliDigits = (val) => {
    if (val === null || val === undefined || val === '') return '০';
    const bDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return val.toString().replace(/[0-9]/g, (d) => bDigits[+d]);
  };

  // Fetch Refunds
  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/refunds/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRefunds(data.refunds || []);
      } else {
        setError(data.message || 'রিফান্ড আবেদন তালিকা লোড করা যায়নি।');
      }
    } catch (err) {
      console.error('Fetch refunds error:', err);
      setError('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Policy Settings
  const fetchPolicy = async () => {
    try {
      setPolicyLoading(true);
      const res = await fetch('/api/refunds/policy');
      const data = await res.json();
      if (data.success && data.policy) {
        setPolicyForm({
          refund_policy_title: data.policy.title || '',
          refund_policy_badge: data.policy.badge || '',
          refund_policy_terms: data.policy.terms || '',
          refund_process_steps: data.policy.process_steps || '',
          refund_window_days: data.policy.window_days || 7,
          refund_support_phone: data.policy.support_phone || '',
          refund_support_email: data.policy.support_email || ''
        });
      }
    } catch (err) {
      console.error('Fetch refund policy error:', err);
    } finally {
      setPolicyLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
    fetchPolicy();
  }, [token]);

  // Socket listener for live incoming refund requests
  useEffect(() => {
    if (!socket) return;
    const handleNewRefund = (newReq) => {
      setRefunds(prev => [newReq, ...prev.filter(r => r.id !== newReq.id)]);
    };
    const handleRefundUpdated = (updatedReq) => {
      setRefunds(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));
      if (selectedRefund && selectedRefund.id === updatedReq.id) {
        setSelectedRefund(updatedReq);
      }
    };

    socket.on('new_refund_request', handleNewRefund);
    socket.on('refund_status_updated', handleRefundUpdated);

    return () => {
      socket.off('new_refund_request', handleNewRefund);
      socket.off('refund_status_updated', handleRefundUpdated);
    };
  }, [socket, selectedRefund]);

  // Handle Status Update
  const handleUpdateStatus = async (status) => {
    if (!selectedRefund) return;
    setUpdatingStatus(true);
    setActionSuccessMsg(null);
    try {
      const payload = { status };
      if (adminNotes) payload.admin_notes = adminNotes;
      if (status === 'Completed') {
        if (!refundTrxId.trim()) {
          alert('রিফান্ড সম্পন্ন করার জন্য পেমেন্ট ট্রানজেকশন আইডি (TrxID) দিন।');
          setUpdatingStatus(false);
          return;
        }
        payload.refund_trx_id = refundTrxId.trim();
      }
      if (status === 'Rejected') {
        if (!rejectionReason.trim()) {
          alert('আবেদন বাতিল করার সুনির্দিষ্ট কারণ উল্লেখ করুন।');
          setUpdatingStatus(false);
          return;
        }
        payload.rejection_reason = rejectionReason.trim();
      }

      const res = await fetch(`/api/refunds/admin/${selectedRefund.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`স্ট্যাটাস সফলভাবে '${status}' করা হয়েছে।`);
        setSelectedRefund(data.refund);
        setRefunds(prev => prev.map(r => r.id === data.refund.id ? data.refund : r));
        setTimeout(() => {
          setActionModal(null);
          setActionSuccessMsg(null);
          setAdminNotes('');
          setRefundTrxId('');
          setRejectionReason('');
        }, 1200);
      } else {
        alert(data.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      console.error('Update status error:', err);
      alert('স্ট্যাটাস আপডেট করার সময় ত্রুটি ঘটেছে।');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Save Policy Settings
  const handleSavePolicy = async (e) => {
    e.preventDefault();
    setPolicySaving(true);
    setPolicySuccess(null);
    setPolicyError(null);
    try {
      const res = await fetch('/api/refunds/admin/policy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(policyForm)
      });
      const data = await res.json();
      if (data.success) {
        setPolicySuccess('রিফান্ড নীতিমালা ও প্রসেস সফলভাবে সেভ করা হয়েছে!');
        setTimeout(() => setPolicySuccess(null), 3000);
      } else {
        setPolicyError(data.message || 'পলিসি সেভ করা যায়নি।');
      }
    } catch (err) {
      console.error('Save policy error:', err);
      setPolicyError('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে।');
    } finally {
      setPolicySaving(false);
    }
  };

  // Metrics Calculation
  const totalCount = refunds.length;
  const pendingCount = refunds.filter(r => r.status === 'Pending').length;
  const approvedCount = refunds.filter(r => r.status === 'Approved').length;
  const processingCount = refunds.filter(r => r.status === 'Processing').length;
  const completedRefunds = refunds.filter(r => r.status === 'Completed');
  const completedCount = completedRefunds.length;
  const rejectedCount = refunds.filter(r => r.status === 'Rejected').length;
  const totalRefundedCash = completedRefunds.reduce((sum, r) => sum + (Number(r.total_refund_amount) || 0), 0);

  // Filtered List
  const filteredRefunds = refunds.filter(r => {
    if (statusFilter !== 'all' && r.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = (r.id || '').toLowerCase().includes(q);
      const matchOrder = (r.order_code || '').toLowerCase().includes(q);
      const matchUser = (r.user_name || '').toLowerCase().includes(q);
      const matchPhone = (r.user_phone || '').includes(q);
      const matchAccount = (r.payout_account || '').includes(q);
      const matchReason = (r.reason || '').toLowerCase().includes(q);
      return matchId || matchOrder || matchUser || matchPhone || matchAccount || matchReason;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" />
            অপেক্ষমাণ
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            অনুমোদিত
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            প্রসেসিং
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Check className="w-3 h-3 mr-1" />
            সম্পন্ন / রিফান্ডকৃত
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <X className="w-3 h-3 mr-1" />
            বাতিল
          </span>
        );
      default:
        return null;
    }
  };

  const getMethodBadge = (method) => {
    switch (method) {
      case 'bkash':
        return <span className="text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-lg">বিকাশ</span>;
      case 'nagad':
        return <span className="text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-lg">নগদ</span>;
      case 'rocket':
        return <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-lg">রকেট</span>;
      case 'bank':
        return <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-lg">ব্যাংক</span>;
      default:
        return <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg">{method || 'ক্যাশ'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Title & Top Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>রিফান্ড ও রিটার্ন ডেস্ক</span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                  Refund Control
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                গ্রাহকদের রিফান্ড আবেদন পর্যালোচনা, পেমেন্ট ট্র্যাকিং এবং নীতিমালা নিয়ন্ত্রণ
              </p>
            </div>
          </div>
        </div>

        {/* Top Mode Selector Tabs */}
        <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'requests'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>আবেদন তালিকা ({toBengaliDigits(totalCount)})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('policy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'policy'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>নীতিমালা ও শর্তাবলী সেটিংস</span>
          </button>
        </div>
      </div>

      {/* ======================= TAB 1: REFUND REQUESTS ======================= */}
      {activeSubTab === 'requests' && (
        <div className="space-y-6">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            
            {/* Card 1: Pending */}
            <div 
              onClick={() => setStatusFilter('pending')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">অপেক্ষমাণ আবেদন</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono">
                {toBengaliDigits(pendingCount)}
              </div>
              <p className="text-[10px] text-amber-300/80 mt-1 font-semibold">তাৎক্ষণিক পর্যালোচনা প্রয়োজন</p>
            </div>

            {/* Card 2: Approved / Processing */}
            <div 
              onClick={() => setStatusFilter('approved')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'approved' || statusFilter === 'processing'
                  ? 'bg-blue-950/30 border-blue-500/60 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">অনুমোদিত / প্রসেসিং</span>
                <RefreshCw className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono">
                {toBengaliDigits(approvedCount + processingCount)}
              </div>
              <p className="text-[10px] text-blue-300/80 mt-1 font-semibold">পণ্য ফেরত ও পেমেন্ট চলমান</p>
            </div>

            {/* Card 3: Completed */}
            <div 
              onClick={() => setStatusFilter('completed')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">সফল রিফান্ড</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono">
                {toBengaliDigits(completedCount)}
              </div>
              <p className="text-[10px] text-emerald-300/80 mt-1 font-semibold">টাকা ফেরত সম্পন্ন হয়েছে</p>
            </div>

            {/* Card 4: Total Cash Refunded */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মোট রিফান্ড প্রদান</span>
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-amber-400 font-mono">
                ৳{toBengaliDigits(totalRefundedCash.toLocaleString())}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">সর্বমোট পরিশোধকৃত অর্থ</p>
            </div>

            {/* Card 5: Rejected */}
            <div 
              onClick={() => setStatusFilter('rejected')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === 'rejected'
                  ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">বাতিলকৃত আবেদন</span>
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono">
                {toBengaliDigits(rejectedCount)}
              </div>
              <p className="text-[10px] text-rose-300/80 mt-1 font-semibold">নীতিমালা ভঙ্গের কারণে বাতিল</p>
            </div>
          </div>

          {/* Search Bar & Filter Buttons */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="গ্রাহকের নাম, ফোন, অর্ডার কোড বা রিফান্ড আইডি দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'সবগুলো' },
                { id: 'pending', label: 'অপেক্ষমাণ' },
                { id: 'approved', label: 'অনুমোদিত' },
                { id: 'processing', label: 'প্রসেসিং' },
                { id: 'completed', label: 'সম্পন্ন' },
                { id: 'rejected', label: 'বাতিল' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <button
                onClick={fetchRefunds}
                title="রিফ্রেশ করুন"
                className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Refund Requests Table / List */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
                <p className="text-xs">রিফান্ড আবেদন লোড হচ্ছে...</p>
              </div>
            ) : filteredRefunds.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-300">কোনো রিফান্ড আবেদন পাওয়া যায়নি</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all'
                    ? 'আপনার ফিল্টারের সাথে মিলে এমন কোনো আবেদন পাওয়া যায়নি।'
                    : 'গ্রাহকরা ড্যাশবোর্ড থেকে রিফান্ড আবেদন করলে তা এখানে প্রদর্শিত হবে।'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">আবেদন ও তারিখ</th>
                      <th className="p-4">অর্ডার কোড</th>
                      <th className="p-4">গ্রাহকের তথ্য</th>
                      <th className="p-4">পণ্য ও রিফান্ড মূল্য</th>
                      <th className="p-4">কারণ ও মাধ্যম</th>
                      <th className="p-4">স্ট্যাটাস</th>
                      <th className="p-4 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {filteredRefunds.map(refund => (
                      <tr key={refund.id} className="hover:bg-slate-800/40 transition-colors">
                        
                        {/* ID & Date */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-amber-400 block">
                            #{refund.id}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {new Date(refund.created_at).toLocaleDateString('bn-BD', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </td>

                        {/* Order Code */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                            {refund.order_code}
                          </span>
                        </td>

                        {/* Customer Info */}
                        <td className="p-4">
                          <span className="font-bold text-white block truncate max-w-[140px]">
                            {refund.user_name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                            {refund.user_phone}
                          </span>
                        </td>

                        {/* Product & Refund Amount */}
                        <td className="p-4">
                          <div className="flex items-center space-x-2.5">
                            {refund.items && refund.items[0]?.image && (
                              <img 
                                src={refund.items[0].image} 
                                alt="Product" 
                                className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0" 
                              />
                            )}
                            <div>
                              <span className="text-white font-semibold line-clamp-1 max-w-[180px]">
                                {refund.items?.map(i => `${i.title} (×${toBengaliDigits(i.quantity)})`).join(', ') || 'পণ্য'}
                              </span>
                              <span className="text-amber-400 font-black font-mono block mt-0.5 text-xs">
                                ৳{toBengaliDigits(refund.total_refund_amount?.toLocaleString())}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Reason & Payout Method */}
                        <td className="p-4">
                          <span className="text-xs text-slate-300 block line-clamp-1 max-w-[160px]" title={refund.reason}>
                            {refund.reason}
                          </span>
                          <div className="flex items-center space-x-1.5 mt-1">
                            {getMethodBadge(refund.preferred_method)}
                            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[100px]">
                              {refund.payout_account}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-4 whitespace-nowrap">
                          {getStatusBadge(refund.status)}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedRefund(refund);
                              setActionModal(null);
                            }}
                            className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold rounded-xl border border-amber-500/30 text-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>রিভিউ ও অ্যাকশন</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: POLICY SETTINGS ======================= */}
      {activeSubTab === 'policy' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 max-w-4xl">
          
          <div className="border-b border-slate-800 pb-5 mb-6">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Settings className="w-5 h-5 text-amber-400" />
              <span>রিফান্ড নীতিমালা ও প্রসেস কনফিগারেশন</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              এখানে দেওয়া শর্তাবলী ও নিয়মাবলী সরাসরি গ্রাহকের ড্যাশবোর্ডের রিফান্ড সেকশনে দৃশ্যমান থাকবে।
            </p>
          </div>

          {policySuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 mb-6 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{policySuccess}</span>
            </div>
          )}

          {policyError && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center space-x-2 mb-6">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{policyError}</span>
            </div>
          )}

          <form onSubmit={handleSavePolicy} className="space-y-6">
            
            {/* Header Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  রিফান্ড পলিসি শিরোনাম (Title)
                </label>
                <input
                  type="text"
                  value={policyForm.refund_policy_title}
                  onChange={(e) => setPolicyForm({ ...policyForm, refund_policy_title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="উদা: রিফান্ড ও রিটার্ন নীতিমালা ও নির্দেশিকা"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  হাইলাইট ব্যাজ (Badge / Subtitle)
                </label>
                <input
                  type="text"
                  value={policyForm.refund_policy_badge}
                  onChange={(e) => setPolicyForm({ ...policyForm, refund_policy_badge: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="উদা: সহজ ও ১০০% নিরাপদ রিটার্ন সেবা"
                />
              </div>
            </div>

            {/* Time Window & Contacts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  রিটার্নের সময়সীমা (দিনের সংখ্যা)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={policyForm.refund_window_days}
                  onChange={(e) => setPolicyForm({ ...policyForm, refund_window_days: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">ডেলিভারি পাওয়ার কত দিনের মধ্যে আবেদন করতে হবে</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  রিফান্ড হেল্পলাইন ফোন নম্বর
                </label>
                <input
                  type="text"
                  value={policyForm.refund_support_phone}
                  onChange={(e) => setPolicyForm({ ...policyForm, refund_support_phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="017XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  সাপোর্ট ইমেইল এড্রেস
                </label>
                <input
                  type="email"
                  value={policyForm.refund_support_email}
                  onChange={(e) => setPolicyForm({ ...policyForm, refund_support_email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="support@alansarbd.com"
                />
              </div>
            </div>

            {/* Terms & Conditions */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                রিফান্ড ও রিটার্ন শর্তাবলী (Terms & Conditions)
              </label>
              <textarea
                rows={5}
                value={policyForm.refund_policy_terms}
                onChange={(e) => setPolicyForm({ ...policyForm, refund_policy_terms: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                placeholder="প্রতিটি শর্ত আলাদা লাইনে লিখুন..."
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">গ্রাহকের জন্য রিফান্ডের প্রযোজ্য সকল নিয়ম ও শর্তাবলী লিখুন</span>
            </div>

            {/* Step-by-Step Process */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                রিফান্ড পাওয়ার সহজ ধাপসমূহ (Step-by-Step Process)
              </label>
              <textarea
                rows={5}
                value={policyForm.refund_process_steps}
                onChange={(e) => setPolicyForm({ ...policyForm, refund_process_steps: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                placeholder="ধাপ ১, ধাপ ২ ইত্যাদি ক্রমানুসারে লিখুন..."
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">গ্রাহক কীভাবে রিফান্ড পাবেন তার ধারাবাহিক নিয়মাবলি</span>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={policySaving}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {policySaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{policySaving ? 'সংরক্ষণ হচ্ছে...' : 'পলিসি সেটিংস সেভ করুন'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================= DETAIL & REVIEW MODAL ======================= */}
      {selectedRefund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-sm font-black text-amber-400">
                    #{selectedRefund.id}
                  </span>
                  {getStatusBadge(selectedRefund.status)}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  অর্ডার কোড: <span className="text-white font-mono font-bold">{selectedRefund.order_code}</span>
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedRefund(null);
                  setActionModal(null);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Order Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">গ্রাহকের তথ্য</span>
                <p className="text-sm font-bold text-white mt-1">{selectedRefund.user_name}</p>
                <p className="text-xs text-slate-400 font-mono">{selectedRefund.user_phone}</p>
                {selectedRefund.user_email && <p className="text-xs text-slate-400">{selectedRefund.user_email}</p>}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">টাকা ফেরতের মাধ্যম ও নম্বর</span>
                <div className="flex items-center space-x-2 mt-1">
                  {getMethodBadge(selectedRefund.preferred_method)}
                  <span className="text-sm font-black text-amber-400 font-mono">
                    {selectedRefund.payout_account || 'ব্যাংক ট্রান্সফার'}
                  </span>
                </div>
                {selectedRefund.bank_details && (
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    ব্যাংক: {selectedRefund.bank_details.bank_name || 'N/A'} • একাউন্ট: {selectedRefund.bank_details.account_number}
                  </div>
                )}
              </div>
            </div>

            {/* Products List & Refund Amount */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">রিফান্ড চাওয়া পণ্যসমূহ</span>
              <div className="space-y-2">
                {selectedRefund.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center space-x-3">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-slate-700" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-white block">{item.title}</span>
                        <span className="text-[11px] text-slate-400">
                          ৳{toBengaliDigits(item.price)} × {toBengaliDigits(item.quantity)} টি
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-black text-amber-400 text-sm">
                      ৳{toBengaliDigits((item.price * item.quantity).toLocaleString())}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="font-bold text-amber-300">সর্বমোট রিফান্ড পরিমাণ:</span>
                <span className="font-mono font-black text-amber-400 text-base">
                  ৳{toBengaliDigits(selectedRefund.total_refund_amount?.toLocaleString())}
                </span>
              </div>
            </div>

            {/* Customer Reason & Detailed Note */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">রিফান্ডের কারণ</span>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <p className="font-bold text-amber-300">{selectedRefund.reason}</p>
                {selectedRefund.detailed_reason ? (
                  <p className="text-slate-300 leading-relaxed">{selectedRefund.detailed_reason}</p>
                ) : (
                  <p className="text-slate-500 italic">কোনো অতিরিক্ত বিবরণ দেওয়া হয়নি</p>
                )}
              </div>
            </div>

            {/* Evidence Images (if provided) */}
            {selectedRefund.evidence_images && selectedRefund.evidence_images.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">গ্রাহকের প্রমাণস্বরূপ ছবি</span>
                <div className="flex flex-wrap gap-2.5">
                  {selectedRefund.evidence_images.map((imgUrl, idx) => (
                    <a 
                      key={idx} 
                      href={imgUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block group relative"
                    >
                      <img 
                        src={imgUrl} 
                        alt="Evidence" 
                        className="w-20 h-20 rounded-xl object-cover border border-slate-700 hover:border-amber-400 transition-colors" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Payout Details (If already completed or rejected) */}
            {selectedRefund.refund_trx_id && (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1">
                <span className="font-bold text-emerald-400 block">✓ পরিশোধিত ট্রানজেকশন আইডি (TrxID)</span>
                <span className="font-mono font-black text-white text-sm">{selectedRefund.refund_trx_id}</span>
              </div>
            )}

            {selectedRefund.rejection_reason && (
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs space-y-1">
                <span className="font-bold text-rose-400 block">✕ বাতিলের কারণ</span>
                <p className="text-slate-300">{selectedRefund.rejection_reason}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t border-slate-800 pt-5 space-y-4">
              
              {actionSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* Action Form when clicking Complete or Reject */}
              {actionModal === 'complete' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>রিফান্ড সম্পন্ন করুন — ট্রানজেকশন তথ্য</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    গ্রাহকের <span className="text-amber-400 font-bold">{selectedRefund.payout_account}</span> নম্বরে ৳{toBengaliDigits(selectedRefund.total_refund_amount)} পাঠিয়ে ট্রানজেকশন আইডি দিন:
                  </p>
                  <input
                    type="text"
                    placeholder="পেমেন্ট TrxID (যেমন: 9L87X5ZA2)"
                    value={refundTrxId}
                    onChange={(e) => setRefundTrxId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="অতিরিক্ত মন্তব্য / নোট (ঐচ্ছিক)"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setActionModal(null)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('Completed')}
                      disabled={updatingStatus}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
                    >
                      {updatingStatus ? 'সম্পন্ন হচ্ছে...' : 'নিশ্চিত করুন'}
                    </button>
                  </div>
                </div>
              )}

              {actionModal === 'reject' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>রিফান্ড আবেদন বাতিল — কারণ উল্লেখ করুন</span>
                  </h4>
                  <textarea
                    rows={2}
                    placeholder="আবেদন বাতিলের সুনির্দিষ্ট কারণ লিখুন যা গ্রাহক দেখতে পাবেন..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setActionModal(null)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      ফিরে যান
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('Rejected')}
                      disabled={updatingStatus}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
                    >
                      {updatingStatus ? 'বাতিল হচ্ছে...' : 'বাতিল নিশ্চিত করুন'}
                    </button>
                  </div>
                </div>
              )}

              {/* Main Action Bar */}
              {!actionModal && (
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-2">
                    {selectedRefund.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus('Approved')}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>আবেদন অনুমোদন করুন</span>
                      </button>
                    )}

                    {(selectedRefund.status === 'Approved' || selectedRefund.status === 'Pending') && (
                      <button
                        onClick={() => handleUpdateStatus('Processing')}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>প্রসেসিং-এ পাঠান</span>
                      </button>
                    )}

                    {selectedRefund.status !== 'Completed' && (
                      <button
                        onClick={() => setActionModal('complete')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>রিফান্ড সম্পন্ন (TrxID)</span>
                      </button>
                    )}
                  </div>

                  {selectedRefund.status !== 'Rejected' && selectedRefund.status !== 'Completed' && (
                    <button
                      onClick={() => setActionModal('reject')}
                      className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>আবেদন বাতিল</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
