import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
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
  Truck,
  Search,
  Lock
} from 'lucide-react';

export default function AdminDashboard({ onNavigateTab, onOpenInvoice }) {
  const { token, hasPermission } = useAuth();
  const { socket } = useSocket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Total Revenue dropdown period
  const [revenuePeriod, setRevenuePeriod] = useState('all'); // 'today' | 'week' | 'month' | 'year' | 'all'
  // Total Orders dropdown period
  const [ordersPeriod, setOrdersPeriod] = useState('all'); // 'today' | 'week' | 'month' | 'year' | 'all'
  
  // Fulfillment Status Clickable Live Button (Starts from Confirmed)
  const [expandedStatus, setExpandedStatus] = useState(null); // 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | null
  const [statusOrders, setStatusOrders] = useState([]);
  const [loadingStatusOrders, setLoadingStatusOrders] = useState(false);
  
  const [confirmingId, setConfirmingId] = useState(null);
  const [advancingId, setAdvancingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Compact product & order search states for Dashboard
  const [recentSearch, setRecentSearch] = useState('');
  const [drawerSearch, setDrawerSearch] = useState('');

  // Courier Link Modal for Processing orders
  const [editingCourierOrder, setEditingCourierOrder] = useState(null);
  const [savingCourier, setSavingCourier] = useState(false);
  const [courierForm, setCourierForm] = useState({
    courier_name: 'Steadfast Courier',
    consignment_id: '',
    courier_tracking_url: '',
    status: 'Shipped'
  });

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

  // Real-time synchronization with Orders page & Customer store via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdated = (eventData) => {
      fetchStats();
      if (eventData && eventData.order) {
        setStatusOrders(prev => prev.map(o => o.id === eventData.orderId ? eventData.order : o));
      }
    };

    const handleNewOrder = () => {
      fetchStats();
    };

    socket.on('order_status_updated', handleStatusUpdated);
    socket.on('new_order', handleNewOrder);

    return () => {
      socket.off('order_status_updated', handleStatusUpdated);
      socket.off('new_order', handleNewOrder);
    };
  }, [socket]);

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

  // 1-Click In-Place Order Confirmation (moves Pending -> Confirmed)
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
        
        // Optimistically update recent orders queue (order becomes Confirmed, so pending filter drops it!)
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
          if (expandedStatus === 'Confirmed') {
            return [{ ...order, status: 'Confirmed' }, ...prev];
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

  // Status Flow Progression: Confirmed -> Processing, Shipped -> Delivered
  const handleAdvanceStatus = async (order, nextStatus, noteText) => {
    setAdvancingId(order.id);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: nextStatus,
          note: noteText || `Order status updated to ${nextStatus}`
        })
      });
      const resData = await res.json();
      if (resData.success) {
        const msg = nextStatus === 'Processing'
          ? `অর্ডার #${order.order_code} প্রসেসিং-এ পাঠানো হয়েছে!`
          : nextStatus === 'Shipped'
          ? `অর্ডার #${order.order_code} সফলভাবে শিপড-এ পাঠানো হয়েছে!`
          : nextStatus === 'Delivered'
          ? `অর্ডার #${order.order_code} সফলভাবে ডেলিভার্ড সম্পন্ন হয়েছে!`
          : `অর্ডার #${order.order_code} স্ট্যাটাস ${nextStatus} এ আপডেট হয়েছে!`;
        showToast(msg);

        // Remove from current active status drawer since it transitioned away!
        setStatusOrders(prev => prev.filter(o => o.id !== order.id));

        fetchStats();
      } else {
        alert(resData.message || 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      console.error('Error advancing status:', err);
      alert('স্ট্যাটাস আপডেট করার সময় ত্রুটি ঘটেছে');
    } finally {
      setAdvancingId(null);
    }
  };

  // Open Courier Modal for Processing Order
  const handleOpenCourierModal = (order) => {
    setEditingCourierOrder(order);
    setCourierForm({
      courier_name: order.courier_name || 'Steadfast Courier',
      consignment_id: order.consignment_id || '',
      courier_tracking_url: order.courier_tracking_url || order.tracking_url || '',
      status: 'Processing'
    });
  };

  // Save Courier details (Supports staying in Processing or advancing to Shipped)
  const handleSaveCourier = async (e) => {
    e.preventDefault();
    if (!editingCourierOrder) return;
    setSavingCourier(true);

    const chosenStatus = courierForm.status || 'Processing';

    try {
      const res = await fetch(`/api/orders/${editingCourierOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: chosenStatus,
          courier_name: courierForm.courier_name,
          consignment_id: courierForm.consignment_id,
          courier_tracking_url: courierForm.courier_tracking_url,
          note: chosenStatus === 'Shipped'
            ? `Courier dispatched with ${courierForm.courier_name} (${courierForm.consignment_id || 'N/A'})`
            : `Courier assigned: ${courierForm.courier_name} (${courierForm.consignment_id || 'N/A'})`
        })
      });
      const resData = await res.json();
      if (resData.success) {
        showToast(
          chosenStatus === 'Shipped'
            ? `কুরিয়ার লিংক যুক্ত হয়েছে এবং অর্ডার #${editingCourierOrder.order_code} শিপ করা হয়েছে!`
            : `অর্ডার #${editingCourierOrder.order_code}-এ কুরিয়ার তথ্য সফলভাবে সংরক্ষিত হয়েছে!`
        );
        
        // If advanced to Shipped, remove from Processing drawer
        if (chosenStatus !== 'Processing') {
          setStatusOrders(prev => prev.filter(o => o.id !== editingCourierOrder.id));
        } else {
          // Otherwise update order in place in statusOrders
          setStatusOrders(prev => prev.map(o => o.id === editingCourierOrder.id ? resData.order : o));
        }

        fetchStats();
        setEditingCourierOrder(null);
      } else {
        alert(resData.message || 'কুরিয়ার লিংক সংরক্ষণ করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      console.error('Error saving courier details:', err);
      alert('কুরিয়ার লিংক সংরক্ষণে ত্রুটি ঘটেছে');
    } finally {
      setSavingCourier(false);
    }
  };

  const stats = data?.stats || {};
  const recentOrders = data?.recent_orders || [];
  const pendingRecentOrders = recentOrders.filter(o => (o.status || '').toLowerCase() === 'pending');
  const lowStock = data?.low_stock_products || [];

  // Instant real-time search filtering by product title, order code, or customer
  const filteredPendingRecentOrders = useMemo(() => {
    if (!recentSearch.trim()) return pendingRecentOrders;
    const q = recentSearch.trim().toLowerCase();
    return pendingRecentOrders.filter(o =>
      (o.order_code || '').toLowerCase().includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.customer_phone || '').toLowerCase().includes(q) ||
      (Array.isArray(o.items) && o.items.some(it => (it.title || '').toLowerCase().includes(q)))
    );
  }, [pendingRecentOrders, recentSearch]);

  const filteredStatusOrders = useMemo(() => {
    if (!drawerSearch.trim()) return statusOrders;
    const q = drawerSearch.trim().toLowerCase();
    return statusOrders.filter(o =>
      (o.order_code || '').toLowerCase().includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.customer_phone || '').toLowerCase().includes(q) ||
      (Array.isArray(o.items) && o.items.some(it => (it.title || '').toLowerCase().includes(q)))
    );
  }, [statusOrders, drawerSearch]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span>অ্যানালিটিক্স ও ড্যাশবোর্ড তথ্য লোড হচ্ছে...</span>
      </div>
    );
  }

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

  // Determine Orders Count based on selected dropdown period
  const ordersBreakdown = stats.orders_by_period || {};
  let displayedOrders = stats.total_orders || 0;
  let ordersPeriodLabel = 'সর্বমোট লাইফটাইম অর্ডার';

  if (ordersPeriod === 'today') {
    displayedOrders = ordersBreakdown.today !== undefined ? ordersBreakdown.today : 0;
    ordersPeriodLabel = 'আজকের দিনের মোট অর্ডার (Today / 24h)';
  } else if (ordersPeriod === 'week') {
    displayedOrders = ordersBreakdown.week !== undefined ? ordersBreakdown.week : 0;
    ordersPeriodLabel = 'গত ৭ দিনের মোট অর্ডার (This Week)';
  } else if (ordersPeriod === 'month') {
    displayedOrders = ordersBreakdown.month !== undefined ? ordersBreakdown.month : 0;
    ordersPeriodLabel = 'চলতি মাসের মোট অর্ডার (This Month)';
  } else if (ordersPeriod === 'year') {
    displayedOrders = ordersBreakdown.year !== undefined ? ordersBreakdown.year : 0;
    ordersPeriodLabel = 'চলতি বছরের মোট অর্ডার (This Year)';
  }

  // Fulfillment status config: Starts strictly from Confirmed (Pending is handled in Recent Queue)
  const statusCardConfig = [
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
        {hasPermission('dashboard.revenue') ? (
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
        ) : (
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/60 shadow-xl flex flex-col justify-between space-y-3 relative opacity-75">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Financial Revenue
              </span>
              <div className="p-2 rounded-xl bg-slate-800 text-slate-500 border border-slate-700">
                <Lock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-400 tracking-tight">
                টাকার হিসাব সংরক্ষিত
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">রেভিনিউ দেখার অনুমতি দেওয়া হয়নি</p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-600 font-semibold">
              🔒 শুধুমাত্র সুপার অ্যাডমিন অ্যাক্সেস
            </div>
          </div>
        )}

        {/* TOTAL ORDERS CARD WITH DEDICATED FULL-WIDTH DROPDOWN (NO OVERLAP) */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-3 relative group">
          
          {/* Header Row: Label on Left, Icon on Right */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Orders (মোট অর্ডার)
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>

          {/* Orders Count & Selected Period Indicator */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-blue-400 font-mono tracking-tight">
              {Number(displayedOrders || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mr-1.5"></span>
              {ordersPeriodLabel}
            </p>
          </div>

          {/* Dedicated Full-Width Period Dropdown (Guaranteed Zero Overlap) */}
          <div className="pt-2 border-t border-slate-800/80">
            <select
              value={ordersPeriod}
              onChange={(e) => setOrdersPeriod(e.target.value)}
              className="w-full bg-slate-800 hover:bg-slate-750 text-blue-300 font-bold text-xs py-2 px-3 rounded-xl border border-blue-500/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer transition-all block"
            >
              <option value="today" className="bg-slate-900 text-white">📅 আজকের দিন (Today / 24h)</option>
              <option value="week" className="bg-slate-900 text-white">📅 এই সপ্তাহ (Last 7 Days)</option>
              <option value="month" className="bg-slate-900 text-white">📅 এই মাস (30 Days)</option>
              <option value="year" className="bg-slate-900 text-white">📅 এই বছর (This Year)</option>
              <option value="all" className="bg-slate-900 text-white">🌟 সর্বমোট (All Time)</option>
            </select>
          </div>
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
            <strong className="text-amber-400 font-mono font-bold text-xs">{stats.low_stock_count || 0}</strong> টি পণ্যে স্টক অ্যালার্ট
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

      {/* INTERACTIVE FULFILLMENT STATUS BREAKDOWN CARDS (LIVE BUTTONS - STICKY) */}
      <div className="sticky top-[88px] md:top-[68px] z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl space-y-3">
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

        {/* 5 Interactive Status Cards (Starting strictly from Confirmed) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
          {statusCardConfig.map((item) => {
            const isSelected = expandedStatus?.toLowerCase() === item.id.toLowerCase();
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggleStatus(item.id)}
                className={`p-3 rounded-xl sm:rounded-2xl border text-center transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 relative group ${
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
                <span className="text-xl sm:text-2xl font-black text-white mt-1 block font-mono">
                  {item.count}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 sm:mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  {isSelected ? 'তালিকা দেখাচ্ছে ▼' : 'ক্লিক করে দেখুন ➔'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DEDICATED FULFILLMENT STATUS ORDERS LIST (OPENS WHEN STATUS BUTTON IS CLICKED) */}
      {expandedStatus && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl animate-in fade-in space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  {expandedStatus} Orders ({statusOrders.length})
                </h4>
                <span className="text-xs text-slate-400">
                  — নির্বাচিত স্ট্যাটাসের অর্ডারসমূহ (পরবর্তী ধাপে পাঠানোর বোতাম সক্রিয়)
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Compact search bar for products and orders in drawer */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="পণ্য বা কোড খুঁজুন..."
                    value={drawerSearch}
                    onChange={(e) => setDrawerSearch(e.target.value)}
                    className="pl-7 pr-2.5 py-1 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 w-36 sm:w-44"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                </div>

                <button
                  onClick={() => onNavigateTab('orders', expandedStatus.toLowerCase())}
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                >
                  <span>Orders এ দেখুন</span>
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
            ) : filteredStatusOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl">
                "{drawerSearch}" দিয়ে কোনো পণ্য বা অর্ডার পাওয়া যায়নি।
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredStatusOrders.map((ord) => {
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
                          {ord.courier_name && <span className="text-emerald-400">• 🚚 {ord.courier_name}</span>}
                        </div>

                        {/* Ordered Products & Quantity (Same Vertical Photo Stack as Order & Trace) */}
                        {Array.isArray(ord.items) && ord.items.length > 0 && (
                          <div className="pt-2">
                            <div className="text-[10px] text-amber-400 font-bold flex items-center mb-1.5">
                              <ShoppingBag className="w-3.5 h-3.5 mr-1 text-amber-400" />
                              <span>অর্ডারকৃত পণ্য ও পরিমাণ (<strong className="text-amber-400 font-mono font-black">{ord.items.length}</strong> টি):</span>
                            </div>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 max-w-md">
                              {ord.items.map((it, idx) => (
                                <div key={idx} className="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800 shadow-xs">
                                  {it.thumbnail ? (
                                    <img 
                                      src={it.thumbnail} 
                                      alt={it.title} 
                                      className="w-7 h-7 rounded-lg object-cover flex-shrink-0 border border-slate-700" 
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700 text-amber-400">
                                      <ShoppingBag className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-bold text-white truncate leading-tight" title={it.title}>
                                      {it.title}
                                    </p>
                                    <div className="text-[10px] text-slate-300 flex items-center space-x-1.5 mt-0.5">
                                      <span className="text-amber-400 font-mono font-black">×{it.quantity || 1} টি</span>
                                      <span className="text-slate-600">•</span>
                                      <span className="text-slate-400 font-mono">৳{(it.price || 0).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Confirmed stage -> Advance to Processing */}
                        {ord.status === 'Confirmed' && (
                          <button
                            type="button"
                            disabled={advancingId === ord.id}
                            onClick={() => handleAdvanceStatus(ord, 'Processing', 'Sent to Processing & Packaging')}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                            title="অর্ডারটি প্রসেসিং-এ পাঠান"
                          >
                            <span>{advancingId === ord.id ? 'পাঠানো হচ্ছে...' : 'প্রসেসিং-এ পাঠান ➔'}</span>
                          </button>
                        )}

                        {/* Processing stage -> Courier link + 1-Click Ship */}
                        {ord.status === 'Processing' && (
                          <div className="flex items-center space-x-2">
                            {(ord.courier_tracking_url || ord.tracking_url) ? (
                              <div className="flex items-center space-x-1.5">
                                <a
                                  href={ord.courier_tracking_url || ord.tracking_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-800 text-xs font-bold rounded-xl flex items-center space-x-1"
                                >
                                  <Truck className="w-3 h-3 text-amber-400" />
                                  <span>Live Courier Link</span>
                                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleOpenCourierModal(ord)}
                                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                                >
                                  এডিট
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenCourierModal(ord)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                                title="কুরিয়ার পার্টনার ও ট্র্যাকিং লিংক যুক্ত করুন"
                              >
                                <Truck className="w-3.5 h-3.5 text-slate-950" />
                                <span>+ কুরিয়ার লিংক দিন</span>
                              </button>
                            )}

                            {/* 1-Click Advance to Shipped: Always available */}
                            <button
                              type="button"
                              disabled={advancingId === ord.id}
                              onClick={() => handleAdvanceStatus(ord, 'Shipped', 'Dispatched to Courier')}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-black rounded-xl shadow-lg shadow-sky-600/30 flex items-center space-x-1 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                              title="অর্ডারটি শিপড-এ পাঠান"
                            >
                              <Truck className="w-3.5 h-3.5 text-white" />
                              <span>{advancingId === ord.id ? 'পাঠানো হচ্ছে...' : 'শিপড-এ পাঠান ➔'}</span>
                            </button>
                          </div>
                        )}

                        {/* Shipped stage -> Show Tracking Link & Complete Delivery */}
                        {ord.status === 'Shipped' && (
                          <>
                            {ord.courier_tracking_url && (
                              <a
                                href={ord.courier_tracking_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 text-xs font-bold rounded-xl flex items-center space-x-1"
                                title="লাইভ ট্র্যাকিং দেখুন"
                              >
                                <Truck className="w-3 h-3" />
                                <span>ট্র্যাকিং</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              disabled={advancingId === ord.id}
                              onClick={() => handleAdvanceStatus(ord, 'Delivered', 'Marked Delivered by Admin')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                              title="ডেলিভারি সম্পন্ন চিহ্নিত করুন"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{advancingId === ord.id ? 'সম্পন্ন হচ্ছে...' : 'ডেলিভারি সম্পন্ন ✓'}</span>
                            </button>
                          </>
                        )}

                        {/* Delivered stage -> Show Delivered badge & Tracking link */}
                        {ord.status === 'Delivered' && (
                          <>
                            {ord.courier_tracking_url && (
                              <a
                                href={ord.courier_tracking_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1"
                              >
                                <span>ট্র্যাকিং</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center space-x-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>ডেলিভার্ড</span>
                            </span>
                          </>
                        )}

                        {/* Invoice Button */}
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

      {/* RECENT ORDERS QUEUE (SEPARATE & PERMANENT) + LOW STOCK WARNINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders Queue (8 cols) - STRICTLY DEDICATED TO NEW PENDING ORDERS */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Recent Orders Queue ({pendingRecentOrders.length})
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  ইনকামিং কিউ (পেন্ডিং)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                শুধুমাত্র নতুন অপেক্ষমান (Pending) অর্ডার — কনফার্ম করলে তাৎক্ষণিকভাবে কিউ থেকে সরে যাবে
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Compact search bar for products and orders in queue */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="পণ্য বা কোড খুঁজুন..."
                  value={recentSearch}
                  onChange={(e) => setRecentSearch(e.target.value)}
                  className="pl-7 pr-2.5 py-1.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 w-36 sm:w-48"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
              </div>

              <button
                onClick={() => onNavigateTab('orders', 'all')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer whitespace-nowrap"
              >
                <span>Full Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {pendingRecentOrders.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mx-auto" />
              <p className="text-xs text-slate-300 font-bold">কোনো নতুন অপেক্ষমান (পেন্ডিং) অর্ডার নেই</p>
              <p className="text-[11px] text-slate-500">সকল ইনকামিং অর্ডার সফলভাবে কনফার্ম ও প্রসেস করা হয়েছে</p>
            </div>
          ) : filteredPendingRecentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl">
              "{recentSearch}" দিয়ে কোনো পণ্য বা অপেক্ষমান অর্ডার পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPendingRecentOrders.map((ord) => {
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
                    className="p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 border-amber-900/50 hover:border-amber-600/60 shadow-lg shadow-amber-950/20"
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

                      {/* Ordered Products & Quantity (Same Vertical Photo Stack as Order & Trace) */}
                      {Array.isArray(ord.items) && ord.items.length > 0 && (
                        <div className="pt-2">
                          <div className="text-[10px] text-amber-400 font-bold flex items-center mb-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 mr-1 text-amber-400" />
                            <span>অর্ডারকৃত পণ্য ও পরিমাণ (<strong className="text-amber-400 font-mono font-black">{ord.items.length}</strong> টি):</span>
                          </div>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 max-w-md">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800 shadow-xs">
                                {it.thumbnail ? (
                                  <img 
                                    src={it.thumbnail} 
                                    alt={it.title} 
                                    className="w-7 h-7 rounded-lg object-cover flex-shrink-0 border border-slate-700" 
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700 text-amber-400">
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-[11px] font-bold text-white truncate leading-tight" title={it.title}>
                                    {it.title}
                                  </p>
                                  <div className="text-[10px] text-slate-300 flex items-center space-x-1.5 mt-0.5">
                                    <span className="text-amber-400 font-mono font-black">×{it.quantity || 1} টি</span>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-slate-400 font-mono">৳{(it.price || 0).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                      
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {ord.status}
                      </span>

                      {/* 1-CLICK ORDER CONFIRMATION BUTTON */}
                      <button
                        type="button"
                        disabled={confirmingId === ord.id}
                        onClick={() => handleConfirmOrder(ord)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
                        title="অর্ডারটি কনফার্ম করুন"
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>{confirmingId === ord.id ? 'কনফার্ম হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}</span>
                      </button>

                      {/* Invoice Button */}
                      <button
                        onClick={() => onOpenInvoice(ord)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
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
            <p className="text-xs text-slate-500 py-6 text-center">সকল পণ্যের স্টক পর্যাপ্ত রয়েছে (১০ টির বেশি)।</p>
          ) : (
            <div className="space-y-2.5">
              {lowStock.map((prod) => (
                <div key={prod.id} className="p-3 bg-slate-800/50 hover:bg-slate-800/80 transition-colors rounded-2xl border border-slate-800 flex items-center space-x-3 text-xs">
                  <img src={prod.thumbnail} alt={prod.title} className="w-11 h-11 rounded-xl object-cover bg-slate-900 border border-slate-700/80 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate text-[12px]">{prod.title}</p>
                    <div className="mt-1 flex items-center space-x-2">
                      {prod.stock <= 0 ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          ❌ স্টক আউট (০ টি)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ⚠️ স্টক অ্যালার্ট: আর মাত্র <strong className="font-mono font-black text-amber-300">{prod.stock}</strong> টি আছে
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COURIER LINK MODAL FOR PROCESSING ORDERS */}
      {editingCourierOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-amber-400" /> Courier Tracking Link Integration
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Order #{editingCourierOrder.order_code} for {editingCourierOrder.customer_name}</p>
              </div>
              <button
                onClick={() => setEditingCourierOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourier} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">কুরিয়ার কোম্পানির নাম *</label>
                <select
                  value={courierForm.courier_name}
                  onChange={(e) => setCourierForm({ ...courierForm, courier_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Steadfast Courier">Steadfast Courier</option>
                  <option value="RedX Logistics">RedX Logistics</option>
                  <option value="Pathao Courier">Pathao Courier</option>
                  <option value="Paperfly">Paperfly</option>
                  <option value="eCourier">eCourier</option>
                  <option value="Sundarban Courier">Sundarban Courier</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Consignment ID / ট্র্যাকিং নম্বর</label>
                <input
                  type="text"
                  placeholder="যেমন: SF-88301948 অথবা REDX-12345"
                  value={courierForm.consignment_id}
                  onChange={(e) => setCourierForm({ ...courierForm, consignment_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">কুরিয়ার লাইভ ট্র্যাকিং ওয়েব লিংক (URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://steadfast.com.bd/t/SF88301948 অথবা https://redx.com.bd/track/..."
                  value={courierForm.courier_tracking_url}
                  onChange={(e) => setCourierForm({ ...courierForm, courier_tracking_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                />
                <span className="text-[10px] text-amber-400 mt-1 block">
                  গ্রাহক তার ড্যাশবোর্ড ও ট্রেস পেজে এই লিংকে সরাসরি ক্লিক করে লাইভ পার্সেল দেখতে পারবেন!
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">ফুলফিলমেন্ট স্ট্যাটাস</label>
                <select
                  value={courierForm.status || 'Processing'}
                  onChange={(e) => setCourierForm({ ...courierForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Processing">Processing (প্যাকেজিং চলছে ও কুরিয়ার লিংক সংযুক্ত)</option>
                  <option value="Shipped">Shipped (কুরিয়ারে হস্তান্তর ও ডিসপ্যাচ)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingCourierOrder(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingCourier}
                  className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  {savingCourier 
                    ? 'সংরক্ষণ হচ্ছে...' 
                    : courierForm.status === 'Shipped' 
                    ? 'কুরিয়ার লিংক সংরক্ষণ ও শিপ করুন' 
                    : 'কুরিয়ার লিংক সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
