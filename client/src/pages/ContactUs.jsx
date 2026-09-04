import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Clock, 
  Send, 
  Check, 
  Sparkles, 
  ArrowLeft,
  ShieldCheck,
  Headphones
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ContactUs({ onNavigate, onBack }) {
  const { siteSettings } = useCart();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', subject: 'পণ্য ও অর্ডার পরামর্শ' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', phone: '', email: '', message: '', subject: 'পণ্য ও অর্ডার পরামর্শ' });
    }, 4000);
  };

  const whatsappClean = (siteSettings?.whatsapp_number || '+8801711223344').replace(/[^0-9]/g, '');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Universal Back Button */}
      <div className="flex items-center justify-between pb-2 border-b border-amber-200">
        <button
          onClick={onBack || (() => onNavigate('home'))}
          className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-amber-800" />
          <span>← পিছনে যান (Back)</span>
        </button>

        <span className="text-xs font-black text-amber-900 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-300">
          আল আনসার কাস্টমার কেয়ার ও হেল্পডেস্ক
        </span>
      </div>

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center mx-auto border border-amber-300 shadow-sm">
          <Headphones className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            যোগাযোগ করুন (Contact Us)
          </h1>
          <span className="text-xs font-bold text-amber-700 font-mono block mt-1">
            24/7 Dedicated Customer Concierge & Support Desk
          </span>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
          ঘরের বাজার, বেকারি আইটেম, করযে হাসানা সুবিধা, আতর ও কাস্টম গিফট প্যাকেজ সংক্রান্ত যেকোনো জিজ্ঞাসায় আমাদের সাথে সরাসরি যোগাযোগ করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Contact Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Hotline */}
          <div className="p-6 bg-white rounded-3xl border border-amber-200/90 shadow-xs space-y-2 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Phone className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">হটলাইন ও কল সাপোর্ট</h3>
              <p className="text-sm font-black text-slate-900 mt-0.5 font-mono">
                {siteSettings?.hotline_number || '+880 1711-000000'}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">সকাল ৯টা থেকে রাত ১১টা পর্যন্ত খোলা</p>
            </div>
          </div>

          {/* WhatsApp */}
          <a 
            href={`https://wa.me/${whatsappClean}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-6 bg-emerald-50 hover:bg-emerald-100/80 rounded-3xl border border-emerald-200/90 shadow-xs space-y-2 block transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-emerald-800 uppercase tracking-wider">অফিসিয়াল হোয়াটসঅ্যাপ (WhatsApp)</h3>
              <p className="text-sm font-black text-emerald-950 mt-0.5 font-mono group-hover:underline">
                {siteSettings?.whatsapp_number || '+880 1711-223344'}
              </p>
              <p className="text-[11px] font-semibold text-emerald-700 mt-1">তাৎক্ষণিক চ্যাট ও দ্রুত অর্ডার সমাধান</p>
            </div>
          </a>

          {/* Showroom / Address */}
          <div className="p-6 bg-white rounded-3xl border border-amber-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">শোরুম ও প্রধান কার্যালয়</h3>
              <p className="text-xs font-bold text-slate-900 mt-0.5 leading-relaxed">
                {siteSettings?.showroom_address || 'হাউজ #১৪, রোড #৭, সেক্টর ৩, উত্তরা, ঢাকা-১২৩০'}
              </p>
            </div>
          </div>

        </div>

        {/* Right Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/90 shadow-sm space-y-5">
          <h3 className="text-base font-black text-slate-900 flex items-center">
            <Send className="w-4 h-4 mr-2 text-amber-600" /> সরাসরি বার্তা পাঠান
          </h3>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-xs font-bold animate-in fade-in">
              <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে! আমাদের টিম দ্রুত আপনার সাথে যোগাযোগ করবে।</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">আপনার নাম *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">মোবাইল নম্বর *</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-mono font-bold rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">বিষয় নির্বাচন করুন</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="পণ্য ও অর্ডার পরামর্শ">পণ্য ও অর্ডার পরামর্শ</option>
                <option value="ঘরের বাজার ও বেকারি">ঘরের বাজার ও বেকারি আইটেম</option>
                <option value="করযে হাসানা ঋণ স্কিম">করযে হাসানা ঋণ স্কিম</option>
                <option value="ভিআইপি কার্ড ও লয়ালটি">ভিআইপি কার্ড ও লয়ালটি পয়েন্ট</option>
                <option value="অন্যান্য জিজ্ঞাসা">অন্যান্য জিজ্ঞাসা</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">আপনার বার্তা *</label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="আপনার বিস্তারিত বার্তা বা মতামত লিখুন..."
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>বার্তা পাঠান</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
