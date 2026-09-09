import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Share2, 
  Heart, 
  Check, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  ChevronRight,
  Flame,
  AlertTriangle,
  XCircle,
  Tag,
  HandHeart,
  X
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetails({ productId, onNavigate, onBack }) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Bengali digits converter helper
  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setRelatedProducts(data.related || []);
          setActiveImage(0);
          setQuantity(1);
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="h-80 bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded-xl w-3/4" />
            <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
            <div className="h-20 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4 font-sans">
        <h2 className="text-2xl font-black text-slate-800">পণ্যটি খুঁজে পাওয়া যায়নি</h2>
        <button
          onClick={onBack || (() => onNavigate('catalog'))}
          className="px-6 py-2.5 bg-amber-600 text-white font-bold rounded-xl cursor-pointer"
        >
          ← পিছনে যান (Back)
        </button>
      </div>
    );
  }

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

  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, null, false);
    onNavigate('checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-8 animate-in fade-in font-sans">
      
      {/* Universal Back Navigation Bar */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <button
          onClick={onBack || (() => onNavigate('catalog'))}
          className="inline-flex items-center space-x-2 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-amber-800" />
          <span>← পিছনে যান (Back)</span>
        </button>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          আইডি: {product.slug?.toUpperCase().slice(0, 14)}
        </span>
      </div>

      {/* Main Product Showcase - Compact Viewport Friendly */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Gallery (6 cols) - Compact Bounded Height to eliminate vertical scrolling */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative h-72 sm:h-80 md:h-96 w-full rounded-3xl overflow-hidden bg-slate-100 border border-amber-100 shadow-md flex items-center justify-center">
            <img
              src={images[activeImage] || product.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
              alt={product.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
              }}
              className={`w-full h-full object-contain p-2 ${isOutOfStock ? 'grayscale-20' : ''}`}
            />

            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {hasDiscount && (
                <span className="bg-gradient-to-r from-amber-600 to-rose-600 text-white text-[11px] font-black px-3 py-0.5 rounded-full shadow-md">
                  {toBengaliDigits(discountPercent)}% ছাড় • সাশ্রয় ৳{toBengaliDigits(savings.toLocaleString())}
                </span>
              )}
              {product.is_free_delivery && (
                <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center">
                  <Truck className="w-3 h-3 mr-1" /> ফ্রি ডেলিভারি
                </span>
              )}
            </div>

            {/* Stock Out Overlay if zero stock */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-rose-600 text-white font-black text-xs sm:text-sm px-5 py-2 rounded-full shadow-2xl flex items-center">
                  <XCircle className="w-4 h-4 mr-1.5" /> সাময়িকভাবে স্টক শেষ
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white p-1 cursor-pointer ${
                    activeImage === idx ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info & Purchasing Panel (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            {/* Rating & Reviews */}
            <div className="flex items-center space-x-2.5 mb-1.5">
              <div className="flex items-center text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-current mr-1" />
                <span className="text-xs font-bold text-slate-800">{toBengaliDigits(product.rating || 5.0)}</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">({toBengaliDigits(product.review_count || 32)} জন ক্রেতার রিভিউ)</span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Pricing Box - Compact */}
          <div className="p-3.5 sm:p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-1">
            <div className="flex items-baseline space-x-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
                ৳{toBengaliDigits(price.toLocaleString())}
              </span>
              {hasDiscount && (
                <span className="text-base text-slate-400 line-through font-semibold font-mono">
                  ৳{toBengaliDigits(regularPrice.toLocaleString())}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-[11px] font-bold text-emerald-700">
                🎉 তাৎক্ষণিক ছাড় প্রযোজ্য: আপনি সাশ্রয় করছেন ৳{toBengaliDigits(savings.toLocaleString())} ({toBengaliDigits(discountPercent)}% ছাড়)
              </p>
            )}
            <p className="text-[10px] text-slate-500">
              {product.is_free_delivery ? '🚚 এই আইটেমে সারাদেশে সম্পূর্ণ ফ্রি হোম ডেলিভারি!' : 'সারাদেশে হোম ডেলিভারি ও স্টিডফাস্ট লাইভ ট্র্যাকিং।'}
            </p>
          </div>

          {/* Live Stock Status */}
          <div className="p-2.5 rounded-xl border">
            {isOutOfStock ? (
              <div className="flex items-center space-x-2 text-rose-700 text-xs">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-bold">স্টক শেষ - দ্রুত রিস্টক করা হবে।</span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center space-x-2 text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="font-bold">🔥 মাত্র {toBengaliDigits(stockNum)} টি পণ্য স্টকে অবশিষ্ট আছে!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-emerald-800 text-xs">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-bold">স্টকে রয়েছে ও দ্রুত ডেলিভারির জন্য প্রস্তুত ({toBengaliDigits(stockNum)} টি)।</span>
              </div>
            )}
          </div>

          {/* Description - Compact with clean scroll or wrap */}
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">সুবাসের বিবরণ ও বৈশিষ্ট্য</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line max-h-24 overflow-y-auto pr-1">
              {product.description}
            </p>
          </div>

          {/* Perfume Specs & Notes Table */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full">
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <tr key={key} className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-slate-500 bg-slate-50/60 w-1/3 text-[11px]">{key}</td>
                      <td className="p-2 font-semibold text-slate-800 text-[11px]">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quantity & CTA Buttons - In Viewport */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-700">পরিমাণ:</span>
              <div className="flex items-center border border-slate-300 rounded-xl bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock || quantity <= 1}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-l-xl font-bold cursor-pointer text-xs"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-mono font-bold text-slate-900">
                  {isOutOfStock ? '০' : toBengaliDigits(quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(stockNum, quantity + 1))}
                  disabled={isOutOfStock || quantity >= stockNum}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-r-xl font-bold cursor-pointer text-xs"
                >
                  +
                </button>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {isOutOfStock ? 'মজুদ নেই' : `সর্বোচ্চ ${toBengaliDigits(stockNum)} টি অর্ডারযোগ্য`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : added
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ব্যাগে যোগ হয়েছে!</span>
                  </>
                ) : isOutOfStock ? (
                  <span>স্টক শেষ</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>শপিং ব্যাগে যোগ করুন</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-300 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-lg shadow-amber-600/25'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isOutOfStock ? 'স্টক শেষ' : 'এখনই কিনুন (তাৎক্ষণিক অর্ডার)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-4">
          <h3 className="text-lg font-black text-slate-900">আপনার আরও পছন্দ হতে পারে</h3>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-3 md:gap-4">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
