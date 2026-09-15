import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Printer, 
  ArrowRight,
  ShieldAlert,
  Calendar,
  ChevronDown,
  Check,
  Sparkles,
  Filter,
  ExternalLink,
  Layers,
  X,
  Truck
} from 'lucide-react';

export default function AdminDashboard({ onNavigateTab, onOpenInvoice }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Total Revenue dropdown period
  const [revenuePeriod, setRevenuePeriod] = useState('all'); // 'today' | 'week' | 'month' | 'year' | 'all'
  
  // Fulfillment Status Clickable Live Button (Dedicated Expanded Section)
  const [expandedStatus, setExpandedStatus] = useState(null); // 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | null
  const [statusOrders, setStatusOrders] = useState([]);
  const [loadingStatusOrders, setLoadingStatusOrders] = useState(false);
  
  const [confirmingId, setConfirmingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // When admin clicks a fulfillment status card, fetch that status's orders
  const handleToggleStatus = async (statusId) => {
    if (expandedStatus === statusId) {
      setExpandedStatus(null);
      setStatusOrders([]);
      return;
    }

    setExpandedStatus(statusId);
    setLoadingStatusOrders(true);
    try {
      const res = await fetch(`/api/orders?status=${statusId.toLowerCase()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setStatusOrders(resData.orders || []);
      }
    } catch (err) {
      console.error('Error loading status orders:', err);
    } finally {
      setLoadingStatusOrders(false);
    }
  };

  // 1-Click In-Place Order Confirmation
  const handleConfirmOrder = async (order) => {
    setConfirmingId(order.id);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'Confirmed',
          note: 'Order confirmed by Admin from Dashboard Overview'
        })
      });
      const resData = await res.json();
      if (resData.success) {
        showToast(`অর্ডার #${order.order_code} সফলভাবে কনফার্ম করা হয়েছে!`);
        
        // Optimistically update recent orders queue
        setData(prev => {
          if (!prev) return prev;
          const updatedRecent = prev.recent_orders ? prev.recent_orders.map(o => 
            o.id === order.id ? { ...o, status: 'Confirmed' } : o
          ) : [];

          const prevStats = prev.stats || {};
          return {
            ...prev,
            stats: {
              ...prevStats,
              pending_orders: Math.max(0, (prevStats.pending_orders || 1) - 1),
              confirmed_orders: (prevStats.confirmed_orders || 0) + 1
            },
            recent_orders: updatedRecent
          };
        });

        // Also update expanded status orders list if open
        setStatusOrders(prev => {
          if (expandedStatus === 'Pending') {
            return prev.filter(o => o.id !== order.id);
          }
          return prev.map(o => o.id === order.id ? { ...o, status: 'Confirmed' } : o);
        });
      } else {
        alert(resData.message || 'অর্ডার কনফার্ম করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      console.error('Error confirming order:', err);
      alert('অর্ডার কনফার্ম করার সময় ত্রুটি ঘটেছে');
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span>অ্যানালিটিক্স ও ড্যাশবোর্ড তথ্য লোড হচ্ছে...</span>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recent_orders || [];
  const lowStock = data?.low_stock_products || [];

  // Determine Revenue Amount based on selected dropdown period
  const revenueBreakdown = stats.revenue_by_period || {};
  let displayedRevenue = stats.total_revenue || 0;
  let periodLabel = 'সর্বমোট লাইফটাইম বিক্রয়';

  if (revenuePeriod === 'today') {
    displayedRevenue = revenueBreakdown.today !== undefined ? revenueBreakdown.today : 0;
    periodLabel = 'আজকের দিনের মোট বিক্রয় (Today / 24h)';
  } else if (revenuePeriod === 'week') {
    displayedRevenue = revenueBreakdown.week !== undefined ? revenueBreakdown.week : 0;
    periodLabel = 'গত ৭ দিনের মোট বিক্রয় (This Week)';
  } else if (revenuePeriod === 'month') {
    displayedRevenue = revenueBreakdown.month !== undefined ? revenueBreakdown.month : 0;
    periodLabel = 'চলতি মাসের মোট বিক্রয় (This Month)';
  } else if (revenuePeriod === 'year') {
    displayedRevenue = revenueBreakdown.year !== undefined ? revenueBreakdown.year : 0;
    periodLabel = 'চলতি বছরের মোট বিক্রয় (This Year)';
  }

  const statusCardConfig = [
    { 
      id: 'Pending', 
      labelBn: 'পেন্ডিং', 
      labelEn: 'Pending', 
      count: stats.pending_orders || 0,
      bgActive: 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-400 shadow-amber-500/30',
      bgNormal: 'bg-amber-950/25 border-amber-900/50 hover:border-amber-600',
      textColor: 'text-amber-400'
    },
    { 
      id: 'Confirmed', 
      labelBn: 'কনফার্মড', 
      labelEn: 'Confirmed', 
      count: stats.confirmed_orders || 0,
      bgActive: 'bg-blue-950/80 border-blue-500 ring-2 ring-blue-400 shadow-blue-500/30',
      bgNormal: 'bg-blue-950/25 border-blue-900/50 hover:border-blue-600',
      textColor: 'text-blue-400'
    },
    { 
      id: 'Processing', 
      labelBn: 'প্রসেসিং', 
      labelEn: 'Processing', 
      count: stats.processing_orders || 0,
      bgActive: 'bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-400 shadow-indigo-500/30',
      bgNormal: 'bg-indigo-950/25 border-indigo-900/50 hover:border-indigo-600',
      textColor: 'text-indigo-400'
    },
    { 
      id: 'Shipped', 
      labelBn: 'কুরিয়ারে অন-ওয়ে', 
      labelEn: 'Shipped / Shift', 
      count: stats.shipped_orders || 0,
      bgActive: 'bg-sky-950/80 border-sky-500 ring-2 ring-sky-400 shadow-sky-500/30',
      bgNormal: 'bg-sky-950/25 border-sky-900/50 hover:border-sky-600',
      textColor: 'text-sky-400'
    },
    { 
      id: 'Delivered', 
      labelBn: 'ডেলিভার্ড', 
      labelEn: 'Delivered', 
      count: stats.delivered_orders || 0,
      bgActive: 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-400 shadow-emerald-500/30',
      bgNormal: 'bg-emerald-950/25 border-emerald-900/50 hover:border-emerald-600',
      textColor: 'text-emerald-400'
    },
    { 
      id: 'Cancelled', 
      labelBn: 'বাতিল', 
      labelEn: 'Cancelled', 
      count: stats.cancelled_orders || 0,
      bgActive: 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-400 shadow-rose-500/30',
      bgNormal: 'bg-rose-950/25 border-rose-900/50 hover:border-rose-600',
      textColor: 'text-rose-400'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 animate-in slide-in-from-top text-xs font-bold border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Platform Overview & Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Admin Analytics & Orders Command</h1>
          <p className="text-xs text-slate-400 mt-0.5">রিয়েল-টাইম আয়, লাইভ স্ট্যাটাস বাটন ও সাম্প্রতিক অর্ডার কিউ</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('orders', 'all')}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>Orders & Courier Trace এ যান</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* TOTAL REVENUE CARD WITH DEDICATED FULL-WIDTH DROPDOWN (NO OVERLAP) */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-3 relative group">
          
          {/* Header Row: Label on Left, Icon on Right */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue (আয়)
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Revenue Figure & Selected Period Indicator */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
              ৳{Number(displayedRevenue || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5"></span>
              {periodLabel}
            </p>
          </div>

          {/* Dedicated Full-Width Period Dropdown (Guaranteed Zero Overlap) */}
          <div className="pt-2 border-t border-slate-800/80">
            <select
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value)}
              className="w-full bg-slate-800 hover:bg-slate-750 text-amber-300 font-bold text-xs py-2 px-3 rounded-xl border border-amber-500/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer transition-all block"
            >
              <option value="today" className="bg-slate-900 text-white">📅 আজকের দিন (Today / 24h)</option>
              <option value="week" className="bg-slate-900 text-white">📅 এই সপ্তাহ (Last 7 Days)</option>
              <option value="month" className="bg-slate-900 text-white">📅 এই মাস (30 Days)</option>
              <option value="year" className="bg-slate-900 text-white">📅 এই বছর (This Year)</option>
              <option value="all" className="bg-slate-900 text-white">🌟 সর্বমোট (All Time)</option>
            </select>
          </div>
        </div>

        {/* Total Orders */}
        <div 
          onClick={() => onNavigateTab('orders', 'all')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2 cursor-pointer hover:border-blue-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats.total_orders || 0}
          </h3>
          <p className="text-[11px] text-amber-400 font-semibold flex items-center justify-between">
            <span>{stats.pending_orders || 0} টি অপেক্ষমান অর্ডার</span>
            <span className="text-[10px] text-blue-400 hover:underline">ভিউ করুন →</span>
          </p>
        </div>

        {/* Total Products */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2 cursor-pointer hover:border-indigo-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Products In Store</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats.total_products || 0}
          </h3>
          <p className="text-[11px] text-slate-400">
            {stats.low_stock_count || 0} টি পণ্যে স্টক অ্যালার্ট
          </p>
        </div>

        {/* Total Users */}
        <div 
          onClick={() => onNavigateTab('users')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2 cursor-pointer hover:border-purple-500/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Registered Customers</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats.total_users || 0}
          </h3>
          <p className="text-[11px] text-slate-400">
            {stats.blocked_users_count || 0} টি অ্যাকাউন্ট স্থগিত
          </p>
        </div>
      </div>

      {/* INTERACTIVE FULFILLMENT STATUS BREAKDOWN CARDS (LIVE BUTTONS) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
              <Layers className="w-4 h-4 mr-2 text-amber-400" />
              Fulfillment Status Breakdown (লাইভ বোতাম)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              যেকোনো স্ট্যাটাস বোতামে ক্লিক করলে সরাসরি সেই স্ট্যাটাসের অর্ডারগুলোর বিস্তারিত তালিকা খুলে যাবে
            </p>
          </div>

          {expandedStatus && (
            <button
              onClick={() => { setExpandedStatus(null); setStatusOrders([]); }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold rounded-xl border border-rose-900/40 flex items-center space-x-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>স্ট্যাটাস তালিকা বন্ধ করুন</span>
            </button>
          )}
        </div>

        {/* 6 Interactive Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statusCardConfig.map((item) => {
            const isSelected = expandedStatus?.toLowerCase() === item.id.toLowerCase();
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggleStatus(item.id)}
                className={`p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 relative group ${
                  isSelected ? item.bgActive : item.bgNormal
                }`}
              >
                {isSelected && (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow">
                    Viewing
                  </span>
                )}
                <span className={`text-xs font-bold block ${item.textColor}`}>
                  {item.labelBn}
                </span>
                <span className="text-xs text-slate-400 font-medium block text-[10px]">
                  {item.labelEn}
                </span>
                <span className="text-2xl font-black text-white mt-1 block font-mono">
                  {item.count}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  {isSelected ? 'তালিকা দেখাচ্ছে ▼' : 'ক্লিক করে দেখুন ➔'}
                </span>
              </button>
            );
          })}
        </div>

        {/* DEDICATED FULFILLMENT STATUS ORDERS LIST (OPENS WHEN STATUS BUTTON IS CLICKED) */}
        {expandedStatus && (
          <div className="mt-5 pt-5 border-t border-slate-800 animate-in fade-in space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  {expandedStatus} Orders ({statusOrders.length})
                </h4>
                <span className="text-xs text-slate-400">
                  — নির্বাচিত স্ট্যাটাসের অর্ডারসমূহ
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigateTab('orders', expandedStatus.toLowerCase())}
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>Orders & Courier Trace পেজে বিস্তারিত দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {loadingStatusOrders ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {expandedStatus} অর্ডারগুলো লোড হচ্ছে...
              </div>
            ) : statusOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                বর্তমানে "{expandedStatus}" স্ট্যাটাসে কোনো অর্ডার নেই।
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {statusOrders.map((ord) => {
                  const isPending = ord.status?.toLowerCase() === 'pending';
                  const orderDate = new Date(ord.created_at);
                  const formattedDate = orderDate.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  const formattedTime = orderDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div 
                      key={ord.id} 
                      className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black font-mono text-amber-400">#{ord.order_code}</span>
                          <span className="text-xs font-bold text-white truncate max-w-[140px]">{ord.customer_name}</span>
                          <span className="text-xs text-slate-400 font-mono">({ord.customer_phone})</span>
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-amber-400 mr-1" />
                            <span>{formattedDate}</span>
                            <span>•</span>
                            <span>{formattedTime}</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                          <span className="uppercase font-bold text-indigo-400">{ord.payment_method}</span>
                          {ord.transaction_id && <span>Trx: <strong className="text-slate-200">{ord.transaction_id}</strong></span>}
                          <span>•</span>
                          <span className="font-bold text-white">৳{(ord.total_amount || 0).toLocaleString()}</span>
                          {ord.shipping_city && <span>• 📍 {ord.shipping_city}</span>}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isPending && (
                          <button
                            type="button"
                            disabled={confirmingId === ord.id}
                            onClick={() => handleConfirmOrder(ord)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{confirmingId === ord.id ? 'হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => onOpenInvoice(ord)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
                          title="ইনভয়েস"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RECENT ORDERS QUEUE (SEPARATE & PERMANENT) + LOW STOCK WARNINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders Queue (8 cols) - PERMANENTLY DEDICATED TO RECENT INCOMING ORDERS */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Recent Orders Queue ({recentOrders.length})
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  ইনকামিং কিউ
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                সাম্প্রতিক অর্ডারের তারিখ, সময় ও ১-ক্লিক কনফার্মেশন (কনফার্ম করলে কিউ থেকে সরে যাবে)
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('orders', 'all')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer"
            >
              <span>Full Orders & Trace এ দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl">
              <Package className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-400">কোন সাম্প্রতিক অর্ডার পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((ord) => {
                const isPending = ord.status?.toLowerCase() === 'pending';
                const isConfirmed = ord.status?.toLowerCase() === 'confirmed';
                const isProcessing = ord.status?.toLowerCase() === 'processing';
                const isShipped = ord.status?.toLowerCase() === 'shipped';
                const isDelivered = ord.status?.toLowerCase() === 'delivered';
                const isCancelled = ord.status?.toLowerCase() === 'cancelled';

                const orderDate = new Date(ord.created_at);
                const formattedDate = orderDate.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
                const formattedTime = orderDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div 
                    key={ord.id} 
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      isPending 
                        ? 'bg-slate-900/90 border-amber-900/50 hover:border-amber-600/60 shadow-lg shadow-amber-950/20' 
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      
                      {/* Code, Name, Phone, and DATE & TIME */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          #{ord.order_code}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-[150px]">
                          {ord.customer_name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ({ord.customer_phone})
                        </span>

                        {/* Order Date & Time Badge */}
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-amber-400 mr-1" />
                          <span>{formattedDate}</span>
                          <span>•</span>
                          <span className="text-slate-300">{formattedTime}</span>
                        </span>
                      </div>

                      {/* Payment & Amount */}
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                        <span className="uppercase font-bold text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/50 text-[10px]">
                          {ord.payment_method}
                        </span>
                        {ord.transaction_id && (
                          <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                            Trx: <strong className="text-white">{ord.transaction_id}</strong>
                          </span>
                        )}
                        <span>•</span>
                        <span className="font-black text-white text-xs">৳{(ord.total_amount || 0).toLocaleString()}</span>
                        {ord.shipping_city && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 truncate text-[10px]">
                              📍 {ord.shipping_city}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                      
                      {/* Current Status Badge */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isDelivered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isCancelled
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isConfirmed
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : isShipped
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {ord.status}
                      </span>

                      {/* 1-CLICK ORDER CONFIRMATION BUTTON FOR PENDING ORDERS */}
                      {isPending && (
                        <button
                          type="button"
                          disabled={confirmingId === ord.id}
                          onClick={() => handleConfirmOrder(ord)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
                          title="অর্ডারটি কনফার্ম করুন"
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>{confirmingId === ord.id ? 'কনফার্ম হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}</span>
                        </button>
                      )}

                      {/* Confirmed Orders Quick Action: Add Courier */}
                      {isConfirmed && (
                        <button
                          onClick={() => onNavigateTab('orders', 'confirmed')}
                          className="px-2.5 py-1.5 bg-blue-950 hover:bg-blue-900 text-blue-300 text-[11px] font-bold rounded-xl border border-blue-800/60 flex items-center space-x-1 cursor-pointer"
                          title="কুরিয়ার লিংক দিন"
                        >
                          <span>কুরিয়ার দিন</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {/* Invoice Button */}
                      <button
                        onClick={() => onOpenInvoice(ord)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                        title="চালান / ইনভয়েস দেখুন"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low Stock Alerts (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-amber-400 flex items-center uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 mr-1.5" /> Inventory Warnings
            </h3>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-blue-400 hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          {lowStock.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">সকল পণ্যের স্টক পর্যাপ্ত রয়েছে।</p>
          ) : (
            <div className="space-y-2.5">
              {lowStock.map((prod) => (
                <div key={prod.id} className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center space-x-3 text-xs">
                  <img src={prod.thumbnail} alt={prod.title} className="w-10 h-10 rounded-lg object-cover bg-slate-800 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{prod.title}</p>
                    <p className="text-rose-400 font-bold mt-0.5">Only {prod.stock} left in stock</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
