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
        className="bg-white w-full max-w-2xl lg:max-w-3xl rounded-3xl shadow-2xl border border-amber-300/80 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Compact Header - Royal Emerald & Gold */}
        <div className="bg-gradient-to-r from-[#042017] via-[#062c21] to-[#042017] text-white px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between border-b border-amber-500/30 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-white flex items-center space-x-2 leading-none">
                <span>আপনার শপিং ব্যাগ</span>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  {totalItemCount} টি পণ্য
                </span>
              </h2>
              <p className="text-[10px] text-amber-200/80 font-mono mt-0.5">
                আল আনসার সুপার শপ • নিরাপদ ও দ্রুত ডেলিভারি
              </p>
            </div>
          </div>

          <button
            onClick={closeCart}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Free Shipping Milestone Progress Bar */}
        <div className="px-3.5 py-1.5 bg-amber-50/90 border-b border-amber-200/80 flex-shrink-0">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 mb-1">
            <span className="flex items-center text-amber-950 font-bold">
              <Truck className="w-3.5 h-3.5 mr-1 text-amber-600 flex-shrink-0" />
              {isFreeDelivery ? '🎉 ফ্রি হোম ডেলিভারি আনলক হয়েছে!' : `আর মাত্র ৳${diffToFree.toLocaleString()} কেনাকাটায় ফ্রি ডেলিভারি!`}
            </span>
            <span className="text-amber-900 font-black font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full bg-amber-200/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List - Ultra-Compact Single Row Cards, No Scrolling Needed */}
        <div className="flex-1 overflow-y-auto modal-scrollable p-2.5 sm:p-3 space-y-1.5 overscroll-contain">
          {cartItems.length === 0 ? (
            <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-200">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-800">আপনার শপিং ব্যাগ খালি</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">
                  আল আনসার কালেকশন ঘুরে খাঁটি ঘি, মধু, আতর ও প্রিমিয়াম খাদ্য সামগ্রী যুক্ত করুন।
                </p>
              </div>
              <button
                onClick={() => {
                  closeCart();
                  onNavigate('catalog');
                }}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer mt-1"
              >
                কালেকশন ঘুরে দেখুন
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id + JSON.stringify(item.variant)}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-50/90 border border-slate-200/90 hover:border-amber-400/80 hover:bg-amber-50/20 transition-all flex items-center justify-between gap-2 shadow-2xs group"
              >
                {/* Left: Compact Image & Title */}
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <img
                    src={item.thumbnail || '/logo.jpg'}
                    alt={item.title}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover bg-white border border-amber-200/60 shadow-2xs flex-shrink-0 p-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 truncate leading-tight">
                      {item.title}
                    </h4>
                    <div className="flex items-center space-x-1.5 mt-0.5 text-[10px] sm:text-[11px]">
                      <span className="font-bold text-amber-900 font-mono">
                        ৳{item.price.toLocaleString()}
                      </span>
                      {item.regular_price && item.regular_price > item.price && (
                        <span className="text-slate-400 line-through font-mono">
                          ৳{item.regular_price.toLocaleString()}
                        </span>
                      )}
                      {item.variant && (
                        <span className="text-slate-500 font-medium truncate max-w-[80px]">
                          • {typeof item.variant === 'string' ? item.variant : JSON.stringify(item.variant)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quantity Controls, Subtotal & Delete (All in same row) */}
                <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
                  {/* Compact Quantity Stepper */}
                  <div className="flex items-center bg-white border border-amber-300/90 rounded-lg p-0.5 shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                      className="w-5 h-5 flex items-center justify-center text-slate-700 hover:bg-amber-100 hover:text-amber-900 rounded transition-colors cursor-pointer"
                      title="সংখ্যা কমান"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-[10px] sm:text-[11px] font-black text-slate-900 px-1 min-w-[18px] text-center font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                      className="w-5 h-5 flex items-center justify-center text-slate-700 hover:bg-amber-100 hover:text-amber-900 rounded transition-colors cursor-pointer"
                      title="সংখ্যা বাড়ান"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[50px] sm:min-w-[62px]">
                    <span className="text-[11px] sm:text-xs font-black text-amber-900 font-mono block leading-tight">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id, item.variant)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="বাদ দিন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Compact Footer: Order Summary */}
        {cartItems.length > 0 && (
          <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-t border-slate-200 bg-slate-50/90 space-y-2 flex-shrink-0">
            {/* Price Calculations */}
            <div className="space-y-0.5 text-[11px] text-slate-600">
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
              <div className="flex justify-between text-xs sm:text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                <span>সর্বমোট প্রদেয়</span>
                <span className="text-sm sm:text-base text-amber-900 font-black font-mono">
                  ৳{(Math.max(0, subtotal - discountAmount)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleCheckoutClick}
              className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md shadow-amber-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              <span>চেকআউটে এগিয়ে যান (Proceed to Checkout)</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
