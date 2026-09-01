import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  Phone, 
  User, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  KeyRound,
  ArrowLeft,
  HelpCircle,
  X
} from 'lucide-react';

// LOGIN COMPONENT
export function Login({ onNavigate }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Account Suspension Appeal Modal State
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealForm, setAppealForm] = useState({ user_email: '', user_phone: '', user_name: '', reason: '' });
  const [appealSubmitting, setAppealSubmitting] = useState(false);
  const [appealSuccess, setAppealSuccess] = useState(null);
  const [appealError, setAppealError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(identifier, password);
      if (data.user.role === 'admin') {
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
          user_email: identifier.includes('@') ? identifier : '',
          user_phone: !identifier.includes('@') ? identifier : ''
        }));
        setShowAppealModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleQuickLogin = (demoEmail, demoPass) => {
    setIdentifier(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6 animate-in fade-in font-sans">
      
      {/* Universal Back Button */}
      <div>
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-amber-800 transition-colors bg-white px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-700" />
          <span>← মূল পেইজে ফিরে যান</span>
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-amber-100 shadow-xl space-y-6">
        
        {/* Header with Larger Logo & Bengali title */}
        <div className="text-center space-y-3">
          <img 
            src="/logo.jpg" 
            alt="AL ANSAR" 
            className="w-16 h-16 object-contain rounded-2xl mx-auto border-2 border-amber-300 shadow-sm" 
          />
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">অ্যাকাউন্টে লগইন করুন</h2>
            <p className="text-xs text-amber-800 font-bold uppercase tracking-wider mt-0.5">
              আল আনসার গ্রাহক ড্যাশবোর্ড
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 space-y-2">
            <div className="flex items-center space-x-2 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {error.toLowerCase().includes('suspend') || error.toLowerCase().includes('blocked') || error.includes('স্থগিত') ? (
              <button
                type="button"
                onClick={() => setShowAppealModal(true)}
                className="text-xs font-bold text-amber-800 underline block cursor-pointer hover:text-amber-900"
              >
                এখানে ক্লিক করে রিভিউ ও আপিল আবেদন করুন →
              </button>
            ) : null}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">ইমেইল অথবা মোবাইল নম্বর</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="user@gmail.com বা 017XXXXXXXX"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white font-medium"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">পাসওয়ার্ড</label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? <span>প্রবেশ করা হচ্ছে...</span> : <span>লগইন করুন</span>}
          </button>
        </form>

        {/* Quick Demo Login Credentials Bar */}
        <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-2 text-[11px]">
          <p className="font-bold text-amber-900 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
            ১-ক্লিক ডেমো লগইন:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@alansar.com', 'admin123')}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg font-bold text-[10px] text-center border border-amber-500/30 cursor-pointer"
            >
              🛡️ সুপার অ্যাডমিন
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('tanvir.ahmed@gmail.com', 'user123')}
              className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-[10px] text-center border border-amber-300 cursor-pointer"
            >
              👤 ডেমো কাস্টমার
            </button>
          </div>
        </div>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          এখনো অ্যাকাউন্ট নেই?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-amber-700 font-bold hover:underline cursor-pointer"
          >
            নতুন অ্যাকাউন্ট তৈরি করুন
          </button>
        </div>
      </div>

      {/* SUSPENDED ACCOUNT REVIEW / APPEAL MODAL */}
      {showAppealModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-amber-100 p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-rose-700 font-bold">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-sm">অ্যাকাউন্ট রিভিউ ও আপিল আবেদন</h3>
              </div>
              <button onClick={() => setShowAppealModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              আপনার অ্যাকাউন্টটি যদি ভুলবশত স্থগিত বা ব্লক হয়ে থাকে, তবে নিচের ফর্মে আপনার তথ্য ও কারণ লিখে রিভিউ আবেদন জমা দিন। আমাদের অ্যাডমিন টিম দ্রুত যাচাই করে আনব্লক করবে।
            </p>

            {appealSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{appealSuccess}</span>
              </div>
            )}

            {appealError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{appealError}</span>
              </div>
            )}

            <form onSubmit={handleAppealSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">আপনার নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="আপনার পূর্ণ নাম"
                  value={appealForm.user_name}
                  onChange={(e) => setAppealForm({ ...appealForm, user_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">রেজিস্টার্ড ইমেইল বা ফোন নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="ইমেইল বা মোবাইল নম্বর"
                  value={appealForm.user_email || appealForm.user_phone}
                  onChange={(e) => setAppealForm({ ...appealForm, user_email: e.target.value, user_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">রিভিউ ও আনব্লকের কারণ / ব্যাখ্যা *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="দয়া করে আপনার অ্যাকাউন্টটি আনব্লক করার অনুরোধের বিস্তারিত কারণ লিখুন..."
                  value={appealForm.reason}
                  onChange={(e) => setAppealForm({ ...appealForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAppealModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={appealSubmitting}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md"
                >
                  {appealSubmitting ? 'জমা হচ্ছে...' : 'আপিল জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// REGISTER COMPONENT
export function Register({ onNavigate }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'ঢাকা',
    postal_code: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.includes('@')) {
      setError('সঠিক ইমেইল ঠিকানা প্রদান করুন (যেমন: user@gmail.com)।');
      return;
    }

    if (!formData.phone.match(/^(?:\+88|88)?(01[3-9]\d{8})$/)) {
      setError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    if (!formData.address.trim()) {
      setError('ডেলিভারি ঠিকানা প্রদান করা বাধ্যতামূলক।');
      return;
    }

    if (formData.password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6 animate-in fade-in font-sans">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-amber-800 transition-colors bg-white px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-700" />
          <span>← মূল পেইজে ফিরে যান</span>
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-amber-100 shadow-xl space-y-6">
        
        <div className="text-center space-y-3">
          <img 
            src="/logo.jpg" 
            alt="AL ANSAR" 
            className="w-16 h-16 object-contain rounded-2xl mx-auto border-2 border-amber-300 shadow-sm" 
          />
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">নতুন গ্রাহক একাউন্ট তৈরি করুন</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              রেজিস্ট্রেশন করে পান ভিআইপি লয়ালটি ক্রেডিট কার্ড ও করযে হাসানা ঋণ সুবিধা
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">পূর্ণ নাম *</label>
              <input
                type="text"
                required
                placeholder="যেমন: তানভীর আহমেদ"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">ইমেইল ঠিকানা *</label>
              <input
                type="email"
                required
                placeholder="tanvir@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">১১ ডিজিটের মোবাইল নম্বর *</label>
              <input
                type="text"
                required
                maxLength={11}
                placeholder="017XXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">ডেলিভারি ঠিকানা (বাসা/রোড নম্বর) *</label>
              <textarea
                rows={2}
                required
                placeholder="ফ্ল্যাট ৪বি, গ্রিন টাওয়ার, মিরপুর-১০, ঢাকা"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">জেলা / শহর *</label>
              <input
                type="text"
                required
                placeholder="ঢাকা"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">পোস্টাল কোড</label>
              <input
                type="text"
                placeholder="১২১৬"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
          >
            {loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'রেজিস্ট্রেশন সম্পন্ন করুন ও ড্যাশবোর্ড খুলুন'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          পূর্বেই অ্যাকাউন্ট রয়েছে?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-amber-700 font-bold hover:underline cursor-pointer"
          >
            লগইন করুন
          </button>
        </div>
      </div>
    </div>
  );
}

// FORGOT PASSWORD COMPONENT
export function ForgotPassword({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'রিকভারি কোড পাঠানো সম্ভব হয়নি।');
      }

      setDemoOtp(data.demo_otp);
      setOtp(data.demo_otp);
      setStep(2);
      setStatus({ success: true, message: `OTP কোড পাঠানো হয়েছে! (কোড: ${data.demo_otp})` });
    } catch (err) {
      setStatus({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'পাসওয়ার্ড রিসেট করা যায়নি।');
      }

      setStatus({ success: true, message: 'পাসওয়ার্ড সফলভাবে রিসেট হয়েছে! লগইন পেইজে নেওয়া হচ্ছে...' });
      setTimeout(() => onNavigate('login'), 1500);
    } catch (err) {
      setStatus({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6 animate-in fade-in font-sans">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('login')}
          className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-amber-800 transition-colors bg-white px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-700" />
          <span>← লগইনে ফিরে যান</span>
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-amber-100 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">পাসওয়ার্ড রিসেট করুন</h2>
          <p className="text-xs text-slate-500">
            {step === 1 ? 'আপনার রেজিস্টার্ড ইমেইল দিয়ে ওটিপি কোড গ্রহণ করুন' : '৬ ডিজিটের ওটিপি ও নতুন পাসওয়ার্ড প্রদান করুন'}
          </p>
        </div>

        {status && (
          <div className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
            status.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {status.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">রেজিস্টার্ড ইমেইল ঠিকানা</label>
              <input
                type="email"
                required
                placeholder="tanvir.ahmed@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              {loading ? 'কোড তৈরি হচ্ছে...' : 'রিকভারি OTP পাঠান'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">৬ ডিজিটের ভেরিফিকেশন কোড</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono text-center font-bold tracking-widest text-base"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              {loading ? 'রিসেট হচ্ছে...' : 'নতুন পাসওয়ার্ড নিশ্চিত করুন'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => onNavigate('login')}
            className="text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
          >
            ← লগইন পেইজে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
}
