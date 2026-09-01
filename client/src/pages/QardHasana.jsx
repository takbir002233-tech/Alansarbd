import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  HandHeart, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  FileText, 
  Sparkles, 
  CreditCard, 
  Clock, 
  DollarSign,
  HeartHandshake
} from 'lucide-react';

export default function QardHasana({ onNavigate }) {
  const { user } = useAuth();
  const { siteSettings } = useCart();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    nid_number: '',
    address: user?.address || '',
    monthly_income: '',
    requested_limit: '3000',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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
        throw new Error(data.message || 'আবেদন জমা দিতে সমস্যা হয়েছে।');
      }

      setSuccessMsg(data.message);
      setFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        nid_number: '',
        address: user?.address || '',
        monthly_income: '',
        requested_limit: '3000',
        notes: ''
      });
    } catch (err) {
      setErrorMsg(err.message || 'সার্ভার সমস্যা। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* Top Universal Back Button */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-amber-800 transition-colors bg-white px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-700" />
          <span>← মূল পেইজে ফিরে যান</span>
        </button>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          ✨ ১০০% সুদমুক্ত ইসলামী সেবা
        </span>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-900 text-white p-8 sm:p-10 rounded-3xl border border-amber-500/40 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="flex items-center space-x-3 text-amber-400">
          <HandHeart className="w-8 h-8 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            {siteSettings?.qard_hero_badge || 'আল আনসার করযে হাসানা স্কিম'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
          {siteSettings?.qard_hero_title || 'সুদমুক্ত ‘করযে হাসানা’ ঋণ সুবিধা ও ১০% তাৎক্ষণিক বাকি সেবা'}
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed whitespace-pre-line">
          {siteSettings?.qard_hero_subtitle || 'ইসলামী শরীয়াহ অনুযায়ী পারস্পরিক সহযোগিতার উদ্দেশ্যে ‘আল আনসার’ নিয়ে এসেছে ১০০% সুদমুক্ত করযে হাসানা সুবিধা। আপনি কোনো প্রকার অতিরিক্ত ফি, প্রসেসিং চার্জ বা সুদ ছাড়াই পণ্য ক্রয় করে পরবর্তীতে সুবিধা অনুযায়ী মূল্য পরিশোধ করতে পারবেন।'}
        </p>

        {/* Hadith Quote Box */}
        <div className="p-4 bg-white/5 rounded-2xl border border-amber-400/20 text-xs text-amber-200 italic space-y-1">
          <p>{siteSettings?.qard_hadith_quote || '“যে ব্যক্তি কোনো মুমিনের দুনিয়াবী বিপদ দূর করে দেবে, আল্লাহ কিয়ামতের দিন তার বিপদসমূহ দূর করে দেবেন।” — (সহীহ মুসলিম: ২৬৯৯)'}</p>
        </div>
      </div>

      {/* 3 Pillars of Qard-e-Hasana */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{siteSettings?.qard_pillar_1_title || '১০০% সুদমুক্ত (Zero Interest)'}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {siteSettings?.qard_pillar_1_desc || 'কোনো প্রকার লুকানো চার্জ, জরিমানা বা সুদ নেই। আপনি যতটুকু ধার নিবেন, ঠিক ততটুকুই পরিশোধ করবেন।'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{siteSettings?.qard_pillar_2_title || 'চেকআউটে ১০% তাৎক্ষণিক বাকি'}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {siteSettings?.qard_pillar_2_desc || 'যেকোনো অর্ডারের সময় আপনি ৯০% পেমেন্ট করে বাকি ১০% টাকা করযে হাসানা হিসেবে ধার রাখতে পারবেন।'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{siteSettings?.qard_pillar_3_title || 'সহজ কিস্তি ও আমানতদারিতা'}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {siteSettings?.qard_pillar_3_desc || 'আপনার সুবিধা অনুযায়ী নির্ধারিত মেয়াদের মধ্যে ঋণ পরিশোধের সুযোগ। ঈমানী আমানত হিসেবে যথাসময়ে ঋণ পরিশোধ করুন।'}
          </p>
        </div>
      </div>

      {/* Terms & Application Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Terms & Rules (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-amber-50/50 p-6 sm:p-8 rounded-3xl border border-amber-200/80 space-y-4">
            <div className="flex items-center space-x-2 text-amber-900">
              <FileText className="w-5 h-5 text-amber-700" />
              <h3 className="text-sm font-bold uppercase tracking-wider">{siteSettings?.qard_terms_title || 'করযে হাসানার শর্তাবলী'}</h3>
            </div>

            <div className="text-xs text-slate-700 space-y-3 leading-relaxed whitespace-pre-line">
              {siteSettings?.qard_hasana_terms || `১. করযে হাসানা হলো সম্পূর্ণ সুদমুক্ত এবং কোনো প্রকার প্রসেসিং বা হিডেন চার্জ বিহীন ইসলামী ঋণ সুবিধা।\n২. ক্রেতা অর্ডারের সময় ৯০% পেমেন্ট করবেন এবং বাকি ১০% টাকা নির্ধারিত মেয়াদের মধ্যে কোনো সুদ ছাড়াই পরিশোধ করবেন।\n৩. এই সুবিধা গ্রহণের জন্য জাতীয় পরিচয়পত্র (NID) নম্বর ও বিস্তারিত তথ্য প্রদান করতে হবে।\n৪. অঙ্গীকার অনুযায়ী যথাসময়ে ঋণ পরিশোধ করা ঈমানী দায়িত্ব ও ইসলামী আমানতদারিতার অন্তর্ভুক্ত।`}
            </div>

            <div className="p-4 bg-white rounded-2xl border border-amber-200 text-xs text-amber-950 font-medium space-y-1">
              <p className="font-bold flex items-center text-amber-800">
                <Sparkles className="w-4 h-4 mr-1 text-amber-600" /> বিশেষ সুবিধা:
              </p>
              <p>{siteSettings?.qard_special_notice || 'আবেদন অনুমোদিত হলে আপনার অ্যাকাউন্টে স্বয়ংক্রিয়ভাবে ক্রেডিট লিমিট যুক্ত হবে এবং যেকোনো অর্ডারে ১-ক্লিকে ব্যবহার করা যাবে।'}</p>
            </div>
          </div>
        </div>

        {/* Right: Application Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900">করযে হাসানা অনুমোদনের আবেদন ফর্ম</h3>
              <p className="text-xs text-slate-500 mt-1">
                সঠিক তথ্য দিয়ে ফর্মটি পূরণ করুন। আমাদের অ্যাডমিন টিম দ্রুত যাচাই করে আপনার ক্রেডিট লিমিট সক্রিয় করবে।
              </p>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-emerald-800 text-xs">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <h4 className="font-bold">আবেদন সফল হয়েছে!</h4>
                  <p className="mt-0.5">{successMsg}</p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-700 text-xs">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">ভুল ত্রুটি লক্ষ্য করুন:</h4>
                  <p className="mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">আবেদনকারীর পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: তানভীর আহমেদ"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">সক্রিয় মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    placeholder="017XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">জাতীয় পরিচয়পত্র (NID) নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="১০ বা ১৭ ডিজিটের এনআইডি নম্বর"
                    value={formData.nid_number}
                    onChange={(e) => setFormData({ ...formData, nid_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">কাঙ্ক্ষিত ক্রেডিট লিমিট (টাকা)</label>
                  <select
                    value={formData.requested_limit}
                    onChange={(e) => setFormData({ ...formData, requested_limit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="2000">৳২,০০০ (টাকা)</option>
                    <option value="3000">৳৩,০০০ (টাকা)</option>
                    <option value="5000">৳৫,০০০ (টাকা)</option>
                    <option value="10000">৳১০,০০০ (টাকা)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">বর্তমান বাসস্থান ও স্থায়ী ঠিকানা *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="বাসা নম্বর, রোড নম্বর, এলাকা, জেলা..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">ঋণ গ্রহণের উদ্দেশ্য ও পরিশোধের অঙ্গীকার বার্তা</label>
                  <input
                    type="text"
                    placeholder="যেমন: মাসিক বেতনের পর পরবর্তী মাসের ১০ তারিখের মধ্যে সম্পূর্ণ পরিশোধ করব।"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-800/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <HandHeart className="w-4 h-4 text-amber-300" />
                  <span>{submitting ? 'আবেদন জমা হচ্ছে...' : 'করযে হাসানা আবেদন সাবমিট করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
