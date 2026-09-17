import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  ExternalLink, 
  User, 
  Calendar, 
  ShieldCheck, 
  Check, 
  RefreshCw,
  Eye,
  Printer,
  Download,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminCustomerProfileModal from '../../components/AdminCustomerProfileModal';
import LuxuryLoyaltyCard from '../../components/LuxuryLoyaltyCard';

export default function AdminLoyaltyDesk({ onOpenInvoice }) {
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
  const [printCardModal, setPrintCardModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (n) => String(n ?? '').replace(/[0-9]/g, d => bengaliDigits[+d]);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/loyalty-applications', {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('alansar_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching loyalty applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token]);

  // Status update (1-click Approve / Reject)
  const handleUpdateStatus = async (appId, status, applicantName) => {
    let customNotes = status === 'Approved' 
      ? 'আবেদন যাচাই সম্পন্ন হয়েছে এবং ডিজিটাল লয়ালটি কার্ড সক্রিয় করা হয়েছে।' 
      : (adminNotes.trim() || 'তথ্য অসম্পূর্ণ থাকায় আবেদনটি বাতিল করা হয়েছে।');

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/loyalty-applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('alansar_token')}`
        },
        body: JSON.stringify({ 
          status, 
          notes: customNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(status === 'Approved' 
          ? `গ্রাহক "${applicantName}" এর ভিআইপি কার্ড অনুমোদন করা হয়েছে!` 
          : `গ্রাহক "${applicantName}" এর আবেদনটি বাতিল করা হয়েছে।`);
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

  const handlePrint = () => {
    const origTitle = document.title;
    document.title = `AL_ANSAR_VIP_CARD_${printCardModal?.loyalty_card_number || 'CARD'}`;
    window.print();
    setTimeout(() => { document.title = origTitle; }, 1000);
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
              ভিআইপি মেম্বারশিপ ডেস্ক
            </span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                {toBn(pendingCount)} টি অপেক্ষমাণ
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center space-x-2">
            <CreditCard className="w-7 h-7 text-amber-400" />
            <span>ভিআইপি লয়ালটি কার্ড আবেদন ও প্রিন্ট কন্ট্রোল</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            লয়ালটি মেম্বারশিপ আবেদন যাচাই, ১-ক্লিক অনুমোদন, কার্ড প্রিন্ট ও ডাউনলোড এবং পয়েন্ট ব্যবস্থাপনা
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
            <span className="text-xs font-bold text-emerald-400">অনুমোদিত ভিআইপি সদস্য</span>
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
            placeholder="নাম, মোবাইল নম্বর বা TrxID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        {/* Filter Tabs */}
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

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>ভিআইপি কার্ড আবেদন লোড হচ্ছে...</span>
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
                  <th className="p-3.5">শহর / ঠিকানা</th>
                  <th className="p-3.5">ফি TrxID (৳৫০০)</th>
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
                            className="w-8 h-8 rounded-xl object-cover border border-amber-500/40 cursor-pointer"
                            onClick={() => setZoomPhoto(app.user_photo)}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black">
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
                      <span className="font-bold text-slate-200 block">{app.nid_number || 'N/A'}</span>
                      <div className="flex items-center space-x-1.5 mt-1">
                        {app.nid_front_photo && (
                          <button 
                            type="button"
                            onClick={() => setZoomPhoto(app.nid_front_photo)}
                            className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 hover:bg-amber-500/20"
                          >
                            সামনে
                          </button>
                        )}
                        {app.nid_back_photo && (
                          <button 
                            type="button"
                            onClick={() => setZoomPhoto(app.nid_back_photo)}
                            className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 hover:bg-amber-500/20"
                          >
                            পেছনে
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="text-white font-bold block">{app.city || 'ঢাকা'}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">{app.address}</span>
                    </td>

                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-amber-400 block">{app.transaction_id || 'N/A'}</span>
                      <span className="text-[10px] text-slate-400">৳{app.payment_amount || 500} ({app.sender_number || 'Mobile'})</span>
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
                            setAdminNotes('');
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                          title="পর্যালোচনা ও যাচাই করুন"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>পর্যালোচনা</span>
                        </button>

                        <button
                          onClick={() => {
                            setPrintCardModal({
                              name: app.name,
                              phone: app.phone,
                              loyalty_card_number: app.loyalty_card_number || `ANSAR-VIP-${app.id?.slice(0, 4)}-2026`,
                              loyalty_points: app.loyalty_points || 150,
                              qard_credit_limit: 5000
                            });
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl font-bold flex items-center space-x-1 cursor-pointer text-xs"
                          title="কার্ড প্রিন্ট ও ডাউনলোড করুন"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>প্রিন্ট কার্ড</span>
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

      {/* Review Modal */}
      {selectedApp && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in"
          onClick={() => setSelectedApp(null)}
        >
          <div 
            className="bg-slate-900 border border-amber-500/40 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-900/40 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">
                  ভিআইপি কার্ড আবেদন পর্যালোচনা
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
              
              {/* Applicant Info */}
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
                <p className="text-slate-300 text-[11px]">📍 শহর: <strong>{selectedApp.city || 'ঢাকা'}</strong> • ঠিকানা: {selectedApp.address || 'দেওয়া হয়নি'}</p>
              </div>

              {/* Photos Gallery */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-400" /> জাতীয় পরিচয়পত্র ও আবেদনকারীর ছবি (ক্লিক করে বড় দেখুন)
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

              {/* Fee Verification */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">মেম্বারশিপ ফি যাচাই</span>
                  <p className="font-mono font-bold text-amber-400 text-xs mt-0.5">
                    TrxID: {selectedApp.transaction_id || 'কোনো ট্রানজেকশন নেই'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 font-mono">৳{selectedApp.payment_amount || 500}</span>
                  <p className="text-[10px] text-slate-400">প্রেরক: {selectedApp.sender_number || 'N/A'}</p>
                </div>
              </div>

              {/* Decline Reason / Notes Input */}
              {selectedApp.status !== 'Approved' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">অ্যাডমিন নোট বা বাতিলের কারণ:</label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="বাতিলের কারণ লিখুন..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2">
                {selectedApp.status === 'Pending' ? (
                  <>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(selectedApp.id, 'Approved', selectedApp.name)}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>অনুমোদন ও কার্ড সক্রিয় করুন</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(selectedApp.id, 'Declined', selectedApp.name)}
                      className="py-3 px-4 bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </>
                ) : selectedApp.status === 'Approved' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPrintCardModal({
                        name: selectedApp.name,
                        phone: selectedApp.phone,
                        loyalty_card_number: selectedApp.loyalty_card_number || `ANSAR-VIP-${selectedApp.id?.slice(0, 4)}-2026`,
                        loyalty_points: selectedApp.loyalty_points || 150,
                        qard_credit_limit: 5000
                      });
                    }}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>🖨️ এই গ্রাহকের ভিআইপি কার্ড প্রিন্ট ও ডাউনলোড করুন</span>
                  </button>
                ) : null}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* VIP Card Print & Download Modal */}
      {printCardModal && (
        <div 
          className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs font-sans animate-in fade-in"
          onClick={() => setPrintCardModal(null)}
        >
          <div 
            className="bg-slate-900 border border-amber-500/40 w-full max-w-md rounded-3xl p-6 space-y-4 text-slate-100 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">ভিআইপি মেম্বারশিপ কার্ড প্রিন্ট প্রিভিউ</h3>
              </div>
              <button 
                type="button"
                onClick={() => setPrintCardModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3D Rendered Loyalty Card */}
            <div className="p-2 py-4 flex justify-center w-full">
              <LuxuryLoyaltyCard user={printCardModal} />
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              কার্ডটিতে ক্লিক করে সামনে ও পেছনের দিক উল্টে দেখতে পারবেন।
            </p>

            {/* Print & Download Action Buttons */}
            <div className="flex items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ প্রিন্ট করুন (Print Card)</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintCardModal(null)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile Modal */}
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
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border-2 border-amber-500 shadow-2xl" 
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
