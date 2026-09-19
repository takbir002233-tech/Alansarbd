import React, { useState, useEffect } from 'react';
import { 
  X, 
  HandHeart, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  FileText,
  Check,
  Camera,
  Upload,
  Image as ImageIcon,
  CreditCard,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import useScrollLock from '../hooks/useScrollLock';
import PaymentGatewayModal from './PaymentGatewayModal';

export default function QardApplicationModal({ isOpen, onClose, onSuccess, onNavigate, initialReapply = false }) {
  const { user, refreshUser } = useAuth();
  const { siteSettings } = useCart();
  useScrollLock(isOpen);

  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (n) => String(n ?? '').replace(/[0-9]/g, d => bengaliDigits[+d]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    nid_number: user?.nid_number || '',
    address: user?.address || '',
    requested_limit: '5000',
    notes: '',
    nid_front_photo: user?.nid_front_photo || '',
    nid_back_photo: user?.nid_back_photo || '',
    user_photo: user?.user_photo || ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reapplyMode, setReapplyMode] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Sync user details and inherited NID photos to form
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
        nid_number: prev.nid_number || user.nid_number || '',
        address: prev.address || user.address || '',
        nid_front_photo: prev.nid_front_photo || user.nid_front_photo || '',
        nid_back_photo: prev.nid_back_photo || user.nid_back_photo || '',
        user_photo: prev.user_photo || user.user_photo || ''
      }));
    }
    if (isOpen) {
      if (initialReapply || user?.qard_status === 'Needs Correction') {
        setReapplyMode(true);
      }
    }
    // Cleanup any lingering global flag
    try {
      localStorage.removeItem('alansar_qard_applied_global');
    } catch (e) {}
  }, [user, isOpen, initialReapply]);

  const isDeclined = user?.qard_status === 'Declined' || user?.qard_status === 'Rejected';
  const isNeedsCorrection = user?.qard_status === 'Needs Correction';
  const isPending = user?.qard_status === 'Pending';
  const isApproved = user?.qard_status === 'Approved';

  // Check if already applied (scoped to logged-in user only, NOT global across accounts)
  const hasAlreadyApplied = React.useMemo(() => {
    if (reapplyMode || isNeedsCorrection) return false;
    if (isPending || isApproved) return true;
    if (user?.id && localStorage.getItem(`alansar_qard_applied_user_${user.id}`) === 'true') return true;
    return false;
  }, [isOpen, user, isPending, isApproved, reapplyMode, isNeedsCorrection]);

  if (!isOpen) return null;

  const handleCloseAndRedirectHome = () => {
    onClose();
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.hash = '';
      window.location.pathname = '/';
    }
  };

  const handleGeneralClose = () => {
    if (isSubmitted || hasAlreadyApplied || (isDeclined && !reapplyMode)) {
      handleCloseAndRedirectHome();
    } else {
      onClose();
    }
  };

  const handlePhotoUpload = (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setErrorMsg('ছবির সাইজ সর্বোচ্চ ৬ মেগাবাইট হতে পারবে।');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, [field]: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const hasInheritedPhotos = Boolean(
    (formData.nid_front_photo || user?.nid_front_photo) &&
    (formData.nid_back_photo || user?.nid_back_photo) &&
    (formData.user_photo || user?.user_photo)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!agreedToTerms) {
      setErrorMsg('আবেদন জমা দিতে শর্তাবলী ও নিয়মাবলীতে সম্মত হয়ে টিক চিহ্ন দিন।');
      return;
    }
    if (!formData.name.trim()) {
      setErrorMsg('আপনার সম্পূর্ণ নাম লিখুন।');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }
    if (!formData.nid_number.trim() || formData.nid_number.length < 10) {
      setErrorMsg('সঠিক জাতীয় পরিচয়পত্র (NID) নম্বর প্রদান করুন।');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('আপনার বর্তমান ও স্থায়ী ঠিকানা প্রদান করুন।');
      return;
    }
    if (!formData.nid_front_photo || !formData.nid_back_photo || !formData.user_photo) {
      setErrorMsg('এনআইডি কার্ডের সামনের ও পেছনের ছবি এবং আপনার নিজের ছবি যুক্ত করা আবশ্যক।');
      return;
    }

    setShowPaymentModal(true);
  };

  const executeApplicationSubmit = async (paymentData = {}) => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        ...formData,
        user_id: user?.id || null,
        payment_method: paymentData.payment_method || 'mfs',
        payment_amount: Number(paymentData.payment_amount) || Number(siteSettings?.qard_application_fee || 0),
        transaction_id: paymentData.transaction_id || '',
        sender_number: paymentData.sender_number || '',
        sender_bank_name: paymentData.sender_bank_name || ''
      };

      const res = await fetch('/api/admin/qard-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'আবেদন জমা দেওয়া সম্ভব হয়নি।');
      }

      // Persist that user applied once
      if (user?.id) {
        localStorage.setItem(`alansar_qard_applied_user_${user.id}`, 'true');
      }
      try {
        localStorage.removeItem('alansar_qard_applied_global');
      } catch (e) {}

      setShowPaymentModal(false);
      setIsSubmitted(true);
      setReapplyMode(false);
      setSuccessMsg('আপনার আবেদন ও পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে! অ্যাডমিন টিম যাচাই করে লিমিট অনুমোদন করবে।');
      if (refreshUser) refreshUser();
      if (onSuccess) onSuccess(data.application);
    } catch (err) {
      setErrorMsg(err.message || 'সার্ভারে সংযোগ দেওয়া যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTermsClick = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    onClose();
    if (onNavigate) {
      onNavigate('terms');
    } else {
      window.location.hash = '#terms';
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
        onClick={handleGeneralClose}
      >
      {/* Centered Modal Card matching Register modal architecture */}
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-emerald-300/80 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Bar (Register style with Dual-Language Back Button and Close) */}
        <div className="bg-gradient-to-r from-emerald-900/15 via-emerald-100/50 to-emerald-900/15 px-3 sm:px-4 py-2 border-b border-emerald-200/80 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={handleGeneralClose}
            className="flex items-center space-x-1 text-[11px] font-black text-slate-800 hover:text-emerald-900 bg-white/90 hover:bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="বন্ধ করে ফিরে যান"
          >
            <ArrowLeft className="w-3 h-3 text-emerald-700 flex-shrink-0" />
            <span>← ফিরে যান (Back)</span>
          </button>

          <span className="text-[11px] font-black text-emerald-900 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center space-x-1">
            <HandHeart className="w-3 h-3 text-emerald-700" />
            <span>করযে হাসানা আবেদন</span>
          </span>

          <button
            type="button"
            onClick={handleGeneralClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto modal-scrollable overscroll-contain space-y-3 flex-1 text-xs">
          
          {/* Brand Header with Logo (Register modal style) */}
          <div className="text-center space-y-1 pb-1">
            <div className="flex justify-center">
              <img 
                src="/logo.jpg" 
                alt="AL ANSAR" 
                className="w-10 h-10 object-contain rounded-2xl border-2 border-emerald-500 ring-2 ring-emerald-400/30 shadow-xs"
              />
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center justify-center space-x-1.5">
              <span>করযে হাসানা ঋণের আবেদন ফর্ম</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            </h2>
            <p className="text-[11px] text-emerald-800 font-medium">
              ১০০% সুদমুক্ত ইসলামী ঋণ সেবা • কোনো অতিরিক্ত চার্জ বা হিডেন ফি নেই
            </p>
          </div>

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start space-x-2 text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs">আবেদন সফল হয়েছে!</h4>
                <p className="mt-0.5 text-[11px] leading-relaxed">{successMsg}</p>
              </div>
            </div>
          )}

          {isDeclined && !reapplyMode && !isSubmitted ? (
            /* Declined Status Screen */
            <div className="py-6 px-3 sm:px-6 text-center space-y-4 flex flex-col items-center justify-center animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-rose-100 border-2 border-rose-500 text-rose-600 flex items-center justify-center shadow-lg">
                <AlertCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-3.5 py-1 rounded-full border border-rose-200 uppercase tracking-wide">
                  আবেদন স্ট্যাটাস: প্রত্যাখ্যাত (Declined)
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  আপনার করযে হাসানা আবেদনটি অনুমোদিত হয়নি
                </h3>
                <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-2xl max-w-sm mx-auto text-left space-y-1 shadow-2xs">
                  <span className="text-[11px] font-black text-rose-900 block">প্রত্যাখ্যানের কারণ (Admin Note):</span>
                  <p className="text-xs text-rose-800 leading-relaxed font-medium">
                    {user?.qard_decline_reason || 'জাতীয় পরিচয়পত্র বা তথ্যে অসঙ্গতি থাকায় আপনার আবেদনটি এই মুহূর্তে অনুমোদন করা সম্ভব হয়নি।'}
                  </p>
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  তথ্য সংশোধন করে আপনি এখনই নতুন করে পুনরায় আবেদন করতে পারেন।
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => { setReapplyMode(true); setErrorMsg(null); }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <span>🔄 সংশোধিত তথ্য দিয়ে পুনরায় আবেদন করুন</span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseAndRedirectHome}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
                >
                  <span>হোম পেজে ফিরে যান</span>
                </button>
              </div>
            </div>
          ) : isSubmitted || hasAlreadyApplied ? (
            /* Success / Already Submitted Confirmation Screen */
            <div className="py-6 px-3 sm:px-6 text-center space-y-4 flex flex-col items-center justify-center animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-700 flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {hasAlreadyApplied && !isSubmitted
                    ? 'আপনার আবেদনটি ইতিপূর্বে সফলভাবে গ্রহণ করা হয়েছে!'
                    : 'আপনার আবেদনটি সফলভাবে গ্রহণ করা হয়েছে!'}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {hasAlreadyApplied && !isSubmitted
                    ? 'আপনি ইতিপূর্বে করযে হাসানার জন্য আবেদন সম্পন্ন করেছেন। আপনার আবেদনটি বর্তমানে যাচাইকরণ ও প্রক্রিয়াকরণ পর্যায়ে রয়েছে। দ্রুত অনুমোদনের পর আপনাকে আপডেট জানানো হবে।'
                    : 'আলহামদুলিল্লাহ! আপনার করযে হাসানা ঋণের আবেদনটি সফলভাবে গৃহীত হয়েছে। আমাদের টিম আপনার তথ্য ও এনআইডি যাচাই করে দ্রুত আপনার সাথে যোগাযোগ করবে এবং ক্রেডিট লিমিট অনুমোদন করবে।'}
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-[11px] text-amber-950 font-bold max-w-sm flex items-center space-x-2 shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>প্রতিজন সম্মানিত গ্রাহক একবারই আবেদন করতে পারবেন। আল-আনসারের সাথে থাকার জন্য ধন্যবাদ!</span>
              </div>

              <button
                type="button"
                onClick={handleCloseAndRedirectHome}
                className="w-full max-w-xs py-3 px-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>🏠</span>
                <span>হোম পেজে ফিরে যান (Back to Home)</span>
              </button>
            </div>
          ) : (
            <>
              {/* Error Alert */}
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold text-xs">{errorMsg}</span>
                </div>
              )}

              {/* Application Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* Admin Feedback / Correction Guidance Alert */}
                {(user?.qard_admin_message || user?.qard_decline_reason) && (
                  <div className="p-3 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-start space-x-2.5 text-amber-950 animate-in fade-in shadow-xs">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-xs block text-amber-900">📢 অ্যাডমিনের বার্তা / সংশোধনের নির্দেশনা:</span>
                      <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-amber-800">
                        {user.qard_admin_message || user.qard_decline_reason}
                      </p>
                      <span className="text-[10px] text-amber-700 font-bold block mt-1">
                        * অনুগ্রহ করে নিচের ফর্মে প্রয়োজনীয় সংশোধন (যেমন: সঠিক এনআইডি নম্বর, অস্পষ্ট ছবি পরিবর্তন ইত্যাদি) সম্পন্ন করুন।
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  
                  {/* Name */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      আবেদনকারীর পূর্ণ নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মোহাম্মদ আব্দুল্লাহ"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-medium text-xs text-slate-900"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-mono font-bold text-xs text-slate-900"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      ইমেইল অ্যাড্রেস (ঐচ্ছিক)
                    </label>
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-medium text-xs text-slate-900"
                    />
                  </div>

                  {/* NID */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      জাতীয় পরিচয়পত্র (NID) নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="১০ বা ১৭ ডিজিটের এনআইডি"
                      value={formData.nid_number}
                      onChange={(e) => setFormData({ ...formData, nid_number: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-mono font-bold text-xs text-slate-900"
                    />
                  </div>

                  {/* Requested Limit */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      কাঙ্ক্ষিত ক্রেডিট লিমিট (টাকা)
                    </label>
                    <select
                      value={formData.requested_limit}
                      onChange={(e) => setFormData({ ...formData, requested_limit: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-bold text-xs cursor-pointer text-slate-900"
                    >
                      <option value="2000">৳২,০০০ (টাকা)</option>
                      <option value="3000">৳৩,০০০ (টাকা)</option>
                      <option value="5000">৳৫,০০০ (টাকা)</option>
                      <option value="10000">৳১০,০০০ (টাকা)</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      বর্তমান বাসস্থান ও স্থায়ী ঠিকানা <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={1.5}
                      required
                      placeholder="বাসা নম্বর, রোড নম্বর, এলাকা, থানা, জেলা..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-medium text-xs text-slate-900"
                    />
                  </div>

                  {/* Photo Uploads: NID Front, NID Back, Selfie */}
                  <div className="sm:col-span-2 space-y-1.5 pt-1 border-t border-emerald-100">
                    <div className="flex items-center justify-between">
                      <label className="font-black text-slate-800 text-[11px] flex items-center space-x-1">
                        <Camera className="w-3.5 h-3.5 text-emerald-600" />
                        <span>প্রয়োজনীয় ৩টি ছবি (এনআইডি উভয় পিঠ ও নিজের ছবি)</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      {hasInheritedPhotos && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full flex items-center space-x-1 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>পূর্বের তথ্য সংরক্ষিত</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* NID Front Slot */}
                      <div className="relative border border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-xl p-1.5 text-center flex flex-col items-center justify-center min-h-[78px] transition-colors">
                        {formData.nid_front_photo ? (
                          <div className="relative w-full h-full flex flex-col items-center">
                            <img 
                              src={formData.nid_front_photo} 
                              alt="NID Front" 
                              className="w-full h-11 object-cover rounded-lg border border-emerald-300 shadow-2xs" 
                            />
                            <span className="text-[10px] font-bold text-emerald-900 mt-1 truncate max-w-full">
                              ✓ এনআইডি (সামনে)
                            </span>
                            <label className="absolute inset-0 opacity-0 cursor-pointer">
                              <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload('nid_front_photo', e)} />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full py-1">
                            <CreditCard className="w-5 h-5 text-emerald-600 mb-0.5" />
                            <span className="text-[10px] font-black text-slate-700">এনআইডি (সামনে)</span>
                            <span className="text-[9px] text-emerald-600 font-semibold">+ ছবি দিন</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload('nid_front_photo', e)} />
                          </label>
                        )}
                      </div>

                      {/* NID Back Slot */}
                      <div className="relative border border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-xl p-1.5 text-center flex flex-col items-center justify-center min-h-[78px] transition-colors">
                        {formData.nid_back_photo ? (
                          <div className="relative w-full h-full flex flex-col items-center">
                            <img 
                              src={formData.nid_back_photo} 
                              alt="NID Back" 
                              className="w-full h-11 object-cover rounded-lg border border-emerald-300 shadow-2xs" 
                            />
                            <span className="text-[10px] font-bold text-emerald-900 mt-1 truncate max-w-full">
                              ✓ এনআইডি (পেছনে)
                            </span>
                            <label className="absolute inset-0 opacity-0 cursor-pointer">
                              <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload('nid_back_photo', e)} />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full py-1">
                            <CreditCard className="w-5 h-5 text-emerald-600 mb-0.5" />
                            <span className="text-[10px] font-black text-slate-700">এনআইডি (পেছনে)</span>
                            <span className="text-[9px] text-emerald-600 font-semibold">+ ছবি দিন</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload('nid_back_photo', e)} />
                          </label>
                        )}
                      </div>

                      {/* User Photo Slot */}
                      <div className="relative border border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-xl p-1.5 text-center flex flex-col items-center justify-center min-h-[78px] transition-colors">
                        {formData.user_photo ? (
                          <div className="relative w-full h-full flex flex-col items-center">
                            <img 
                              src={formData.user_photo} 
                              alt="Applicant Selfie" 
                              className="w-full h-11 object-cover rounded-lg border border-emerald-300 shadow-2xs" 
                            />
                            <span className="text-[10px] font-bold text-emerald-900 mt-1 truncate max-w-full">
                              ✓ নিজের ছবি
                            </span>
                            <label className="absolute inset-0 opacity-0 cursor-pointer">
                              <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload('user_photo', e)} />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full py-1">
                            <UserIcon className="w-5 h-5 text-emerald-600 mb-0.5" />
                            <span className="text-[10px] font-black text-slate-700">নিজের ছবি</span>
                            <span className="text-[9px] text-emerald-600 font-semibold">+ সেলফি/ছবি</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload('user_photo', e)} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Shariah Trust Note */}
                <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 leading-relaxed flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>
                    করযে হাসানা পরিশোধ ঈমানী আমানত। সময়মতো পরিশোধে আপনার ক্রেডিট লিমিট বৃদ্ধি পাবে।
                  </span>
                </div>

                {/* Terms Agreement Checkbox (Right Above Submit Button) */}
                <div className="pt-1">
                  <div className="flex items-start space-x-2 p-2.5 bg-emerald-50/70 border border-emerald-300/90 rounded-xl hover:bg-emerald-100/60 transition-colors">
                    <input
                      id="qard_terms_chk"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-emerald-400 text-emerald-700 focus:ring-emerald-500 cursor-pointer flex-shrink-0"
                    />
                    <div className="text-[11px] text-slate-800 font-semibold leading-tight">
                      <label htmlFor="qard_terms_chk" className="cursor-pointer">
                        আমি করযে হাসানার সকল{' '}
                      </label>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowTermsModal(true);
                        }}
                        className="text-emerald-800 font-black underline hover:text-emerald-950 inline cursor-pointer"
                      >
                        শর্তাবলী ও নিয়মাবলীতে
                      </button>
                      <label htmlFor="qard_terms_chk" className="cursor-pointer">
                        {' '}সম্মত আছি এবং সত্য তথ্য প্রদান করেছি। <span className="text-rose-600 font-black">*</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-0.5">
                  <button
                    type="submit"
                    disabled={submitting || !agreedToTerms}
                    className={`w-full py-2.5 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98 ${
                      !agreedToTerms
                        ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-emerald-800/20 cursor-pointer'
                    }`}
                  >
                    <HandHeart className={`w-4 h-4 ${agreedToTerms ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span>
                      {submitting 
                        ? 'আবেদন প্রসেস হচ্ছে...' 
                        : `পরবর্তী ধাপ: আবেদন ফি পরিশোধ (৳${toBn(siteSettings?.qard_application_fee ?? 300)}) →`}
                    </span>
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>

      {/* Nested Terms & Conditions Standalone Modal (Overlaid on top with highest z-index) */}
      {showTermsModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 font-sans"
          onClick={() => setShowTermsModal(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-500 w-full max-w-md max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Terms Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white px-4 py-3 flex items-center justify-between border-b border-amber-500/30 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black text-amber-200">
                  করযে হাসানা — শর্তাবলী ও নিয়মাবলী
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Terms Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 text-xs text-slate-700 leading-relaxed font-sans">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 font-bold text-[11px] flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>{siteSettings?.qard_modal_badge || 'আল আনসার করযে হাসানা সম্পূর্ণ সুদমুক্ত ও ইসলামী শরীয়াহ অনুযায়ী পরিচালিত।'}</span>
              </div>

              <div className="space-y-2.5 text-[11.5px]">
                {(() => {
                  const qardPercentage = Number(user?.qard_max_percentage) > 0 
                    ? Number(user.qard_max_percentage) 
                    : (Number(siteSettings?.qard_max_percentage) || 10);
                  const defaultTerms = [
                    { title: 'সুদমুক্ত ঋণ', text: 'করযে হাসানার অধীনে গৃহীত কোনো অর্ডারে কোনো প্রকার অতিরিক্ত ফি, সুদ বা সার্ভিস চার্জ নেই। যতটুকু মূল্য ঠিক ততটুকুই পরিশোধ করতে হবে।' },
                    { title: 'সঠিক তথ্যের নিশ্চয়তা', text: 'আবেদনকারীকে অবশ্যই সঠিক জাতীয় পরিচয়পত্র (NID) নম্বর ও স্থায়ী ঠিকানা প্রদান করতে হবে। অসত্য তথ্য দিলে আবেদন তাৎক্ষণিক বাতিল হবে।' },
                    { title: 'পরিশোধ পদ্ধতি', text: `অর্ডারের সময় ${toBn(100 - qardPercentage)}% মূল্য পরিশোধযোগ্য এবং অবশিষ্ট ${toBn(qardPercentage)}% বা অনুমোদিত লিমিট নির্ধারিত সময়ের মধ্যে পরিশোধ করতে হবে।` },
                    { title: 'লিমিট বৃদ্ধি', text: 'সময়মতো করযে হাসানা পরিশোধ করলে পরবর্তীতে সর্বোচ্চ ৳১০,০০০ পর্যন্ত ক্রেডিট লিমিট স্বয়ংক্রিয়ভাবে বৃদ্ধি পাবে।' },
                    { title: 'ঈমানী আমানত', text: 'করযে হাসানা পরিশোধ করা একটি ঈমানী দায়িত্ব। যথাসময়ে ঋণ পরিশোধের মাধ্যমে এই মহৎ খেদমত চালু রাখতে সাহায্য করুন।' },
                  ];

                  const termsList = siteSettings?.qard_modal_terms && siteSettings.qard_modal_terms.trim()
                    ? siteSettings.qard_modal_terms
                        .split('\n')
                        .map(l => l.trim().replace(/^[০-৯0-9]+[.\-)]\s*/, ''))
                        .filter(Boolean)
                        .map(line => {
                          const parts = line.split(':');
                          if (parts.length > 1) {
                            return { title: parts[0].trim(), text: parts.slice(1).join(':').trim() };
                          }
                          return { title: '', text: line };
                        })
                    : defaultTerms;

                  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
                  const toBn = (n) => String(n).replace(/[0-9]/g, d => bengaliDigits[+d]);

                  return termsList.map((term, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {toBn(idx + 1)}
                      </span>
                      <p>
                        {term.title && <strong>{term.title}: </strong>}
                        {term.text}
                      </p>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Terms Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                onClick={() => {
                  setAgreedToTerms(true);
                  setShowTermsModal(false);
                }}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>আমি শর্তাবলীতে সম্মত আছি (সম্মত হয়ে ফিরে যান)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal (Synchronized directly with checkout payment gateway) */}
      {showPaymentModal && (
        <PaymentGatewayModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          totalAmount={Number(siteSettings?.qard_application_fee ?? 300)}
          deliveryFee={0}
          siteSettings={siteSettings}
          user={user}
          hideCod={true}
          title="করযে হাসানা আবেদন ফি পরিশোধ"
          subtitle="সুদমুক্ত ঋণ সুবিধার অফিসিয়াল ভেরিফিকেশন চার্জ"
          onConfirmPayment={executeApplicationSubmit}
        />
      )}
    </>
  );
}
