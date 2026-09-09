import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  FileText 
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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

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

      setSuccessMsg('আপনার লয়ালটি মেম্বারশিপ আবেদন সফলভাবে জমা হয়েছে! অ্যাডমিন টিম যাচাই করে আপনার ভার্চুয়াল ভিআইপি কার্ডটি প্রোফাইলে যুক্ত করে দেবে।');
      
      if (onSuccess) {
        onSuccess(data.application || { ...formData, status: 'Pending' });
      }

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
      {/* Centered Modal Card matching Register modal architecture with Royal Gold accents */}
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-amber-300/90 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Bar (Register style with Dual-Language Back Button and Close) */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/50 to-amber-500/15 px-3 sm:px-4 py-2 border-b border-amber-200/80 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
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

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                <CreditCard className="w-4 h-4 text-slate-950" />
                <span>{submitting ? 'আবেদন জমা হচ্ছে...' : 'লয়ালটি কার্ড আবেদন সাবমিট করুন'}</span>
              </button>
            </div>
          </form>

          {/* Bottom Row: Terms & Conditions Link on Bottom-Left */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleTermsClick}
              className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-800 hover:text-amber-950 hover:underline cursor-pointer group"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
              <span>শর্তাবলী ও নিয়মাবলী (Terms & Conditions)</span>
            </button>

            <span className="text-[10px] text-slate-400 font-medium select-none">
              আল আনসার প্রিভিলেজ ক্লাব
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
