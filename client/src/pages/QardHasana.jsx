import React, { useState, useEffect } from 'react';
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
  Check,
  Clock,
  Calendar,
  AlertCircle,
  RefreshCw,
  X,
  Copy,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import QardApplicationModal from '../components/QardApplicationModal';
import PageHadithBanner from '../components/PageHadithBanner';
import AuthModal from '../components/AuthModal';

export default function QardHasana({ onNavigate, onBack }) {
  const { user, token, refreshUser } = useAuth();
  const { siteSettings } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [appliedApp, setAppliedApp] = useState(null);
  const [reapplyMode, setReapplyMode] = useState(false);

  // Bengali digits converter helper
  const toBengaliDigits = (str) => {
    if (str === null || str === undefined || str === '') return '০';
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  // Qard Approval & Status Logic
  const isQardApproved = Boolean(
    user && 
    user.qard_status && 
    user.qard_status.toLowerCase() === 'approved' &&
    Number(user.qard_credit_limit || user.qard_limit || 0) > 0
  );

  const isQardNeedsCorrection = Boolean(
    user?.qard_status && user.qard_status.toLowerCase() === 'needs correction'
  );

  const isQardDeclined = Boolean(
    user?.qard_status && (user.qard_status.toLowerCase() === 'declined' || user.qard_status.toLowerCase() === 'rejected')
  );

  const isQardPending = Boolean(
    !isQardNeedsCorrection && !isQardDeclined && (
      (user?.qard_status && user.qard_status.toLowerCase() === 'pending') ||
      appliedApp
    )
  );

  const adminNotice = user?.qard_admin_message || user?.qard_decline_reason;
  const showNoticeBanner = Boolean(!isQardApproved && (isQardNeedsCorrection || isQardDeclined || adminNotice));

  // Live Qard Ledger State
  const [ledgerData, setLedgerData] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

  const fetchLedger = async () => {
    if (!token || !isQardApproved) return;
    try {
      setLoadingLedger(true);
      const res = await fetch('/api/orders/my-qard-ledger', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.ledger) {
        setLedgerData(data.ledger);
      }
    } catch (err) {
      console.error('Error fetching qard ledger:', err);
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    if (isQardApproved && token) {
      fetchLedger();
    }
  }, [isQardApproved, token]);

  // Derived Financial Metrics
  const creditLimit = Number(ledgerData?.credit_limit ?? user?.qard_credit_limit ?? user?.qard_limit ?? 0);
  const unpaidDebt = Number(ledgerData?.unpaid_debt ?? user?.qard_unpaid_amount ?? 0);
  const availableCredit = Number(ledgerData?.available_credit ?? Math.max(0, creditLimit - unpaidDebt));
  const totalBorrowed = Number(ledgerData?.total_borrowed ?? (unpaidDebt + Number(user?.qard_total_repaid || 0)));
  const totalRepaid = Number(ledgerData?.total_repaid ?? user?.qard_total_repaid ?? 0);
  const hasUnpaidDebt = unpaidDebt > 0;

  const dueDateStr = ledgerData?.due_date || user?.qard_due_date;
  let daysRemaining = ledgerData?.days_remaining;
  let isOverdue = Boolean(ledgerData?.is_overdue);
  if (dueDateStr && (daysRemaining === undefined || daysRemaining === null)) {
    const due = new Date(dueDateStr);
    const now = new Date();
    daysRemaining = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    isOverdue = daysRemaining < 0;
  }

  // Repayment Modal State
  const [repayModalOpen, setRepayModalOpen] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayMethod, setRepayMethod] = useState('bKash');
  const [repaySenderNumber, setRepaySenderNumber] = useState('');
  const [repayTrxId, setRepayTrxId] = useState('');
  const [repayNotes, setRepayNotes] = useState('');
  const [submittingRepay, setSubmittingRepay] = useState(false);
  const [repaySuccess, setRepaySuccess] = useState(false);
  const [repayError, setRepayError] = useState(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const openRepaymentModal = (initialAmount) => {
    setRepayAmount(initialAmount ? String(initialAmount) : (unpaidDebt > 0 ? String(unpaidDebt) : ''));
    setRepaySenderNumber(user?.phone || '');
    setRepayTrxId('');
    setRepayNotes('');
    setRepayError(null);
    setRepaySuccess(false);
    setRepayModalOpen(true);
  };

  const handleCopyNumber = (num) => {
    if (!num) return;
    navigator.clipboard?.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleConfirmRepay = async (e) => {
    e.preventDefault();
    if (!repayAmount || Number(repayAmount) <= 0) {
      setRepayError('সঠিক পরিশোধের পরিমাণ প্রদান করুন।');
      return;
    }
    if (!repaySenderNumber.trim()) {
      setRepayError('প্রেরক মোবাইল নম্বর প্রদান করুন।');
      return;
    }
    if (!repayTrxId.trim()) {
      setRepayError('ট্রানজেকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }
    setSubmittingRepay(true);
    setRepayError(null);
    try {
      const res = await fetch('/api/orders/repay-qard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(repayAmount),
          payment_method: repayMethod,
          sender_number: repaySenderNumber.trim(),
          transaction_id: repayTrxId.trim(),
          notes: repayNotes.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setRepaySuccess(true);
        if (refreshUser) await refreshUser();
        await fetchLedger();
        setTimeout(() => {
          setRepaySuccess(false);
          setRepayModalOpen(false);
          setRepayTrxId('');
          setRepayNotes('');
        }, 2000);
      } else {
        setRepayError(data.message || 'পরিশোধ সম্পন্ন করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      console.error('Repay error:', err);
      setRepayError('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSubmittingRepay(false);
    }
  };

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
    if (refreshUser) refreshUser();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 animate-in fade-in font-sans">
      
      {/* Top Universal Back Button & Islamic Tag */}
      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        <button
          onClick={onBack || (() => onNavigate('home'))}
          className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-amber-800" />
          <span>← পিছনে যান (Back)</span>
        </button>

        <PageHadithBanner 
          text={siteSettings?.hadith_qard_hasana} 
          defaultText="🌸 হাদিস: যে ব্যক্তি কোনো মুসলিমের পার্থিব কষ্ট দূর করবে, আল্লাহ কিয়ামতের দিন তার কষ্ট দূর করবেন। (মুসলিম)" 
          className="flex-1 max-w-xl mx-auto"
        />

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center space-x-1.5 shadow-2xs flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>১০০% সুদমুক্ত ইসলামী ঋণ সুবিধা</span>
        </span>
      </div>

      {/* High-visibility Admin Notice Banner (If declined or needs correction or admin note sent) */}
      {showNoticeBanner && (
        <div className={`p-4 sm:p-5 rounded-3xl border-2 shadow-xl animate-in slide-in-from-top-3 duration-300 relative overflow-hidden ${
          isQardDeclined 
            ? 'bg-gradient-to-r from-rose-950/90 via-slate-950 to-rose-950/80 border-rose-500/60 text-white'
            : 'bg-gradient-to-r from-amber-950/90 via-slate-950 to-amber-950/80 border-amber-500/60 text-white'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-md ${
                isQardDeclined 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isQardDeclined 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {isQardDeclined ? 'আবেদন বাতিল / প্রত্যাখ্যাত' : 'সংশোধন প্রয়োজন (Action Required)'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    AL ANSAR VERIFICATION DESK
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  {isQardDeclined ? 'করযে হাসানা আবেদনটি অনুমোদিত হয়নি' : 'করযে হাসানা আবেদনে তথ্য সংশোধনের নির্দেশনা'}
                </h2>
                
                {/* Admin Note Box */}
                <div className="mt-2 p-3 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs sm:text-sm font-medium text-slate-200">
                  <span className="text-[10px] font-black text-amber-400 block uppercase tracking-wider mb-0.5">
                    📢 অ্যাডমিনের বার্তা (Admin Note):
                  </span>
                  <p className="leading-relaxed text-amber-100 font-semibold">
                    “{adminNotice || (isQardDeclined ? 'জাতীয় পরিচয়পত্র বা তথ্যে অসঙ্গতি থাকায় আবেদনটি অনুমোদন করা সম্ভব হয়নি।' : 'প্রদত্ত তথ্য যাচাই করে সংশোধন সম্পন্ন করুন।')}”
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  * ভুল তথ্য ঠিক করে ও স্পষ্ট ছবি যুক্ত করে এখনই পুনরায় আবেদন জমা দিন।
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-end flex-shrink-0 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => {
                  setReapplyMode(true);
                  setModalOpen(true);
                }}
                className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center space-x-2 ${
                  isQardDeclined
                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white border border-rose-400/50 shadow-rose-950/40'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border border-amber-300 shadow-amber-950/40'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>তথ্য সংশোধন / পুনরায় আবেদন করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Banner: If approved, ultra-compact luxury status banner; otherwise advert banner */}
      {isQardApproved ? (
        <div className="bg-gradient-to-r from-emerald-950 via-[#03291f] to-slate-950 text-white px-5 py-3.5 rounded-3xl border-2 border-amber-500/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/40 shadow-xs flex-shrink-0">
              <HandHeart className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-400/30">
                  সদস্য হিসাব সক্রিয় (Active Member)
                </span>
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-500/40 hidden sm:inline">
                  ✓ ১০০% সুদমুক্ত স্কিম
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white mt-0.5">
                {siteSettings?.qard_hero_title || 'করযে হাসানা ডিজিটাল পাসবুক ও ব্যক্তিগত হিসাব'}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 text-xs font-mono font-bold text-amber-300 self-end md:self-center bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-amber-500/30">
            <span>গ্রাহক: <span className="text-white font-sans">{user?.name || 'সম্মানিত গ্রাহক'}</span></span>
            <span className="text-amber-500/50">•</span>
            <span>A/C: QA-{user?.phone ? user.phone.slice(-6) : 'MEMBER'}</span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-900 text-white p-5 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[160px]">
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
      )}

      {/* 🌟 LUXURY APPROVED MEMBER QARD DETAILS DASHBOARD CARD */}
      {isQardApproved && (
        <div className="bg-gradient-to-b from-[#022c22] via-[#04362b] to-[#02241c] text-white p-5 sm:p-7 rounded-3xl border-2 border-amber-500/50 shadow-2xl relative overflow-hidden space-y-6 font-sans">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header with Title & Live Refresh Button */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div>
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>ব্যক্তিগত করযে হাসানা পাসবুক</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                আপনার সক্রিয় করযে হাসানা হিসাব ও ক্রেডিট লিমিট
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                চেকআউটে অর্ডারের সময় ৯০% পরিশোধ করে বাকি ১০% টাকা করযে হাসানা হিসেবে গ্রহণ করুন।
              </p>
            </div>

            <button
              onClick={fetchLedger}
              disabled={loadingLedger}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-amber-300 text-xs font-bold rounded-xl border border-amber-400/30 transition-all cursor-pointer shadow-xs self-start sm:self-center"
              title="হিসাব রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLedger ? 'animate-spin' : ''}`} />
              <span>{loadingLedger ? 'রিফ্রেশ হচ্ছে...' : 'হিসাব রিফ্রেশ'}</span>
            </button>
          </div>

          {/* 5 Financial Metric Stat Cards */}
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            
            {/* 1. Credit Limit */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/40 shadow-xs flex flex-col justify-between space-y-2 hover:border-amber-400 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>অনুমোদিত লিমিট</span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                  ৳{toBengaliDigits(creditLimit.toLocaleString())}
                </div>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">সর্বোচ্চ অনুমোদিত সীমা</span>
              </div>
              <div className="text-[10px] font-bold text-amber-400/90 pt-1.5 border-t border-slate-800 flex items-center space-x-1">
                <Check className="w-3 h-3 text-amber-400" />
                <span>১০০% সুদমুক্ত</span>
              </div>
            </div>

            {/* 2. Available Balance */}
            <div className="bg-emerald-950/80 p-4 rounded-2xl border border-emerald-500/50 shadow-xs flex flex-col justify-between space-y-2 hover:border-emerald-400 transition-all">
              <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
                <span>ব্যবহারযোগ্য লিমিট</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
                  ৳{toBengaliDigits(availableCredit.toLocaleString())}
                </div>
                <span className="text-[10px] text-emerald-200/70 font-bold block mt-0.5">পরবর্তী কেনাকাটায় বাকি</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-400 pt-1.5 border-t border-emerald-900/60 flex items-center space-x-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>শপিংয়ের জন্য প্রস্তুত</span>
              </div>
            </div>

            {/* 3. Current Unpaid Debt */}
            <div className={`p-4 rounded-2xl border shadow-xs flex flex-col justify-between space-y-2 transition-all ${
              hasUnpaidDebt 
                ? 'bg-rose-950/70 border-rose-500/60 text-rose-200 hover:border-rose-400' 
                : 'bg-slate-950/80 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={hasUnpaidDebt ? 'text-rose-300' : 'text-slate-400'}>বর্তমান বকেয়া ঋণ</span>
                {hasUnpaidDebt ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <div>
                <div className={`text-xl sm:text-2xl font-black font-mono ${hasUnpaidDebt ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ৳{toBengaliDigits(unpaidDebt.toLocaleString())}
                </div>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                  {hasUnpaidDebt ? 'পরিশোধযোগ্য বকেয়া' : '✓ কোনো বকেয়া নেই'}
                </span>
              </div>
              <div className="pt-1.5 border-t border-slate-800">
                {hasUnpaidDebt ? (
                  <button
                    onClick={() => openRepaymentModal(unpaidDebt)}
                    className="text-[10px] font-bold text-rose-300 hover:text-white underline cursor-pointer"
                  >
                    এখনই পরিশোধ করুন →
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-400">হিসাব সম্পূর্ণ নিয়মিত</span>
                )}
              </div>
            </div>

            {/* 4. Total Borrowed */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between space-y-2 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>মোট ঋণ গ্রহণ</span>
                <HandHeart className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-200 font-mono">
                  ৳{toBengaliDigits(totalBorrowed.toLocaleString())}
                </div>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">এ যাবত মোট ধার</span>
              </div>
              <div className="text-[10px] font-bold text-slate-400 pt-1.5 border-t border-slate-800">
                অর্ডারসমূহের সমষ্টি
              </div>
            </div>

            {/* 5. Total Repaid */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between space-y-2 hover:border-slate-700 transition-all col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>মোট পরিশোধিত</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  ৳{toBengaliDigits(totalRepaid.toLocaleString())}
                </div>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">সফলভাবে আদায়</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-400 pt-1.5 border-t border-slate-800">
                আমানতদারিতার প্রমাণ
              </div>
            </div>

          </div>

          {/* Repayment Countdown Alert / Good Standing Banner */}
          <div className="relative z-10">
            {hasUnpaidDebt ? (
              <div className={`p-4 sm:p-4.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md ${
                isOverdue ? 'bg-rose-950/80 border-rose-500 text-rose-100' : 'bg-amber-950/60 border-amber-500/50 text-amber-100'
              }`}>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black flex-shrink-0 ${
                    isOverdue ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-black">
                        পরিশোধের শেষ সময়: {dueDateStr ? new Date(dueDateStr).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : '৬ মাস'}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md font-mono ${
                        isOverdue ? 'bg-rose-600 text-white' : 'bg-amber-400 text-slate-950'
                      }`}>
                        {isOverdue 
                          ? `মেয়াদ উত্তীর্ণ (${toBengaliDigits(Math.abs(daysRemaining))} দিন অতিবাহিত)` 
                          : daysRemaining !== null && daysRemaining !== undefined 
                            ? `আর ${toBengaliDigits(daysRemaining)} দিন বাকি` 
                            : 'মেয়াদ প্রযোজ্য'}
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/90 mt-0.5">
                      ঈমানী অঙ্গীকার রক্ষার্থে যথাসময়ে ঋণ পরিশোধ করে করযে হাসানা স্কিম সচল রাখুন।
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openRepaymentModal(unpaidDebt)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-1.5 flex-shrink-0"
                >
                  <CreditCard className="w-4 h-4 text-slate-950" />
                  <span>বকেয়া ঋণ পরিশোধ করুন</span>
                </button>
              </div>
            ) : (
              <div className="p-4 sm:p-4.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-emerald-200">
                      হিসাব সম্পূর্ণ নিয়মিত • কোনো বকেয়া ঋণ নেই
                    </h4>
                    <p className="text-xs text-emerald-300/80 mt-0.5">
                      আলহামদুলিল্লাহ! আপনার করযে হাসানা হিসাব সম্পূর্ণ পরিষ্কার। আপনার পূর্ণ লিমিট ৳{toBengaliDigits(creditLimit.toLocaleString())} সক্রিয় রয়েছে। পরবর্তী কেনাকাটায় সর্বোচ্চ ১০% পর্যন্ত বাকি সুবিধা উপভোগ করুন।
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('home')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-1.5 flex-shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>কেনাকাটা শুরু করুন (১০% ধারে)</span>
                </button>
              </div>
            )}
          </div>

          {/* Transaction Ledger Table (স্টেটমেন্ট) */}
          <div className="relative z-10 bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black text-white">
                  করযে হাসানা লেনদেন বিবরণী (Ledger Statement)
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                মোট রেকর্ড: {toBengaliDigits((ledgerData?.transactions?.length || 0).toString())}
              </span>
            </div>

            {ledgerData?.transactions && ledgerData.transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="py-2 px-3 font-bold">তারিখ</th>
                      <th className="py-2 px-3 font-bold">বিবরণ</th>
                      <th className="py-2 px-3 font-bold">পদ্ধতি</th>
                      <th className="py-2 px-3 font-bold">প্রকার</th>
                      <th className="py-2 px-3 font-bold text-right">পরিমাণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {ledgerData.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                          {tx.date ? new Date(tx.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' }) : '–'}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-200">
                          <div>{tx.title}</div>
                          {tx.transaction_id && (
                            <span className="text-[10px] text-amber-400 font-mono block">
                              TrxID: {tx.transaction_id}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {tx.method || '–'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {tx.type === 'borrowed' ? (
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded-md">
                              ঋণ গ্রহণ
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                              ঋণ পরিশোধ
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-black text-right whitespace-nowrap">
                          {tx.type === 'borrowed' ? (
                            <span className="text-rose-400">-৳{toBengaliDigits(tx.amount?.toLocaleString())}</span>
                          ) : (
                            <span className="text-emerald-400">+৳{toBengaliDigits(tx.amount?.toLocaleString())}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <HandHeart className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold">এখনও কোনো করযে হাসানা লেনদেন সংঘটিত হয়নি।</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  যেকোনো পণ্য অর্ডারের সময় চেকআউটে ‘করযে হাসানা (১০% ধার)’ নির্বাচন করলেই আপনার প্রথম লেনদেন এখানে স্বয়ংক্রিয়ভাবে যুক্ত হবে।
                </p>
              </div>
            )}
          </div>

          {/* Bottom Quick Links in Approved Dashboard */}
          <div className="relative z-10 pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-amber-200/80 font-medium">
              * সুদমুক্ত করযে হাসানা সুবিধা গ্রাহকদের পারস্পরিক সহযোগিতার জন্য প্রস্তুতকৃত।
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold cursor-pointer transition-all border border-slate-700"
              >
                ইউজার ড্যাশবোর্ডে দেখুন →
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer transition-all shadow-xs"
              >
                কেনাকাটা করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4 Feature & Terms Cards Side-by-Side in One Row */}
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

        {/* Card 4: Terms & Conditions */}
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

      {/* Bottom Status / Apply Section: If approved, shows active confirmation & quick actions; otherwise application button */}
      {isQardApproved ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-emerald-50/90 border border-emerald-300 rounded-3xl text-emerald-950 shadow-xs">
          <div className="flex items-center space-x-2.5 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>
              আলহামদুলিল্লাহ! আপনার করযে হাসানা অ্যাকাউন্ট সক্রিয় রয়েছে। চেকআউটে যেকোনো অর্ডারে ৯০% পরিশোধ করে বাকি ১০% টাকা সুবিধাজনক সময়ে পরিশোধ করুন।
            </span>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end flex-shrink-0">
            {hasUnpaidDebt && (
              <button
                onClick={() => openRepaymentModal(unpaidDebt)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-xs"
              >
                বকেয়া পরিশোধ
              </button>
            )}
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-xs flex items-center space-x-1"
            >
              <span>কেনাকাটা করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {isQardNeedsCorrection ? (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center space-x-2 text-xs text-amber-950 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>আবেদনে তথ্য সংশোধন প্রয়োজন: {adminNotice || 'সঠিক তথ্য দিয়ে পুনরায় জমা দিন'}</span>
            </div>
          ) : isQardPending ? (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2 text-xs text-emerald-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>আপনার করযে হাসানা আবেদনটি পর্যালোচনায় রয়েছে (যাচাই সম্পন্ন হলে লিমিট সক্রিয় হবে)।</span>
            </div>
          ) : isQardDeclined ? (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-center space-x-2 text-xs text-rose-900 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>পূর্ববর্তী আবেদনটি অনুমোদিত হয়নি: {adminNotice || 'সঠিক তথ্য দিয়ে পুনরায় আবেদন করুন'}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-medium hidden sm:block">
              * বাটনে ক্লিক করে সহজ পপ-আপ ফর্ম পূরণ করে আজই আবেদন করুন।
            </div>
          )}

          <div className="flex justify-end w-full sm:w-auto">
            <button
              onClick={() => {
                if (isQardNeedsCorrection || isQardDeclined) setReapplyMode(true);
                handleApplyClick();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-end space-x-3.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-2xl border-2 border-amber-400/70 shadow-lg shadow-emerald-950/30 transition-all transform hover:-translate-y-0.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/40 group-hover:scale-105 transition-transform flex-shrink-0">
                <HandHeart className="w-5 h-5 text-amber-300" />
              </div>
              
              <div className="text-right">
                <span className="block text-xs sm:text-sm font-black text-white leading-tight">
                  {(isQardNeedsCorrection || isQardDeclined) ? 'তথ্য সংশোধন / পুনরায় আবেদন করুন' : 'করযে হাসানার জন্য আবেদন করুন'}
                </span>
                <span className="block text-[10px] sm:text-[11px] text-amber-300 font-mono font-bold tracking-wide">
                  {(isQardNeedsCorrection || isQardDeclined) ? 'Update & Re-apply' : 'Apply for Qard-e-Hasana'}
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
          আল আনসার সুপার শপ • সুদমুক্ত ইসলামী কেনাকাটা
        </span>
      </div>

      {/* 🌸 QARD REPAYMENT MODAL */}
      {repayModalOpen && (
        <div 
          className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in"
          onClick={() => setRepayModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 text-slate-800 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">করযে হাসানা ঋণ পরিশোধ</h3>
                  <p className="text-[11px] text-slate-500">বিকাশ, নগদ বা রকেটের মাধ্যমে ঋণ পরিশোধ</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setRepayModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {repaySuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-black text-emerald-800 text-sm">ঋণ পরিশোধ সফল হয়েছে!</h4>
                <p className="text-xs text-slate-600">আপনার বকেয়া ঋণ সফলভাবে সমন্বয় করা হয়েছে। আলহামদুলিল্লাহ!</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmRepay} className="space-y-3.5">
                {/* Summary Info */}
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold">বর্তমান মোট বকেয়া</span>
                    <span className="text-base font-black text-rose-600 font-mono">৳{toBengaliDigits(unpaidDebt.toLocaleString())}</span>
                  </div>
                  {daysRemaining !== null && daysRemaining !== undefined && (
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px] font-bold">পরিশোধের শেষ সময়</span>
                      <span className={`text-xs font-bold font-mono ${isOverdue ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {isOverdue ? 'মেয়াদ উত্তীর্ণ' : `আর ${toBengaliDigits(daysRemaining)} দিন বাকি`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Amount Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    পরিশোধের পরিমাণ (টাকা) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={unpaidDebt || 50000}
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    placeholder="যেমন: ৫০০"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold font-mono text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">সম্পূর্ণ বকেয়া অথবা যেকোনো আংশিক কিস্তি পরিশোধ করতে পারেন।</p>
                </div>

                {/* Payment Method Pills */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    পেমেন্ট মেথড নির্বাচন করুন <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'bKash', label: 'বিকাশ', number: siteSettings?.payment_methods?.bkash_number || '01712-345678' },
                      { id: 'Nagad', label: 'নগদ', number: siteSettings?.payment_methods?.nagad_number || '01812-345678' },
                      { id: 'Rocket', label: 'রকেট', number: siteSettings?.payment_methods?.rocket_number || '01912-345678' }
                    ].map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setRepayMethod(pm.id)}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          repayMethod === pm.id
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account Number Box */}
                {(() => {
                  const currentNumber = (
                    repayMethod === 'bKash' ? (siteSettings?.payment_methods?.bkash_number || '01712-345678') :
                    repayMethod === 'Nagad' ? (siteSettings?.payment_methods?.nagad_number || '01812-345678') :
                    (siteSettings?.payment_methods?.rocket_number || '01912-345678')
                  );
                  return (
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 uppercase block">
                          {repayMethod} মার্চেন্ট / সেন্ড মানি নম্বর
                        </span>
                        <span className="text-xs font-black text-slate-900 font-mono tracking-wider">
                          {currentNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyNumber(currentNumber)}
                        className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-300 flex items-center space-x-1 cursor-pointer"
                      >
                        {copiedNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি'}</span>
                      </button>
                    </div>
                  );
                })()}

                {/* Sender Number Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    যে নম্বর থেকে টাকা পাঠিয়েছেন <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={repaySenderNumber}
                    onChange={(e) => setRepaySenderNumber(e.target.value)}
                    placeholder="যেমন: 017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold font-mono text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Transaction ID Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ট্রানজেকশন আইডি (TrxID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={repayTrxId}
                    onChange={(e) => setRepayTrxId(e.target.value)}
                    placeholder="যেমন: 9H7G6F5D"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                {/* Optional Notes */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    মন্তব্য (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={repayNotes}
                    onChange={(e) => setRepayNotes(e.target.value)}
                    placeholder="যেমন: মার্চ মাসের কিস্তি"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {repayError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{repayError}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setRepayModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRepay}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-black shadow-md cursor-pointer transition-all flex items-center justify-center space-x-1.5"
                  >
                    {submittingRepay ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>যাচাই হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>পরিশোধ নিশ্চিত করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
        onNavigate={onNavigate}
        isOpen={modalOpen}
        initialReapply={reapplyMode}
        onClose={() => {
          setModalOpen(false);
          setReapplyMode(false);
        }}
        onSuccess={handleApplySuccess}
      />

    </div>
  );
}
