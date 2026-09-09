import React from 'react';
import { useCart } from '../context/CartContext';
import { 
  FileText, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  HandHeart, 
  Lock, 
  ArrowLeft,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function TermsAndConditions({ onNavigate, onBack }) {
  const { siteSettings } = useCart();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in font-sans">
      
      {/* Universal Back Navigation */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={onBack || (() => onNavigate('home'))}
          className="inline-flex items-center space-x-2 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-amber-800" />
          <span>← পিছনে যান (Back)</span>
        </button>

        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          আল আনসার গ্রাহক সুরক্ষা নীতিমালা
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white p-8 sm:p-10 rounded-3xl border border-amber-500/40 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-amber-400">
          <FileText className="w-6 h-6 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            {siteSettings?.terms_hero_badge || 'অফিসিয়াল পলিসি ও নীতিমালা'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          {siteSettings?.terms_hero_title || 'শর্তাবলী, ডেলিভারি ও শরিয়াহ নীতিমালা'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed whitespace-pre-line">
          {siteSettings?.terms_hero_subtitle || 'আল আনসার (AL ANSAR) বিশুদ্ধ সুবাস ও বিশ্বস্ততার সাথে ব্যবসা পরিচালনায় অঙ্গীকারবদ্ধ। ক্রেতা ও গ্রাহকদের সর্বোচ্চ সন্তুষ্টি ও অধিকার সুরক্ষায় আমাদের সুস্পষ্ট নীতিমালা নিচে বর্ণিত হলো।'}
        </p>
      </div>

      {/* Dynamic Main Terms from Admin Settings */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center text-amber-800">
          <Sparkles className="w-4 h-4 mr-2 text-amber-600" /> {siteSettings?.terms_main_heading || 'সাধারণ শর্তাবলী ও বিক্রয় নীতিমালা'}
        </h2>
        <div className="text-xs text-slate-700 space-y-3 leading-relaxed whitespace-pre-line bg-amber-50/40 p-5 rounded-2xl border border-amber-200/80">
          {siteSettings?.terms_and_conditions || `১. আল আনসার ১০০% খাঁটি ও অ্যালকোহলমুক্ত আতর এবং প্রিমিয়াম পারফিউম সরবরাহে অঙ্গীকারবদ্ধ।\n২. ডেলিভারি গ্রহণের সময় পণ্য যাচাই করে গ্রহণ করুন। কোনো ত্রুটি থাকলে ৭ দিনের মধ্যে পরিবর্তন বা রিপ্লেসমেন্ট করা হবে।\n৩. ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা। ২০০০ টাকার উপরে অর্ডারে ডেলিভারি ফ্রি।\n৪. করযে হাসানা সুবিধা গ্রহণের ক্ষেত্রে সঠিক তথ্য ও এনআইডি প্রদান বাধ্যতামূলক।`}
        </div>
      </div>

      {/* 4 Pillars Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Quality & Purity */}
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-xs space-y-3">
          <div className="flex items-center space-x-3 text-emerald-800 font-bold">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm">{siteSettings?.terms_pillar_1_title || '১. সুগন্ধির বিশুদ্ধতা ও গুণমান নিশ্চয়তা'}</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-1 whitespace-pre-line">
            {siteSettings?.terms_pillar_1_desc || 'আমাদের সকল আতর ১০০% নন-অ্যালকোহলিক প্রাকৃতিক তেল ও আসল কম্বোডিয়ান আগরউড থেকে তৈরি। কোনো প্রকার সিন্থেটিক বা ক্ষতিকর কেমিক্যাল ব্যবহার করা হয় না।'}
          </p>
        </div>

        {/* 2. Delivery & Live Tracking */}
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-xs space-y-3">
          <div className="flex items-center space-x-3 text-blue-800 font-bold">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-sm">{siteSettings?.terms_pillar_2_title || '২. দ্রুত ডেলিভারি ও কুরিয়ার ট্র্যাকিং'}</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-1 whitespace-pre-line">
            {siteSettings?.terms_pillar_2_desc || 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২-৪ দিনের মধ্যে স্টিভফাস্ট বা রেডএক্স কুরিয়ারের মাধ্যমে ডেলিভারি সম্পন্ন হয়। প্রতিটি অর্ডারে লাইভ কুরিয়ার ট্র্যাকিং লিংক প্রদান করা হয়।'}
          </p>
        </div>

        {/* 3. 7 Days Replacement */}
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-xs space-y-3">
          <div className="flex items-center space-x-3 text-amber-800 font-bold">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-sm">{siteSettings?.terms_pillar_3_title || '৩. ৭ দিনের সহজ রিপ্লেসমেন্ট সুবিধা'}</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-1 whitespace-pre-line">
            {siteSettings?.terms_pillar_3_desc || 'পার্সেল খোলার সময় কোনো বোতল বা প্যাকেজিংয়ে ত্রুটি পরিলক্ষিত হলে সাথে সাথে আমাদের হেল্পলাইনে কল দিন বা ইনভয়েস সহ জানালে আমরা ৭ দিনের মধ্যে ফ্রি রিপ্লেসমেন্ট প্রদান করি।'}
          </p>
        </div>

        {/* 4. Qard-e-Hasana Shariah Policy */}
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-xs space-y-3">
          <div className="flex items-center space-x-3 text-purple-800 font-bold">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <HandHeart className="w-5 h-5" />
            </div>
            <h3 className="text-sm">{siteSettings?.terms_pillar_4_title || '৪. সুদমুক্ত করযে হাসানা নীতিমালা'}</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-1 whitespace-pre-line">
            {siteSettings?.terms_pillar_4_desc || 'করযে হাসানা সুবিধার অধীনে কোনো অতিরিক্ত সুদ বা ফি প্রযোজ্য নয়। ক্রেতাকে আমানতদারিতার সাথে নির্ধারিত সময়ে বকেয়া টাকা পরিশোধের অঙ্গীকার করতে হবে।'}
          </p>
        </div>
      </div>
    </div>
  );
}
