import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function SecretAdminLogin({ onLoginSuccess, onNavigate }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(identifier, password);
    setLoading(false);

    if (result.success) {
      if (result.user.role !== 'admin') {
        setError('Access denied. This account does not possess Super Administrator privileges.');
        return;
      }
      onLoginSuccess();
    } else {
      setError(result.message || 'Invalid administrator credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 bg-slate-900/90 p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-emerald-700 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30">
            A
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
              RESTRICTED ACCESS
            </span>
            <h2 className="text-2xl font-black text-white mt-1">AL ANSAR Admin Portal</h2>
            <p className="text-xs text-slate-400 mt-1">
              Private gateway for authorized administrators only.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start space-x-3 text-rose-400 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Admin Email or Phone</label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@alansar.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Admin Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Enter Admin Master Desk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="text-xs text-slate-400 hover:text-amber-300 transition-colors"
          >
            ← Return to AL ANSAR Storefront
          </button>
        </div>
      </div>
    </div>
  );
}
