import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  Phone, 
  User, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft, 
  X, 
  Building2, 
  Navigation,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  bangladeshDivisions, 
  getDistrictsForDivision, 
  getThanasForDistrict, 
  getPostOfficesForThana 
} from '../data/bangladeshLocations';
import useScrollLock from '../hooks/useScrollLock';

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onNavigate, onSuccess, customNotice }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'

  // Lock body scroll when auth popup is open
  useScrollLock(isOpen);

  // Sync mode when initialMode changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setError(null);
    }
  }, [isOpen, initialMode]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Common State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Suspended Account Appeal
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealForm, setAppealForm] = useState({ user_email: '', user_phone: '', user_name: '', reason: '' });
  const [appealSubmitting, setAppealSubmitting] = useState(false);
  const [appealSuccess, setAppealSuccess] = useState(null);
  const [appealError, setAppealError] = useState(null);

  // Register Form State (All in one page)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // Bikroy.com Style Cascading Location State
  const [selectedDivision, setSelectedDivision] = useState('dhaka');
  const [districtsList, setDistrictsList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('dhaka_city');
  const [thanasList, setThanasList] = useState([]);
  const [selectedThana, setSelectedThana] = useState('');
  const [postOfficesList, setPostOfficesList] = useState([]);
  const [selectedPostOffice, setSelectedPostOffice] = useState('');
  const [postalCode, setPostalCode] = useState('১২১৬');
  const [streetAddress, setStreetAddress] = useState('');

  // Initialize and cascade districts when division changes
  useEffect(() => {
    const districts = getDistrictsForDivision(selectedDivision);
    setDistrictsList(districts);
    if (districts.length > 0) {
      const firstDistrict = districts[0].id;
      setSelectedDistrict(firstDistrict);
    } else {
      setSelectedDistrict('');
      setThanasList([]);
      setSelectedThana('');
      setPostOfficesList([]);
      setSelectedPostOffice('');
    }
  }, [selectedDivision]);

  // Cascade thanas when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setThanasList([]);
      setSelectedThana('');
      return;
    }
    const thanas = getThanasForDistrict(selectedDistrict);
    setThanasList(thanas);
    if (thanas.length > 0) {
      setSelectedThana(thanas[0].id);
    } else {
      setSelectedThana('');
      setPostOfficesList([]);
      setSelectedPostOffice('');
    }
  }, [selectedDistrict]);

  // Cascade post offices when thana changes
  useEffect(() => {
    if (!selectedThana) {
      setPostOfficesList([]);
      setSelectedPostOffice('');
      return;
    }
    const thanaObj = thanasList.find(t => t.id === selectedThana);
    const postOffices = getPostOfficesForThana(selectedThana, thanaObj ? thanaObj.name : '');
    setPostOfficesList(postOffices);
    if (postOffices.length > 0) {
      setSelectedPostOffice(postOffices[0].name);
      setPostalCode(postOffices[0].code || '');
    } else {
      setSelectedPostOffice('');
      setPostalCode('');
    }
  }, [selectedThana, thanasList]);

  // Handle post office change
  const handlePostOfficeChange = (e) => {
    const poName = e.target.value;
    setSelectedPostOffice(poName);
    const found = postOfficesList.find(p => p.name === poName);
    if (found && found.code) {
      setPostalCode(found.code);
    }
  };

  if (!isOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(loginIdentifier, loginPassword);
      onClose();
      if (onSuccess) {
        onSuccess(data.user);
      } else if (data.user.role === 'admin') {
        onNavigate('admin');
      } else {
        onNavigate('dashboard');
      }
    } catch (err) {
      const errMsg = err.message || 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করে পুনরায় চেষ্টা করুন।';
      setError(errMsg);
      if (errMsg.toLowerCase().includes('suspend') || errMsg.toLowerCase().includes('blocked') || errMsg.includes('স্থগিত') || errMsg.includes('ব্যান')) {
        setAppealForm(prev => ({
          ...prev,
          user_email: loginIdentifier.includes('@') ? loginIdentifier : '',
          user_phone: !loginIdentifier.includes('@') ? loginIdentifier : ''
        }));
        setShowAppealModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!regEmail.includes('@')) {
      setError('সঠিক ইমেইল ঠিকানা প্রদান করুন (যেমন: user@gmail.com)।');
      return;
    }

    if (!regPhone.match(/^(?:\+88|88)?(01[3-9]\d{8})$/)) {
      setError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    if (!streetAddress.trim()) {
      setError('বিস্তারিত ডেলিভারি ঠিকানা (বাসা/রোড নম্বর) প্রদান করা আবশ্যক।');
      return;
    }

    if (regPassword.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    // Resolve location labels for structured address
    const divObj = bangladeshDivisions.find(d => d.id === selectedDivision);
    const distObj = districtsList.find(d => d.id === selectedDistrict);
    const thanaObj = thanasList.find(t => t.id === selectedThana);

    const divName = divObj ? divObj.name : '';
    const distName = distObj ? distObj.name : '';
    const thanaName = thanaObj ? thanaObj.name : '';

    const formattedFullAddress = `${streetAddress.trim()}, ${selectedPostOffice ? selectedPostOffice + ', ' : ''}${thanaName ? thanaName + ', ' : ''}${distName ? distName + ', ' : ''}${divName}`;

    const payload = {
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      address: formattedFullAddress,
      city: distName || 'ঢাকা',
      postal_code: postalCode || '১০০০'
    };

    setLoading(true);
    try {
      const regRes = await register(payload);
      onClose();
      if (onSuccess) {
        onSuccess(regRes?.user || regRes);
      } else {
        onNavigate('dashboard');
      }
    } catch (err) {
      setError(err.message || 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login
  const handleQuickLogin = (demoEmail, demoPass) => {
    setLoginIdentifier(demoEmail);
    setLoginPassword(demoPass);
  };

  // Appeal Handler
  const handleAppealSubmit = async (e) => {
    e.preventDefault();
    setAppealSubmitting(true);
    setAppealError(null);
    setAppealSuccess(null);

    try {
      const res = await fetch('/api/admin/account-appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appealForm)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'আপিল জমা দিতে সমস্যা হয়েছে।');
      }
      setAppealSuccess(data.message);
      setAppealForm({ user_email: '', user_phone: '', user_name: '', reason: '' });
    } catch (err) {
      setAppealError(err.message);
    } finally {
      setAppealSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      
      {/* Centered Modal Card */}
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[96vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Bar (Compact) */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/50 to-amber-500/15 px-3 sm:px-4 py-2 border-b border-amber-200/80 flex items-center justify-between flex-shrink-0">
          
          {/* Dual Language Back Button: ← ফিরে যান (Back) */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center space-x-1 text-[11px] font-black text-slate-800 hover:text-amber-800 bg-white/90 hover:bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="বন্ধ করে পূর্বের পেইজে ফিরে যান"
          >
            <ArrowLeft className="w-3 h-3 text-amber-700 flex-shrink-0" />
            <span>← ফিরে যান (Back)</span>
          </button>

          {/* Mode Switcher Pills */}
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-amber-300 shadow-2xs">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`px-2.5 py-0.5 text-xs font-black rounded-md transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-amber-600 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              লগইন
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`px-2.5 py-0.5 text-xs font-black rounded-md transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-amber-600 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              রেজিস্টার
            </button>
          </div>

          {/* Close 'X' Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body (Ultra-compact so normal screens need NO scroll) */}
        <div className="p-3 sm:p-4 overflow-y-auto modal-scrollable overscroll-contain space-y-2 flex-1">
          
          {/* Brand Header with Compact Logo */}
          <div className="text-center space-y-0.5 pb-0.5">
            <div className="flex justify-center">
              <img 
                src="/logo.jpg" 
                alt="AL ANSAR" 
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl border-2 border-amber-400 shadow-xs"
              />
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              {mode === 'login' ? 'গ্রাহক অ্যাকাউন্টে লগইন' : 'নতুন গ্রাহক একাউন্ট তৈরি করুন'}
            </h2>
            <p className="text-[10px] text-slate-500">
              {mode === 'login' 
                ? 'আপনার ফোন নম্বর বা ইমেইল দিয়ে সহজে লগইন করুন' 
                : 'সব তথ্য এক পেইজে দিয়ে দ্রুত সাইন-আপ সম্পন্ন করুন'}
            </p>
          </div>

          {/* Custom Notice (e.g. login gate for application) */}
          {customNotice && (
            <div className="p-2.5 bg-amber-500/15 border border-amber-400/50 rounded-2xl text-xs text-amber-950 font-bold flex items-center space-x-2 animate-in fade-in shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{customNotice}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-1.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* ---------------- LOGIN FORM ---------------- */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-2.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                  মোবাইল নম্বর অথবা ইমেইল এড্রেস *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="01XXXXXXXXX অথবা user@gmail.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none font-medium transition-all text-xs"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="font-bold text-slate-700 text-[11px]">পাসওয়ার্ড *</label>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('forgot-password');
                    }}
                    className="text-[10px] text-amber-700 hover:underline font-bold"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="আপনার পাসওয়ার্ড লিখুন"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none font-medium transition-all text-xs"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-slate-950 font-black rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-1.5 text-xs select-none active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block animate-spin mr-1">⏳</span>
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-950" />
                )}
                <span>{loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}</span>
              </button>

              {/* Switch to Register */}
              <div className="text-center pt-1 border-t border-slate-100 text-xs text-slate-500">
                এখনো অ্যাকাউন্ট নেই?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-amber-700 font-bold hover:underline cursor-pointer"
                >
                  নতুন অ্যাকাউন্ট রেজিস্টার করুন
                </button>
              </div>
            </form>
          )}

          {/* ---------------- REGISTER FORM (Compact All-In-One Page, No Scrolling Needed) ---------------- */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-2 text-xs">
              
              {/* Row 1: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">পূর্ণ নাম *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="যেমন: তানভীর আহমেদ"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 font-medium text-xs"
                    />
                    <User className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">মোবাইল নম্বর * (১১ ডিজিট)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 font-medium text-xs"
                    />
                    <Phone className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                  </div>
                </div>
              </div>

              {/* Row 2: Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">ইমেইল ঠিকানা *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="user@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 font-medium text-xs"
                    />
                    <Mail className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-0.5 text-[11px]">পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="পাসওয়ার্ড লিখুন"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-7 pr-7 py-1.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 font-medium text-xs"
                    />
                    <Lock className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* CASCADING LOCATION SECTION (Clean standard title, no bikroy text) */}
              <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/90 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-amber-900 font-black text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                  <span>ডেলিভারি এলাকা ও ঠিকানা নির্বাচন</span>
                </div>

                {/* 1. Division & District (বিভাগ ও জেলা) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[10px]">বিভাগ (Division) *</label>
                    <select
                      value={selectedDivision}
                      onChange={(e) => setSelectedDivision(e.target.value)}
                      className="w-full px-2 py-1 bg-white rounded-lg border border-amber-300 focus:outline-none focus:border-amber-600 font-medium text-xs cursor-pointer shadow-2xs"
                    >
                      {bangladeshDivisions.map((div) => (
                        <option key={div.id} value={div.id}>
                          {div.name} ({div.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[10px]">জেলা (District) *</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-2 py-1 bg-white rounded-lg border border-amber-300 focus:outline-none focus:border-amber-600 font-medium text-xs cursor-pointer shadow-2xs"
                    >
                      {districtsList.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.name} ({dist.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Thana/Upazila & Post Office (থানা/উপজেলা ও পোস্ট অফিস) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[10px]">থানা / উপজেলা (Thana) *</label>
                    <select
                      value={selectedThana}
                      onChange={(e) => setSelectedThana(e.target.value)}
                      className="w-full px-2 py-1 bg-white rounded-lg border border-amber-300 focus:outline-none focus:border-amber-600 font-medium text-xs cursor-pointer shadow-2xs"
                    >
                      {thanasList.length === 0 && <option value="">উপজেলা নির্বাচন করুন</option>}
                      {thanasList.map((thana) => (
                        <option key={thana.id} value={thana.id}>
                          {thana.name} ({thana.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5 text-[10px]">পোস্ট অফিস / এলাকা *</label>
                    <select
                      value={selectedPostOffice}
                      onChange={handlePostOfficeChange}
                      className="w-full px-2 py-1 bg-white rounded-lg border border-amber-300 focus:outline-none focus:border-amber-600 font-medium text-xs cursor-pointer shadow-2xs"
                    >
                      {postOfficesList.length === 0 && <option value="">পোস্ট অফিস নির্বাচন করুন</option>}
                      {postOfficesList.map((po, idx) => (
                        <option key={idx} value={po.name}>
                          {po.name} (পোস্ট কোড: {po.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Detailed Street Address (বাসা/রোড/হোল্ডিং নম্বর) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5 text-[10px]">
                    বিস্তারিত ডেলিভারি ঠিকানা (বাসা নং, রোড নং, ফ্ল্যাট বা হোল্ডিং) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: বাসা ১২/এ, রোড ৪, ব্লক সি"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full px-2.5 py-1 bg-white rounded-lg border border-amber-300 focus:outline-none focus:border-amber-600 font-medium text-xs shadow-2xs"
                  />
                </div>

                {/* Full Address Preview Display */}
                {streetAddress && (
                  <div className="text-[10px] bg-white py-1 px-2 rounded-lg border border-amber-200 text-slate-600 flex items-center space-x-1">
                    <span className="font-black text-amber-700 flex-shrink-0">পূর্ণ ঠিকানা:</span>
                    <span className="truncate">
                      {streetAddress}, {selectedPostOffice ? selectedPostOffice + ', ' : ''}
                      {thanasList.find(t => t.id === selectedThana)?.name || ''}, {districtsList.find(d => d.id === selectedDistrict)?.name || ''}
                    </span>
                  </div>
                )}
              </div>

              {/* VIP Benefits Note (Ultra-compact) */}
              <div className="py-1 px-2 bg-gradient-to-r from-amber-50 to-emerald-50 rounded-lg border border-amber-200 text-[10px] text-slate-700 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>রেজিস্ট্রেশন সম্পন্ন করলেই পাবেন <strong>ভিআইপি কার্ড</strong> ও ১০% করযে হাসানা সুবিধা!</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-slate-950 font-black rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-1.5 text-xs select-none active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block animate-spin mr-1">⏳</span>
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                )}
                <span>{loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'রেজিস্ট্রেশন সম্পন্ন করুন'}</span>
              </button>

              {/* Switch to Login */}
              <div className="text-center pt-0.5 border-t border-slate-100 text-[11px] text-slate-500">
                ইতিমধ্যে একাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-amber-700 font-bold hover:underline cursor-pointer"
                >
                  লগইন করুন
                </button>
              </div>
            </form>
          )}

          {/* SUSPENDED ACCOUNT APPEAL MODAL */}
          {showAppealModal && (
            <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/80 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-amber-100 p-6 space-y-4 animate-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-rose-700 font-bold">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="text-sm">অ্যাকাউন্ট রিভিউ ও আপিল আবেদন</h3>
                  </div>
                  <button onClick={() => setShowAppealModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  আপনার অ্যাকাউন্ট স্থগিত থাকলে বিস্তারিত লিখে জমা দিন। আমাদের অ্যাডমিন টিম দ্রুত ব্যবস্থা নেবে।
                </p>

                {appealSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{appealSuccess}</span>
                  </div>
                )}

                {appealError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{appealError}</span>
                  </div>
                )}

                <form onSubmit={handleAppealSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">পূর্ণ নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="আপনার নাম"
                      value={appealForm.user_name}
                      onChange={(e) => setAppealForm({ ...appealForm, user_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">ইমেইল বা ফোন নম্বর *</label>
                    <input
                      type="text"
                      required
                      placeholder="ইমেইল বা মোবাইল"
                      value={appealForm.user_email || appealForm.user_phone}
                      onChange={(e) => setAppealForm({ ...appealForm, user_email: e.target.value, user_phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">আপিলের কারণ *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="বিস্তারিত লিখুন..."
                      value={appealForm.reason}
                      onChange={(e) => setAppealForm({ ...appealForm, reason: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAppealModal(false)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={appealSubmitting}
                      className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                    >
                      {appealSubmitting ? 'জমা হচ্ছে...' : 'আপিল জমা দিন'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
