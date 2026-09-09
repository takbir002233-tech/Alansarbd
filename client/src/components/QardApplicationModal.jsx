import React, { useState } from 'react';
import { 
  X, 
  HandHeart, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  FileText 
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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

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

      setSuccessMsg('আপনার করযে হাসানা আবেদনটি সফলভাবে গৃহীত হয়েছে! আমাদের টিম এনআইডি যাচাই করে ২৪ ঘণ্টার মধ্যে আপনার ক্রেডিট লিমিট অনুমোদন করবে।');
      if (onSuccess) onSuccess(data.application);
      
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'সার্ভারে সংযোগ দেওয়া যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTermsClick = () => {
    onClose();
    if (onNavigate) {
      onNavigate('terms');
    } else {
      window.location.hash = '#terms';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
      onClick={onClose}
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
            onClick={onClose}
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
            onClick={onClose}
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
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-medium text-xs text-slate-900"
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
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 font-mono font-bold text-xs text-slate-900"
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
                  placeholder="১০ বা ১৭ ডিজিটের NID"
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

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-800/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                <HandHeart className="w-4 h-4 text-amber-300" />
                <span>{submitting ? 'আবেদন জমা হচ্ছে...' : 'আবেদন সাবমিট করুন (Submit Application)'}</span>
              </button>
            </div>
          </form>

          {/* Bottom Row: Terms & Conditions Link on Bottom-Left */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleTermsClick}
              className="inline-flex items-center space-x-1.5 text-xs font-black text-emerald-700 hover:text-emerald-950 hover:underline cursor-pointer group"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>শর্তাবলী ও নিয়মাবলী (Terms & Conditions)</span>
            </button>

            <span className="text-[10px] text-slate-400 font-medium select-none">
              আল আনসার শরিয়াহ বোর্ড
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
