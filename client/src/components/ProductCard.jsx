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
      className={`group bg-white rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative transform hover:-translate-y-1 font-sans ${
        isOutOfStock 
          ? 'border-slate-200 opacity-80 hover:border-slate-400' 
          : 'border-amber-100/80 hover:border-amber-400 shadow-2xs hover:shadow-2xl hover:shadow-amber-500/15'
      }`}
    >
      {/* Auto Calculated Discount Badge & Featured Tag */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 pointer-events-none">
        {hasDiscount && (
          <span className="bg-gradient-to-r from-amber-600 to-rose-600 text-white text-[9px] sm:text-[11px] font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md">
            {toBengaliDigits(discountPercent)}% ছাড়
          </span>
        )}
        {product.is_featured && (
          <span className="bg-emerald-950/90 text-amber-300 text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center border border-amber-400/30 backdrop-blur-xs">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-amber-300" /> রয়্যাল চয়েস
          </span>
        )}
        {product.is_free_delivery && (
          <span className="bg-emerald-600 text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center animate-pulse">
            <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" /> ফ্রি ডেলিভারি
          </span>
        )}
      </div>

      {/* Stock Status Badge (Top Right) */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 pointer-events-none">
        {isOutOfStock ? (
          <span className="bg-rose-700 text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-md flex items-center">
            <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" /> স্টক শেষ
          </span>
        ) : isLowStock ? (
          <span className="bg-amber-600 text-white text-[8px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-md flex items-center animate-bounce">
            <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" /> মাত্র {toBengaliDigits(stockNum)} টি!
          </span>
        ) : (
          <span className="bg-emerald-900/90 text-emerald-200 text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
            ✓ স্টকে আছে ({toBengaliDigits(stockNum)})
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="relative w-full pt-[90%] bg-gradient-to-br from-amber-50/50 to-slate-100 overflow-hidden">
        <img
          src={product.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
            isOutOfStock ? 'grayscale-30 group-hover:scale-102' : 'group-hover:scale-108'
          }`}
          loading="lazy"
        />

        {/* Stock Out Overlay if zero stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-rose-600/95 text-white font-black text-[10px] sm:text-xs px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-lg">
              স্টক আউট
            </span>
          </div>
        )}

        {/* Quick View hint */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-white/95 text-slate-900 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <Eye className="w-3.5 h-3.5 text-amber-600" /> সুবাসের বিবরণ দেখুন
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-1.5 sm:mb-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800">{toBengaliDigits(product.rating || 5.0)}</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400">({toBengaliDigits(product.review_count || 24)})</span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-amber-700 transition-colors leading-snug">
            {product.title}
          </h3>
        </div>

        {/* Pricing & Add Button */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-amber-100/60 flex items-center justify-between gap-1">
          <div className="min-w-0">
            <div className="flex items-baseline space-x-1.5 flex-wrap">
              <span className="text-sm sm:text-lg font-black text-slate-900">
                ৳{toBengaliDigits(price.toLocaleString())}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through font-medium">
                  ৳{toBengaliDigits(regularPrice.toLocaleString())}
                </span>
              )}
            </div>
            {hasDiscount ? (
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 block truncate">সাশ্রয় ৳{toBengaliDigits(savings.toLocaleString())}</span>
            ) : product.is_free_delivery ? (
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 block truncate">৳০ ডেলিভারি</span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-semibold text-amber-700 block truncate">রাজকীয় কালেকশন</span>
            )}
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-200 flex items-center justify-center flex-shrink-0 cursor-pointer ${
              added
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-amber-50 text-amber-800 hover:bg-gradient-to-r hover:from-amber-600 hover:to-amber-700 hover:text-white hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 border border-amber-200/80'
            }`}
            title={isOutOfStock ? 'স্টক শেষ' : added ? 'যুক্ত হয়েছে!' : 'ব্যাগে যোগ করুন'}
          >
            {added ? (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : isOutOfStock ? (
              <span className="text-[9px] font-bold px-1 text-slate-400">শেষ</span>
            ) : (
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
