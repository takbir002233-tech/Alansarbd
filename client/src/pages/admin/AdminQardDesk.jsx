import React, { useState, useEffect } from 'react';
import { 
  HandHeart, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  ExternalLink, 
  User, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Check, 
  RefreshCw,
  Eye,
  PlusCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminCustomerProfileModal from '../../components/AdminCustomerProfileModal';

export default function AdminQardDesk({ onOpenInvoice }) {
  const { token, hasPermission } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [successToast, setSuccessToast] = useState('');

  // Selected for review modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [viewProfileUser, setViewProfileUser] = useState(null);
  const [zoomPhoto, setZoomPhoto] = useState(null);

  // Approval modal state
  const [approveLimit, setApproveLimit] = useState(5000);
  const [approveNotes, setApproveNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Due Date Extension modal state
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendMonths, setExtendMonths] = useState(1);
  const [extendNotes, setExtendNotes] = useState('');

  // Repayment modal state
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayNotes, setRepayNotes] = useState('');

  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (n) => String(n ?? '').replace(/[0-9]/g, d => bengaliDigits[+d]);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/qard-applications', {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('alansar_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching Qard applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token]);

  // Status update (Approve / Reject)
  const handleUpdateStatus = async (appId, status, notes, limit = null) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/qard-applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('alansar_token')}`
        },
        body: JSON.stringify({
          status,
          notes,
          requested_limit: limit ? Number(limit) : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(status === 'Approved' ? 'করযে হাসানা আবেদনটি অনুমোদিত হয়েছে!' : 'আবেদনটি প্রত্যাখ্যান করা হয়েছে।');
        setSelectedApp(null);
        fetchApplications();
      } else {
        alert(data.message || 'আপডেট করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error(err);
      alert('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  // Extend due date
  const handleExtendDueDate = async (userId) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/extend-qard-due`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('alansar_token')}`
        },
        body: JSON.stringify({
          additional_months: Number(extendMonths) || 1,
          notes: extendNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`ঋণ পরিশোধের মেয়াদ আরও ${extendMonths} মাস বৃদ্ধি করা হয়েছে!`);
        setShowExtendModal(false);
        fetchApplications();
      } else {
        alert(data.message || 'মেয়াদ বৃদ্ধি করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Repay Qard Debt
  const handleRepayDebt = async (userId) => {
    if (!userId || !repayAmount) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/repay-qard`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('alansar_token')}`
        },
        body: JSON.stringify({
          amount: Number(repayAmount),
          notes: repayNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`৳${Number(repayAmount).toLocaleString()} সফলভাবে সমন্বয় করা হয়েছে!`);
        setShowRepayModal(false);
        setRepayAmount('');
        fetchApplications();
      } else {
        alert(data.message || 'ঋণ সমন্বয় করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchSearch = 
      (app.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.phone || '').includes(searchTerm) ||
      (app.nid_number || '').includes(searchTerm) ||
      (app.transaction_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = applications.filter(a => a.status === 'Pending').length;
  const approvedCount = applications.filter(a => a.status === 'Approved').length;
  const declinedCount = applications.filter(a => a.status === 'Declined' || a.status === 'Rejected').length;

  return (
    <div className="space-y-6 animate-in fade-in max-w-7xl font-sans text-slate-100">
      
      {/* Toast */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center space-x-2 animate-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-200" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              সুদমুক্ত সেবা ডেস্ক
            </span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                {toBn(pendingCount)} টি অপেক্ষমাণ
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center space-x-2">
            <HandHeart className="w-7 h-7 text-emerald-400" />
            <span>করযে হাসানা আবেদন ও ঋণ ব্যবস্থাপনা ডেস্ক</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            এনআইডি ছবি ও আবেদনকারী যাচাইকরণ, ১-ক্লিক অনুমোদন, মেয়াদ বৃদ্ধি এবং ঋণ সমন্বয় নিয়ন্ত্রণ
          </p>
        </div>

        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs font-bold text-slate-400 block">মোট আবেদন</span>
          <span className="text-2xl font-black text-white font-mono block mt-1">
            {toBn(applications.length)} <span className="text-xs text-slate-400 font-normal">টি</span>
          </span>
        </div>

        <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400">অপেক্ষমাণ আবেদন</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-300 font-mono block mt-1">
            {toBn(pendingCount)} <span className="text-xs text-amber-400/80 font-normal">টি</span>
          </span>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">অনুমোদিত ঋণগ্রহীতা</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-300 font-mono block mt-1">
            {toBn(approvedCount)} <span className="text-xs text-emerald-400/80 font-normal">জন</span>
          </span>
        </div>

        <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400">বাতিলকৃত আবেদন</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-black text-rose-300 font-mono block mt-1">
            {toBn(declinedCount)} <span className="text-xs text-rose-400/80 font-normal">টি</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="নাম, ফোন, এনআইডি বা TrxID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `সকল (${applications.length})` },
            { id: 'Pending', label: `অপেক্ষমাণ (${pendingCount})`, badge: pendingCount > 0 },
            { id: 'Approved', label: `অনুমোদিত (${approvedCount})` },
            { id: 'Declined', label: `বাতিল (${declinedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
                statusFilter === tab.id
                  ? 'bg-amber-600 text-slate-950 font-black shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>করযে হাসানা আবেদনসমূহ লোড হচ্ছে...</span>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            কোনো আবেদন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">আবেদনকারী</th>
                  <th className="p-3.5">এনআইডি ও ছবি</th>
                  <th className="p-3.5">কাঙ্ক্ষিত লিমিট</th>
                  <th className="p-3.5">ফি TrxID (৳৩০০)</th>
                  <th className="p-3.5">আবেদনের তারিখ</th>
                  <th className="p-3.5">স্ট্যাটাস</th>
                  <th className="p-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2.5">
                        {app.user_photo ? (
                          <img 
                            src={app.user_photo} 
                            alt="" 
                            className="w-8 h-8 rounded-xl object-cover border border-emerald-500/40 cursor-pointer"
                            onClick={() => setZoomPhoto(app.user_photo)}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black">
                            {app.name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-black text-white">{app.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">📞 {app.phone}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-slate-200 block">{app.nid_number}</span>
                      <div className="flex items-center space-x-1.5 mt-1">
                        {app.nid_front_photo && (
                          <button 
                            type="button"
                            onClick={() => setZoomPhoto(app.nid_front_photo)}
                            className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 hover:bg-emerald-500/20"
                          >
                            সামনে
                          </button>
                        )}
                        {app.nid_back_photo && (
                          <button 
                            type="button"
                            onClick={() => setZoomPhoto(app.nid_back_photo)}
                            className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 hover:bg-emerald-500/20"
                          >
                            পেছনে
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 font-mono font-black text-emerald-400 text-sm">
                      ৳{Number(app.requested_limit || 5000).toLocaleString()}
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-amber-400 block">{app.transaction_id || 'N/A'}</span>
                      <span className="text-[10px] text-slate-400">৳{app.payment_amount || 300} ({app.sender_number || 'Mobile'})</span>
                    </td>

                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        app.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                        app.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' :
                        'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {app.status === 'Approved' ? '✓ অনুমোদিত' : app.status === 'Pending' ? '⏳ অপেক্ষমাণ' : '✕ বাতিল'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setApproveLimit(app.requested_limit || 5000);
                            setApproveNotes(`এনআইডি (${app.nid_number}) সফলভাবে যাচাইকৃত। ৳${(app.requested_limit || 5000).toLocaleString()} করযে হাসানা লিমিট মঞ্জুর করা হলো।`);
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                          title="পর্যালোচনা ও যাচাই করুন"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>পর্যালোচনা</span>
                        </button>

                        <button
                          onClick={() => setViewProfileUser({ id: app.user_id, name: app.name, phone: app.phone })}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                          title="গ্রাহকের সম্পূর্ণ প্রোফাইল ড্যাশবোর্ড দেখুন"
                        >
                          <User className="w-3.5 h-3.5" />
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

      {/* Review & Action Modal */}
      {selectedApp && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in"
          onClick={() => setSelectedApp(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-900/40 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HandHeart className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white">
                  করযে হাসানা আবেদন পর্যালোচনা
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedApp(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Applicant Card */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-black text-white">{selectedApp.name}</h4>
                    <p className="text-slate-400 font-mono text-xs">📞 {selectedApp.phone} {selectedApp.email ? `• ✉️ ${selectedApp.email}` : ''}</p>
                  </div>
                  <button
                    onClick={() => {
                      setViewProfileUser({ id: selectedApp.user_id, name: selectedApp.name, phone: selectedApp.phone });
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>প্রোফাইল ড্যাশবোর্ড</span>
                  </button>
                </div>
                <p className="text-slate-300 text-[11px]">📍 ঠিকানা: {selectedApp.address || 'দেওয়া হয়নি'}</p>
              </div>

              {/* 3 Photos Slot with Click to Zoom */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" /> জাতীয় পরিচয়পত্র ও আবেদনকারীর ছবি (ক্লিক করে বড় দেখুন)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div 
                    className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 cursor-pointer group"
                    onClick={() => selectedApp.nid_front_photo && setZoomPhoto(selectedApp.nid_front_photo)}
                  >
                    {selectedApp.nid_front_photo ? (
                      <img src={selectedApp.nid_front_photo} alt="NID Front" className="w-full h-20 object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="h-20 flex items-center justify-center text-slate-600">ছবি নেই</div>
                    )}
                    <div className="p-1 bg-slate-950/90 text-center text-[10px] font-bold text-slate-300">এনআইডি (সামনে)</div>
                  </div>

                  <div 
                    className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 cursor-pointer group"
                    onClick={() => selectedApp.nid_back_photo && setZoomPhoto(selectedApp.nid_back_photo)}
                  >
                    {selectedApp.nid_back_photo ? (
                      <img src={selectedApp.nid_back_photo} alt="NID Back" className="w-full h-20 object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="h-20 flex items-center justify-center text-slate-600">ছবি নেই</div>
                    )}
                    <div className="p-1 bg-slate-950/90 text-center text-[10px] font-bold text-slate-300">এনআইডি (পেছনে)</div>
                  </div>

                  <div 
                    className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 cursor-pointer group"
                    onClick={() => selectedApp.user_photo && setZoomPhoto(selectedApp.user_photo)}
                  >
                    {selectedApp.user_photo ? (
                      <img src={selectedApp.user_photo} alt="Selfie" className="w-full h-20 object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="h-20 flex items-center justify-center text-slate-600">ছবি নেই</div>
                    )}
                    <div className="p-1 bg-slate-950/90 text-center text-[10px] font-bold text-slate-300">আবেদনকারীর ছবি</div>
                  </div>
                </div>
              </div>

              {/* Fee Verification Box */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">আবেদন ফি যাচাই</span>
                  <p className="font-mono font-bold text-amber-400 text-xs mt-0.5">
                    TrxID: {selectedApp.transaction_id || 'কোনো ট্রানজেকশন নেই'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 font-mono">৳{selectedApp.payment_amount || 300}</span>
                  <p className="text-[10px] text-slate-400">প্রেরক: {selectedApp.sender_number || 'N/A'}</p>
                </div>
              </div>

              {/* Admin Note Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">অ্যাডমিন নোট / বার্তা:</label>
                <textarea
                  rows={2}
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  placeholder="অনুমোদন বা বাতিলের কারণ লিখুন..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Action Buttons for Pending */}
              {selectedApp.status === 'Pending' && (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedApp.id, 'Approved', approveNotes, approveLimit)}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>অনুমোদন করুন (Approve)</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedApp.id, 'Declined', approveNotes || 'জাতীয় পরিচয়পত্র বা তথ্যে অসঙ্গতি থাকায় আবেদনটি বাতিল করা হয়েছে।')}
                    className="py-3 px-4 bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    বাতিল (Decline)
                  </button>
                </div>
              )}

              {/* Quick Actions if already approved */}
              {selectedApp.status === 'Approved' && (
                <div className="pt-2 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">✓ করযে হাসানা লিমিট সক্রিয় রয়েছে</span>
                    <span className="text-sm font-black font-mono text-emerald-300">৳{selectedApp.requested_limit || 5000}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowExtendModal(true)}
                      className="flex-1 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>মেয়াদ বৃদ্ধি করুন (Extend Due)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRepayModal(true)}
                      className="flex-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>ঋণ সমন্বয় / পরিশোধ</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Extend Due Date Sub-Modal */}
      {showExtendModal && selectedApp && (
        <div 
          className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs font-sans animate-in fade-in"
          onClick={() => setShowExtendModal(false)}
        >
          <div 
            className="bg-slate-900 border border-amber-500/40 w-full max-w-sm rounded-3xl p-5 space-y-4 text-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-black text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>ঋণ পরিশোধের মেয়াদ বৃদ্ধি</span>
            </h4>
            <p className="text-xs text-slate-400">
              গ্রাহক "{selectedApp.name}" এর জন্য পরিশোধের নির্ধারিত সময় বৃদ্ধি করুন:
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">অতিরিক্ত মাস যোগ করুন:</label>
              <select
                value={extendMonths}
                onChange={(e) => setExtendMonths(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="1">+ ১ মাস বৃদ্ধি</option>
                <option value="2">+ ২ মাস বৃদ্ধি</option>
                <option value="3">+ ৩ মাস বৃদ্ধি</option>
                <option value="6">+ ৬ মাস বৃদ্ধি</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">অ্যাডমিন কারণ / নোট:</label>
              <input
                type="text"
                placeholder="যেমন: গ্রাহকের বিশেষ আবেদনে মেয়াদ বাড়ানো হলো"
                value={extendNotes}
                onChange={(e) => setExtendNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExtendModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleExtendDueDate(selectedApp.user_id)}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
              >
                {actionLoading ? 'সেভ হচ্ছে...' : 'মেয়াদ নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repay Qard Debt Sub-Modal */}
      {showRepayModal && selectedApp && (
        <div 
          className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs font-sans animate-in fade-in"
          onClick={() => setShowRepayModal(false)}
        >
          <div 
            className="bg-slate-900 border border-emerald-500/40 w-full max-w-sm rounded-3xl p-5 space-y-4 text-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-black text-white flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>বকেয়া ঋণ সমন্বয় বা আদায়</span>
            </h4>
            <p className="text-xs text-slate-400">
              গ্রাহক "{selectedApp.name}" এর পরিশোধিত কিস্তির টাকা সমন্বয় করুন:
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">পরিশোধিত টাকার পরিমাণ (BDT):</label>
              <input
                type="number"
                placeholder="যেমন: 500"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">নোট / মেমো নম্বর:</label>
              <input
                type="text"
                placeholder="যেমন: ক্যাশ রিসিট #481"
                value={repayNotes}
                onChange={(e) => setRepayNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRepayModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={actionLoading || !repayAmount}
                onClick={() => handleRepayDebt(selectedApp.user_id)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
              >
                {actionLoading ? 'সেভ হচ্ছে...' : 'ঋণ সমন্বয় করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile & Activity Modal */}
      {viewProfileUser && (
        <AdminCustomerProfileModal
          isOpen={!!viewProfileUser}
          user={viewProfileUser}
          onClose={() => setViewProfileUser(null)}
          onOpenInvoice={onOpenInvoice}
        />
      )}

      {/* Image Zoom Modal */}
      {zoomPhoto && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/95 flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
          onClick={() => setZoomPhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[88vh]">
            <img 
              src={zoomPhoto} 
              alt="Zoomed" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border-2 border-emerald-500 shadow-2xl" 
            />
            <button 
              type="button"
              onClick={() => setZoomPhoto(null)}
              className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
