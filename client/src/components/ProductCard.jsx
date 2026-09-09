import React from 'react';
import { Star, ShoppingBag, Eye, Check, Sparkles, Truck, AlertTriangle, XCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onNavigate, onSelect }) {
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
      className={`group bg-white rounded-xl sm:rounded-2xl border transition-all duration-150 ease-out flex flex-col overflow-hidden cursor-pointer relative transform hover:-translate-y-1 hover:scale-[1.015] font-sans ${
        isOutOfStock 
          ? 'border-slate-200 opacity-80 hover:border-slate-400' 
          : 'border-slate-200/90 hover:border-amber-500 hover:ring-2 hover:ring-amber-400 shadow-xs hover:shadow-xl hover:shadow-amber-500/20'
      }`}
    >
      {/* Auto Calculated Discount Badge & Featured Tag */}
      <div className="absolute top-1 left-1 sm:top-2.5 sm:left-2.5 z-10 flex flex-col gap-0.5 sm:gap-1 pointer-events-none">
        {hasDiscount && (
          <span className="bg-gradient-to-r from-amber-600 to-rose-600 text-white text-[7.5px] sm:text-[9px] md:text-[10px] font-black px-1 py-0.2 sm:px-2 sm:py-0.5 rounded-full shadow-md">
            {toBengaliDigits(discountPercent)}% ছাড়
          </span>
        )}
        {product.is_featured && (
          <span className="bg-emerald-950/90 text-amber-300 text-[7px] sm:text-[8px] md:text-[9px] font-bold px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-full shadow-md flex items-center border border-amber-400/30 backdrop-blur-xs">
            <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5 text-amber-300" /> রয়্যাল
          </span>
        )}
        {product.is_free_delivery && (
          <span className="bg-emerald-600 text-white text-[7px] sm:text-[8px] md:text-[9px] font-black px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-full shadow-md flex items-center animate-pulse">
            <Truck className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" /> ফ্রি
          </span>
        )}
      </div>

      {/* Stock Status Badge (Top Right) */}
      <div className="absolute top-1 right-1 sm:top-2.5 sm:right-2.5 z-10 pointer-events-none">
        {isOutOfStock ? (
          <span className="bg-rose-700 text-white text-[7px] sm:text-[8px] md:text-[9px] font-black px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-full shadow-md flex items-center">
            <XCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" /> শেষ
          </span>
        ) : isLowStock ? (
          <span className="bg-amber-600 text-white text-[7px] sm:text-[8px] md:text-[9px] font-bold px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-full shadow-md flex items-center animate-bounce">
            <AlertTriangle className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" /> মাত্র {toBengaliDigits(stockNum)}!
          </span>
        ) : (
          <span className="bg-emerald-900/90 text-emerald-200 text-[7px] sm:text-[8px] md:text-[9px] font-bold px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-full backdrop-blur-xs">
            ✓ স্টক
          </span>
        )}
      </div>

      {/* Product Image (Compact 80% Height) */}
      <div className="relative w-full pt-[80%] bg-gradient-to-br from-amber-50/40 to-slate-100 overflow-hidden">
        <img
          src={product.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${
            isOutOfStock ? 'grayscale-30 group-hover:scale-102' : 'group-hover:scale-108'
          }`}
          loading="lazy"
        />

        {/* Stock Out Overlay if zero stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-rose-600/95 text-white font-black text-[9px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">
              স্টক আউট
            </span>
          </div>
        )}

        {/* Quick View hint */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <span className="bg-white/95 text-slate-900 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md flex items-center space-x-1 backdrop-blur-xs transform translate-y-1 group-hover:translate-y-0 transition-transform">
              <Eye className="w-3 h-3 text-amber-600" /> বিবরণ
            </span>
          </div>
        )}
      </div>

      {/* Content (Compact padding & line-clamping for slim height) */}
      <div className="p-1.5 sm:p-2.5 md:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 mb-0.5 sm:mb-1">
            <div className="flex items-center text-amber-500">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
            </div>
            <span className="text-[8.5px] sm:text-[10px] md:text-[11px] font-bold text-slate-800">{toBengaliDigits(product.rating || 5.0)}</span>
            <span className="text-[7.5px] sm:text-[9px] md:text-[10px] text-slate-400">({toBengaliDigits(product.review_count || 24)})</span>
          </div>

          {/* Title */}
          <h3 className="text-[10px] sm:text-xs md:text-[13px] font-bold text-slate-800 line-clamp-2 group-hover:text-amber-700 transition-colors leading-tight min-h-[1.75rem] sm:min-h-[2.2rem]">
            {product.title}
          </h3>
        </div>

        {/* Pricing & Add Button */}
        <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-amber-100/70 flex items-center justify-between gap-1">
          <div className="min-w-0">
            <div className="flex items-baseline space-x-0.5 sm:space-x-1 flex-wrap">
              <span className="text-xs sm:text-sm md:text-base font-black text-slate-900">
                ৳{toBengaliDigits(price.toLocaleString())}
              </span>
              {hasDiscount && (
                <span className="text-[8.5px] sm:text-[10px] md:text-[11px] text-slate-400 line-through font-medium">
                  ৳{toBengaliDigits(regularPrice.toLocaleString())}
                </span>
              )}
            </div>
            {hasDiscount ? (
              <span className="text-[7.5px] sm:text-[8.5px] md:text-[9.5px] font-bold text-emerald-700 block truncate">সাশ্রয় ৳{toBengaliDigits(savings.toLocaleString())}</span>
            ) : product.is_free_delivery ? (
              <span className="text-[7.5px] sm:text-[8.5px] md:text-[9.5px] font-bold text-emerald-600 block truncate">৳০ ডেলিভারি</span>
            ) : (
              <span className="text-[7.5px] sm:text-[8.5px] md:text-[9.5px] font-semibold text-amber-700 block truncate">রাজকীয়</span>
            )}
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`p-1 sm:p-1.5 md:p-2 rounded-lg sm:rounded-xl transition-all duration-150 flex items-center justify-center flex-shrink-0 cursor-pointer ${
              added
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-amber-50 text-amber-800 hover:bg-gradient-to-r hover:from-amber-600 hover:to-amber-700 hover:text-white hover:shadow-md hover:shadow-amber-500/20 active:scale-95 border border-amber-200/90'
            }`}
            title={isOutOfStock ? 'স্টক শেষ' : added ? 'যুক্ত হয়েছে!' : 'ব্যাগে যোগ করুন'}
          >
            {added ? (
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            ) : isOutOfStock ? (
              <span className="text-[8px] font-bold px-0.5 text-slate-400">শেষ</span>
            ) : (
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
