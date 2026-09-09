import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, Mail, Phone, MapPin, Sparkles, MessageCircle, HandHeart, FileText, ArrowLeft, Star, CreditCard, ShoppingBasket, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Footer({ onNavigate }) {
  const { siteSettings } = useCart();

  return (
    <footer className="bg-slate-950 text-slate-300 py-3 sm:py-4 border-t border-amber-950/60 selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* Top Value Propositions / 4 Trust Badges (Ultra-Compact) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-2.5 border-b border-slate-800/60">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
          
          {/* Trust 1 */}
          <div className="flex items-center space-x-2 py-1.5 px-2 rounded-lg bg-slate-900/40 border border-amber-900/15">
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 flex-shrink-0">
              <ShoppingBasket className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider truncate">
                {siteSettings?.trust_1_title || '১০০% খাঁটি ও ফ্রেশ পণ্য'}
              </h4>
              <p className="text-[9px] font-semibold text-slate-400 truncate">
                {siteSettings?.trust_1_desc || 'ঘরের বাজার, বেকারি ও আতর'}
              </p>
            </div>
          </div>

          {/* Trust 2 */}
          <div className="flex items-center space-x-2 py-1.5 px-2 rounded-lg bg-slate-900/40 border border-amber-900/15">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider truncate">
                {siteSettings?.trust_2_title || 'হালাল ও নির্ভেজাল মান'}
              </h4>
              <p className="text-[9px] font-semibold text-slate-400 truncate">
                {siteSettings?.trust_2_desc || 'শতভাগ খাঁটি প্রাকৃতিক উপাদান'}
              </p>
            </div>
          </div>

          {/* Trust 3 */}
          <div className="flex items-center space-x-2 py-1.5 px-2 rounded-lg bg-slate-900/40 border border-amber-900/15">
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 flex-shrink-0">
              <Truck className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider truncate">
                {siteSettings?.trust_3_title || 'দ্রুততম হোম ডেলিভারি'}
              </h4>
              <p className="text-[9px] font-semibold text-slate-400 truncate">
                {siteSettings?.trust_3_desc || 'সরাসরি লাইভ ট্র্যাকিং ডেলিভারি'}
              </p>
            </div>
          </div>

          {/* Trust 4 */}
          <div className="flex items-center space-x-2 py-1.5 px-2 rounded-lg bg-slate-900/40 border border-amber-900/15">
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 flex-shrink-0">
              <HandHeart className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider truncate">
                {siteSettings?.trust_4_title || 'করযে হাসানা সেবা'}
              </h4>
              <p className="text-[9px] font-semibold text-slate-400 truncate">
                {siteSettings?.trust_4_desc || 'বিনা সুদে ঋণ ও ১০% ধার'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links - Tight & Streamlined */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-5">
          
          {/* Company Info */}
          <div className="col-span-2 lg:col-span-2 space-y-1.5">
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onNavigate('home')}>
              <img 
                src={siteSettings?.logo_url || '/logo.jpg'} 
                alt="AL ANSAR SUPER SHOP" 
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-lg border border-amber-400/40 bg-white" 
              />
              <div>
                <span className="text-base sm:text-lg font-black tracking-tight text-white block leading-none">
                  {siteSettings?.store_name || 'AL ANSAR SUPER SHOP'}
                </span>
                <span className="text-[10px] font-bold text-amber-400">
                  {siteSettings?.store_name_bn || 'আল আনসার সুপার শপ'}
                </span>
              </div>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 leading-tight max-w-sm line-clamp-1">
              {siteSettings?.footer_about || 'ঘরের নিত্যপ্রয়োজনীয় বাজার, ফ্রেশ বেকারি সামগ্রী, খাঁটি আতর এবং উপহারের সুপার শপ।'}
            </p>
            <div className="space-y-0.5 text-[10px] font-semibold text-slate-400">
              <p className="flex items-center truncate"><MapPin className="w-3 h-3 mr-1 text-amber-400 flex-shrink-0" /> {siteSettings?.showroom_address || 'হাউজ #১৪, রোড #৭, সেক্টর ৩, উত্তরা, ঢাকা-১২৩০'}</p>
              <p className="flex items-center"><Phone className="w-3 h-3 mr-1 text-amber-400 flex-shrink-0" /> {siteSettings?.hotline_number || '+880 1711-000000'} | <Mail className="w-3 h-3 mx-1 text-amber-400 flex-shrink-0" /> {siteSettings?.support_email || 'support@alansar.com'}</p>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-1">
            <h4 className="text-[10px] sm:text-[11px] font-black text-amber-400 uppercase tracking-wider pb-0.5">ক্যাটাগরি</h4>
            <ul className="space-y-0.5 text-[10px] font-bold text-slate-400">
              <li><button onClick={() => onNavigate('catalog', { category: 'cat_grocery' })} className="hover:text-amber-300 transition-colors cursor-pointer">🛒 ঘরের বাজার</button></li>
              <li><button onClick={() => onNavigate('catalog', { category: 'cat_bakery' })} className="hover:text-amber-300 transition-colors cursor-pointer">🥐 বেকারি আইটেম</button></li>
              <li><button onClick={() => onNavigate('catalog', { category: 'cat_attar' })} className="hover:text-amber-300 transition-colors cursor-pointer">🌸 আতর ও সুগন্ধি</button></li>
              <li><button onClick={() => onNavigate('catalog', { category: 'cat_gifts' })} className="hover:text-amber-300 transition-colors cursor-pointer">🎁 গিফট সামগ্রী</button></li>
            </ul>
          </div>

          {/* Quick Links & Services */}
          <div className="space-y-1">
            <h4 className="text-[10px] sm:text-[11px] font-black text-amber-400 uppercase tracking-wider pb-0.5">সেবাসমূহ</h4>
            <ul className="space-y-0.5 text-[10px] font-bold text-slate-400">
              <li><button onClick={() => onNavigate('qard-hasana')} className="hover:text-emerald-400 transition-colors cursor-pointer font-bold text-emerald-300">🤝 করযে হাসানা (১০% ধার)</button></li>
              <li><button onClick={() => onNavigate('loyalty-card')} className="hover:text-amber-300 transition-colors cursor-pointer">💳 ভিআইপি কার্ড</button></li>
              <li><button onClick={() => onNavigate('reviews')} className="hover:text-amber-300 transition-colors cursor-pointer">⭐ কাস্টমার রিভিউ</button></li>
              <li><button onClick={() => onNavigate('track-order')} className="hover:text-amber-300 transition-colors cursor-pointer">🚚 অর্ডার ট্র্যাকিং</button></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="col-span-2 md:col-span-1 space-y-1">
            <h4 className="text-[10px] sm:text-[11px] font-black text-amber-400 uppercase tracking-wider pb-0.5">যোগাযোগ</h4>
            <div className="flex flex-row md:flex-col gap-1.5 pt-0.5">
              <button
                onClick={() => onNavigate('contact')}
                className="flex-1 py-1 px-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-[10px] rounded-md shadow-xs transition-all text-center cursor-pointer block truncate"
              >
                যোগাযোগ ফর্ম
              </button>
              <a
                href={`https://wa.me/${(siteSettings?.whatsapp_number || '01711223344').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1 px-2 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 font-black text-[10px] rounded-md border border-emerald-500/40 transition-all text-center cursor-pointer flex items-center justify-center space-x-1 truncate"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright - Ultra-Compact */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 mt-1.5 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[9px] sm:text-[10px] font-bold text-slate-500 gap-1">
        <p>{siteSettings?.footer_copyright || '© ২০২৬ AL ANSAR SUPER SHOP (আল আনসার সুপার শপ)। সর্বস্বত্ব সংরক্ষিত।'}</p>
        <p className="text-amber-400/80 font-mono">নিরাপদ ও বিশ্বস্ত ই-কমার্স অভিজ্ঞতা</p>
      </div>

    </footer>
  );
}
