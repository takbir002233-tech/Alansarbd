import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Printer, 
  CheckCircle, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Mail, 
  Truck, 
  ExternalLink, 
  Download, 
  ArrowLeft, 
  Sparkles, 
  BookOpen 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import useScrollLock from '../hooks/useScrollLock';

export default function InvoiceModal({ order, onClose }) {
  const { siteSettings } = useCart();
  useScrollLock(!!order);

  useEffect(() => {
    if (order) {
      document.body.classList.add('alansar-invoice-active');
    }
    return () => {
      document.body.classList.remove('alansar-invoice-active');
    };
  }, [order]);

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

  const hadithSlogan = siteSettings?.invoice_hadith_slogans?.[0] || '“সৎ ও আমানতদার ব্যবসায়ী কিয়ামতের দিন নবী, সিদ্দিক ও শহীদগণের সাথে থাকবে।” — (তিরমিযী)';

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cod': return 'ক্যাশ অন ডেলিভারি (COD)';
      case 'qard': return 'করযে হাসানা (সুদমুক্ত ধার)';
      case 'bkash_personal': return 'বিকাশ (bKash)';
      case 'nagad_personal': return 'নগদ (Nagad)';
      case 'rocket': return 'রকেট (Rocket)';
      case 'bank': return 'ব্যাংক ডিপোজিট (Bank)';
      case 'points': return 'লয়ালটি পয়েন্ট রিডিম';
      default: return (method || 'ক্যাশ অন ডেলিভারি').toUpperCase();
    }
  };

  const modalContent = (
    <div 
      id="alansar-invoice-portal"
      className="invoice-portal-root"
    >
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm 6mm 8mm;
          }
          
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Hide EVERYTHING in the body except this invoice portal */
          body > *:not(#alansar-invoice-portal) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
          }

          #alansar-invoice-portal {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          .alansar-invoice-backdrop {
            position: static !important;
            inset: auto !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            backdrop-filter: none !important;
            box-shadow: none !important;
          }

          .alansar-invoice-card {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            max-height: none !important;
            overflow: visible !important;
            background: #ffffff !important;
          }

          .alansar-invoice-sheet {
            padding: 2mm 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: #ffffff !important;
            overflow: visible !important;
            font-size: 10.5px !important;
            line-height: 1.35 !important;
          }

          .invoice-no-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .invoice-item-row {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .print-hide {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen Backdrop */}
      <div 
        className="alansar-invoice-backdrop fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in"
        onClick={onClose}
      >
        <div 
          className="alansar-invoice-card bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200 text-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Top Control Bar (Hidden on Print) */}
          <div className="px-5 py-3 bg-slate-950 text-white flex items-center justify-between print-hide flex-shrink-0 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
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
                type="button"
                onClick={handlePrintOrDownload}
                className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                title="এ৪ সাইজের ১ পৃষ্ঠার নিখুঁত পিডিএফ ডাউনলোড করুন"
              >
                <Download className="w-3.5 h-3.5" />
                <span>📥 ডাউনলোড / প্রিন্ট PDF (A4)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Invoice Printable Sheet (A4 Compact Layout) */}
          <div 
            className="alansar-invoice-sheet p-6 sm:p-7 text-slate-800 bg-white overflow-y-auto modal-scrollable overscroll-contain flex-1"
            id="printable-invoice"
          >
            
            {/* 1. Header with Logo & Meta */}
            <div className="flex items-start justify-between border-b border-amber-200/80 pb-3 mb-3 invoice-no-break">
              <div className="flex items-center space-x-3">
                <img 
                  src={siteSettings?.logo_url || "/logo.jpg"} 
                  alt="AL ANSAR Logo" 
                  onError={(e) => { e.target.onerror = null; e.target.src = '/logo.jpg'; }}
                  className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-xl border border-amber-300 ring-1 ring-amber-300/40 p-0.5 bg-white shadow-2xs shrink-0" 
                />
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                    {siteSettings?.store_name || 'AL ANSAR SUPER SHOP'}
                  </h2>
                  <p className="text-[11px] text-amber-800 font-bold leading-tight mt-0.5">
                    {siteSettings?.store_name_bn || 'আল আনসার সুপার শপ'} • বিশুদ্ধ সুবাস ও বিশ্বস্ত সেবা
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    {siteSettings?.showroom_address || siteSettings?.store_address || 'উত্তরা, ঢাকা-১২৩০, বাংলাদেশ'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight font-mono">
                    হটলাইন: {siteSettings?.store_phone || '+880 1711-223344'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-black text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-300">
                  ক্যাশ মেমো / ইনভয়েস
                </span>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 mt-1 font-mono">
                  #{order.order_code}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <div className="mt-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : order.status === 'Cancelled'
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}>
                    {order.status === 'Delivered' ? '✓ ডেলিভার্ড' : order.status === 'Cancelled' ? '✕ বাতিল' : order.status === 'Shipped' ? '📦 কুরিয়ারে হস্তান্তর' : '⏳ প্রক্রিয়াধীন'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Customer, Shipping & Payment Summary (Compact 3-Column Box) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/70 mb-3 text-xs invoice-no-break">
              <div>
                <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-0.5">গ্রাহকের বিবরণ</p>
                <h4 className="font-bold text-slate-900 text-xs">{order.customer_name}</h4>
                <p className="text-[11px] text-slate-700 font-mono">📞 {order.customer_phone}</p>
                {order.customer_email && <p className="text-[10px] text-slate-500 truncate">{order.customer_email}</p>}
              </div>

              <div>
                <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-0.5">ডেলিভারি ঠিকানা</p>
                <p className="text-[11px] font-medium text-slate-800 leading-snug">{order.shipping_address}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {order.shipping_city} ({order.delivery_zone === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'})
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-0.5">পেমেন্ট ও কুরিয়ার</p>
                <p className="text-[11px] text-slate-800 font-medium">
                  মাধ্যম: <strong className="text-slate-900">{getPaymentMethodLabel(order.payment_method)}</strong>
                </p>
                {order.transaction_id && (
                  <p className="text-[10px] text-slate-600 font-mono">TrxID: <strong className="text-amber-900">{order.transaction_id}</strong></p>
                )}
                {order.courier_name && (
                  <p className="text-[10px] text-slate-600 font-medium">
                    কুরিয়ার: {order.courier_name} {order.consignment_id ? `(#${order.consignment_id})` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* 3. Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-100/70 text-slate-800 text-[11px] font-bold border-b border-amber-200">
                  <tr>
                    <th className="py-1.5 px-2.5 w-10 text-center">ক্র.</th>
                    <th className="py-1.5 px-2.5">পণ্যের বিবরণ</th>
                    <th className="py-1.5 px-2.5 w-14 text-center">পরিমাণ</th>
                    <th className="py-1.5 px-2.5 w-20 text-right">একক মূল্য</th>
                    <th className="py-1.5 px-2.5 w-24 text-right">মোট টাকা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="invoice-item-row hover:bg-amber-50/20">
                      <td className="py-1.5 px-2.5 text-center font-mono text-slate-500 text-[11px]">
                        {toBengaliDigits(idx + 1)}
                      </td>
                      <td className="py-1.5 px-2.5 font-bold text-slate-900 leading-snug">
                        {item.title}
                        {item.selected_variant && (
                          <span className="block text-[10px] text-slate-500 font-normal">
                            ভেরিয়েন্ট: {item.selected_variant}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-2.5 text-center font-bold font-mono text-slate-700">
                        {toBengaliDigits(item.quantity)}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-mono text-slate-600">
                        ৳{toBengaliDigits(Number(item.price).toLocaleString())}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900">
                        ৳{toBengaliDigits((item.price * item.quantity).toLocaleString())}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Summary & Footer Section (Side by Side to fit cleanly in A4) */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-2 border-t border-amber-200/80 invoice-no-break">
              
              {/* Left Side: Hadith Slogan & Authorized Signature */}
              <div className="w-full sm:flex-1 space-y-2">
                <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/70 text-slate-700">
                  <p className="text-[11px] font-medium italic text-slate-800 leading-relaxed">
                    {hadithSlogan}
                  </p>
                  <p className="text-[10px] text-amber-900 font-bold mt-0.5">
                    আল আনসার — বিশুদ্ধ সুবাস ও বিশ্বস্ততার মেলবন্ধন।
                  </p>
                </div>
                <p className="text-[10px] text-slate-500">
                  আল আনসারকে বেছে নেওয়ার জন্য আন্তরিক ধন্যবাদ! যেকোনো সহায়তায় আমাদের হটলাইনে যোগাযোগ করুন।
                </p>

                {/* Formal Signatures */}
                <div className="pt-6 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="border-t border-slate-300 pt-1 w-28 sm:w-32 text-center">
                    গ্রাহকের স্বাক্ষর
                  </div>
                  <div className="border-t border-slate-300 pt-1 w-36 sm:w-40 text-center font-bold text-slate-700">
                    অনুমোদিত স্বাক্ষর ও সিল
                  </div>
                </div>
              </div>

              {/* Right Side: Financial Breakdown */}
              <div className="w-full sm:w-72 space-y-1 text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-200 shrink-0">
                <div className="flex justify-between text-slate-600 py-0.5">
                  <span>সাবটোটাল</span>
                  <span className="font-bold text-slate-800 font-mono">
                    ৳{toBengaliDigits(order.subtotal?.toLocaleString())}
                  </span>
                </div>

                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold py-0.5">
                    <span>ভাউচার ছাড় ({order.applied_voucher_code || 'PROMO'})</span>
                    <span className="font-mono">-৳{toBengaliDigits(order.discount_amount?.toLocaleString())}</span>
                  </div>
                )}

                {Number(order.points_discount) > 0 && (
                  <div className="flex justify-between text-amber-800 font-bold py-0.5">
                    <span>ভিআইপি পয়েন্ট ছাড় ({toBengaliDigits(order.points_used)} পয়েন্ট)</span>
                    <span className="font-mono">-৳{toBengaliDigits(order.points_discount?.toLocaleString())}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 py-0.5">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {Number(order.delivery_fee) === 0 ? 'ফ্রি (FREE)' : `৳${toBengaliDigits(order.delivery_fee?.toLocaleString())}`}
                  </span>
                </div>

                <div className="flex justify-between text-xs font-black text-slate-900 border-t border-slate-300 pt-1 mt-0.5">
                  <span>সর্বমোট অর্ডার মূল্য</span>
                  <span className="text-sm font-black font-mono text-slate-900">
                    ৳{toBengaliDigits(order.total_amount?.toLocaleString())}
                  </span>
                </div>

                {Number(order.qard_amount) > 0 && (
                  <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-900 text-[10px] font-bold border border-emerald-200 space-y-0.5 mt-1">
                    <div className="flex justify-between">
                      <span>করযে হাসানা ঋণ ({toBengaliDigits(order.qard_percentage || 10)}%):</span>
                      <span className="font-mono">-৳{toBengaliDigits(order.qard_amount?.toLocaleString())}</span>
                    </div>
                    <p className="text-[9px] text-emerald-700 font-normal">
                      মেয়াদ: ৬ মাস ({order.qard_due_date ? new Date(order.qard_due_date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : 'সুদমুক্ত'})
                    </p>
                  </div>
                )}

                {Number(order.qard_repayment_amount) > 0 && (
                  <div className="flex justify-between text-blue-700 font-bold py-0.5">
                    <span>বকেয়া ঋণ শোধ কিস্তি:</span>
                    <span className="font-mono">+৳{toBengaliDigits(order.qard_repayment_amount?.toLocaleString())}</span>
                  </div>
                )}

                {order.payable_now !== undefined && (
                  <div className="flex justify-between text-xs font-black text-slate-900 bg-amber-200/60 px-2 py-1.5 rounded-lg border border-amber-300 mt-1">
                    <span>নগদ / গেটওয়েতে প্রদেয়:</span>
                    <span className="text-sm text-amber-950 font-mono font-black">
                      ৳{toBengaliDigits(order.payable_now?.toLocaleString())}
                    </span>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Bottom Actions for Screen View (Hidden on Print) */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between print-hide shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              ← বন্ধ করুন
            </button>
            <button
              type="button"
              onClick={handlePrintOrDownload}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl flex items-center space-x-2 shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>ডাউনলোড / প্রিন্ট ইনভয়েস (PDF)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
