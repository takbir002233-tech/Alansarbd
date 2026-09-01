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
  ShieldAlert
} from 'lucide-react';

export default function AdminDashboard({ onNavigateTab, onOpenInvoice }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading analytics data...</div>;
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recent_orders || [];
  const lowStock = data?.low_stock_products || [];

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Platform Overview</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Admin Control & Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time metrics, revenue, and order dispatch monitoring</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center space-x-1.5"
          >
            <Package className="w-4 h-4" />
            <span>Manage Orders</span>
          </button>
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Revenue */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
            ৳{(stats.total_revenue || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-400 font-semibold">Verified non-cancelled sales</p>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats.total_orders || 0}
          </h3>
          <p className="text-[11px] text-amber-400 font-semibold">
            {stats.pending_orders || 0} pending verification
          </p>
        </div>

        {/* Total Products */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
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
            {stats.low_stock_count || 0} low stock items
          </p>
        </div>

        {/* Total Users */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
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
            {stats.blocked_users_count || 0} suspended accounts
          </p>
        </div>
      </div>

      {/* Order Status Breakdown Badges */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fulfillment Status Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-2xl text-center">
            <span className="text-xs font-bold text-amber-400 block">Pending</span>
            <span className="text-xl font-black text-white mt-1 block">{stats.pending_orders || 0}</span>
          </div>
          <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-2xl text-center">
            <span className="text-xs font-bold text-blue-400 block">Confirmed</span>
            <span className="text-xl font-black text-white mt-1 block">{stats.confirmed_orders || 0}</span>
          </div>
          <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-2xl text-center">
            <span className="text-xs font-bold text-indigo-400 block">Processing</span>
            <span className="text-xl font-black text-white mt-1 block">{stats.processing_orders || 0}</span>
          </div>
          <div className="p-3 bg-sky-950/40 border border-sky-800/40 rounded-2xl text-center">
            <span className="text-xs font-bold text-sky-400 block">Shipped (On Way)</span>
            <span className="text-xl font-black text-white mt-1 block">{stats.shipped_orders || 0}</span>
          </div>
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl text-center">
            <span className="text-xs font-bold text-emerald-400 block">Delivered</span>
            <span className="text-xl font-black text-white mt-1 block">{stats.delivered_orders || 0}</span>
          </div>
          <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-2xl text-center">
            <span className="text-xs font-bold text-rose-400 block">Cancelled</span>
            <span className="text-xl font-black text-white mt-1 block">{stats.cancelled_orders || 0}</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Orders Queue</h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-blue-400 hover:underline"
            >
              View Full List
            </button>
          </div>

          <div className="space-y-3">
            {recentOrders.map((ord) => (
              <div key={ord.id} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black font-mono text-blue-400">#{ord.order_code}</span>
                    <span className="text-xs font-bold text-white">{ord.customer_name}</span>
                    <span className="text-xs text-slate-400">({ord.customer_phone})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                    <span className="uppercase font-bold text-indigo-400">{ord.payment_method}</span>
                    {ord.transaction_id && <span>TrxID: <strong className="text-slate-200">{ord.transaction_id}</strong></span>}
                    <span>•</span>
                    <span className="font-bold text-white">৳{ord.total_amount?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    ord.status === 'Delivered'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : ord.status === 'Cancelled'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {ord.status}
                  </span>
                  <button
                    onClick={() => onOpenInvoice(ord)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                    title="View Invoice"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-amber-400 flex items-center uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 mr-1.5" /> Inventory Warnings
            </h3>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-blue-400 hover:underline"
            >
              Manage
            </button>
          </div>

          {lowStock.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">All products have healthy stock levels.</p>
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
