import React, { useState } from 'react';
import { 
  X, 
  HandHeart, 
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

export default function QardApplicationModal({ isOpen, onClose, onSuccess, onNavigate }) {
  const { user } = useAuth();
  useScrollLock(isOpen);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    nid_number: '',
    address: user?.address || '',
    requested_limit: '5000',
    notes: ''
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
      localStorage.getItem(`alansar_qard_applied_${userKey}`) === 'true' ||
      localStorage.getItem('alansar_qard_applied_global') === 'true' ||
      user?.qard_status === 'Pending' ||
      user?.qard_status === 'Approved'
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

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        user_id: user?.id || null
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
      localStorage.setItem(`alansar_qard_applied_${userKey}`, 'true');
      localStorage.setItem('alansar_qard_applied_global', 'true');

      setIsSubmitted(true);
      setSuccessMsg('আপনার আবেদনটি সফলভাবে গ্রহণ করা হয়েছে!');
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

          {isSubmitted || hasAlreadyApplied ? (
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
                      rows={2}
                      required
                      placeholder="বাসা নম্বর, রোড নম্বর, এলাকা, থানা, জেলা..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-medium text-xs text-slate-900"
                    />
                  </div>

                  {/* Commitment Notes */}
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                      পরিশোধের অঙ্গীকার বার্তা (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: পরবর্তী মাসের ১০ তারিখের মধ্যে পরিশোধ করব।"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-medium text-xs text-slate-900"
                    />
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
                    <span>{submitting ? 'আবেদন জমা হচ্ছে...' : 'আবেদন সাবমিট করুন (Submit Application)'}</span>
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
                <span>আল আনসার করযে হাসানা সম্পূর্ণ সুদমুক্ত ও ইসলামী শরীয়াহ অনুযায়ী পরিচালিত।</span>
              </div>

              <div className="space-y-2.5 text-[11.5px]">
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">১</span>
                  <p><strong>সুদমুক্ত ঋণ:</strong> করযে হাসানার অধীনে গৃহীত কোনো অর্ডারে কোনো প্রকার অতিরিক্ত ফি, সুদ বা সার্ভিস চার্জ নেই। যতটুকু মূল্য ঠিক ততটুকুই পরিশোধ করতে হবে।</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">২</span>
                  <p><strong>সঠিক তথ্যের নিশ্চয়তা:</strong> আবেদনকারীকে অবশ্যই সঠিক জাতীয় পরিচয়পত্র (NID) নম্বর ও স্থায়ী ঠিকানা প্রদান করতে হবে। অসত্য তথ্য দিলে আবেদন তাৎক্ষণিক বাতিল হবে।</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">৩</span>
                  <p><strong>পরিশোধ পদ্ধতি:</strong> অর্ডারের সময় ৯০% মূল্য পরিশোধযোগ্য এবং অবশিষ্ট ১০% বা অনুমোদিত লিমিট নির্ধারিত সময়ের মধ্যে পরিশোধ করতে হবে।</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">৪</span>
                  <p><strong>লিমিট বৃদ্ধি:</strong> সময়মতো করযে হাসানা পরিশোধ করলে পরবর্তীতে সর্বোচ্চ ৳১০,০০০ পর্যন্ত ক্রেডিট লিমিট স্বয়ংক্রিয়ভাবে বৃদ্ধি পাবে।</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">৫</span>
                  <p><strong>ঈমানী আমানত:</strong> করযে হাসানা পরিশোধ করা একটি ঈমানী দায়িত্ব। যথাসময়ে ঋণ পরিশোধের মাধ্যমে এই মহৎ খেদমত চালু রাখতে সাহায্য করুন।</p>
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
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer"
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
