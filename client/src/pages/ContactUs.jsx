import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Clock, 
  Sparkles, 
  ArrowLeft,
  ShieldCheck,
  Headphones,
  ExternalLink
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ContactUs({ onNavigate, onBack }) {
  const { siteSettings } = useCart();

  const hotline = siteSettings?.hotline_number || siteSettings?.store_phone || '+880 1711-223344';
  const whatsapp = siteSettings?.whatsapp_number || siteSettings?.store_phone || '+880 1711-223344';
  const whatsappClean = whatsapp.replace(/[^0-9]/g, '');
  const email = siteSettings?.store_email || 'info@alansarfragrance.com';
  const address = siteSettings?.showroom_address || siteSettings?.store_address || 'আল আনসার ফ্ল্যাগশিপ শোরুম, লেভেল ৪, সেক্টর ৩, উত্তরা, ঢাকা-১২৩০';
  const officeHours = siteSettings?.contact_office_hours || 'সকাল ৯:০০টা – রাত ১১:০০টা (সপ্তাহের ৭ দিন খোলা)';
  const subtitle = siteSettings?.contact_subtitle || 'ঘরের বাজার, বেকারি আইটেম, করযে হাসানা সুবিধা, আতর ও কাস্টম গিফট প্যাকেজ সংক্রান্ত যেকোনো জিজ্ঞাসায় আমাদের সাথে সরাসরি যোগাযোগ করুন।';
  const extraNote = siteSettings?.contact_extra_note || 'আমাদের সম্মানিত গ্রাহকদের সুবিধার্থে অনলাইন কাস্টমার কেয়ার ও হেল্পডেস্ক সার্বক্ষণিক সক্রিয় থাকে। যেকোনো জরুরি তথ্যের জন্য সরাসরি কল অথবা হোয়াটসঅ্যাপ করুন।';

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
          {subtitle}
        </p>
      </div>

      {/* 6 Luxury Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Hotline Support */}
        <div className="p-6 bg-white rounded-3xl border border-amber-200/90 shadow-xs hover:shadow-md transition-all space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Phone className="w-6 h-6 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">হটলাইন ও কল সাপোর্ট</h3>
            <p className="text-base font-black text-slate-900 font-mono">{hotline}</p>
            <p className="text-[11px] font-semibold text-slate-500">জরুরি অর্ডার ও যেকোনো তথ্য পরামর্শের জন্য সরাসরি ডায়াল করুন</p>
          </div>
          <a
            href={`tel:${hotline.replace(/[^0-9+]/g, '')}`}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline pt-2"
          >
            <span>সরাসরি কল দিন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 2. Official WhatsApp */}
        <a 
          href={`https://wa.me/${whatsappClean}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-6 bg-emerald-50 hover:bg-emerald-100/90 rounded-3xl border border-emerald-200 shadow-xs hover:shadow-md transition-all space-y-4 group block"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-black text-emerald-800 uppercase tracking-wider">অফিসিয়াল হোয়াটসঅ্যাপ (WhatsApp)</h3>
            <p className="text-base font-black text-emerald-950 font-mono group-hover:underline">{whatsapp}</p>
            <p className="text-[11px] font-semibold text-emerald-700">তাৎক্ষণিক চ্যাট, পণ্যের ছবি ও দ্রুত অর্ডার সমাধান</p>
          </div>
          <span className="inline-flex items-center space-x-1.5 text-xs font-black text-emerald-800 group-hover:underline pt-2">
            <span>হোয়াটসঅ্যাপে চ্যাট করুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </a>

        {/* 3. Official Email */}
        <div className="p-6 bg-white rounded-3xl border border-amber-200/90 shadow-xs hover:shadow-md transition-all space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Mail className="w-6 h-6 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">অফিসিয়াল ইমেইল সাপোর্ট</h3>
            <p className="text-sm font-black text-slate-900 font-mono truncate">{email}</p>
            <p className="text-[11px] font-semibold text-slate-500">কর্পোরেট উপহার, ডিলারশিপ ও প্রাতিষ্ঠানিক যোগাযোগের জন্য</p>
          </div>
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline pt-2"
          >
            <span>ইমেইল পাঠান</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 4. Showroom / Address */}
        <div className="p-6 bg-white rounded-3xl border border-amber-200/90 shadow-xs hover:shadow-md transition-all space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            <MapPin className="w-6 h-6 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">ফ্ল্যাগশিপ শোরুম ও প্রধান কার্যালয়</h3>
            <p className="text-xs font-bold text-slate-900 leading-relaxed">{address}</p>
            <p className="text-[11px] font-semibold text-slate-500">সরাসরি পরিদর্শন করে ১০০% আসল আতর ও সুগন্ধি নির্বাচন করুন</p>
          </div>
        </div>

        {/* 5. Office Hours */}
        <div className="p-6 bg-white rounded-3xl border border-amber-200/90 shadow-xs hover:shadow-md transition-all space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">গ্রাহক সেবা সময়সূচী</h3>
            <p className="text-xs font-bold text-slate-900">{officeHours}</p>
            <p className="text-[11px] font-semibold text-slate-500">ছুটির দিনসহ সপ্তাহের প্রতিদিন আমাদের হেল্পডেস্ক সক্রিয় থাকে</p>
          </div>
        </div>

        {/* 6. Extra Shariah / Assurance Note */}
        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200 shadow-xs hover:shadow-md transition-all space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider">গ্রাহক সন্তুষ্টি নিশ্চয়তা</h3>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed">{extraNote}</p>
          </div>
        </div>

      </div>

      {/* Direct Interactive Call To Action */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>দ্রুত সহায়তা ডেস্ক</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">যেকোনো প্রশ্ন বা সহযোগিতার জন্য আমরা প্রস্তুত</h3>
          <p className="text-xs text-slate-400">হোয়াটসঅ্যাপ অথবা সরাসরি কল করে তাৎক্ষণিক সহায়তা গ্রহণ করুন।</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`https://wa.me/${whatsappClean}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>হোয়াটসঅ্যাপ চ্যাট</span>
          </a>
          <a
            href={`tel:${hotline.replace(/[^0-9+]/g, '')}`}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>হটলাইনে কল করুন</span>
          </a>
        </div>
      </div>

    </div>
  );
}
