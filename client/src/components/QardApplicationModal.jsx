import React, { useState } from 'react';
import { X, HandHeart, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function QardApplicationModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in font-sans">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl border border-amber-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-900 text-white p-5 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/40">
              <HandHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center space-x-1.5">
                <span>করযে হাসানা ঋণের আবেদন ফর্ম</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-amber-200/90 font-mono">
                ১০০% সুদমুক্ত ইসলামী সেবা • কোনো হিডেন ফি নেই
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

        {/* Modal Body / Scrollable Form */}
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
                <label className="font-bold text-slate-700 block mb-1">আবেদনকারীর পূর্ণ নাম *</label>
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

              {/* NID */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">জাতীয় পরিচয়পত্র (NID) নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="১০ বা ১৭ ডিজিট"
                  value={formData.nid_number}
                  onChange={(e) => setFormData({ ...formData, nid_number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>

              {/* Requested Limit */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">কাঙ্ক্ষিত ক্রেডিট লিমিট (টাকা)</label>
                <select
                  value={formData.requested_limit}
                  onChange={(e) => setFormData({ ...formData, requested_limit: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="2000">৳২,০০০ (টাকা)</option>
                  <option value="3000">৳৩,০০০ (টাকা)</option>
                  <option value="5000">৳৫,০০০ (টাকা)</option>
                  <option value="10000">৳১০,০০০ (টাকা)</option>
                </select>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">বর্তমান বাসস্থান ও স্থায়ী ঠিকানা *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="বাসা নম্বর, রোড নম্বর, এলাকা, জেলা..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Commitment Notes */}
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">পরিশোধের অঙ্গীকার বার্তা (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: পরবর্তী মাসের ১০ তারিখের মধ্যে পরিশোধ করব।"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

            </div>

            {/* Shariah Trust Note */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>
                করযে হাসানা পরিশোধ ঈমানী আমানত। সময়মতো পরিশোধে আপনার ক্রেডিট লিমিট বৃদ্ধি পাবে।
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-800/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <HandHeart className="w-4 h-4 text-amber-300" />
                <span>{submitting ? 'আবেদন জমা হচ্ছে...' : 'আবেদন সাবমিট করুন (Submit Application)'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
