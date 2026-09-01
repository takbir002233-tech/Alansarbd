import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, Mail, Phone, MapPin, Sparkles, MessageCircle, HandHeart, FileText, ArrowLeft } from 'lucide-react';
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
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {siteSettings?.trust_1_title || '১০০% খাঁটি সুগন্ধি'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {siteSettings?.trust_1_desc || 'ফ্রেঞ্চ ও ওরিয়েন্টাল খাঁটি এসেন্সিয়াল অয়েল'}
              </p>
            </div>
          </div>

          {/* Trust 2 */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-900/60 border border-amber-900/20 hover:border-emerald-500/40 transition-colors">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {siteSettings?.trust_2_title || 'অ্যালকোহলমুক্ত আতর'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {siteSettings?.trust_2_desc || '১০০% খাঁটি প্রাকৃতিক আতর ও উদ তেল'}
              </p>
            </div>
          </div>

          {/* Trust 3 */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-900/60 border border-amber-900/20 hover:border-blue-500/40 transition-colors">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {siteSettings?.trust_3_title || 'দ্রুত কুরিয়ার ডেলিভারি'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {siteSettings?.trust_3_desc || 'স্টিভফাস্ট / রেডএক্স লাইভ ট্র্যাকিং'}
              </p>
            </div>
          </div>

          {/* Trust 4 */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-900/60 border border-amber-900/20 hover:border-purple-500/40 transition-colors">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 flex-shrink-0">
              <HandHeart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {siteSettings?.trust_4_title || 'করযে হাসানা সেবা'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
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
                alt="AL ANSAR" 
                className="h-14 w-14 object-contain rounded-2xl border-2 border-amber-400/50 bg-white" 
              />
              <div>
                <span className="text-2xl font-black tracking-tight text-white block">
                  AL ANSAR
                </span>
                <span className="text-xs font-bold text-amber-400">আল আনসার</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {siteSettings?.footer_about || siteSettings?.store_tagline || 'বাংলাদেশে ফ্রেঞ্চ পারফিউম, অ্যালকোহলমুক্ত খাঁটি আতর, আসল কম্বোডিয়ান উদ এবং রাজকীয় গিফট বক্সের বিশ্বস্ত প্রিমিয়াম প্রতিষ্ঠান।'}
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-amber-400 flex-shrink-0" /> {siteSettings?.showroom_address || siteSettings?.store_address || 'আল আনসার প্লাজা, উত্তরা, ঢাকা-১২৩০'}</p>
              <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-emerald-400 flex-shrink-0" /> হটলাইন: {siteSettings?.store_phone || '+880 1711-223344'}</p>
              <p className="flex items-center"><MessageCircle className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" /> হোয়াটসঅ্যাপ: {siteSettings?.whatsapp_number || '+880 1711-223344'}</p>
              <p className="flex items-center"><Mail className="w-4 h-4 mr-2 text-amber-400 flex-shrink-0" /> ইমেইল: {siteSettings?.store_email || 'info@alansarfragrance.com'}</p>
            </div>
          </div>

          {/* Quick Collections */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 tracking-wider uppercase mb-4">সুগন্ধি কালেকশন</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => onNavigate('catalog', { category: 'cat_perfumes' })} className="hover:text-white transition-colors cursor-pointer">ফ্রেঞ্চ পারফিউম</button></li>
              <li><button onClick={() => onNavigate('catalog', { category: 'cat_attar' })} className="hover:text-white transition-colors cursor-pointer">খাঁটি আতর ও উদ</button></li>
              <li><button onClick={() => onNavigate('catalog', { category: 'cat_gift_boxes' })} className="hover:text-white transition-colors cursor-pointer">লাক্সারি গিফট বক্স</button></li>
              <li><button onClick={() => onNavigate('catalog', { category: 'cat_combos' })} className="hover:text-white transition-colors cursor-pointer">এক্সক্লুসিভ কম্বো প্যাক</button></li>
              <li><button onClick={() => onNavigate('catalog', { freeDelivery: true })} className="hover:text-emerald-400 font-bold transition-colors cursor-pointer">🚚 ফ্রি ডেলিভারি আইটেম</button></li>
            </ul>
          </div>

          {/* Islamic Services & Customer Care */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 tracking-wider uppercase mb-4">ইসলামিক সেবা ও সহায়তা</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => onNavigate('qard-hasana')} className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors flex items-center cursor-pointer"><HandHeart className="w-3.5 h-3.5 mr-1" /> করযে হাসানা (০% সুদ)</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors flex items-center cursor-pointer"><FileText className="w-3.5 h-3.5 mr-1" /> শর্তাবলী ও নীতিমালা</button></li>
              <li><button onClick={() => onNavigate('track-order')} className="hover:text-white transition-colors cursor-pointer">লাইভ কুরিয়ার ট্র্যাকিং</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors cursor-pointer">গ্রাহক সেবা ও যোগাযোগ</button></li>
              <li><button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors cursor-pointer">লয়ালটি ক্রেডিট কার্ড ও প্রোফাইল</button></li>
            </ul>
          </div>

          {/* Supported Payments & Qard */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 tracking-wider uppercase mb-4">পেমেন্ট ও ক্রেডিট মাধ্যম</h4>
            <p className="text-xs text-slate-400 mb-3">বিকাশ, নগদ, রকেট, ক্যাশ অন ডেলিভারি অথবা করযে হাসানায় পরিশোধ করুন:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-pink-950/60 border border-pink-700/40 rounded-lg p-2 text-center text-xs font-bold text-pink-400">
                বিকাশ ম্যানুয়াল
              </div>
              <div className="bg-amber-950/60 border border-amber-700/40 rounded-lg p-2 text-center text-xs font-bold text-amber-400">
                নগদ ম্যানুয়াল
              </div>
              <div className="bg-emerald-950/60 border border-emerald-700/40 rounded-lg p-2 text-center text-xs font-bold text-emerald-400">
                ক্যাশ অন ডেলিভারি
              </div>
              <div className="bg-emerald-900/60 border border-emerald-500/40 rounded-lg p-2 text-center text-xs font-bold text-emerald-300">
                করযে হাসানা (বাকি)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>{siteSettings?.footer_copyright || '© ২০২৬ AL ANSAR (আল আনসার) সুগন্ধি ও লাক্সারি গিফট বাংলাদেশ। সর্বস্বত্ব সংরক্ষিত।'}</p>
        <p className="mt-2 sm:mt-0 font-medium text-amber-400/80">
          {siteSettings?.footer_tagline || 'বিশুদ্ধ সুবাস • রাজকীয় কারুকার্য • সুদমুক্ত সেবা'}
        </p>
      </div>
    </footer>
  );
}
