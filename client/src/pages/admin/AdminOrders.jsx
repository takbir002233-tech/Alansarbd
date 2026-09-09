import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Edit,
  X
} from 'lucide-react';

export default function AdminOrders({ onOpenInvoice }) {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [copiedTrx, setCopiedTrx] = useState(null);

  // Courier Link Assignment Modal State
  const [editingCourierOrder, setEditingCourierOrder] = useState(null);
  const [courierForm, setCourierForm] = useState({
    status: 'Shipped',
    courier_name: 'Steadfast Courier',
    consignment_id: '',
    courier_tracking_url: '',
    note: ''
  });
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/api/orders?`;
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (paymentFilter !== 'all') url += `payment_method=${paymentFilter}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error loading admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token, statusFilter, paymentFilter]);

  const handleOpenCourierModal = (order) => {
    setEditingCourierOrder(order);
    setCourierForm({
      status: order.status,
      courier_name: order.courier_name || 'Steadfast Courier',
      consignment_id: order.consignment_id || '',
      courier_tracking_url: order.courier_tracking_url || '',
      note: `Courier dispatched with ${order.courier_name || 'Steadfast'}`
    });
  };

  const handleSaveCourierDetails = async (e) => {
    e.preventDefault();
    if (!editingCourierOrder) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/orders/${editingCourierOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(courierForm)
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev =>
          prev.map(o => (o.id === editingCourierOrder.id ? data.order : o))
        );
        setEditingCourierOrder(null);
      }
    } catch (err) {
      console.error('Error saving courier link:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          note: `Status updated to ${newStatus} by Admin`
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? data.order : o))
        );
      }
    } catch (err) {
      console.error('Status change error:', err);
    }
  };

  const copyTrx = (trx) => {
    navigator.clipboard.writeText(trx);
    setCopiedTrx(trx);
    setTimeout(() => setCopiedTrx(null), 2000);
  };

  const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Fulfillment & Logistics</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Orders & Courier Link Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Verify TrxIDs, assign Steadfast/RedX/Pathao tracking links, and manage dispatches</p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
        >
          Refresh Orders
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search by Code, Customer, TrxID, Consignment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center space-x-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-800 text-white">All Statuses</option>
              {statuses.map(s => (
                <option key={s} value={s.toLowerCase()} className="bg-slate-800 text-white">{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-800 text-white">All Payments</option>
              <option value="bkash" className="bg-slate-800 text-white">bKash</option>
              <option value="nagad" className="bg-slate-800 text-white">Nagad</option>
              <option value="rocket" className="bg-slate-800 text-white">Rocket</option>
              <option value="upay" className="bg-slate-800 text-white">Upay</option>
              <option value="cellfin" className="bg-slate-800 text-white">Cellfin</option>
              <option value="bank" className="bg-slate-800 text-white">Bank Transfer</option>
              <option value="cod" className="bg-slate-800 text-white">Cash on Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Package className="w-12 h-12 text-slate-700 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No orders match criteria</h4>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-4">Order Code & Date</th>
                  <th className="p-4">Customer & Location</th>
                  <th className="p-4">Payment & TrxID</th>
                  <th className="p-4">Courier Link & Consignment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Code & Date */}
                    <td className="p-4 align-top">
                      <span className="font-mono font-bold text-amber-400 block text-xs">
                        #{order.order_code}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-GB')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="p-4 align-top max-w-xs">
                      <p className="font-bold text-white text-xs">{order.customer_name}</p>
                      <p className="text-slate-400 font-mono text-[11px] mt-0.5">{order.customer_phone}</p>
                      <p className="text-slate-400 text-[11px] mt-1 leading-snug">
                        {order.shipping_address}, <strong className="text-slate-300">{order.shipping_city}</strong>
                      </p>
                      {order.notes && (
                        <p className="text-[10px] text-amber-400/80 italic mt-1">Gift Note: "{order.notes}"</p>
                      )}
                    </td>

                    {/* Payment & TrxID */}
                    <td className="p-4 align-top">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          order.payment_method === 'bkash'
                            ? 'bg-pink-950 text-pink-400 border border-pink-800'
                            : order.payment_method === 'nagad'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : order.payment_method === 'rocket'
                            ? 'bg-purple-950 text-purple-400 border border-purple-800'
                            : order.payment_method === 'upay'
                            ? 'bg-sky-950 text-sky-400 border border-sky-800'
                            : order.payment_method === 'cellfin'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : order.payment_method === 'bank'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {order.payment_method}
                        </span>

                        {order.sender_number ? (
                          <p className="text-[10px] text-slate-400 font-mono">
                            From: <span className="text-slate-200 font-bold">{order.sender_number}</span>
                          </p>
                        ) : null}

                        {order.transaction_id ? (
                          <div className="flex items-center space-x-1.5 mt-1">
                            <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-[11px]">
                              {order.transaction_id}
                            </span>
                            <button
                              onClick={() => copyTrx(order.transaction_id)}
                              className="text-slate-400 hover:text-white p-1"
                              title="Copy TrxID"
                            >
                              {copiedTrx === order.transaction_id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ) : null}

                        <p className="text-xs font-black text-white mt-1">
                          ৳{order.total_amount?.toLocaleString()}
                        </p>
                      </div>
                    </td>

                    {/* COURIER LINK & CONSIGNMENT COLUMN */}
                    <td className="p-4 align-top max-w-xs">
                      {order.courier_tracking_url ? (
                        <div className="space-y-1.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
                          <p className="text-[11px] font-bold text-emerald-400 flex items-center">
                            <Truck className="w-3.5 h-3.5 mr-1" /> {order.courier_name || 'Courier'}
                          </p>
                          {order.consignment_id && (
                            <p className="text-[10px] font-mono text-slate-300">
                              ID: {order.consignment_id}
                            </p>
                          )}
                          <a
                            href={order.courier_tracking_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-amber-400 hover:underline flex items-center"
                          >
                            <span>Live Courier Link</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenCourierModal(order)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold rounded-lg border border-amber-900/40 flex items-center space-x-1"
                        >
                          <Truck className="w-3 h-3 text-amber-400" />
                          <span>+ Add Courier Link</span>
                        </button>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-4 align-top">
                      <select
                        value={order.status}
                        onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                          order.status === 'Confirmed'
                            ? 'bg-blue-950 text-blue-300 border-blue-700'
                            : order.status === 'Processing'
                            ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                            : order.status === 'Shipped'
                            ? 'bg-amber-950 text-amber-300 border-amber-700'
                            : order.status === 'Delivered'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            : order.status === 'Cancelled'
                            ? 'bg-rose-950 text-rose-300 border-rose-700'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {statuses.map(s => (
                          <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="p-4 align-top text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenCourierModal(order)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl"
                          title="Assign Courier Partner & Link"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenInvoice(order)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1 border border-slate-700"
                          title="Print / View Invoice"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400" />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Courier Assignment Modal */}
      {editingCourierOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 text-white animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-amber-400" /> Courier Tracking Link Integration
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Order #{editingCourierOrder.order_code} for {editingCourierOrder.customer_name}</p>
              </div>
              <button
                onClick={() => setEditingCourierOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourierDetails} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Courier Partner Name *</label>
                <select
                  value={courierForm.courier_name}
                  onChange={(e) => setCourierForm({ ...courierForm, courier_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
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
                <label className="text-xs font-bold text-slate-300 block mb-1">Consignment ID / Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. SF-88301948 or REDX-12345"
                  value={courierForm.consignment_id}
                  onChange={(e) => setCourierForm({ ...courierForm, consignment_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Direct Courier Tracking Web Link (URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://steadfast.com.bd/t/SF88301948 or https://redx.com.bd/track/..."
                  value={courierForm.courier_tracking_url}
                  onChange={(e) => setCourierForm({ ...courierForm, courier_tracking_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                />
                <span className="text-[10px] text-amber-400 mt-1 block">
                  Customer will see a direct "Track on Courier Website" button linking to this URL!
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Fulfillment Status</label>
                <select
                  value={courierForm.status}
                  onChange={(e) => setCourierForm({ ...courierForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Processing">Processing (Packaging)</option>
                  <option value="Shipped">Shipped (Handed to Courier)</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingCourierOrder(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-slate-950 font-black text-xs rounded-xl shadow-lg"
                >
                  {updating ? 'Saving...' : 'Save & Publish Courier Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
