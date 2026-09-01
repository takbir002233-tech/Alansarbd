import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Layers,
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Store,
  Tag,
  Sparkles
} from 'lucide-react';

export default function AdminLayout({ children, activeTab, setActiveTab, onNavigate }) {
  const { user, logout } = useAuth();

  const navigation = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders & Courier Trace', icon: Package },
    { id: 'products', label: 'Perfumes & Inventory', icon: ShoppingBag },
    { id: 'categories', label: 'Categories & Sub-Categories', icon: Layers },
    { id: 'vouchers', label: 'Vouchers & Promo Codes', icon: Tag },
    { id: 'users', label: 'Customer Management', icon: Users },
    { id: 'chat', label: 'Live Support Desk', icon: MessageSquare },
    { id: 'settings', label: 'Global CMS & Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <img 
              src="/logo.jpg" 
              alt="AL ANSAR" 
              className="h-12 w-12 object-contain rounded-2xl border border-amber-500/40 shadow-lg shadow-amber-500/10" 
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-white text-lg tracking-tight">AL ANSAR</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  PORTAL
                </span>
              </div>
              <p className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">
                Admin Master Control
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 shadow-lg shadow-amber-600/20 font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer CTA */}
        <div className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-emerald-400">Super Admin Access</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('home')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center space-x-2 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Public Storefront</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
