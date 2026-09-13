import React from 'react';
import { 
  Star, 
  ShoppingBag, 
  Eye, 
  Check, 
  Sparkles, 
  Truck, 
  AlertTriangle, 
  XCircle,
  Crown,
  Flame
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onNavigate, onSelect, compact = false }) {
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  const price = Number(product.discount_price || product.price);
  const regularPrice = Number(product.price);
  const hasDiscount = product.discount_price && Number(product.discount_price) < regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : 0;
  const savings = hasDiscount ? (regularPrice - price) : 0;
  const stockNum = Number(product.stock) !== undefined ? Number(product.stock) : 0;
  const isOutOfStock = stockNum <= 0;
  const isLowStock = stockNum > 0 && stockNum <= 5;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleCardClick = (e) => {
    e?.preventDefault?.();
    if (onSelect) {
      onSelect(product.id);
    } else if (onNavigate) {
      onNavigate('product-details', { productId: product.id });
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`product-card group bg-white rounded-2xl border transition-all duration-200 ease-out flex flex-col overflow-hidden cursor-pointer relative transform hover:-translate-y-1 hover:scale-[1.015] font-sans ${
        isOutOfStock 
          ? 'border-slate-200 opacity-80 hover:border-slate-300' 
          : 'border-slate-200/90 hover:border-emerald-600 hover:ring-2 hover:ring-emerald-400/25 shadow-xs hover:shadow-xl'
      }`}
    >
      {/* Top subtle emerald accent line on card */}
      <div className="h-0.5 w-full bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Product Image Box (Compact proportion on mobile so cards aren't overly tall) */}
      <div className={`relative w-full ${compact ? 'pt-[68%] sm:pt-[78%]' : 'pt-[70%] sm:pt-[82%] md:pt-[90%]'} bg-gradient-to-b from-slate-50/80 via-white to-amber-50/20 overflow-hidden flex items-center justify-center`}>
        
        {/* Background / Product Image */}
        <img
          src={product.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
          }}
          className={`absolute inset-0 w-full h-full object-contain p-1.5 sm:p-2.5 transition-transform duration-500 ease-out ${
            isOutOfStock ? 'grayscale-30 group-hover:scale-102' : 'group-hover:scale-108'
          }`}
          loading="lazy"
        />

        {/* TOP-LEFT: Emerald Sawtooth Ribbon Discount Tag */}
        {hasDiscount && (
          <div className="absolute top-0 left-1.5 sm:left-2.5 z-20 pointer-events-none drop-shadow-md">
            <div className="bg-emerald-800 text-amber-300 font-black text-[9px] sm:text-[11.5px] leading-tight px-1.5 sm:px-2 pt-0.5 sm:pt-1 pb-1 sm:pb-1.5 text-center relative flex flex-col items-center">
              <span className="font-extrabold tracking-tight">৳{toBengaliDigits(savings.toLocaleString())}</span>
              <span className="text-[7px] sm:text-[8.5px] font-black uppercase tracking-wider -mt-0.5 text-white">OFF</span>
              
              {/* Sawtooth / Zigzag bottom edge */}
              <div 
                className="absolute -bottom-1.5 left-0 right-0 h-1.5 bg-emerald-800"
                style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 85% 30%, 70% 100%, 55% 30%, 40% 100%, 25% 30%, 10% 100%, 0% 30%)'
                }}
              />
            </div>
          </div>
        )}

        {/* Featured Tag (Royal Choice) if applicable */}
        {product.is_featured && (
          <div className={`absolute ${hasDiscount ? 'top-8 sm:top-11 left-1.5' : 'top-1.5 left-1.5'} z-20 pointer-events-none`}>
            <span className="bg-gradient-to-r from-[#032318] to-[#063b2a] text-amber-300 text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-xs border border-amber-400/80 flex items-center space-x-0.5">
              <Crown className="w-2 h-2 text-amber-300 flex-shrink-0" />
              <span>রয়্যাল</span>
            </span>
          </div>
        )}

        {/* TOP-RIGHT: Stock status & Free delivery tags */}
        <div className="absolute top-1.5 right-1.5 z-20 flex flex-col gap-1 pointer-events-none items-end">
          {isOutOfStock ? (
            <span className="bg-rose-700 text-white text-[7px] sm:text-[8.5px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-md border border-rose-300/40 flex items-center space-x-0.5">
              <XCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-rose-200" />
              <span>স্টক শেষ</span>
            </span>
          ) : isLowStock ? (
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[7px] sm:text-[8.5px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-md border border-amber-300/60 flex items-center space-x-0.5 animate-bounce">
              <AlertTriangle className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-100" />
              <span>মাত্র {toBengaliDigits(stockNum)}টি বাকি!</span>
            </span>
          ) : product.is_free_delivery ? (
            <span className="bg-teal-700 text-white text-[6.5px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-xs flex items-center space-x-0.5">
              <Truck className="w-2 h-2 text-teal-200" />
              <span>ফ্রি ডেলিভারি</span>
            </span>
          ) : null}
        </div>

        {/* Stock Out Overlay if zero stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1.5px] flex items-center justify-center z-20">
            <span className="bg-rose-600 text-white font-black text-[10px] sm:text-xs px-3 py-1 rounded-full shadow-xl border border-rose-400/60 tracking-wider">
              স্টক আউট
            </span>
          </div>
        )}
      </div>

      {/* Content Area - Compact on mobile with minimal gaps */}
      <div className="p-1.5 sm:p-2.5 flex-1 flex flex-col justify-between space-y-1 sm:space-y-1.5">
        <div>
          {/* Dynamic Delivery Time Line (Customizable per product) */}
          <p className="text-[8.5px] sm:text-[10px] text-slate-500 italic text-center font-medium tracking-tight truncate">
            {product.is_free_delivery 
              ? `Delivery ${product.delivery_time || '1-2 hours'} • ফ্রি ডেলিভারি` 
              : `Delivery ${product.delivery_time || '1-2 hours'} • দ্রুত ডেলিভারি`}
          </p>

          {/* Product Title */}
          <h3 className="text-[11px] sm:text-xs md:text-[13px] font-black text-slate-800 text-center line-clamp-2 leading-snug group-hover:text-emerald-800 transition-colors mt-0.5 min-h-[1.5rem] sm:min-h-[1.9rem]">
            {product.title}
          </h3>
        </div>

        {/* Pricing & Add to Bag Button Stack */}
        <div className="space-y-1 sm:space-y-1.5 pt-0.5">
          {/* Price Row: Strikethrough Regular Price + Bold Emerald Selling Price + Per Piece */}
          <div className="flex items-center justify-center space-x-1 sm:space-x-1.5 flex-wrap">
            {hasDiscount && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through font-bold decoration-slate-400 font-mono">
                ৳{toBengaliDigits(regularPrice.toLocaleString())}
              </span>
            )}
            <span className="text-xs sm:text-sm md:text-[16px] font-black text-emerald-800 font-mono tracking-tight">
              ৳{toBengaliDigits(price.toLocaleString())}
            </span>
            <span className="text-[8.5px] sm:text-[10px] text-slate-500 font-medium">
              Per Piece
            </span>
          </div>

          {/* Emerald Pill "+ Add to Bag" Button (Website brand color) */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-full py-1 sm:py-1.5 px-2 sm:px-3 rounded-full font-black text-[10.5px] sm:text-xs transition-all duration-200 flex items-center justify-center space-x-1 shadow-xs active:scale-95 cursor-pointer ${
              added
                ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                : isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : 'bg-emerald-800 hover:bg-emerald-700 text-white shadow-emerald-900/20 hover:shadow-md hover:shadow-emerald-900/30 border border-emerald-700'
            }`}
            title={isOutOfStock ? 'স্টক শেষ' : added ? 'ব্যাগে যুক্ত হয়েছে!' : 'ব্যাগে যোগ করুন'}
          >
            {added ? (
              <>
                <Check className="w-3 h-3 stroke-[3]" />
                <span>যুক্ত হয়েছে!</span>
              </>
            ) : isOutOfStock ? (
              <span>স্টক শেষ</span>
            ) : (
              <>
                <span className="text-sm font-bold leading-none mr-0.5">+</span>
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
