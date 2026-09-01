import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, Package, Printer, Clock, ArrowRight, ShieldCheck, Truck, Download, ArrowLeft } from 'lucide-react';

export default function OrderConfirmation({ order, onNavigate, onOpenInvoice }) {
  // Bengali digits converter helper
  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <h2 className="text-xl font-bold text-slate-800">কোনো সক্রিয় অর্ডার পাওয়া যায়নি</h2>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          ← মূল পেইজে ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6 animate-in fade-in font-sans">
      
      {/* Universal Back Button */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-amber-800 transition-colors bg-white px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-700" />
          <span>← মূল পেইজে ফিরে যান</span>
        </button>
      </div>

      {/* Success Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-amber-100 shadow-xl text-center space-y-6">
        
        {/* Animated Checkmark */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 ring-8 ring-emerald-50">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black text-amber-800 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-200">
            অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            ধন্যবাদ, {order.customer_name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            আপনার আল আনসার সুগন্ধি অর্ডারটি সিস্টেমে সংরক্ষিত হয়েছে। আমাদের ওয়্যারহাউস টিম পার্সেলটি প্রস্তুত করছে।
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="p-6 bg-amber-50/40 rounded-2xl border border-amber-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">অর্ডার কোড</span>
            <span className="text-sm font-black font-mono text-amber-700">#{order.order_code}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">পেমেন্ট মাধ্যম</span>
            <span className="text-xs font-bold text-slate-800 uppercase">
              {order.payment_method === 'qard' ? 'করযে হাসানা (১০% ধার)' : order.payment_method}
            </span>
            {order.transaction_id && (
              <span className="text-[10px] text-slate-500 block font-mono">TrxID: {order.transaction_id}</span>
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">মোট প্রদেয় টাকা</span>
            <span className="text-sm font-black text-slate-900">৳{toBengaliDigits(order.total_amount?.toLocaleString())}</span>
          </div>
        </div>

        {/* Shipping summary */}
        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center space-x-3 text-left">
          <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="text-xs text-emerald-950">
            <span className="font-bold">ডেলিভারি ঠিকানা: </span>
            <span>{order.shipping_address}, {order.shipping_city} ({order.customer_phone})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => onOpenInvoice(order)}
            className="py-3.5 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>📥 ডাউনলোড / প্রিন্ট অফিসিয়াল ইনভয়েস</span>
          </button>

          <button
            onClick={() => onNavigate('track-order', { code: order.order_code })}
            className="py-3.5 px-5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>লাইভ কুরিয়ার ট্র্যাকিং দেখুন</span>
          </button>
        </div>

        <div>
          <button
            onClick={() => onNavigate('home')}
            className="text-xs font-bold text-slate-600 hover:text-amber-800 transition-colors cursor-pointer"
          >
            ← মূল পেইজে ফিরে যান ও আরও কেনাকাটা করুন
          </button>
        </div>
      </div>
    </div>
  );
}
