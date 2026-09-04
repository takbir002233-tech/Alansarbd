import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, Mail, Phone, MapPin, Sparkles, MessageCircle, HandHeart, FileText, ArrowLeft, Star, CreditCard, ShoppingBasket, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Footer({ onNavigate }) {
  const { siteSettings } = useCart();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-amber-950/60 selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* Top Value Propositions / 4 Trust Badges (Dynamic CMS from Admin) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Trust 1 */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-900/60 border border-amber-900/20 hover:border-amber-500/40 transition-colors">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
              <ShoppingBasket className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                {siteSettings?.trust_1_title || '১০০% খাঁটি ও ফ্রেশ পণ্য'}
              </h4>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                {siteSettings?.trust_1_desc || 'ঘরের বাজার, বেকারি ও প্রিমিয়াম সামগ্রী'}
              </p>
            </div>
          </div>

          {/* Trust 2 */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-900/60 border border-amber-900/20 hover:border-emerald-500/40 transition-colors">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                {siteSettings?.trust_2_title || 'হালাল ও নির্ভেজাল মান'}
              </h4>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                {siteSettings?.trust_2_desc || 'শতভাগ খাঁটি প্রাকৃতিক আতর ও খাবার'}
              </p>
            </div>
          </div>

          {/* Trust 3 */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-900/60 border border-amber-900/20 hover:border-blue-500/40 transition-colors">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 flex-shrink-0">
              <Truck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                {siteSettings?.trust_3_title || 'দ্রুততম হোম ডেলিভারি'}
              </h4>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                {siteSettings?.trust_3_desc || 'ঢাকা ও সারাদেশে লাইভ ট্র্যাকিং ডেলিভারি'}
              </p>
            </div>
          </div>

          {/* Trust 4 */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-900/60 border border-amber-900/20 hover:border-purple-500/40 transition-colors">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 flex-shrink-0">
              <HandHeart className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                {siteSettings?.trust_4_title || 'করযে হাসানা সেবা'}
              </h4>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                {siteSettings?.trust_4_desc || 'বিনা সুদে ঋণ ও ১০% তাৎক্ষণিক ধার'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => onNavigate('home')}>
              <img 
                src={siteSettings?.logo_url || '/logo.jpg'} 
                alt="AL ANSAR SUPER SHOP" 
                className="h-14 w-14 object-contain rounded-2xl border-2 border-amber-400/50 bg-white" 
              />
              <div>
                <span className="text-2xl font-black tracking-tight text-white block">
                  {siteSettings?.store_name || 'AL ANSAR SUPER SHOP'}
                </span>
                <span className="text-xs font-bold text-amber-400">
                  {siteSettings?.store_name_bn || 'আল আনসার সুপার শপ'}
                </span>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 leading-relaxed max-w-sm">
              {siteSettings?.footer_about || 'ঘরের নিত্যপ্রয়োজনীয় বাজার, ফ্রেশ বেকারি সামগ্রী, খাঁটি আতর এবং প্রিয়জনের জন্য রাজকীয় উপহারের নির্ভরযোগ্য প্রিমিয়াম সুপার শপ।'}
            </p>
            <div className="space-y-2 text-xs font-semibold text-slate-400 pt-2">
              <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-amber-400 flex-shrink-0" /> {siteSettings?.showroom_address || 'হাউজ #১৪, রোড #৭, সেক্টর ৩, উত্তরা, ঢাকা-১২৩০'}</p>
              <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-amber-400 flex-shrink-0" /> {siteSettings?.hotline_number || '+880 1711-000000'} (সকাল ৯টা - রাত ১১টা)</p>
              <p className="flex items-center"><Mail className="w-4 h-4 mr-2 text-amber-400 flex-shrink-0" /> {siteSettings?.support_email || 'support@alansar.com'}</p>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">ক্যাটাগরি সমূহ</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li><button onClick={() => onNavigate('catalog', { category: 'cat_grocery' })} className="hover:text-amber-300 transition-colors cursor-pointer">🛒 ঘরের বাজার</button></li>
              <li><button onClick={() => onNavigate('catalog', { category: 'cat_bakery' })} className="hover:text-amber-300 transition-colors cursor-pointer">🥐 তাজা বেকারি আইটেম</button></li>
              <li><button onClick={() => onNavigate('catalog', { category: 'cat_attar' })} className="hover:text-amber-300 transition-colors cursor-pointer">🌸 আতর ও সুগন্ধি</button></li>
              <li><button onClick={() => onNavigate('catalog', { category: 'cat_gifts' })} className="hover:text-amber-300 transition-colors cursor-pointer">🎁 গিফট সামগ্রী</button></li>
              <li><button onClick={() => onNavigate('catalog')} className="hover:text-amber-300 transition-colors cursor-pointer">📦 সব কালেকশন</button></li>
            </ul>
          </div>

          {/* Quick Links & Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">বিশেষ সেবাসমূহ</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li><button onClick={() => onNavigate('qard-hasana')} className="hover:text-emerald-400 transition-colors cursor-pointer font-bold text-emerald-300">🤝 করযে হাসানা (১০% ধার)</button></li>
              <li><button onClick={() => onNavigate('dashboard', { tab: 'overview' })} className="hover:text-amber-300 transition-colors cursor-pointer">💳 ভিআইপি লয়ালটি কার্ড</button></li>
              <li><button onClick={() => onNavigate('reviews')} className="hover:text-amber-300 transition-colors cursor-pointer">⭐ কাস্টমার রিভিউ ও রেটিং</button></li>
              <li><button onClick={() => onNavigate('track-order')} className="hover:text-amber-300 transition-colors cursor-pointer">🚚 লাইভ অর্ডার ট্র্যাকিং</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-amber-300 transition-colors cursor-pointer">📜 শর্তাবলী ও নীতিমালা</button></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">যোগাযোগ (Contact Us)</h4>
            <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">
              সরাসরি সহায়তা ও দ্রুত অর্ডারের জন্য আমাদের কাস্টমার কেয়ারে যোগাযোগ করুন।
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => onNavigate('contact')}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all text-center cursor-pointer block"
              >
                যোগাযোগ ফর্ম (Contact Us)
              </button>
              <a
                href={`https://wa.me/${(siteSettings?.whatsapp_number || '01711223344').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 font-black text-xs rounded-xl border border-emerald-500/40 transition-all text-center cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp চ্যাট</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] font-bold text-slate-500 gap-4">
        <p>{siteSettings?.footer_copyright || '© ২০২৬ AL ANSAR SUPER SHOP (আল আনসার সুপার শপ)। সর্বস্বত্ব সংরক্ষিত।'}</p>
        <p className="text-amber-400/80 font-mono">নিরাপদ ও বিশ্বস্ত ই-কমার্স অভিজ্ঞতা</p>
      </div>

    </footer>
  );
}
