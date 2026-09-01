import React from 'react';
import { Star, ShoppingBag, Eye, Check, Sparkles, Truck, AlertTriangle, XCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onNavigate }) {
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

  const handleCardClick = () => {
    onNavigate('product-details', { productId: product.id });
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
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {hasDiscount && (
          <span className="bg-gradient-to-r from-amber-600 to-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md">
            {toBengaliDigits(discountPercent)}% ছাড়
          </span>
        )}
        {product.is_featured && (
          <span className="bg-emerald-950/90 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center border border-amber-400/30 backdrop-blur-xs">
            <Sparkles className="w-3 h-3 mr-1 text-amber-300" /> রয়্যাল চয়েস
          </span>
        )}
        {product.is_free_delivery && (
          <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center animate-pulse">
            <Truck className="w-3 h-3 mr-1" /> ফ্রি ডেলিভারি
          </span>
        )}
      </div>

      {/* Stock Status Badge (Top Right) */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none">
        {isOutOfStock ? (
          <span className="bg-rose-700 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center">
            <XCircle className="w-3 h-3 mr-1" /> স্টক শেষ
          </span>
        ) : isLowStock ? (
          <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center animate-bounce">
            <AlertTriangle className="w-3 h-3 mr-1" /> মাত্র {toBengaliDigits(stockNum)} টি বাকি!
          </span>
        ) : (
          <span className="bg-emerald-900/90 text-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
            ✓ স্টকে আছে ({toBengaliDigits(stockNum)})
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="relative w-full pt-[90%] bg-gradient-to-br from-amber-50/50 to-slate-100 overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.title}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
            isOutOfStock ? 'grayscale-30 group-hover:scale-102' : 'group-hover:scale-108'
          }`}
          loading="lazy"
        />

        {/* Stock Out Overlay if zero stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-rose-600/95 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg">
              স্টক আউট (অর্ডারের অপেক্ষায়)
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
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-slate-800">{toBengaliDigits(product.rating || 5.0)}</span>
            <span className="text-[11px] text-slate-400">({toBengaliDigits(product.review_count || 24)} রিভিউ)</span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-amber-700 transition-colors leading-snug">
            {product.title}
          </h3>
        </div>

        {/* Pricing & Add Button */}
        <div className="mt-4 pt-3 border-t border-amber-100/60 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-base sm:text-lg font-black text-slate-900">
                ৳{toBengaliDigits(price.toLocaleString())}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  ৳{toBengaliDigits(regularPrice.toLocaleString())}
                </span>
              )}
            </div>
            {hasDiscount ? (
              <span className="text-[10px] font-bold text-emerald-700">সাশ্রয় ৳{toBengaliDigits(savings.toLocaleString())}</span>
            ) : product.is_free_delivery ? (
              <span className="text-[10px] font-bold text-emerald-600">৳০ ডেলিভারি চার্জ</span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-700">রাজকীয় উপহার বক্স</span>
            )}
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-2xl transition-all duration-200 flex items-center justify-center cursor-pointer ${
              added
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-amber-50 text-amber-800 hover:bg-gradient-to-r hover:from-amber-600 hover:to-amber-700 hover:text-white hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 border border-amber-200/80'
            }`}
            title={isOutOfStock ? 'স্টক শেষ' : added ? 'যুক্ত হয়েছে!' : 'ব্যাগে যোগ করুন'}
          >
            {added ? (
              <Check className="w-4 h-4" />
            ) : isOutOfStock ? (
              <span className="text-[10px] font-bold px-1 text-slate-400">স্টক শেষ</span>
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
