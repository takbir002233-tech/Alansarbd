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
  ChevronRight,
  Flame,
  AlertTriangle,
  XCircle,
  Tag,
  HandHeart
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetails({ productId, onNavigate }) {
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
      <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded-xl w-3/4" />
            <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
            <div className="h-24 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <h2 className="text-2xl font-black text-slate-800">পণ্যটি খুঁজে পাওয়া যায়নি</h2>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-6 py-2.5 bg-amber-600 text-white font-bold rounded-xl cursor-pointer"
        >
          ক্যাটালগে ফিরে যান
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
    addToCart(product, quantity);
    onNavigate('checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in font-sans">
      
      {/* Universal Back Navigation Bar */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => onNavigate('catalog')}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-amber-800 transition-colors bg-white px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-700" />
          <span>← সুগন্ধি কালেকশনে ফিরে যান</span>
        </button>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          আইডি: {product.slug?.toUpperCase().slice(0, 14)}
        </span>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-amber-100 shadow-xl">
            <img
              src={images[activeImage] || product.thumbnail}
              alt={product.title}
              className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale-20' : ''}`}
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {hasDiscount && (
                <span className="bg-gradient-to-r from-amber-600 to-rose-600 text-white text-xs font-black px-3.5 py-1 rounded-full shadow-lg">
                  {toBengaliDigits(discountPercent)}% ছাড় • সাশ্রয় ৳{toBengaliDigits(savings.toLocaleString())}
                </span>
              )}
              {product.is_free_delivery && (
                <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center">
                  <Truck className="w-3.5 h-3.5 mr-1" /> ফ্রি ডেলিভারি
                </span>
              )}
            </div>

            {/* Stock Out Overlay if zero stock */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-rose-600 text-white font-black text-sm px-6 py-2.5 rounded-full shadow-2xl flex items-center">
                  <XCircle className="w-5 h-5 mr-2" /> সাময়িকভাবে স্টক শেষ
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-slate-100 cursor-pointer ${
                    activeImage === idx ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info & Purchasing Panel (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            {/* Rating & Reviews */}
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-current mr-1" />
                <span className="text-xs font-bold text-slate-800">{toBengaliDigits(product.rating || 5.0)}</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">({toBengaliDigits(product.review_count || 32)} জন ক্রেতার রিভিউ)</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Live Customer Stock Status Bar */}
          <div className="p-4 rounded-2xl border transition-all">
            {isOutOfStock ? (
              <div className="flex items-center space-x-3 bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-800">
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-black">স্টক শেষ</h4>
                  <p className="text-[11px] text-rose-600">পণ্যটি দ্রুত রিস্টক করা হবে।</p>
                </div>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center space-x-3 bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 animate-bounce" />
                <div>
                  <h4 className="text-xs font-black">🔥 সীমিত স্টক অ্যালার্ট: মাত্র {toBengaliDigits(stockNum)} টি পণ্য অবশিষ্ট আছে!</h4>
                  <p className="text-[11px] text-amber-700">দ্রুত অর্ডার সম্পন্ন করার পরামর্শ দেওয়া হচ্ছে।</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-black">✅ স্টকে রয়েছে ও দ্রুত কুরিয়ার ডেলিভারির জন্য প্রস্তুত</h4>
                  <p className="text-[11px] text-emerald-700">উত্তরা সেন্ট্রাল ওয়্যারহাউসে {toBengaliDigits(stockNum)} টি খাঁটি বোতল মজুদ আছে।</p>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Box */}
          <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-200/70 space-y-2">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-black text-slate-950">৳{toBengaliDigits(price.toLocaleString())}</span>
              {hasDiscount && (
                <span className="text-lg text-slate-400 line-through font-semibold">
                  ৳{toBengaliDigits(regularPrice.toLocaleString())}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-xs font-bold text-emerald-700">
                🎉 তাৎক্ষণিক ছাড় প্রযোজ্য: আপনি সাশ্রয় করছেন ৳{toBengaliDigits(savings.toLocaleString())} ({toBengaliDigits(discountPercent)}% ছাড়)
              </p>
            )}
            <p className="text-[11px] text-slate-500">
              {product.is_free_delivery ? '🚚 এই আইটেমে সারাদেশে সম্পূর্ণ ফ্রি হোম ডেলিভারি!' : 'সারাদেশে হোম ডেলিভারি ও স্টিভফাস্ট লাইভ ট্র্যাকিং।'}
            </p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">সুবাসের বিবরণ ও বৈশিষ্ট্য</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Perfume Specs & Notes Table */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full">
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <tr key={key} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-500 bg-slate-50/60 w-1/3">{key}</td>
                      <td className="p-3 font-semibold text-slate-800">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-700">পরিমাণ:</span>
              <div className="flex items-center border border-slate-300 rounded-xl bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock || quantity <= 1}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-l-xl font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-mono font-bold text-slate-900">
                  {isOutOfStock ? '০' : toBengaliDigits(quantity)}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(stockNum, quantity + 1))}
                  disabled={isOutOfStock || quantity >= stockNum}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-r-xl font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {isOutOfStock ? 'মজুদ নেই' : `সর্বোচ্চ ${toBengaliDigits(stockNum)} টি অর্ডারযোগ্য`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : added
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
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
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-300 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-xl shadow-amber-600/25'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isOutOfStock ? 'স্টক শেষ' : 'এখনই কিনুন (তাৎক্ষণিক চেকআউট)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-slate-200 space-y-6">
          <h3 className="text-xl font-black text-slate-900">আপনার আরও পছন্দ হতে পারে</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
