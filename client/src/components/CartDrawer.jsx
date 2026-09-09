import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import useScrollLock from '../hooks/useScrollLock';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Tag, 
  Truck
} from 'lucide-react';

export default function CartDrawer({ onNavigate }) {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItemCount,
    appliedPromo,
    promoCode,
    setPromoCode,
    applyPromo,
    removePromo,
    discountAmount,
    siteSettings
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);

  // Lock body scroll when cart popup is open
  useScrollLock(isCartOpen);

  if (!isCartOpen) return null;

  const threshold = siteSettings?.free_delivery_threshold || 2000;
  const isFreeDelivery = subtotal >= threshold;
  const diffToFree = Math.max(0, threshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / threshold) * 100));

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const res = applyPromo(promoInput);
    setPromoMessage(res);
  };

  const handleCheckoutClick = () => {
    closeCart();
    onNavigate('checkout');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
      onClick={closeCart}
    >
      {/* Centered Modal Card */}
      <div 
        className="bg-white w-full max-w-2xl lg:max-w-3xl rounded-3xl shadow-2xl border border-amber-300/80 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - Royal Emerald & Gold */}
        <div className="bg-gradient-to-r from-[#042017] via-[#062c21] to-[#042017] text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-500/30 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-md">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center space-x-2">
                <span>আপনার শপিং ব্যাগ</span>
                <span className="text-[10px] sm:text-xs font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {totalItemCount} টি পণ্য
                </span>
              </h2>
              <p className="text-[11px] text-amber-200/80 font-mono">
                আল আনসার সুপার শপ • নিরাপদ ও দ্রুত ডেলিভারি
              </p>
            </div>
          </div>

          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Milestone Progress Bar */}
        <div className="p-3 sm:p-3.5 bg-amber-50/80 border-b border-amber-200/80 flex-shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
            <span className="flex items-center text-amber-950 font-bold">
              <Truck className="w-4 h-4 mr-1 text-amber-600 flex-shrink-0" />
              {isFreeDelivery ? '🎉 অভিনন্দন! আপনি ফ্রি হোম ডেলিভারি আনলক করেছেন!' : `আর মাত্র ৳${diffToFree.toLocaleString()} কেনাকাটায় ফ্রি ডেলিভারি!`}
            </span>
            <span className="text-amber-900 font-black">{progressPercent}%</span>
          </div>
          <div className="w-full bg-amber-200/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List - Separate Individual Cards, Vertical List, Scrollable */}
        <div className="flex-1 overflow-y-auto modal-scrollable p-4 sm:p-5 space-y-3 overscroll-contain">
          {cartItems.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-200">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">আপনার শপিং ব্যাগ খালি</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  আল আনসার কালেকশন ঘুরে খাঁটি ঘি, মধু, আতর ও প্রিমিয়াম খাদ্য সামগ্রী যুক্ত করুন।
                </p>
              </div>
              <button
                onClick={() => {
                  closeCart();
                  onNavigate('catalog');
                }}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer mt-2"
              >
                কালেকশন ঘুরে দেখুন
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id + JSON.stringify(item.variant)}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:border-amber-400/80 hover:bg-amber-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs group"
              >
                {/* Left: Product Image & Details */}
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  <img
                    src={item.thumbnail || '/logo.jpg'}
                    alt={item.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-white border border-amber-200/60 shadow-2xs flex-shrink-0 p-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    {item.variant && (
                      <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                        ভ্যারিয়েন্ট: {typeof item.variant === 'string' ? item.variant : JSON.stringify(item.variant)}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs sm:text-sm font-black text-amber-900 font-mono">
                        একক মূল্য: ৳{item.price.toLocaleString()}
                      </span>
                      {item.regular_price && item.regular_price > item.price && (
                        <span className="text-[11px] text-slate-400 line-through font-mono">
                          ৳{item.regular_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quantity Controls & Subtotal & Delete */}
                <div className="flex items-center justify-between sm:justify-end sm:space-x-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                  {/* Quantity Stepper */}
                  <div className="flex items-center space-x-1 bg-white border border-amber-300 rounded-xl p-0.5 shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                      className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-amber-100 hover:text-amber-900 rounded-lg transition-colors cursor-pointer"
                      title="সংখ্যা কমান"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black text-slate-900 px-2 min-w-[24px] text-center font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                      className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-amber-100 hover:text-amber-900 rounded-lg transition-colors cursor-pointer"
                      title="সংখ্যা বাড়ান"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal for this Item */}
                  <div className="text-right min-w-[80px]">
                    <span className="text-[10px] text-slate-500 block font-medium">মোট</span>
                    <span className="text-sm sm:text-base font-black text-amber-900 font-mono">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  {/* Remove Item Button */}
                  <button
                    onClick={() => removeFromCart(item.id, item.variant)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="কার্ট থেকে বাদ দিন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Coupon Box & Order Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/90 space-y-3.5 flex-shrink-0">
            
            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-1.5">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="কুপন কোড (যেমন: ALANSAR10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 font-mono uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  প্রয়োগ করুন
                </button>
              </div>

              {promoMessage && (
                <p className={`text-[11px] font-medium ${promoMessage.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {promoMessage.message}
                </p>
              )}

              {appliedPromo && (
                <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  <span className="font-bold flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    কুপন {appliedPromo.code} সফলভাবে প্রয়োগ হয়েছে (-৳{discountAmount.toLocaleString()})
                  </span>
                  <button
                    type="button"
                    onClick={removePromo}
                    className="text-red-500 hover:underline text-[10px] font-bold cursor-pointer"
                  >
                    মুছে ফেলুন
                  </button>
                </div>
              )}
            </form>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-200">
              <div className="flex justify-between">
                <span>পণ্যের মোট মূল্য (Subtotal)</span>
                <span className="font-bold text-slate-800 font-mono">৳{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>ছাড় (Discount)</span>
                  <span className="font-mono">-৳{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>হোম ডেলিভারি</span>
                <span className="font-semibold text-slate-700">
                  {isFreeDelivery ? <span className="text-emerald-600 font-bold">ফ্রি (FREE)</span> : 'চেকআউটে নির্ধারিত হবে'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>সর্বমোট প্রদেয়</span>
                <span className="text-lg text-amber-900 font-black font-mono">
                  ৳{(Math.max(0, subtotal - discountAmount)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleCheckoutClick}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              <span>চেকআউটে এগিয়ে যান (Proceed to Checkout)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
