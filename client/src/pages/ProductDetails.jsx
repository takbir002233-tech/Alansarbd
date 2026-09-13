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
import PageHadithBanner from '../components/PageHadithBanner';

export default function ProductDetails({ productId, onNavigate, onBack }) {
  const { addToCart, siteSettings } = useCart();
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
    <div className="w-full max-w-[1220px] mx-auto px-2 sm:px-4 py-2 space-y-3 animate-in fade-in font-sans">
      
      {/* Universal Back Navigation Bar - Compact */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200 flex-wrap sm:flex-nowrap">
        <button
          onClick={onBack || (() => onNavigate('catalog'))}
          className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-800" />
          <span>← পিছনে যান (Back)</span>
        </button>

        <PageHadithBanner 
          text={siteSettings?.hadith_product_details} 
          defaultText="🌸 হাদিস: সৎ ও বিশ্বস্ত ব্যবসায়ী কিয়ামতের দিন নবী, সত্যবাদী ও শহীদদের সাথে থাকবেন। (তিরমিজি)" 
          className="flex-1 max-w-lg mx-auto text-center"
        />

        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline flex-shrink-0 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
          আইডি: {product.slug?.toUpperCase().slice(0, 12)}
        </span>
      </div>

      {/* Main Product Showcase - 3-Column 1-Page Layout: Left (Photo), Middle (Specs & Details), Right (Price & Buy Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 xl:gap-5 items-start">
        
        {/* 1. LEFT COLUMN (4 cols): Product Photo & Gallery (Photo shifted left to fill space) */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-2">
          <div className="relative h-56 sm:h-64 lg:h-[285px] xl:h-[305px] w-full rounded-2xl overflow-hidden bg-slate-50 border border-amber-200 shadow-xs flex items-center justify-center p-2 group">
            <img
              src={images[activeImage] || product.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
              alt={product.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
              }}
              className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'grayscale-20' : ''}`}
            />

            {/* Badges Overlay */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {hasDiscount && (
                <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10.5px] font-black px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  <span>{toBengaliDigits(discountPercent)}% ছাড়</span>
                </span>
              )}
              {product.is_free_delivery && (
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center">
                  <Truck className="w-2.5 h-2.5 mr-1" /> ফ্রি ডেলিভারি
                </span>
              )}
            </div>

            {/* Stock Out Overlay if zero stock */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center z-20">
                <span className="bg-rose-600 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-xl flex items-center">
                  <XCircle className="w-3.5 h-3.5 mr-1" /> সাময়িকভাবে স্টক শেষ
                </span>
              </div>
            )}
          </div>

          {/* Compact Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white p-0.5 cursor-pointer ${
                    activeImage === idx ? 'border-amber-500 ring-2 ring-amber-400/40 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Trust Guarantees under photo */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-center">
            <div className="p-1.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 mx-auto text-amber-600 mb-0.5" />
              <span className="text-[10px] font-bold text-slate-700 block leading-tight">১০০% আসল</span>
            </div>
            <div className="p-1.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <Truck className="w-3.5 h-3.5 mx-auto text-emerald-600 mb-0.5" />
              <span className="text-[10px] font-bold text-slate-700 block leading-tight">দ্রুত ডেলিভারি</span>
            </div>
            <div className="p-1.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <RotateCcw className="w-3.5 h-3.5 mx-auto text-blue-600 mb-0.5" />
              <span className="text-[10px] font-bold text-slate-700 block leading-tight">সহজ রিটার্ন</span>
            </div>
          </div>
        </div>

        {/* 2. MIDDLE COLUMN (5 cols): Product Details, Highlights & Dynamic Specs ("kichu likha majhe deo") */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-2">
          <div>
            {/* Tag & Rating */}
            <div className="flex items-center space-x-2 mb-1 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                আল আনসার স্পেশাল
              </span>
              <div className="flex items-center text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                <Star className="w-3 h-3 fill-current mr-1 text-amber-500" />
                <span className="text-[11px] font-bold text-slate-800">{toBengaliDigits(product.rating || 5.0)}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">({toBengaliDigits(product.review_count || 32)} রিভিউ)</span>
            </div>

            {/* Product Title */}
            <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-900 leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Live Stock Status Badge */}
          <div className="inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-bold">
            {isOutOfStock ? (
              <div className="flex items-center space-x-1.5 text-rose-700">
                <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>স্টক শেষ - দ্রুত রিস্টক করা হবে</span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center space-x-1.5 text-amber-800 bg-amber-50 border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>🔥 মাত্র {toBengaliDigits(stockNum)} টি পণ্য স্টকে আছে!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>স্টকে রয়েছে ({toBengaliDigits(stockNum)} টি মজুদ)</span>
              </div>
            )}
          </div>

          {/* Description Snippet */}
          {product.description && (
            <div className="bg-slate-50/90 p-2 sm:p-2.5 rounded-xl border border-slate-200">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-0.5 flex items-center">
                <Tag className="w-3 h-3 mr-1 text-amber-600" /> বিবরণ ও বিশেষত্ব
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed max-h-16 overflow-y-auto pr-1">
                {product.description}
              </p>
            </div>
          )}

          {/* Dynamic Specs Table */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden text-[10.5px]">
              <div className="bg-slate-100/90 px-2.5 py-1 border-b border-slate-200 font-bold text-slate-700 text-[10.5px]">
                ⚙️ পণ্যের স্পেসিফিকেশন ও তথ্য
              </div>
              <table className="w-full">
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <tr key={key} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-1 px-2.5 font-bold text-slate-600 bg-slate-50/70 w-2/5">{key}</td>
                      <td className="py-1 px-2.5 font-semibold text-slate-800">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. RIGHT COLUMN (3 cols): Price, Savings, Quantity & Buy Actions ("dan dik eo likha deo, jeno 1 page ei sob hoy") */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-2">
          <div className="p-3 bg-gradient-to-b from-amber-50/90 via-white to-amber-50/50 rounded-2xl border-2 border-amber-300 shadow-sm space-y-2.5">
            
            {/* Price Box */}
            <div className="space-y-0.5 pb-2 border-b border-amber-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">মূল্য ও ছাড়</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl sm:text-2xl font-black text-slate-950 font-mono">
                  ৳{toBengaliDigits(price.toLocaleString())}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through font-semibold font-mono">
                    ৳{toBengaliDigits(regularPrice.toLocaleString())}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <div className="inline-flex items-center text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300">
                  🎉 সাশ্রয় ৳{toBengaliDigits(savings.toLocaleString())} ({toBengaliDigits(discountPercent)}% ছাড়)
                </div>
              )}
            </div>

            {/* Delivery Info */}
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center space-x-1.5 text-slate-700">
                <Truck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="font-semibold">
                  {product.is_free_delivery ? '🚚 সারাদেশে ফ্রি ডেলিভারি!' : '🚚 সারাদেশে দ্রুত হোম ডেলিভারি'}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-600 text-[10.5px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>ক্যাশ অন ডেলিভারি (হাতে পেয়ে টাকা দিন)</span>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="pt-2 border-t border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">পরিমাণ:</span>
                <div className="flex items-center border border-slate-300 rounded-lg bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock || quantity <= 1}
                    className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-l-lg font-bold cursor-pointer text-xs"
                  >
                    -
                  </button>
                  <span className="px-2.5 text-xs font-mono font-bold text-slate-900">
                    {isOutOfStock ? '০' : toBengaliDigits(quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(stockNum, quantity + 1))}
                    disabled={isOutOfStock || quantity >= stockNum}
                    className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 rounded-r-lg font-bold cursor-pointer text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md ${
                    isOutOfStock
                      ? 'bg-slate-300 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-amber-600/30'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? 'স্টক শেষ' : 'এখনই কিনুন (Buy Now)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer border ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300'
                      : added
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white hover:bg-amber-50 text-amber-950 border-amber-300 shadow-2xs'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>ব্যাগে যোগ হয়েছে!</span>
                    </>
                  ) : isOutOfStock ? (
                    <span>স্টক শেষ</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>ব্যাগে যোগ করুন (Add to Bag)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Extra assurance */}
            <div className="pt-2 border-t border-amber-200/80 text-[10px] text-slate-500 space-y-0.5">
              <div className="flex items-center space-x-1 text-slate-600">
                <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span>পার্সেল খুলে দেখে পেমেন্ট করার সুযোগ</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-600">
                <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span>সরাসরি অথেনটিক ইমপোর্টেড পণ্য</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <h3 className="text-sm font-black text-slate-800">আপনার আরও পছন্দ হতে পারে</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
