import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
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
  Sparkles,
  ShieldCheck,
  RotateCcw,
  HandHeart,
  CreditCard,
  Bell,
  CheckCheck,
  Trash2,
  X,
  Volume2,
  VolumeX,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Send,
  Smartphone,
  Laptop,
  Megaphone,
  Radio
} from 'lucide-react';

function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.12); // A5
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {}
}

export default function AdminLayout({ children, activeTab, setActiveTab, onNavigate }) {
  const { user, logout, isSuperAdmin, hasPermission, token } = useAuth();
  const { socket } = useSocket();
  const [counts, setCounts] = useState({});

  // Notification Center States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [incomingToast, setIncomingToast] = useState(null);
  const drawerRef = useRef(null);

  // OS-level Push Notification & Custom Message States
  const [notifPermission, setNotifPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [showCustomNotifModal, setShowCustomNotifModal] = useState(false);
  const [customNotifForm, setCustomNotifForm] = useState({
    title: '',
    message: '',
    link_tab: 'orders',
    send_email: true
  });
  const [sendingCustomNotif, setSendingCustomNotif] = useState(false);
  const [customNotifFeedback, setCustomNotifFeedback] = useState(null);

  // Trigger Native Mobile Status Bar & PC Action Center Notification
  const triggerSystemNotification = (notif) => {
    if (!notif) return;
    const title = notif.title || 'আল আনসার নোটিফিকেশন';
    const body = notif.message || '';
    const notifUrl = window.location.origin + '/admin#' + (notif.link_tab || 'orders');

    try {
      // 1. Service Worker Notification (Primary: Popups in Android drawer & Windows Action Center)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          body,
          icon: '/logo.jpg',
          badge: '/logo.jpg',
          data: { url: notifUrl }
        });
      } else if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          if (reg && reg.showNotification) {
            reg.showNotification(title, {
              body,
              icon: '/logo.jpg',
              badge: '/logo.jpg',
              vibrate: [250, 100, 250, 100, 250],
              tag: 'alansar-notif-' + Date.now(),
              renotify: true,
              requireInteraction: true,
              data: { url: notifUrl }
            });
          }
        }).catch(() => {});
      } else if ('Notification' in window && Notification.permission === 'granted') {
        // Fallback standard Web Notification
        const n = new Notification(title, {
          body,
          icon: '/logo.jpg',
          badge: '/logo.jpg'
        });
        n.onclick = () => {
          window.focus();
          if (notif.link_tab) setActiveTab(notif.link_tab);
          n.close();
        };
      }

      // 2. Hardware Vibration for Mobile devices
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
    } catch (err) {
      console.warn('System push display error:', err);
    }
  };

  // Request Push Permission from Browser / Mobile OS
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('আপনার বর্তমান ব্রাউজারে সিস্টেম নোটিফিকেশন সাপোর্ট করে না। অনুগ্রহ করে গুগল ক্রোম বা এজ ব্যবহার করুন।');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        triggerSystemNotification({
          title: '🎉 পুশ নোটিফিকেশন সক্রিয় হয়েছে!',
          message: 'এখন থেকে নতুন অর্ডার, করযে হাসানা ও রিফান্ড নোটিফিকেশন আপনার মোবাইল ও পিসির স্ক্রিনে সরাসরি আসবে।'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Dispatch Custom Notification (Push + Email)
  const handleSendCustomNotif = async (e) => {
    e.preventDefault();
    if (!customNotifForm.title.trim() || !customNotifForm.message.trim()) return;
    setSendingCustomNotif(true);
    setCustomNotifFeedback(null);
    try {
      const authToken = token || localStorage.getItem('nexus_token');
      const res = await fetch('/api/admin/send-custom-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(customNotifForm)
      });
      const data = await res.json();
      if (data.success) {
        setCustomNotifFeedback({ success: true, message: data.message || 'নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!' });
        setTimeout(() => {
          setShowCustomNotifModal(false);
          setCustomNotifFeedback(null);
          setCustomNotifForm({ title: '', message: '', link_tab: 'orders', send_email: true });
        }, 1800);
      } else {
        setCustomNotifFeedback({ success: false, message: data.message || 'ব্যর্থ হয়েছে' });
      }
    } catch (err) {
      setCustomNotifFeedback({ success: false, message: 'সার্ভার যোগাযোগে ত্রুটি হয়েছে।' });
    } finally {
      setSendingCustomNotif(false);
    }
  };

  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (n) => String(n ?? '').replace(/[0-9]/g, d => bengaliDigits[+d]);

  const formatTimeAgo = (isoStr) => {
    if (!isoStr) return '';
    const diffMs = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'এইমাত্র';
    if (mins < 60) return `${toBn(mins)} মি. আগে`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${toBn(hours)} ঘণ্টা আগে`;
    const days = Math.floor(hours / 24);
    return `${toBn(days)} দিন আগে`;
  };

  const fetchCounts = async () => {
    try {
      const authToken = token || localStorage.getItem('nexus_token');
      if (!authToken) return;
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const d = await res.json();
      if (d.success && d.stats) {
        setCounts({
          pending_orders: d.stats.pending_orders || 0,
          pending_refunds_count: d.stats.pending_refunds_count || 0,
          pending_qard_count: d.stats.pending_qard_count || 0,
          pending_loyalty_count: d.stats.pending_loyalty_count || 0
        });
      }
    } catch (e) {}
  };

  const fetchNotifications = async () => {
    try {
      const authToken = token || localStorage.getItem('nexus_token');
      if (!authToken) return;
      const res = await fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const d = await res.json();
      if (d.success) {
        setNotifications(d.notifications || []);
        setUnreadCount(d.unread_count || 0);
      }
    } catch (e) {}
  };

  // Fetch initial counts and notifications
  useEffect(() => {
    fetchCounts();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchCounts();
      fetchNotifications();
    }, 20000);
    return () => clearInterval(interval);
  }, [token]);

  // Real-time WebSocket event listener for incoming admin alerts
  useEffect(() => {
    if (!socket) return;

    const handleAdminNotif = (notif) => {
      setNotifications(prev => [notif, ...prev.filter(n => n.id !== notif.id)]);
      setUnreadCount(prev => prev + 1);
      if (soundEnabled) {
        playNotificationChime();
      }
      setIncomingToast(notif);
      triggerSystemNotification(notif);
      setTimeout(() => {
        setIncomingToast(curr => (curr?.id === notif.id ? null : curr));
      }, 7000);
      fetchCounts();
    };

    socket.on('admin_notification', handleAdminNotif);

    return () => {
      socket.off('admin_notification', handleAdminNotif);
    };
  }, [socket, soundEnabled]);

  // Click outside to close drawer
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target) && !e.target.closest('.notif-bell-btn')) {
        setShowDrawer(false);
      }
    };
    if (showDrawer) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDrawer]);

  const handleMarkAsRead = async (notif) => {
    try {
      const authToken = token || localStorage.getItem('nexus_token');
      if (authToken) {
        fetch(`/api/admin/notifications/${notif.id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${authToken}` }
        }).catch(() => {});
      }
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (notif.link_tab) {
        setActiveTab(notif.link_tab);
        setShowDrawer(false);
      }
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      const authToken = token || localStorage.getItem('nexus_token');
      if (authToken) {
        await fetch('/api/admin/notifications/mark-all-read', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleClearAll = async () => {
    if (!window.confirm('আপনি কি সব নোটিফিকেশন মুছে ফেলতে চান?')) return;
    try {
      const authToken = token || localStorage.getItem('nexus_token');
      if (authToken) {
        await fetch('/api/admin/notifications', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }
      setNotifications([]);
      setUnreadCount(0);
    } catch (e) {}
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-amber-400" />;
      case 'qard':
        return <HandHeart className="w-4 h-4 text-emerald-400" />;
      case 'loyalty':
        return <CreditCard className="w-4 h-4 text-amber-300" />;
      case 'refund':
        return <RotateCcw className="w-4 h-4 text-rose-400" />;
      case 'user_delete':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'appeal':
        return <ShieldCheck className="w-4 h-4 text-sky-400" />;
      default:
        return <Bell className="w-4 h-4 text-amber-400" />;
    }
  };

  const allNavigation = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, perm: 'dashboard.view' },
    { id: 'orders', label: 'Orders & Courier Trace', icon: Package, perm: 'orders.view', badgeKey: 'pending_orders' },
    { id: 'refunds', label: 'রিফান্ড ও রিটার্ন ডেস্ক', icon: RotateCcw, perm: 'refunds.manage', badgeKey: 'pending_refunds_count' },
    { id: 'qard', label: 'করযে হাসানা আবেদন', icon: HandHeart, perm: 'customers.qard_applications', badgeKey: 'pending_qard_count' },
    { id: 'loyalty', label: 'ভিআইপি কার্ড আবেদন', icon: CreditCard, perm: 'customers.loyalty_applications', badgeKey: 'pending_loyalty_count' },
    { id: 'products', label: 'Perfumes & Inventory', icon: ShoppingBag, perm: 'products.view' },
    { id: 'categories', label: 'Categories & Sub-Categories', icon: Layers, perm: 'categories.manage' },
    { id: 'vouchers', label: 'Vouchers & Promo Codes', icon: Tag, perm: 'vouchers.manage' },
    { id: 'users', label: 'Customer Management', icon: Users, perm: 'customers.view' },
    { id: 'chat', label: 'Live Support Desk', icon: MessageSquare, perm: 'chat.manage' },
    { id: 'team_chat', label: 'টিম গ্রুপ চ্যাট', icon: Users, perm: 'dashboard.view' },
    { id: 'settings', label: 'Global CMS & Settings', icon: Settings, perm: 'settings.manage' },
    { id: 'staff', label: 'স্টাফ ও পারমিশন কন্ট্রোল', icon: ShieldCheck, superOnly: true },
  ];

  // Filter navigation items by role and granular permissions
  const navigation = allNavigation.filter(item => {
    if (item.superOnly) return isSuperAdmin;
    return hasPermission(item.perm);
  });

  // Auto-redirect to first available tab if current active tab is unauthorized
  useEffect(() => {
    if (navigation.length > 0 && !navigation.some(n => n.id === activeTab)) {
      setActiveTab(navigation[0].id);
    }
  }, [navigation, activeTab, setActiveTab]);

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-amber-500 selection:text-slate-950 font-sans relative"
      style={{ backgroundColor: '#020617' }}
    >
      
      {/* Floating Incoming Notification Toast Alert */}
      {incomingToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top duration-300 text-white flex items-start space-x-3">
          <div className="p-2 bg-amber-500/20 rounded-xl shrink-0 mt-0.5 border border-amber-500/40">
            {getNotifIcon(incomingToast.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-amber-300 truncate">{incomingToast.title}</h4>
              <span className="text-[10px] text-slate-400 ml-1">এখন</span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-snug line-clamp-2">{incomingToast.message}</p>
            <div className="mt-2.5 flex items-center space-x-2">
              <button
                onClick={() => {
                  handleMarkAsRead(incomingToast);
                  setIncomingToast(null);
                }}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <span>দেখুন</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIncomingToast(null)}
                className="px-2 py-1 text-slate-400 hover:text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
          <button 
            onClick={() => setIncomingToast(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          
          {/* Brand Logo & Mobile Bell */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab(navigation[0]?.id || 'dashboard')}>
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
                  {user?.is_staff ? (user.custom_role || 'Staff Control') : 'Admin Master Control'}
                </p>
              </div>
            </div>

            {/* Mobile Notification Bell Trigger */}
            <div className="flex md:hidden items-center space-x-1">
              <button
                onClick={() => setShowDrawer(!showDrawer)}
                className="notif-bell-btn relative p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-all cursor-pointer"
                title="নোটিফিকেশন"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md">
                    {toBn(unreadCount)}
                  </span>
                )}
              </button>
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
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.badgeKey && counts[item.badgeKey] > 0 && (
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 shadow-xs ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                    }`}>
                      {toBn(counts[item.badgeKey])}
                    </span>
                  )}
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
                {user?.is_staff ? (
                  <span className="inline-block text-[10px] font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/25 truncate max-w-[130px]">
                    {user.custom_role || 'মডারেটর'}
                  </span>
                ) : (
                  <p className="text-[10px] text-emerald-400 font-semibold">Super Admin Access</p>
                )}
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
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl bg-slate-950 flex flex-col relative" style={{ backgroundColor: '#020617' }}>
        
        {/* Browser / OS Push Notification Permission Prompt (Mobile & PC) */}
        {notifPermission !== 'granted' && (
          <div className="mb-5 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border-2 border-amber-500/50 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl animate-in fade-in">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 shrink-0 border border-amber-500/40">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white flex items-center space-x-2">
                  <span>📱 মোবাইল ও পিসির স্ক্রিনে সরাসরি নোটিফিকেশন অন করুন</span>
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full">সুপার ফাস্ট</span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  ওয়েবসাইট বা ব্রাউজার বন্ধ থাকলেও নতুন অর্ডার, করযে হাসানা, ভিআইপি আবেদন ও রিফান্ডের নোটিফিকেশন আপনার মোবাইল স্ট্যাটাস বার / লকস্ক্রিন ও পিসি উইন্ডোজ অ্যাকশন সেন্টারে রিংটোন ও ভাইব্রেশন সহ সরাসরি প্রদর্শিত হবে।
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={requestNotificationPermission}
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center space-x-2"
              >
                <Bell className="w-4 h-4" />
                <span>নোটিফিকেশন চালু করুন (Allow)</span>
              </button>
            </div>
          </div>
        )}

        {/* Desktop Top Header Bar with Live Notification Center */}
        <div className="hidden md:flex items-center justify-between pb-5 mb-6 border-b border-slate-800/80">
          <div>
            <h1 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>{navigation.find(n => n.id === activeTab)?.label || 'অ্যাডমিন ড্যাশবোর্ড'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" title="লাইভ সংযোগ সক্রিয়" />
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              আল আনসার সুপার শপ • অ্যাডমিন পোর্টাল (অর্ডার, করযে হাসানা, ভিআইপি, রিফান্ড ও আপিল নোটিফিকেশন সক্রিয়)
            </p>
          </div>

          {/* Action Tools: Custom Msg + Test Push + Sound + Bell */}
          <div className="flex items-center space-x-2 relative">
            
            {/* Custom Notification Trigger */}
            <button
              onClick={() => setShowCustomNotifModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="কাস্টম নোটিফিকেশন ও মেসেজ পাঠান"
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-400" />
              <span>কাস্টম মেসেজ</span>
            </button>

            {/* Test Push Trigger */}
            <button
              onClick={() => {
                triggerSystemNotification({
                  title: '🧪 টেস্ট পুশ নোটিফিকেশন',
                  message: 'মোবাইল ও পিসির নোটিফিকেশন সফলভাবে সক্রিয় হয়েছে!'
                });
              }}
              className="flex items-center space-x-1 px-2.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="মোবাইল বা পিসির স্ক্রিনে সরাসরি টেস্ট নোটিফিকেশন পরীক্ষা করুন"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>টেস্ট পুশ</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-slate-900 border-slate-700 text-amber-400 hover:border-amber-500' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title={soundEnabled ? 'সাউন্ড অ্যালার্ট চালু আছে' : 'সাউন্ড অ্যালার্ট বন্ধ'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Notification Bell with Badge */}
            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className="notif-bell-btn relative flex items-center space-x-2 px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-amber-500/60 rounded-xl text-slate-200 transition-all cursor-pointer shadow-sm"
              title="নোটিফিকেশন সেন্টার"
            >
              <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
              <span className="text-xs font-bold">নোটিফিকেশন</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow-xs">
                  {toBn(unreadCount)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* NOTIFICATION CENTER DROPDOWN / DRAWER (PC + Mobile) */}
        {showDrawer && (
          <div 
            ref={drawerRef}
            className="absolute top-16 right-4 md:right-8 z-50 w-80 sm:w-96 bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Drawer Header */}
            <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white">নোটিফিকেশন সেন্টার</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/30">
                    {toBn(unreadCount)} টি অপঠিত
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="সব পঠিত করুন"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="সব মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Drawer Action Bar */}
            <div className="px-3.5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowDrawer(false);
                  setShowCustomNotifModal(true);
                }}
                className="flex-1 py-1.5 px-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                <span>কাস্টম বার্তা পাঠান</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerSystemNotification({
                    title: '🧪 টেস্ট নোটিফিকেশন',
                    message: 'মোবাইল ও পিসির পুশ নোটিফিকেশন সক্রিয় আছে!'
                  });
                }}
                className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                title="সরাসরি মোবাইল বা পিসির স্ক্রিনে টেস্ট নোটিফিকেশন দেখুন"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>টেস্ট পুশ</span>
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold">নতুন কোনো নোটিফিকেশন নেই</p>
                  <p className="text-[10px] text-slate-500">অর্ডার, করযে হাসানা, রিফান্ড বা আপিল আসলে এখানে প্রদর্শিত হবে।</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif)}
                    className={`p-3.5 flex items-start space-x-3 transition-colors cursor-pointer ${
                      notif.is_read ? 'bg-slate-900 hover:bg-slate-850' : 'bg-slate-850/80 hover:bg-slate-800 border-l-4 border-amber-500'
                    }`}
                  >
                    <div className="p-2 bg-slate-800 rounded-xl shrink-0 mt-0.5 border border-slate-700">
                      {getNotifIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs truncate ${notif.is_read ? 'font-bold text-slate-300' : 'font-black text-amber-300'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                          {formatTimeAgo(notif.created_at)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {notifications.length > 0 && (
              <div className="p-2.5 bg-slate-950 text-center border-t border-slate-800">
                <span className="text-[10px] text-slate-500 font-semibold">
                  নোটিফিকেশনে ক্লিক করলে সরাসরি সংশ্লিষ্ট ডেস্কে নিয়ে যাবে
                </span>
              </div>
            )}
          </div>
        )}

        {children}

        {/* CUSTOM NOTIFICATION MODAL */}
        {showCustomNotifModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">📢 কাস্টম পুশ ও বার্তা প্রেরণ</h3>
                    <p className="text-[11px] text-slate-400">মোবাইল ও পিসির নোটিফিকেশন এবং অ্যাডমিন ইমেইলে বার্তা পাঠান</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCustomNotifModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendCustomNotif} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">নোটিফিকেশন শিরোনাম (Title) *</label>
                  <input
                    type="text"
                    required
                    value={customNotifForm.title}
                    onChange={(e) => setCustomNotifForm({ ...customNotifForm, title: e.target.value })}
                    placeholder="যেমন: জরুরি নোটিশ / নতুন অফার / অর্ডার রিভিউ"
                    className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">বিস্তারিত বার্তা (Message) *</label>
                  <textarea
                    rows={3}
                    required
                    value={customNotifForm.message}
                    onChange={(e) => setCustomNotifForm({ ...customNotifForm, message: e.target.value })}
                    placeholder="নোটিফিকেশনের বিস্তারিত বিষয়বস্তু এখানে লিখুন..."
                    className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">ক্লিক করলে নিয়ে যাবে (Target Tab)</label>
                    <select
                      value={customNotifForm.link_tab}
                      onChange={(e) => setCustomNotifForm({ ...customNotifForm, link_tab: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="orders">অর্ডার তালিকা (Orders)</option>
                      <option value="qard">করযে হাসানা আবেদন (Qard)</option>
                      <option value="loyalty">ভিআইপি কার্ড আবেদন (VIP)</option>
                      <option value="refunds">রিফান্ড ও রিটার্ন (Refunds)</option>
                      <option value="users">গ্রাহক তালিকা (Users)</option>
                      <option value="settings">গ্লোবাল সেটিংস (Settings)</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center space-x-2 text-xs font-bold text-amber-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customNotifForm.send_email}
                        onChange={(e) => setCustomNotifForm({ ...customNotifForm, send_email: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-0"
                      />
                      <span>ইমেইলে ও কপি পাঠান</span>
                    </label>
                  </div>
                </div>

                {customNotifFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-bold border animate-in fade-in ${
                    customNotifFeedback.success 
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}>
                    {customNotifFeedback.message}
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomNotifModal(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={sendingCustomNotif}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-600/25 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {sendingCustomNotif ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>🚀 নোটিফিকেশন পাঠান</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
