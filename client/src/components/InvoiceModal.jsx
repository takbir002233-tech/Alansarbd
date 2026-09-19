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

  const hadithSlogans = siteSettings?.invoice_hadith_slogans || [
    '“সৎ ও আমানতদার ব্যবসায়ী কিয়ামতের দিন নবী, সিদ্দিক ও শহীদগণের সাথে থাকবে।” — (তিরমিযী)',
    '“হে মুমিনগণ! তোমরা পারস্পরিক সন্তুষ্টির ভিত্তিতে ব্যবসা-বাণিজ্য করো।” — (সূরা আন-নিসা: ২৯)',
    'আল আনসার — বিশুদ্ধ সুবাস ও বিশ্বস্ততার মেলবন্ধন।'
  ];

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cod': return 'ক্যাশ অন ডেলিভারি (COD)';
      case 'qard': return 'করযে হাসানা (১০% তাৎক্ষণিক ধার/বাকি)';
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
            height: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;
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

          .print-hide, .print\\:hidden {
            display: none !important;
          }

          #printable-invoice {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            font-size: 11px !important;
            line-height: 1.35 !important;
          }

          /* Exact Original Style Print Optimization: fits cleanly in 1 single A4 page */
          .print-header {
            padding-bottom: 3mm !important;
            margin-bottom: 3mm !important;
          }

          .print-logo {
            height: 15mm !important;
            width: 15mm !important;
          }

          .print-customer-box {
            padding: 2.5mm 3.5mm !important;
            margin-bottom: 2.5mm !important;
            gap: 3mm !important;
            border-radius: 2.5mm !important;
          }

          .print-bar {
            padding: 2mm 3mm !important;
            margin-bottom: 2.5mm !important;
            border-radius: 2.5mm !important;
          }

          .print-table-wrap {
            margin-bottom: 2.5mm !important;
            border-radius: 2.5mm !important;
          }

          .print-table-th, .print-table-td {
            padding: 1.8mm 2.8mm !important;
            font-size: 10.5px !important;
          }

          .print-summary-wrap {
            padding-top: 1mm !important;
          }

          .print-summary-box {
            width: 82mm !important;
            font-size: 10.5px !important;
          }

          .print-summary-box > div {
            padding-top: 0.6mm !important;
            padding-bottom: 0.6mm !important;
          }

          .print-hadith-box {
            padding-top: 2.5mm !important;
            margin-top: 2.5mm !important;
          }

          .print-hadith-box p {
            margin-bottom: 1mm !important;
            font-size: 9.5px !important;
          }
        }
      `}</style>

      {/* Screen Backdrop */}
      <div 
        className="alansar-invoice-backdrop fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in"
        onClick={onClose}
      >
        <div 
          className="alansar-invoice-card bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-amber-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 text-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Top Control Bar (Hidden on Print) */}
          <div className="p-4 bg-slate-950 text-white flex items-center justify-between print-hide flex-shrink-0">
            <div className="flex items-center space-x-2">
              <button
                type="button"
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

          {/* Invoice Printable Sheet (Exact Original Style) */}
          <div 
            className="p-6 sm:p-8 space-y-4 sm:space-y-5 text-slate-800 bg-white overflow-y-auto modal-scrollable overscroll-contain flex-1" 
            id="printable-invoice"
          >
            
            {/* 1. Header with Official Logo at Top Corner */}
            <div className="print-header flex items-start justify-between border-b border-amber-200/80 pb-4 sm:pb-5">
              <div className="flex items-center space-x-3.5 sm:space-x-4">
                <img 
                  src={siteSettings?.logo_url || "/logo.jpg"} 
                  alt="AL ANSAR Logo" 
                  onError={(e) => { e.target.onerror = null; e.target.src = '/logo.jpg'; }}
                  className="print-logo h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-2xl border-2 border-amber-400 ring-2 ring-amber-300/40 shadow-xs bg-white p-1 shrink-0" 
                />
                <div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                      {siteSettings?.store_name || 'AL ANSAR SUPER SHOP'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 font-bold tracking-wider mt-0.5">
                    {siteSettings?.store_name_bn || 'আল আনসার সুপার শপ'} • প্রিমিয়াম কোয়ালিটি ও বিশ্বস্ত সেবা
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-tight">
                    {siteSettings?.showroom_address || siteSettings?.store_address || 'উত্তরা, ঢাকা-১২৩০, বাংলাদেশ'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium leading-tight">
                    হটলাইন: {siteSettings?.store_phone || '+880 1711-223344'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-black text-amber-800 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-200">
                  অফিসিয়াল ইনভয়েস
                </span>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 mt-1.5 font-mono">
                  #{order.order_code}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="mt-1.5">
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

            {/* 2. Customer & Shipping Details (Exact 2-Column Box) */}
            <div className="print-customer-box grid grid-cols-2 gap-4 sm:gap-6 bg-amber-50/40 p-3.5 sm:p-4 rounded-2xl border border-amber-100 text-xs">
              <div>
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">গ্রাহকের বিবরণ</p>
                <h4 className="text-sm font-bold text-slate-900">{order.customer_name}</h4>
                <p className="text-xs text-slate-600 mt-0.5 font-mono">{order.customer_phone}</p>
                {order.customer_email && <p className="text-xs text-slate-500 truncate">{order.customer_email}</p>}
              </div>

              <div>
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">ডেলিভারি গন্তব্য</p>
                <p className="text-xs font-medium text-slate-800">{order.shipping_address}</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {order.shipping_city} ({order.delivery_zone === 'inside_dhaka' ? 'ঢাকা সিটি' : 'ঢাকার বাইরে'})
                </p>
              </div>
            </div>

            {/* 3. Courier Details if assigned */}
            {(order.courier_tracking_url || order.courier_name) && (
              <div className="print-bar p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>কুরিয়ার: <strong>{order.courier_name || 'স্টিভফাস্ট কুরিয়ার'}</strong> {order.consignment_id ? `(আইডি: ${order.consignment_id})` : ''}</span>
                </div>
                {order.courier_tracking_url && (
                  <a href={order.courier_tracking_url} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline flex items-center print-hide">
                    অনলাইনে ট্র্যাক করুন <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            )}

            {/* 4. Payment Method & Details */}
            <div className="print-bar p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">পেমেন্ট মাধ্যম: </span>
                <span className="font-bold text-slate-900 uppercase">
                  {order.payment_method === 'qard' ? 'করযে হাসানা (১০% তাৎক্ষণিক ধার/বাকি)' : getPaymentMethodLabel(order.payment_method)}
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

            {/* 5. Items Table */}
            <div className="print-table-wrap border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50/70 text-slate-700 uppercase font-semibold border-b border-amber-100">
                  <tr>
                    <th className="print-table-th p-2.5 sm:p-3">পণ্যের বিবরণ</th>
                    <th className="print-table-th p-2.5 sm:p-3 text-center">পরিমাণ</th>
                    <th className="print-table-th p-2.5 sm:p-3 text-right">একক মূল্য</th>
                    <th className="print-table-th p-2.5 sm:p-3 text-right">মোট (টাকা)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="print-table-td p-2.5 sm:p-3 font-medium text-slate-800">
                        {item.title}
                        {item.selected_variant && (
                          <span className="block text-[10px] text-slate-500 font-normal">
                            ভেরিয়েন্ট: {item.selected_variant}
                          </span>
                        )}
                      </td>
                      <td className="print-table-td p-2.5 sm:p-3 text-center font-bold text-slate-700">
                        {toBengaliDigits(item.quantity)}
                      </td>
                      <td className="print-table-td p-2.5 sm:p-3 text-right text-slate-600">
                        ৳{toBengaliDigits(Number(item.price).toLocaleString())}
                      </td>
                      <td className="print-table-td p-2.5 sm:p-3 text-right font-bold text-slate-900">
                        ৳{toBengaliDigits((item.price * item.quantity).toLocaleString())}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 6. Summary Breakdown (Exact Right-Aligned Box) */}
            <div className="print-summary-wrap flex justify-end pt-1 sm:pt-2">
              <div className="print-summary-box w-72 sm:w-80 space-y-1.5 sm:space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>সাবটোটাল</span>
                  <span className="font-bold text-slate-800 font-mono">৳{toBengaliDigits(order.subtotal?.toLocaleString())}</span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>ভাউচার ছাড় ({order.applied_voucher_code || 'PROMO'})</span>
                    <span className="font-mono">-৳{toBengaliDigits(order.discount_amount?.toLocaleString())}</span>
                  </div>
                )}
                {Number(order.points_discount) > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>ভিআইপি পয়েন্ট ছাড় ({toBengaliDigits(order.points_used)} পয়েন্ট)</span>
                    <span className="font-mono">-৳{toBengaliDigits(order.points_discount?.toLocaleString())}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {Number(order.delivery_fee) === 0 ? 'ফ্রি' : `৳${toBengaliDigits(order.delivery_fee?.toLocaleString())}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-1.5 sm:pt-2">
                  <span>সর্বমোট অর্ডার মূল্য</span>
                  <span className="text-base text-slate-900 font-mono">৳{toBengaliDigits(order.total_amount?.toLocaleString())}</span>
                </div>
                {Number(order.qard_amount) > 0 && (
                  <div className="p-2 sm:p-2.5 bg-emerald-50 rounded-xl text-emerald-900 text-[11px] font-bold border border-emerald-200 space-y-0.5">
                    <div className="flex justify-between">
                      <span>করযে হাসানা ঋণ ({toBengaliDigits(order.qard_percentage || 10)}%):</span>
                      <span className="font-mono">-৳{toBengaliDigits(order.qard_amount?.toLocaleString())}</span>
                    </div>
                    <p className="text-[10px] text-emerald-700 font-normal">
                      পরিশোধের নির্দিষ্ট সময়: ৬ মাস ({order.qard_due_date ? new Date(order.qard_due_date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }) : 'সুদমুক্ত'})
                    </p>
                  </div>
                )}
                {Number(order.qard_repayment_amount) > 0 && (
                  <div className="flex justify-between text-blue-700 font-bold">
                    <span>বকেয়া ঋণ পরিশোধ সমন্বয়:</span>
                    <span className="font-mono">+৳{toBengaliDigits(order.qard_repayment_amount?.toLocaleString())}</span>
                  </div>
                )}
                {order.payable_now !== undefined && (
                  <div className="flex justify-between text-sm font-black text-slate-900 bg-amber-100/70 p-2 rounded-xl border border-amber-300">
                    <span>নগদ / গেটওয়েতে প্রদেয়</span>
                    <span className="text-base text-amber-900 font-mono">৳{toBengaliDigits(order.payable_now?.toLocaleString())}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 7. Configurable Hadith Slogans at Bottom of Invoice (All Slogans Preserved) */}
            <div className="print-hadith-box border-t border-amber-200/80 pt-3 sm:pt-4 space-y-1 sm:space-y-1.5 text-center">
              {hadithSlogans.map((slogan, idx) => (
                <p key={idx} className="text-[10.5px] sm:text-[11px] text-slate-600 italic font-medium">
                  {slogan}
                </p>
              ))}
              <p className="text-[9.5px] sm:text-[10px] text-slate-400 pt-0.5">
                আল আনসারকে বেছে নেওয়ার জন্য আন্তরিক ধন্যবাদ! যেকোনো প্রয়োজনে এই মেমোটি সংরক্ষণ করুন।
              </p>
            </div>

          </div>

          {/* 8. Bottom Actions for Screen View (Hidden on Print) */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print-hide shrink-0">
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
              <span>ডাউনলোড ইনভয়েস (PDF)</span>
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
