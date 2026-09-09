import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  HandHeart, 
  ShieldCheck, 
  CreditCard, 
  HeartHandshake, 
  FileText, 
  ArrowLeft, 
  Sparkles,
  CheckCircle2,
  Check
} from 'lucide-react';
import QardApplicationModal from '../components/QardApplicationModal';
import AuthModal from '../components/AuthModal';

export default function QardHasana({ onNavigate, onBack }) {
  const { user } = useAuth();
  const { siteSettings } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [appliedApp, setAppliedApp] = useState(null);

  const handleApplyClick = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      setModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    setModalOpen(true);
  };

  const handleApplySuccess = (app) => {
    setAppliedApp(app);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 animate-in fade-in font-sans">
      
      {/* Top Universal Back Button & Islamic Tag */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack || (() => onNavigate('home'))}
          className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-amber-800" />
          <span>← পিছনে যান (Back)</span>
        </button>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center space-x-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>১০০% সুদমুক্ত ইসলামী ঋণ সুবিধা</span>
        </span>
      </div>

      {/* Top Compact Advert Banner (Height reduced, no excess blank space - Matches Image 1) */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-900 text-white p-5 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[160px]">
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400">
            <HandHeart className="w-5 h-5 text-amber-400" />
            <span className="text-[11px] font-black uppercase tracking-widest bg-amber-500/15 px-3 py-0.5 rounded-full border border-amber-500/30">
              {siteSettings?.qard_hero_badge || 'আল আনসার করযে হাসানা স্কিম'}
            </span>
          </div>

          <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-snug">
            {siteSettings?.qard_hero_title || 'সুদমুক্ত ‘করযে হাসানা’ ঋণ সুবিধা ও ১০% তাৎক্ষণিক বাকি সেবা'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            {siteSettings?.qard_hero_subtitle || 'ইসলামী শরীয়াহ অনুযায়ী পারস্পরিক সহযোগিতার উদ্দেশ্যে কোনো প্রকার অতিরিক্ত ফি, প্রসেসিং চার্জ বা সুদ ছাড়াই পণ্য ক্রয় করে পরবর্তীতে সুবিধা অনুযায়ী মূল্য পরিশোধের সুযোগ।'}
          </p>
        </div>

        <div className="relative z-10 mt-3 pt-2.5 border-t border-amber-400/20 text-[11px] text-amber-200 italic flex items-center justify-between">
          <span>“যে ব্যক্তি কোনো মুমিনের দুনিয়াবী বিপদ দূর করে দেবে, আল্লাহ কিয়ামতের দিন তার বিপদসমূহ দূর করে দেবেন।” — (সহীহ মুসলিম)</span>
          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md hidden md:inline">
            ০% সুদ • ১০০% আমানত
          </span>
        </div>
      </div>

      {/* 4 Feature & Terms Cards Side-by-Side in One Row (Matches Image 1 Wireframe) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: 100% Zero Interest */}
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-300 transition-all">
          <div className="space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1">
                Zero Interest
              </span>
              <h3 className="text-sm font-black text-slate-900">
                {siteSettings?.qard_pillar_1_title || '১০০% সুদমুক্ত সেবা'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {siteSettings?.qard_pillar_1_desc || 'কোনো প্রকার লুকানো চার্জ, জরিমানা বা সুদ নেই। আপনি যতটুকু ধার নিবেন, ঠিক ততটুকুই পরিশোধ করবেন।'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
            <Check className="w-3.5 h-3.5" />
            <span>শরীয়াহসম্মত ও বিশুদ্ধ</span>
          </div>
        </div>

        {/* Card 2: 10% Instant Credit */}
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-300 transition-all">
          <div className="space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shadow-2xs">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mb-1">
                Instant Credit
              </span>
              <h3 className="text-sm font-black text-slate-900">
                {siteSettings?.qard_pillar_2_title || '১০% তাৎক্ষণিক বাকি'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {siteSettings?.qard_pillar_2_desc || 'যেকোনো অর্ডারের সময় আপনি ৯০% পেমেন্ট করে বাকি ১০% টাকা করযে হাসানা হিসেবে সুবিধাজনক সময়ে পরিশোধ করতে পারবেন।'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-amber-800 flex items-center space-x-1">
            <Check className="w-3.5 h-3.5" />
            <span>১-ক্লিকে চেকআউটে ব্যবহার</span>
          </div>
        </div>

        {/* Card 3: Easy Repayment & Trust */}
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-300 transition-all">
          <div className="space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shadow-2xs">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1">
                Flexible Repayment
              </span>
              <h3 className="text-sm font-black text-slate-900">
                {siteSettings?.qard_pillar_3_title || 'সহজ পরিশোধ ও আমানত'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {siteSettings?.qard_pillar_3_desc || 'আপনার সুবিধা অনুযায়ী নির্ধারিত মেয়াদের মধ্যে ঋণ পরিশোধের সুযোগ। ঈমানী আমানত হিসেবে যথাসময়ে পরিশোধ করুন।'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-blue-700 flex items-center space-x-1">
            <Check className="w-3.5 h-3.5" />
            <span>সুবিধাজনক মেয়াদ ও কিস্তি</span>
          </div>
        </div>

        {/* Card 4: Terms & Conditions (Combined into 4th Card matching wireframe) */}
        <div className="bg-amber-50/70 p-5 rounded-3xl border border-amber-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-400 transition-all">
          <div className="space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold shadow-2xs">
              <FileText className="w-6 h-6 text-amber-800" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-md inline-block mb-1">
                Terms & Rules
              </span>
              <h3 className="text-sm font-black text-slate-950">
                {siteSettings?.qard_terms_title || 'নিয়ম ও শর্তাবলী'}
              </h3>
            </div>
            <ul className="text-xs text-slate-700 space-y-1.5 leading-relaxed">
              {siteSettings?.qard_hasana_terms ? (
                siteSettings.qard_hasana_terms.split('\n').filter(Boolean).map((line, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>{line.replace(/^[০-৯\d]+\.\s*/, '')}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>জাতীয় পরিচয়পত্র (NID) যাচাই সাপেক্ষে লিমিট প্রদান।</span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>অর্ডারের সময় ৯০% পরিশোধ ও বাকি ১০% ধার।</span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>নির্ধারিত সময়সীমার মধ্যে পরিশোধ ঈমানী অঙ্গীকার।</span>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="pt-2 border-t border-amber-200/80 text-[11px] font-bold text-amber-900 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>২৪ ঘণ্টার মধ্যে যাচাই ও অনুমোদন</span>
          </div>
        </div>

      </div>

      {/* Bottom-Right Dual-Language Apply Button (Positioned exactly matching Image 1 wireframe) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {appliedApp ? (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2 text-xs text-emerald-900 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>আপনার করযে হাসানা আবেদনটি পর্যালোচনায় রয়েছে (যাচাই সম্পন্ন হলে লিমিট সক্রিয় হবে)।</span>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            * বাটনে ক্লিক করে সহজ পপ-আপ ফর্ম পূরণ করে আজই আবেদন করুন।
          </div>
        )}

        <div className="flex justify-end w-full sm:w-auto">
          <button
            onClick={handleApplyClick}
            className="w-full sm:w-auto inline-flex items-center justify-end space-x-3.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-2xl border-2 border-amber-400/70 shadow-lg shadow-emerald-950/30 transition-all transform hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/40 group-hover:scale-105 transition-transform flex-shrink-0">
              <HandHeart className="w-5 h-5 text-amber-300" />
            </div>
            
            {/* Dual Language Stacked Text (Matches Image 1 & Contact Button Style) */}
            <div className="text-right">
              <span className="block text-xs sm:text-sm font-black text-white leading-tight">
                করযে হাসানার জন্য আবেদন করুন
              </span>
              <span className="block text-[10px] sm:text-[11px] text-amber-300 font-mono font-bold tracking-wide">
                Apply for Qard-e-Hasana
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Back Button */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onBack || (() => onNavigate('home'))}
          className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-amber-800" />
          <span>← পিছনে যান (Back)</span>
        </button>

        <span className="text-[11px] font-bold text-slate-500">
          আল আনসার সুপার শপ • সুদমুক্ত ইসলামী কেনাকাটা
        </span>
      </div>

      {/* Login Gate Modal if not logged in */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode="login"
        customNotice="করযে হাসানার জন্য আবেদন করতে প্রথমে লগইন বা রেজিস্টার করুন।"
        onClose={() => setAuthModalOpen(false)}
        onNavigate={onNavigate}
        onSuccess={handleAuthSuccess}
      />

      {/* Popup Application Modal */}
      <QardApplicationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleApplySuccess}
      />

    </div>
  );
}
