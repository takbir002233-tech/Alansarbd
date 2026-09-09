import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  Award, 
  Sparkles, 
  Truck, 
  FileText, 
  ArrowLeft, 
  Check, 
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import LuxuryLoyaltyCard from '../components/LuxuryLoyaltyCard';
import LoyaltyApplicationModal from '../components/LoyaltyApplicationModal';
import AuthModal from '../components/AuthModal';

export default function LoyaltyCard({ onNavigate, onBack }) {
  const { user } = useAuth();
  const { siteSettings } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState(null);

  const hasApprovedCard = user?.loyalty_card_status === 'Approved' || 
                         user?.loyalty_card_status === 'approved' || 
                         user?.loyalty_card_approved === true;

  const isPendingCard = user?.loyalty_card_status === 'Pending' || 
                        user?.loyalty_card_status === 'pending' ||
                        appliedStatus === 'Pending';

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
    setAppliedStatus('Pending');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 animate-in fade-in font-sans">
      
      {/* Top Universal Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack || (() => onNavigate('home'))}
          className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-amber-800" />
          <span>← পিছনে যান (Back)</span>
        </button>

        <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 flex items-center space-x-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>আল আনসার প্রিভিলেজ ক্লাব মেম্বারশিপ</span>
        </span>
      </div>

      {/* Top Banner: Ultra-compact when card is approved, full wireframe before receiving card */}
      {hasApprovedCard ? (
        <div className="bg-gradient-to-r from-emerald-950 via-[#03241b] to-slate-950 text-white px-4 py-2.5 rounded-2xl border border-amber-500/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <h1 className="text-xs sm:text-sm font-black text-white">
              {siteSettings?.loyalty_hero_title || 'আল আনসার ভিআইপি মেম্বারশিপ ও ডিজিটাল লয়ালটি কার্ড'}
            </h1>
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
              ✓ মেম্বারশিপ সক্রিয়
            </span>
          </div>
          <div className="text-[10px] font-mono font-bold text-amber-300 flex items-center space-x-2">
            <span>কার্ড নং: {user?.phone ? `AL-${user.phone.slice(-6)}` : 'AL-VIP'}</span>
            <span className="text-amber-500/50">•</span>
            <span className="text-slate-300">{user?.name || 'VIP Member'}</span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950 via-[#03241b] to-slate-950 text-white p-5 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[160px]">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-[11px] font-black uppercase tracking-widest bg-amber-500/15 px-3 py-0.5 rounded-full border border-amber-500/30">
                {siteSettings?.loyalty_hero_badge || 'AL ANSAR PRIVILEGE CLUB'}
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-snug">
              {siteSettings?.loyalty_hero_title || 'আল আনসার ভিআইপি মেম্বারশিপ ও ডিজিটাল লয়ালটি কার্ড'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {siteSettings?.loyalty_hero_subtitle || 'আল আনসার সুপার শপের সম্মানিত গ্রাহকদের জন্য বিশেষ সম্মাননা। প্রতি কেনাকাটায় রিওয়ার্ড ক্যাশ পয়েন্ট, এক্সক্লুসিভ ভিআইপি ডিসকাউন্ট ও ফ্রি ডেলিভারি সুবিধা উপভোগ করুন।'}
            </p>
          </div>

          <div className="relative z-10 mt-3 pt-2.5 border-t border-amber-400/20 text-[11px] text-amber-200 italic flex items-center justify-between">
            <span>{siteSettings?.loyalty_hadith_quote || 'লাইফটাইম ক্যাশ পয়েন্ট • ইউনিক ডিজিটাল বারকোড • বিশেষ মেম্বারশিপ ডিসকাউন্ট'}</span>
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md hidden md:inline">
              VIP PRIVILEGE
            </span>
          </div>
        </div>
      )}

      {/* If user is approved, showcase their luxury card! */}
      {hasApprovedCard && (
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ✓ আপনার লয়ালটি কার্ডটি সক্রিয় রয়েছে
              </span>
              <h2 className="text-xs sm:text-sm font-black text-slate-900">আপনার ডিজিটাল ভিআইপি কার্ড</h2>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
              STATUS: APPROVED
            </span>
          </div>
          <LuxuryLoyaltyCard user={user} />
        </div>
      )}

      {/* 4 Feature & Terms Cards Side-by-Side in One Row (Matches Image 1 Wireframe) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Cashback & Points */}
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-300 transition-all">
          <div className="space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1">
                Cash Points
              </span>
              <h3 className="text-sm font-black text-slate-900">
                {siteSettings?.loyalty_pillar_1_title || 'লাইফটাইম রিওয়ার্ড পয়েন্ট'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {siteSettings?.loyalty_pillar_1_desc || 'প্রতি ১০০ টাকা কেনাকাটায় ক্যাশ পয়েন্ট সংগ্রহ করুন। পরবর্তী যেকোনো অর্ডারে পয়েন্ট রিডিম করে সরাসরি মূল্যছাড় পান।'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
            <Check className="w-3.5 h-3.5" />
            <span>পয়েন্টের কোনো মেয়াদ নেই</span>
          </div>
        </div>

        {/* Card 2: Special VIP Discounts */}
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-300 transition-all">
          <div className="space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mb-1">
                VIP Discounts
              </span>
              <h3 className="text-sm font-black text-slate-900">
                {siteSettings?.loyalty_pillar_2_title || 'স্পেশাল মেম্বারশিপ ছাড়'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {siteSettings?.loyalty_pillar_2_desc || 'প্রিমিয়াম খাঁটি আতর, ফ্রেঞ্চ পারফিউম ও উপহার সামগ্রীতে অতিরিক্ত ৫% থেকে ১৫% পর্যন্ত বিশেষ ভিআইপি মূল্যছাড়।'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-amber-800 flex items-center space-x-1">
            <Check className="w-3.5 h-3.5" />
            <span>এক্সক্লুসিভ উৎসব অফার</span>
          </div>
        </div>

        {/* Card 3: Free Express Delivery */}
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-300 transition-all">
          <div className="space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shadow-2xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1">
                Priority Care
              </span>
              <h3 className="text-sm font-black text-slate-900">
                {siteSettings?.loyalty_pillar_3_title || 'ফ্রি ডেলিভারি ও অগ্রাধিকার'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {siteSettings?.loyalty_pillar_3_desc || 'নির্ধারিত অর্ডারে সারা দেশে ফ্রি হোম ডেলিভারি এবং যেকোনো সহযোগিতায় ২৪/৭ ডেডিকেটেড ভিআইপি হেল্পলাইন সাপোর্ট।'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-blue-700 flex items-center space-x-1">
            <Check className="w-3.5 h-3.5" />
            <span>দ্রুততম এক্সপ্রেস কুরিয়ার</span>
          </div>
        </div>

        {/* Card 4: Rules & Conditions */}
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
                {siteSettings?.loyalty_terms_title || 'কার্ডের শর্তাবলী ও নিয়ম'}
              </h3>
            </div>
            <ul className="text-xs text-slate-700 space-y-1.5 leading-relaxed">
              {siteSettings?.loyalty_terms_desc ? (
                siteSettings.loyalty_terms_desc.split('\n').filter(Boolean).map((line, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>{line.replace(/^[০-৯\d]+\.\s*/, '')}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>কার্ডটি আবেদনকারীর নিজস্ব নামে সংরক্ষিত ও হস্তান্তরঅযোগ্য।</span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>প্রতিটি সফল ডেলিভারির পর পয়েন্ট স্বয়ংক্রিয় যোগ হবে।</span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-amber-700 font-bold">•</span>
                    <span>চেকআউটে কার্ডের বারকোড স্ক্যান বা নম্বর ব্যবহারযোগ্য।</span>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="pt-2 border-t border-amber-200/80 text-[11px] font-bold text-amber-900 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>ডিজিটাল ইনস্ট্যান্ট অ্যাক্সেস</span>
          </div>
        </div>

      </div>

      {/* Bottom Status / Apply Section: Apply button ONLY shows if user does NOT have approved card */}
      {hasApprovedCard ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-emerald-50/90 border border-emerald-300 rounded-2xl text-emerald-950 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>আলহামদুলিল্লাহ! আপনার মেম্বারশিপ কার্ড সক্রিয় রয়েছে। প্রতিটি কেনাকাটায় স্বয়ংক্রিয় ক্যাশ পয়েন্ট ও ভিআইপি ডিসকাউন্ট উপভোগ করুন।</span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-xl border border-emerald-300 whitespace-nowrap">
            VIP ACTIVE
          </span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {isPendingCard ? (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center space-x-2 text-xs text-amber-950 font-bold">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>আপনার লয়ালটি কার্ড আবেদনটি পর্যালোচনায় রয়েছে। দ্রুত অনুমোদন সম্পন্ন হবে।</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-medium hidden sm:block">
              * কার্ডটি প্রোফাইলে স্বয়ংক্রিয়ভাবে পেতে নিচের বাটনে ক্লিক করে আবেদন সম্পন্ন করুন।
            </div>
          )}

          <div className="flex justify-end w-full sm:w-auto">
            <button
              onClick={handleApplyClick}
              className="w-full sm:w-auto inline-flex items-center justify-end space-x-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-6 py-3 rounded-2xl border-2 border-amber-400 shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-950/10 text-slate-950 flex items-center justify-center border border-slate-950/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <CreditCard className="w-5 h-5 text-slate-950" />
              </div>
              
              {/* Dual Language Stacked Text */}
              <div className="text-right">
                <span className="block text-xs sm:text-sm font-black text-slate-950 leading-tight">
                  {siteSettings?.loyalty_button_bn || 'লয়ালটি কার্ডের জন্য আবেদন করুন'}
                </span>
                <span className="block text-[10px] sm:text-[11px] text-slate-900 font-mono font-bold tracking-wide">
                  {siteSettings?.loyalty_button_en || 'Apply for Loyalty Card'}
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

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
          আল আনসার সুপার শপ • প্রিভিলেজ ক্লাব মেম্বারশিপ
        </span>
      </div>

      {/* Login Gate Modal if not logged in */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode="login"
        customNotice="লয়ালটি কার্ডের জন্য আবেদন করতে প্রথমে লগইন বা রেজিস্টার করুন।"
        onClose={() => setAuthModalOpen(false)}
        onNavigate={onNavigate}
        onSuccess={handleAuthSuccess}
      />

      {/* Popup Application Modal */}
      <LoyaltyApplicationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleApplySuccess}
      />

    </div>
  );
}
