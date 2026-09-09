import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck, Phone, MapPin, Mail, Truck, ExternalLink, Download, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';
import { useCart } from '../context/CartContext';
import useScrollLock from '../hooks/useScrollLock';

export default function InvoiceModal({ order, onClose }) {
  const { siteSettings } = useCart();
  useScrollLock(!!order);

  if (!order) return null;

  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  const handlePrintOrDownload = () => {
    const originalTitle = document.title;
    document.title = `AL_ANSAR_Invoice_${order.order_code}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const hadithSlogans = siteSettings?.invoice_hadith_slogans || [
    '“সৎ ও আমানতদার ব্যবসায়ী কিয়ামতের দিন নবী, সিদ্দিক ও শহীদগণের সাথে থাকবে।” — (তিরমিযী)',
    '“হে মুমিনগণ! তোমরা পারস্পরিক সন্তুষ্টির ভিত্তিতে ব্যবসা-বাণিজ্য করো।” — (সূরা আন-নিসা: ২৯)',
    'আল আনসার — বিশুদ্ধ সুবাস ও বিশ্বস্ততার মেলবন্ধন।'
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-amber-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="p-4 bg-slate-950 text-white flex items-center justify-between print:hidden flex-shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← ফিরে যান</span>
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 hidden sm:inline ml-2">
              আল আনসার অফিসিয়াল ইনভয়েস
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintOrDownload}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>📥 ডাউনলোড / প্রিন্ট PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 space-y-6 print:p-6 text-slate-800 bg-white overflow-y-auto modal-scrollable overscroll-contain flex-1" id="printable-invoice">
          
          {/* Header with Official Logo at Top Corner */}
          <div className="flex items-start justify-between border-b border-amber-200/80 pb-6">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo.jpg" 
                alt="AL ANSAR Logo" 
                className="h-16 w-16 object-contain rounded-2xl border-2 border-amber-300 shadow-xs" 
              />
              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    AL ANSAR
                  </span>
                </div>
                <p className="text-xs text-amber-800 font-bold tracking-wider">
                  আল আনসার • লাক্সারি পারফিউম ও খাঁটি আতর
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">{siteSettings?.showroom_address || siteSettings?.store_address || 'উত্তরা, ঢাকা-১২৩০, বাংলাদেশ'}</p>
                <p className="text-xs text-slate-500 font-medium">হটলাইন: {siteSettings?.store_phone || '+880 1711-223344'}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-black text-amber-800 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-200">
                অফিসিয়াল ইনভয়েস
              </span>
              <h3 className="text-sm font-black text-slate-900 mt-2 font-mono">#{order.order_code}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <div className="mt-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  order.status === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'Cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  স্ট্যাটাস: {order.status === 'Delivered' ? 'ডেলিভার্ড' : order.status === 'Cancelled' ? 'বাতিল' : order.status === 'Shipped' ? 'কুরিয়ারে হস্তান্তর' : 'প্রক্রিয়াধীন'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 bg-amber-50/40 p-4 rounded-2xl border border-amber-100">
            <div>
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">গ্রাহকের বিবরণ</p>
              <h4 className="text-sm font-bold text-slate-900">{order.customer_name}</h4>
              <p className="text-xs text-slate-600 mt-0.5 font-mono">{order.customer_phone}</p>
              {order.customer_email && <p className="text-xs text-slate-500">{order.customer_email}</p>}
            </div>

            <div>
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">ডেলিভারি গন্তব্য</p>
              <p className="text-xs font-medium text-slate-800">{order.shipping_address}</p>
              <p className="text-xs text-slate-600 mt-0.5">{order.shipping_city} ({order.delivery_zone === 'inside_dhaka' ? 'ঢাকা সিটি' : 'ঢাকার বাইরে'})</p>
            </div>
          </div>

          {/* Courier Details if assigned */}
          {order.courier_tracking_url && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>কুরিয়ার: <strong>{order.courier_name || 'স্টিভফাস্ট কুরিয়ার'}</strong> (আইডি: {order.consignment_id || 'N/A'})</span>
              </div>
              <a href={order.courier_tracking_url} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline flex items-center print:hidden">
                অনলাইনে ট্র্যাক করুন <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          )}

          {/* Payment Method & Details */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">পেমেন্ট মাধ্যম: </span>
              <span className="font-bold text-slate-900 uppercase">
                {order.payment_method === 'qard' ? 'করযে হাসানা (১০% তাৎক্ষণিক ধার/বাকি)' : order.payment_method}
              </span>
            </div>
            {order.transaction_id && (
              <div>
                <span className="text-slate-500">TrxID: </span>
                <span className="font-mono font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {order.transaction_id}
                </span>
              </div>
            )}
            {order.sender_number && (
              <div>
                <span className="text-slate-500">প্রেরক নম্বর: </span>
                <span className="font-semibold text-slate-800 font-mono">{order.sender_number}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/70 text-slate-700 uppercase font-semibold border-b border-amber-100">
                <tr>
                  <th className="p-3">সুগন্ধি / আইটেমের বিবরণ</th>
                  <th className="p-3 text-center">পরিমাণ</th>
                  <th className="p-3 text-right">একক মূল্য</th>
                  <th className="p-3 text-right">মোট (টাকা)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-medium text-slate-800">{item.title}</td>
                    <td className="p-3 text-center font-bold text-slate-700">{toBengaliDigits(item.quantity)}</td>
                    <td className="p-3 text-right text-slate-600">৳{toBengaliDigits(Number(item.price).toLocaleString())}</td>
                    <td className="p-3 text-right font-bold text-slate-900">৳{toBengaliDigits((item.price * item.quantity).toLocaleString())}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>সাবটোটাল</span>
                <span className="font-bold text-slate-800">৳{toBengaliDigits(order.subtotal?.toLocaleString())}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>ভাউচার ছাড় ({order.applied_voucher_code || 'PROMO'})</span>
                  <span>-৳{toBengaliDigits(order.discount_amount?.toLocaleString())}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি চার্জ</span>
                <span className="font-semibold text-slate-800">৳{toBengaliDigits(order.delivery_fee?.toLocaleString())}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                <span>সর্বমোট প্রদেয় টাকা</span>
                <span className="text-base text-amber-700">৳{toBengaliDigits(order.total_amount?.toLocaleString())}</span>
              </div>
              {order.payment_method === 'qard' && (
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 text-[11px] font-bold text-right border border-emerald-200">
                  <span>করযে হাসানা বকেয়া: ৳{toBengaliDigits(Math.round(order.total_amount * 0.1).toLocaleString())} (১০%)</span>
                </div>
              )}
            </div>
          </div>

          {/* Configurable Hadith Slogans at Bottom of Invoice */}
          <div className="border-t border-amber-200/80 pt-4 space-y-2 text-center">
            {hadithSlogans.map((slogan, idx) => (
              <p key={idx} className="text-[11px] text-slate-600 italic font-medium">
                {slogan}
              </p>
            ))}
            <p className="text-[10px] text-slate-400 pt-1">
              আল আনসারকে বেছে নেওয়ার জন্য আন্তরিক ধন্যবাদ! যেকোনো প্রয়োজনে এই মেমোটি সংরক্ষণ করুন।
            </p>
          </div>
        </div>

        {/* Bottom Actions for Screen View (Hidden on Print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
          >
            ← বন্ধ করুন
          </button>
          <button
            onClick={handlePrintOrDownload}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl flex items-center space-x-2 shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>ডাউনলোড ইনভয়েস (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
