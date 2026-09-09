import React, { useState } from 'react';
import { Phone, Globe, MapPin, Sparkles, Award, ShieldCheck, RotateCw } from 'lucide-react';
import Barcode from './Barcode';

/**
 * Luxury Loyalty Card Component
 * Faithfully implements the luxury vertical card layout from media_1788885683566.jpg
 * using the website's brand colors (Deep Emerald, Obsidian Slate & Metallic Gold).
 */
export default function LuxuryLoyaltyCard({ user, onFlip }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Bengali digits converter helper
  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  const memberName = user?.name ? user.name.toUpperCase() : 'VALUED VIP MEMBER';
  const memberPhone = user?.phone || '01700-000000';
  const cardNumber = user?.loyalty_card_number || 'ANSAR-VIP-7861-2026';
  const points = user?.loyalty_points !== undefined ? user.loyalty_points : 150;
  const qardLimit = user?.qard_credit_limit || 5000;

  return (
    <div className="flex flex-col items-center space-y-3 font-sans">
      
      {/* 3D Flip Container (Compact dimensions to fit viewport without scrolling) */}
      <div 
        className="relative w-[260px] sm:w-[280px] h-[390px] sm:h-[420px] transition-all duration-700 [perspective:1200px] cursor-pointer group select-none"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d] shadow-2xl rounded-[24px] ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          
          {/* ==================== CARD FRONT (Matches Right Card of Photo) ==================== */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[24px] overflow-hidden border-2 border-amber-400/70 shadow-2xl bg-gradient-to-b from-emerald-950 via-[#04241a] to-slate-950 text-white flex flex-col justify-between p-4 sm:p-5">
            
            {/* Top-Left Luxury Gold Corner Ribbon / Wave (SVG Arc) */}
            <svg 
              className="absolute -top-1 -left-1 w-24 h-24 pointer-events-none drop-shadow-md z-0" 
              viewBox="0 0 100 100" 
              fill="none"
            >
              <path 
                d="M 0 0 L 75 0 C 70 30, 30 70, 0 75 Z" 
                fill="url(#goldGradient1)" 
              />
              <path 
                d="M 0 0 L 88 0 C 80 40, 40 80, 0 88 Z" 
                stroke="url(#goldGradient2)" 
                strokeWidth="1.5" 
                fill="none" 
              />
              <defs>
                <linearGradient id="goldGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="40%" stopColor="#d97706" />
                  <stop offset="80%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#fef08a" />
                </linearGradient>
                <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>

            {/* Bottom-Right Luxury Gold Corner Ribbon / Wave (SVG Arc) */}
            <svg 
              className="absolute -bottom-1 -right-1 w-28 h-28 pointer-events-none drop-shadow-md z-0" 
              viewBox="0 0 120 120" 
              fill="none"
            >
              <path 
                d="M 120 120 L 120 40 C 90 60, 60 90, 40 120 Z" 
                fill="url(#goldGradient3)" 
              />
              <path 
                d="M 120 120 L 120 25 C 80 50, 50 80, 25 120 Z" 
                stroke="url(#goldGradient1)" 
                strokeWidth="2" 
                fill="none" 
              />
              <defs>
                <linearGradient id="goldGradient3" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="35%" stopColor="#f59e0b" />
                  <stop offset="75%" stopColor="#92400e" />
                  <stop offset="100%" stopColor="#fef08a" />
                </linearGradient>
              </defs>
            </svg>

            {/* Subtly embossed decorative rings in background */}
            <div className="absolute top-1/2 -right-16 w-48 h-48 rounded-full border border-amber-500/10 pointer-events-none" />
            <div className="absolute top-1/2 -right-24 w-64 h-64 rounded-full border border-amber-500/10 pointer-events-none" />

            {/* FRONT TOP: Emblem & Website Name */}
            <div className="relative z-10 flex flex-col items-center pt-1">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-300 to-amber-500 p-[2px] shadow-md shadow-amber-500/20">
                  <div className="w-full h-full rounded-full bg-emerald-950 flex items-center justify-center overflow-hidden border border-amber-400/40">
                    <img 
                      src="/logo.jpg" 
                      alt="AL ANSAR" 
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[8px] font-black shadow-xs">
                  ★
                </div>
              </div>

              {/* Website Name & Tag */}
              <h2 className="text-xs font-black tracking-[0.15em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 mt-1.5 text-center drop-shadow-xs">
                AL ANSAR SUPER SHOP
              </h2>
              <span className="text-[8px] font-bold tracking-widest text-emerald-300 uppercase mt-0.2">
                ISLAMIC PRIVILEGE CLUB
              </span>
            </div>

            {/* FRONT MIDDLE: Member Name & Position */}
            <div className="relative z-10 my-auto text-center space-y-0.5 py-1">
              <span className="text-[7px] tracking-[0.2em] text-amber-300/80 uppercase font-black block">
                VIP CARD HOLDER
              </span>
              <h3 className="text-sm sm:text-base font-black tracking-wide text-white uppercase drop-shadow-md px-1 truncate">
                {memberName}
              </h3>
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-[9px] font-black text-amber-300">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                <span>{user?.loyalty_tier || 'ROYAL GOLD MEMBER'}</span>
              </div>
            </div>

            {/* FRONT INFO: 3 Golden Pill Badges (Phone, Web, Address matching photo) */}
            <div className="relative z-10 space-y-1.5 py-0.5">
              {/* Phone Pill */}
              <div className="flex items-center space-x-2 bg-white/10 hover:bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-amber-400/30 transition-all">
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Phone className="w-2.5 h-2.5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-200 truncate tracking-wide">
                  {memberPhone}
                </span>
              </div>

              {/* Web Pill */}
              <div className="flex items-center space-x-2 bg-white/10 hover:bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-amber-400/30 transition-all">
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Globe className="w-2.5 h-2.5" />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-200 truncate tracking-wide">
                  alansarbd.com
                </span>
              </div>

              {/* Address Pill */}
              <div className="flex items-center space-x-2 bg-white/10 hover:bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-amber-400/30 transition-all">
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <MapPin className="w-2.5 h-2.5" />
                </div>
                <span className="text-[9px] font-medium text-slate-200 truncate">
                  {user?.address || 'উত্তরা ও ঢাকা, বাংলাদেশ'}
                </span>
              </div>
            </div>

            {/* FRONT BOTTOM: Auto-Generated Barcode & Security Chip */}
            <div className="relative z-10 pt-1.5 border-t border-amber-500/30">
              <div className="bg-white/95 rounded-xl p-1.5 shadow-inner border border-amber-400/60">
                <Barcode 
                  value={cardNumber} 
                  barColor="#0f172a" 
                  textColor="text-slate-900" 
                  height={24} 
                />
              </div>

              {/* Balances bar under barcode */}
              <div className="flex items-center justify-between text-[9px] pt-1.5 px-0.5 text-slate-300 font-medium">
                <div>
                  <span className="text-slate-400 block text-[7px] uppercase">পয়েন্ট ব্যালেন্স</span>
                  <span className="font-bold text-amber-300">{toBengaliDigits(points)} Pts</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[7px] uppercase">করযে হাসানা লিমিট</span>
                  <span className="font-bold text-emerald-400">৳{toBengaliDigits(qardLimit.toLocaleString())}</span>
                </div>
              </div>
            </div>

          </div>

          {/* ==================== CARD BACK (Matches Left Card of Photo) ==================== */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[24px] overflow-hidden border-2 border-amber-400/70 shadow-2xl bg-gradient-to-b from-emerald-950 via-[#032117] to-slate-950 text-white flex flex-col justify-between p-4 sm:p-5">
            
            {/* Concentric Golden Waves / Rings (Identical to Left Card in Reference Photo) */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-0" 
              viewBox="0 0 300 500" 
              fill="none"
            >
              {/* Outer Golden Wave Bands */}
              <circle cx="90" cy="270" r="230" stroke="url(#goldGradBack1)" strokeWidth="32" opacity="0.85" />
              <circle cx="90" cy="270" r="160" stroke="url(#goldGradBack1)" strokeWidth="28" opacity="0.85" />
              <circle cx="90" cy="270" r="95" stroke="url(#goldGradBack1)" strokeWidth="22" opacity="0.85" />
              
              <defs>
                <linearGradient id="goldGradBack1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="80%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#fef08a" />
                </linearGradient>
              </defs>
            </svg>

            {/* Magnetic Stripe at Top */}
            <div className="relative z-10 w-full -mx-4 sm:-mx-5 -mt-4 sm:-mt-5">
              <div className="h-7 bg-slate-950 border-b border-amber-500/30 shadow-inner" />
            </div>

            {/* Centered Golden Logo Box (Matches Photo's Centered Rounded Box) */}
            <div className="relative z-10 my-auto flex flex-col items-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 border-2 border-amber-400 shadow-xl flex flex-col items-center justify-center p-1.5 relative">
                <img 
                  src="/logo.jpg" 
                  alt="AL ANSAR" 
                  className="w-9 h-9 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
                <span className="text-[6px] font-black text-amber-300 tracking-widest uppercase mt-0.5">
                  AL ANSAR
                </span>
              </div>

              <div className="text-center mt-2 space-y-0.5">
                <h4 className="text-[11px] font-black tracking-widest text-amber-200 uppercase">
                  অফিসিয়াল ভিআইপি সদস্যপদ
                </h4>
                <p className="text-[9px] text-slate-300 max-w-[200px] leading-tight">
                  এই কার্ডটি আল আনসার সুপার শপের সম্মানিত নিয়মিত গ্রাহকদের জন্য সংরক্ষিত।
                </p>
              </div>
            </div>

            {/* Back Bottom Notes & Signature */}
            <div className="relative z-10 space-y-1.5 text-[8px] text-slate-400 border-t border-amber-500/20 pt-2">
              <div className="flex items-center justify-between text-slate-300 font-mono">
                <span>SECURITY: 100% SHARIAH</span>
                <span>EXP: 12/2029</span>
              </div>
              <p className="leading-tight text-slate-300 text-center">
                কার্ড সম্পর্কিত সহায়তায় যোগাযোগ: +880 1700-000000 • alansarbd.com
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Flip Card Action Button */}
      <button
        onClick={() => setIsFlipped(!isFlipped)}
        className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 text-[11px] font-bold rounded-full border border-amber-400/40 transition-all cursor-pointer shadow-2xs"
      >
        <RotateCw className="w-3 h-3 text-amber-700" />
        <span>কার্ড ফ্লিপ করুন (Flip to {isFlipped ? 'Front' : 'Back'})</span>
      </button>

    </div>
  );
}
