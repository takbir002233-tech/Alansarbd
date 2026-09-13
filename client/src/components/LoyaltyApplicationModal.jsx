import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  FileText,
  Check 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useScrollLock from '../hooks/useScrollLock';

export default function LoyaltyApplicationModal({ isOpen, onClose, onSuccess, onNavigate }) {
  const { user, updateProfile } = useAuth();
  useScrollLock(isOpen);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || 'ঢাকা',
    nid_number: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check if already applied (single application per user)
  const userKey = user?.id ? `user_${user.id}` : user?.phone ? `phone_${user.phone}` : 'guest';
  const hasAlreadyApplied = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return (
      localStorage.getItem(`alansar_vip_applied_${userKey}`) === 'true' ||
      localStorage.getItem('alansar_vip_applied_global') === 'true' ||
      user?.loyalty_card_status === 'Pending' ||
      user?.loyalty_card_status === 'Approved'
    );
  }, [isOpen, user, userKey]);

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
    if (isSubmitted || hasAlreadyApplied) {
      handleCloseAndRedirectHome();
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!agreedToTerms) {
      setErrorMsg('আবেদন জমা দিতে শর্তাবলী ও নিয়মাবলীতে সম্মত হয়ে টিক চিহ্ন দিন।');
      return;
    }
    if (!formData.name.trim()) {
      setErrorMsg('আপনার পূর্ণ নাম প্রদান করুন।');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('আপনার সম্পূর্ণ ঠিকানা লিখুন।');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        user_id: user?.id || null
      };

      const res = await fetch('/api/admin/loyalty-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'আবেদন জমা দেওয়া যায়নি।');
      }

      // Persist that user applied once
      localStorage.setItem(`alansar_vip_applied_${userKey}`, 'true');
      localStorage.setItem('alansar_vip_applied_global', 'true');

      setIsSubmitted(true);
      setSuccessMsg('আপনার লয়ালটি মেম্বারশিপ আবেদন সফলভাবে জমা হয়েছে!');
      
      if (onSuccess) {
        onSuccess(data.application || { ...formData, status: 'Pending' });
      }
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
      {/* Centered Modal Card matching Register modal architecture with Royal Gold accents */}
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-amber-300/90 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Bar (Register style with Dual-Language Back Button and Close) */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/50 to-amber-500/15 px-3 sm:px-4 py-2 border-b border-amber-200/80 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={handleGeneralClose}
            className="flex items-center space-x-1 text-[11px] font-black text-slate-800 hover:text-amber-900 bg-white/90 hover:bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="বন্ধ করে ফিরে যান"
          >
            <ArrowLeft className="w-3 h-3 text-amber-700 flex-shrink-0" />
            <span>← ফিরে যান (Back)</span>
          </button>

          <span className="text-[11px] font-black text-amber-950 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center space-x-1">
            <CreditCard className="w-3 h-3 text-slate-900" />
            <span>ভিআইপি কার্ড আবেদন</span>
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
                className="w-10 h-10 object-contain rounded-2xl border-2 border-amber-400 ring-2 ring-amber-300/40 shadow-xs"
              />
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center justify-center space-x-1.5">
              <span>আল আনসার ভিআইপি মেম্বারশিপ কার্ড আবেদন</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h2>
            <p className="text-[11px] text-amber-800 font-medium">
              আল আনসার প্রিভিলেজ ক্লাব • লাইফটাইম পয়েন্ট ও ক্যাশব্যাক সুবিধা
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

          {isSubmitted || hasAlreadyApplied ? (
            /* Success / Already Submitted Confirmation Screen */
            <div className="py-6 px-3 sm:px-6 text-center space-y-4 flex flex-col items-center justify-center animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-500 text-amber-800 flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-amber-700" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {hasAlreadyApplied && !isSubmitted
                    ? 'আপনার আবেদনটি ইতিপূর্বে সফলভাবে গ্রহণ করা হয়েছে!'
                    : 'আপনার আবেদনটি সফলভাবে গ্রহণ করা হয়েছে!'}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {hasAlreadyApplied && !isSubmitted
                    ? 'আপনি ইতিপূর্বে ভিআইপি মেম্বারশিপ কার্ডের জন্য আবেদন সম্পন্ন করেছেন। আপনার আবেদনটি বর্তমানে পর্যালোচনাধীন রয়েছে। দ্রুত অনুমোদন সম্পন্ন হলে প্রোফাইলে কার্ড যুক্ত হবে।'
                    : 'আলহামদুলিল্লাহ! আপনার ভিআইপি মেম্বারশিপ কার্ডের আবেদন সফলভাবে জমা হয়েছে। অ্যাডমিন টিম যাচাই করে আপনার ভার্চুয়াল ভিআইপি কার্ডটি প্রোফাইলে যুক্ত করে দেবে।'}
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-[11px] text-amber-950 font-bold max-w-sm flex items-center space-x-2 shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>প্রতিজন সম্মানিত গ্রাহক একবারই আবেদন করতে পারবেন। আল-আনসারের সাথে থাকার জন্য ধন্যবাদ!</span>
              </div>

              <button
                type="button"
                onClick={handleCloseAndRedirectHome}
                className="w-full max-w-xs py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  
                  {/* Name */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      কার্ডহোল্ডারের পূর্ণ নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: তানভীর আহমেদ"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium text-xs text-slate-900"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      সক্রিয় মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={11}
                      placeholder="017XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold text-xs text-slate-900"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      ইমেইল ঠিকানা (ঐচ্ছিক)
                    </label>
                    <input
                      type="email"
                      placeholder="user@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium text-xs text-slate-900"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      শহর / জেলা <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: ঢাকা"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium text-xs text-slate-900"
                    />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      ডেলিভারি ও যোগাযোগের ঠিকানা <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="বাসা নম্বর, রোড নম্বর, এলাকা, থানা..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium text-xs text-slate-900"
                    />
                  </div>

                  {/* NID */}
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      জাতীয় পরিচয়পত্র (NID) নম্বর (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      placeholder="১০ বা ১৭ ডিজিটের এনআইডি"
                      value={formData.nid_number}
                      onChange={(e) => setFormData({ ...formData, nid_number: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-medium text-xs text-slate-900"
                    />
                  </div>

                </div>

                {/* Privilege Note */}
                <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-950 leading-relaxed flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    অনুমোদিত হলে স্বয়ংক্রিয়ভাবে ইউনিক বারকোডসহ আপনার ডিজিটাল ভিআইপি কার্ডটি প্রোফাইলে যুক্ত হবে।
                  </span>
                </div>

                {/* Terms Agreement Checkbox (Right Above Submit Button) */}
                <div className="pt-1">
                  <div className="flex items-start space-x-2 p-2.5 bg-amber-50/70 border border-amber-300/90 rounded-xl hover:bg-amber-100/60 transition-colors">
                    <input
                      id="loyalty_terms_chk"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer flex-shrink-0"
                    />
                    <div className="text-[11px] text-slate-800 font-semibold leading-tight">
                      <label htmlFor="loyalty_terms_chk" className="cursor-pointer">
                        আমি আল আনসার ভিআইপি মেম্বারশিপের সকল{' '}
                      </label>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowTermsModal(true);
                        }}
                        className="text-amber-800 font-black underline hover:text-amber-950 inline cursor-pointer"
                      >
                        শর্তাবলী ও নিয়মাবলীতে
                      </button>
                      <label htmlFor="loyalty_terms_chk" className="cursor-pointer">
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
                        : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-amber-500/20 cursor-pointer'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-slate-950" />
                    <span>{submitting ? 'আবেদন জমা হচ্ছে...' : 'লয়ালটি কার্ড আবেদন সাবমিট করুন'}</span>
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>

      {/* Nested VIP Terms & Conditions Standalone Modal (Overlaid on top with highest z-index) */}
      {showTermsModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 font-sans"
          onClick={() => setShowTermsModal(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border-2 border-amber-500 w-full max-w-md max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Terms Header */}
            <div className="bg-gradient-to-r from-[#042017] via-[#062c21] to-[#042017] text-white px-4 py-3 flex items-center justify-between border-b border-amber-500/30 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black text-amber-200">
                  ভিআইপি মেম্বারশিপ — নিয়মাবলী ও শর্তাবলী
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
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 font-bold text-[11px] flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>আল আনসার রয়্যাল ভিআইপি মেম্বারশিপ সম্পূর্ণ বিনামূল্যে প্রদান করা হয়।</span>
              </div>

              <div className="space-y-2.5 text-[11.5px]">
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">১</span>
                  <p><strong>পয়েন্ট ও রিওয়ার্ড:</strong> প্রতিটি কেনাকাটায় স্বয়ংক্রিয়ভাবে ক্যাশব্যাক ও রিওয়ার্ড পয়েন্ট অর্জিত হবে যা পরবর্তী কেনাকাটায় ব্যবহার করা যাবে।</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">২</span>
                  <p><strong>ডিজিটাল কার্ড ও বারকোড:</strong> অনুমোদিত কার্ডটি আপনার প্রোফাইলে ইউনিক বারকোডসহ সংরক্ষিত থাকবে এবং শোরুম বা অনলাইনে প্রদর্শনে বিশেষ সুবিধা পাবেন।</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">৩</span>
                  <p><strong>প্রায়োরিটি ডেলিভারি:</strong> ভিআইপি মেম্বারদের অর্ডার যেকোনো সাধারণ অর্ডারের চেয়ে সর্বোচ্চ অগ্রাধিকার ও দ্রুততম সময়ে ডেলিভারি করা হবে।</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">৪</span>
                  <p><strong>কার্ড হস্তান্তরযোগ্য নয়:</strong> মেম্বারশিপ কার্ড ও অর্জিত পয়েন্ট ব্যক্তিগত এবং অন্য কারো নিকট হস্তান্তরযোগ্য নয়।</p>
                </div>
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
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>আমি শর্তাবলীতে সম্মত আছি (সম্মত হয়ে ফিরে যান)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
