import React, { useState } from 'react';
import { X, Award, CheckCircle2, AlertCircle, Sparkles, ShieldCheck, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoyaltyApplicationModal({ isOpen, onClose, onSuccess }) {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || 'Dhaka',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in font-sans">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl border border-amber-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#032318] to-slate-950 text-white p-5 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-md font-black">
              <Award className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center space-x-1.5">
                <span>লয়ালটি মেম্বারশিপ কার্ড আবেদন ফর্ম</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-amber-200/90 font-mono">
                আল আনসার প্রিভিলেজ ক্লাব • লাইফটাইম পয়েন্ট ও ক্যাশব্যাক
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start space-x-2.5 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">আবেদন সফল হয়েছে!</h4>
                <p className="mt-0.5 leading-relaxed">{successMsg}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex items-start space-x-2.5 text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">সঠিক তথ্য দিন:</h4>
                <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">কার্ডহোল্ডারের পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">সক্রিয় মোবাইল নম্বর *</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  placeholder="017XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>

              {/* Email */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
                <input
                  type="email"
                  placeholder="user@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* City / District */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">শহর / জেলা *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ঢাকা"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">ডেলিভারি ও যোগাযোগের ঠিকানা *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="বাসা নম্বর, রোড নম্বর, এলাকা, থানা..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* NID */}
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">জাতীয় পরিচয়পত্র (NID) নম্বর (ঐচ্ছিক - ভেরিফিকেশনের জন্য)</label>
                <input
                  type="text"
                  placeholder="১০ বা ১৭ ডিজিটের এনআইডি"
                  value={formData.nid_number}
                  onChange={(e) => setFormData({ ...formData, nid_number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-medium"
                />
              </div>

            </div>

            {/* Privilege Note */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                অনুমোদিত হলে স্বয়ংক্রিয়ভাবে ইউনিক বারকোডসহ আপনার ডিজিটাল ভিআইপি কার্ডটি প্রোফাইলে যুক্ত হবে।
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4 text-slate-950" />
                <span>{submitting ? 'আবেদন জমা হচ্ছে...' : 'লয়ালটি কার্ড আবেদন সাবমিট করুন'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
