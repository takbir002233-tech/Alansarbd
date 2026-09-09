import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  AlertCircle, 
  Printer, 
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Download
} from 'lucide-react';

export default function OrderTrack({ initialCode = '', onNavigate, onOpenInvoice }) {
  const [orderCode, setOrderCode] = useState(initialCode);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Bengali digits converter helper
  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  const fetchOrder = async (codeToSearch) => {
    const code = (codeToSearch || orderCode).trim().replace(/^#/, '');
    if (!code) return;

    setLoading(true);
    setErrorMsg(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/${code}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
        setErrorMsg(data.message || 'এই কোড দিয়ে কোনো অর্ডার খুঁজে পাওয়া যায়নি।');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('অর্ডার ট্র্যাক করতে সমস্যা হয়েছে। সংযোগ পরীক্ষা করুন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      setOrderCode(initialCode);
      fetchOrder(initialCode);
    }
  }, [initialCode]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrder();
  };

  const steps = [
    { key: 'Pending', label: 'অর্ডার গৃহীত', desc: 'যাচাইকরণের অপেক্ষায়' },
    { key: 'Confirmed', label: 'পেমেন্ট নিশ্চিত', desc: 'আল আনসার টিম কর্তৃক অনুমোদিত' },
    { key: 'Processing', label: 'প্যাকিং চলছে', desc: 'বাবল র‍্যাপ ও রাজকীয় সিল' },
    { key: 'Shipped', label: 'কুরিয়ারে হস্তান্তর', desc: 'ডেলিভারির পথে চলমান' },
    { key: 'Delivered', label: 'ডেলিভার্ড', desc: 'গ্রাহক পণ্য গ্রহণ করেছেন' },
  ];

  const getStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    const idx = steps.findIndex(s => s.key.toLowerCase() === (status || '').toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in font-sans">
      
      {/* Universal Back Navigation Bar */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center space-x-2 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-amber-800" />
          <span>← পিছনে যান (Back)</span>
        </button>

        {order && (
          <button
            onClick={() => onOpenInvoice(order)}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-700" />
            <span>ইনভয়েস PDF ডাউনলোড</span>
          </button>
        )}
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3.5 py-1 rounded-full uppercase tracking-wider border border-amber-200">
          আল আনসার লাইভ কুরিয়ার ও অর্ডার ট্র্যাকার
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">আপনার সুগন্ধি পার্সেল ট্র্যাক করুন</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          আপনার অর্ডার কোড (যেমন: ANSAR-88301) লিখুন এবং সরাসরি লাইভ স্ট্যাটাস ও স্টিভফাস্ট/রেডএক্স কুরিয়ার ট্র্যাকিং লিংক দেখুন।
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
        <input
          type="text"
          placeholder="অর্ডার কোড লিখুন (যেমন: ANSAR-88301)"
          value={orderCode}
          onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
          className="w-full pl-12 pr-28 py-3.5 bg-white text-sm rounded-2xl border border-amber-200 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 font-mono shadow-xs font-bold"
        />
        <Package className="w-5 h-5 text-amber-600 absolute left-4 top-4" />
        <button
          type="submit"
          disabled={loading || !orderCode.trim()}
          className="absolute right-2 top-2 bottom-2 px-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              <span>ট্র্যাক করুন</span>
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {errorMsg && (
        <div className="max-w-xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Order Tracking Display */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-xl space-y-8 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400 uppercase">অর্ডার কোড:</span>
                <span className="text-lg font-black font-mono text-amber-700">#{order.order_code}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                অর্ডারের তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                order.status === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.status === 'Cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                স্ট্যাটাস: {order.status === 'Delivered' ? 'ডেলিভার্ড' : order.status === 'Cancelled' ? 'বাতিল' : order.status === 'Shipped' ? 'কুরিয়ারে হস্তান্তর' : 'প্রক্রিয়াধীন'}
              </span>

              <button
                onClick={() => onOpenInvoice(order)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>ইনভয়েস ডাউনলোড</span>
              </button>
            </div>
          </div>

          {/* PROMINENT EXTERNAL COURIER TRACKING BOX */}
          {order.courier_tracking_url ? (
            <div className="p-5 bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl border border-amber-400/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    কুরিয়ার পার্টনার: {order.courier_name || 'স্টিভফাস্ট কুরিয়ার'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  কনসাইনমেন্ট ট্র্যাকিং আইডি: <span className="font-mono text-amber-300 font-black">{order.consignment_id || 'SF-TRACK'}</span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  আপনার পার্সেলটি কুরিয়ার নেটওয়ার্কে চলমান রয়েছে। লাইভ ট্র্যাকিং দেখতে নিচের বাটনে ক্লিক করুন।
                </p>
              </div>

              <a
                href={order.courier_tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-102 flex-shrink-0 cursor-pointer"
              >
                <span>🚚 কুরিয়ার ওয়েবসাইটে ট্র্যাক করুন</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs text-amber-900">
              <span className="flex items-center">
                <Truck className="w-4 h-4 mr-2 text-amber-700" />
                <span>পার্সেলটি কুরিয়ারে হস্তান্তর হওয়ামাত্র লাইভ ট্র্যাকিং লিংক যুক্ত হয়ে যাবে।</span>
              </span>
            </div>
          )}

          {/* Stepper Progress Timeline */}
          {order.status !== 'Cancelled' ? (
            <div className="py-4">
              <div className="grid grid-cols-5 gap-2 relative">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted
                            ? 'bg-amber-600 text-white ring-4 ring-amber-100 shadow-md'
                            : 'bg-slate-100 text-slate-400 border border-slate-300'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : toBengaliDigits(idx + 1)}
                      </div>
                      <span className={`text-xs font-bold mt-2 ${isCurrent ? 'text-amber-800' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                      <span className="text-[10px] text-slate-400 hidden sm:block max-w-[90px] mt-0.5 leading-tight">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs text-center font-bold">
              ❌ অর্ডারটি বাতিল করা হয়েছে। সহায়তার জন্য আল আনসার সাপোর্টে যোগাযোগ করুন।
            </div>
          )}

          {/* Detailed Status History Logs */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">ফুলফিলমেন্ট ও ট্র্যাকিং লগ</h4>
              <div className="space-y-2 text-xs">
                {order.status_history.map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-3 bg-white p-3 rounded-xl border border-slate-200/80">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800">{log.note || `স্ট্যাটাস পরিবর্তন: ${log.status}`}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleDateString('bn-BD')} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery & Items Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">ডেলিভারি ঠিকানা</h4>
              <p className="text-xs font-bold text-slate-900">{order.customer_name} ({order.customer_phone})</p>
              <p className="text-xs text-slate-600 mt-1">{order.shipping_address}, {order.shipping_city}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">পেমেন্ট বিবরণ</h4>
              <p className="text-xs text-slate-700">
                মাধ্যম: <strong className="text-slate-900 uppercase">{order.payment_method === 'qard' ? 'করযে হাসানা' : order.payment_method}</strong>
              </p>
              {order.transaction_id && (
                <p className="text-xs font-mono text-amber-700 font-bold mt-0.5">
                  TrxID: {order.transaction_id}
                </p>
              )}
              <p className="text-xs text-slate-900 font-black mt-1">
                মোট প্রদেয় টাকা: ৳{toBengaliDigits(order.total_amount?.toLocaleString())}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
