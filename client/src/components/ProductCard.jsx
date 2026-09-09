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
      className={`product-card group bg-white rounded-2xl border transition-all duration-200 ease-out flex flex-col overflow-hidden cursor-pointer relative transform hover:-translate-y-1 hover:scale-[1.018] font-sans ${
        isOutOfStock 
          ? 'border-slate-200 opacity-80 hover:border-slate-300' 
          : 'border-amber-200/80 hover:border-amber-500 hover:ring-2 hover:ring-amber-400/40 shadow-xs hover:shadow-xl hover:shadow-amber-500/15'
      }`}
    >
      {/* Top subtle golden accent bar on card */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Product Image Box with Luxury Framing & Badges */}
      <div className={`relative w-full ${compact ? 'pt-[64%]' : 'pt-[80%]'} bg-gradient-to-b from-amber-50/60 via-slate-50 to-amber-100/30 overflow-hidden`}>
        
        {/* Background Image with Zoom */}
        <img
          src={product.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out ${
            isOutOfStock ? 'grayscale-30 group-hover:scale-102' : 'group-hover:scale-110'
          }`}
          loading="lazy"
        />

        {/* Elegant Light Gleam Sheen Effect on Hover */}
        <div className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

        {/* TOP-LEFT: 💥 ছাড় (DISCOUNT) & 👑 রয়্যাল (ROYAL FEATURED) */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20 flex flex-col gap-1 pointer-events-none items-start">
          {hasDiscount && (
            <span className="bg-gradient-to-r from-rose-600 via-red-500 to-amber-600 text-white text-[8px] sm:text-[9.5px] font-black px-2 py-0.5 rounded-full shadow-md border border-white/50 ring-1 ring-rose-500/30 flex items-center space-x-0.5 tracking-tight animate-pulse">
              <Flame className="w-2.5 h-2.5 text-amber-200 flex-shrink-0" />
              <span>{toBengaliDigits(discountPercent)}% ছাড়</span>
            </span>
          )}
          {product.is_featured && (
            <span className="bg-gradient-to-r from-[#032318] via-[#063b2a] to-[#032318] text-amber-300 text-[7.5px] sm:text-[8.5px] font-black px-2 py-0.5 rounded-full shadow-md border border-amber-400/80 ring-1 ring-amber-400/30 flex items-center space-x-1 backdrop-blur-xs">
              <Crown className="w-2.5 h-2.5 text-amber-300 flex-shrink-0 animate-spin-slow" />
              <span>রয়্যাল চয়েস</span>
            </span>
          )}
        </div>

        {/* TOP-RIGHT: 📦 স্টক (STOCK) & 🚚 ফ্রি ডেলিভারি (FREE DELIVERY) */}
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 flex flex-col gap-1 pointer-events-none items-end">
          {isOutOfStock ? (
            <span className="bg-rose-700 text-white text-[7.5px] sm:text-[8.5px] font-black px-2 py-0.5 rounded-full shadow-md border border-rose-300/40 flex items-center space-x-0.5">
              <XCircle className="w-2.5 h-2.5 text-rose-200" />
              <span>স্টক শেষ</span>
            </span>
          ) : isLowStock ? (
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[7.5px] sm:text-[8.5px] font-black px-2 py-0.5 rounded-full shadow-md border border-amber-300/60 flex items-center space-x-0.5 animate-bounce">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-100" />
              <span>মাত্র {toBengaliDigits(stockNum)}টি বাকি!</span>
            </span>
          ) : (
            <span className="bg-[#04241b]/95 text-emerald-200 text-[7.5px] sm:text-[8.5px] font-bold px-2 py-0.5 rounded-full shadow-md border border-emerald-400/50 backdrop-blur-xs flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>স্টক আছে</span>
            </span>
          )}

          {product.is_free_delivery && (
            <span className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white text-[7.5px] sm:text-[8.5px] font-black px-2 py-0.5 rounded-full shadow-md border border-teal-300/50 flex items-center space-x-1">
              <Truck className="w-2.5 h-2.5 text-teal-200" />
              <span>ফ্রি ডেলিভারি</span>
            </span>
          )}
        </div>

        {/* Stock Out Overlay if zero stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1.5px] flex items-center justify-center z-20">
            <span className="bg-rose-600 text-white font-black text-[10px] sm:text-xs px-3 py-1 rounded-full shadow-xl border border-rose-400/60 tracking-wider">
              স্টক আউট
            </span>
          </div>
        )}

        {/* Quick View Button on Hover */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
            <span className="bg-white/95 text-slate-900 text-[10px] sm:text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center space-x-1 backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-transform border border-amber-300">
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>বিস্তারিত দেখুন</span>
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className={`${compact ? 'p-2 sm:p-2.5' : 'p-2.5 sm:p-3.5'} flex-1 flex flex-col justify-between`}>
        <div>
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-1">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-[9.5px] sm:text-[11px] font-black text-slate-800">{toBengaliDigits(product.rating || 5.0)}</span>
            <span className="text-[8.5px] sm:text-[9.5px] text-slate-400">({toBengaliDigits(product.review_count || 24)})</span>
          </div>

          {/* Title */}
          <h3 className={`text-[11px] sm:text-xs md:text-[13px] font-black text-slate-800 line-clamp-2 group-hover:text-amber-700 transition-colors leading-snug ${compact ? 'min-h-[1.6rem] sm:min-h-[2rem]' : 'min-h-[1.9rem] sm:min-h-[2.3rem]'}`}>
            {product.title}
          </h3>

          {/* 💰 সাশ্রয় (SAVINGS HIGHLIGHT BAR - চোখে পড়ার মতো স্পেশাল ব্যাজ) */}
          <div className="my-1.5 flex items-center flex-wrap gap-1">
            {hasDiscount ? (
              <span className="bg-gradient-to-r from-emerald-100 to-teal-50 text-emerald-950 border border-emerald-300/90 px-2 py-0.5 rounded-lg text-[8.5px] sm:text-[10px] font-black inline-flex items-center space-x-1 shadow-2xs">
                <span className="text-emerald-700 font-bold">💰 সাশ্রয়</span>
                <span className="text-emerald-800 font-mono font-black">৳{toBengaliDigits(savings.toLocaleString())}</span>
                <span className="text-rose-600 font-bold text-[8px] sm:text-[9px]">({toBengaliDigits(discountPercent)}% ছাড়)</span>
              </span>
            ) : product.is_free_delivery ? (
              <span className="bg-teal-50 text-teal-900 border border-teal-200 px-2 py-0.5 rounded-lg text-[8.5px] sm:text-[10px] font-bold inline-flex items-center space-x-1 shadow-2xs">
                <Truck className="w-3 h-3 text-teal-700" />
                <span>ফ্রি হোম ডেলিভারি</span>
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-lg text-[8.5px] sm:text-[10px] font-bold inline-flex items-center space-x-1 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>১০০% খাঁটি ও অরিজিনাল</span>
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Add Button Row */}
        <div className="mt-1 pt-1.5 border-t border-amber-100/90 flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            <div className="flex items-baseline space-x-1 sm:space-x-1.5 flex-wrap">
              <span className="text-xs sm:text-sm md:text-[15px] font-black text-slate-900 tracking-tight font-mono">
                ৳{toBengaliDigits(price.toLocaleString())}
              </span>
              {hasDiscount && (
                <span className="text-[9px] sm:text-[10.5px] text-slate-400 line-through font-bold decoration-rose-500/70 font-mono">
                  ৳{toBengaliDigits(regularPrice.toLocaleString())}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`p-1.5 sm:p-2 rounded-xl transition-all duration-200 flex items-center justify-center flex-shrink-0 cursor-pointer ${
              added
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-sm hover:shadow-md hover:shadow-amber-500/30 active:scale-95 border border-amber-400/80'
            }`}
            title={isOutOfStock ? 'স্টক শেষ' : added ? 'যুক্ত হয়েছে!' : 'ব্যাগে যোগ করুন'}
          >
            {added ? (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            ) : isOutOfStock ? (
              <span className="text-[8.5px] font-bold px-0.5 text-slate-400">শেষ</span>
            ) : (
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
