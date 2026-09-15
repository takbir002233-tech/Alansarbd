import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { 
  Package, 
  ShoppingBag,
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
  X,
  MapPin,
  Sparkles,
  LayoutGrid,
  ListFilter,
  CheckCheck
} from 'lucide-react';

// Bangladesh 8 Divisions in Alphabetical Sequence with FULL BOX Color Themes
const DIVISION_CONFIGS = [
  {
    id: 'barishal',
    letter: 'B',
    nameEn: 'Barishal',
    nameBn: 'বরিশাল বিভাগ',
    keywords: ['barishal', 'বরিশাল', 'barguna', 'বরগুনা', 'bhola', 'ভোলা', 'jhalokati', 'jhalakati', 'ঝালকাঠি', 'patuakhali', 'পটুয়াখালী', 'pirojpur', 'পিরোজপুর'],
    theme: {
      letterBg: 'bg-blue-600 text-white border-2 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]',
      boxBorder: 'border-2 border-blue-500/80 shadow-[0_0_35px_rgba(59,130,246,0.25)]',
      boxBg: 'bg-gradient-to-b from-blue-950/80 via-blue-950/50 to-slate-950',
      headerBg: 'bg-blue-900/60 border-b border-blue-700/60',
      titleColor: 'text-blue-300 font-black',
      badgeBg: 'bg-blue-500/30 text-blue-200 border border-blue-400/50',
      accentDot: 'bg-blue-400 shadow-blue-400 shadow',
      tableHeadBg: 'bg-blue-950/90 text-blue-200 border-b border-blue-800/80',
      rowHover: 'divide-blue-800/40 hover:bg-blue-900/25',
      codeColor: 'text-blue-400'
    }
  },
  {
    id: 'chattogram',
    letter: 'C',
    nameEn: 'Chattogram',
    nameBn: 'চট্টগ্রাম বিভাগ',
    keywords: ['chattogram', 'chittagong', 'চট্টগ্রাম', 'coxsbazar', "cox's bazar", 'কক্সবাজার', 'cumilla', 'comilla', 'কুমিল্লা', 'brahmanbaria', 'ব্রাহ্মণবাড়িয়া', 'chandpur', 'চাঁদপুর', 'noakhali', 'নোয়াখালী', 'feni', 'ফেনী', 'lakshmipur', 'লক্ষ্মীপুর', 'rangamati', 'রাঙ্গামাটি', 'bandarban', 'বান্দরবান', 'khagrachhari', 'খাগড়াছড়ি'],
    theme: {
      letterBg: 'bg-teal-600 text-white border-2 border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.6)]',
      boxBorder: 'border-2 border-teal-500/80 shadow-[0_0_35px_rgba(20,184,166,0.25)]',
      boxBg: 'bg-gradient-to-b from-teal-950/80 via-teal-950/50 to-slate-950',
      headerBg: 'bg-teal-900/60 border-b border-teal-700/60',
      titleColor: 'text-teal-300 font-black',
      badgeBg: 'bg-teal-500/30 text-teal-200 border border-teal-400/50',
      accentDot: 'bg-teal-400 shadow-teal-400 shadow',
      tableHeadBg: 'bg-teal-950/90 text-teal-200 border-b border-teal-800/80',
      rowHover: 'divide-teal-800/40 hover:bg-teal-900/25',
      codeColor: 'text-teal-400'
    }
  },
  {
    id: 'dhaka',
    letter: 'D',
    nameEn: 'Dhaka',
    nameBn: 'ঢাকা বিভাগ',
    keywords: ['dhaka', 'ঢাকা', 'gazipur', 'গাজীপুর', 'narayanganj', 'নারায়ণগঞ্জ', 'tangail', 'টাঙ্গাইল', 'narsingdi', 'নরসিংদী', 'faridpur', 'ফরিদপুর', 'manikganj', 'মানিকগঞ্জ', 'munshiganj', 'মুন্সীগঞ্জ', 'kishoreganj', 'কিশোরগঞ্জ', 'gopalganj', 'গোপালগঞ্জ', 'madaripur', 'মাদারীপুর', 'rajbari', 'রাজবাড়ী', 'shariatpur', 'শরীয়তপুর', 'uttara', 'মিরপুর', 'mirpur', 'dhanmondi', 'ধানমন্ডি', 'gulshan', 'গুলশান', 'banani', 'বনানী'],
    theme: {
      letterBg: 'bg-amber-600 text-white border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)]',
      boxBorder: 'border-2 border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.25)]',
      boxBg: 'bg-gradient-to-b from-amber-950/80 via-amber-950/50 to-slate-950',
      headerBg: 'bg-amber-900/60 border-b border-amber-700/60',
      titleColor: 'text-amber-300 font-black',
      badgeBg: 'bg-amber-500/30 text-amber-200 border border-amber-400/50',
      accentDot: 'bg-amber-400 shadow-amber-400 shadow',
      tableHeadBg: 'bg-amber-950/90 text-amber-200 border-b border-amber-800/80',
      rowHover: 'divide-amber-800/40 hover:bg-amber-900/25',
      codeColor: 'text-amber-400'
    }
  },
  {
    id: 'khulna',
    letter: 'K',
    nameEn: 'Khulna',
    nameBn: 'খুলনা বিভাগ',
    keywords: ['khulna', 'খুলনা', 'jashore', 'jessore', 'যশোর', 'kushtia', 'কুষ্টিয়া', 'satkhira', 'সাতক্ষীরা', 'bagerhat', 'বাগেরহাট', 'chuadanga', 'চুয়াডাঙ্গা', 'meherpur', 'মেহেরপুর', 'jhenaidah', 'ঝিনাইদহ', 'narail', 'নড়াইল', 'magura', 'মাগুরা'],
    theme: {
      letterBg: 'bg-emerald-600 text-white border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)]',
      boxBorder: 'border-2 border-emerald-500/80 shadow-[0_0_35px_rgba(16,185,129,0.25)]',
      boxBg: 'bg-gradient-to-b from-emerald-950/80 via-emerald-950/50 to-slate-950',
      headerBg: 'bg-emerald-900/60 border-b border-emerald-700/60',
      titleColor: 'text-emerald-300 font-black',
      badgeBg: 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50',
      accentDot: 'bg-emerald-400 shadow-emerald-400 shadow',
      tableHeadBg: 'bg-emerald-950/90 text-emerald-200 border-b border-emerald-800/80',
      rowHover: 'divide-emerald-800/40 hover:bg-emerald-900/25',
      codeColor: 'text-emerald-400'
    }
  },
  {
    id: 'mymensingh',
    letter: 'M',
    nameEn: 'Mymensingh',
    nameBn: 'ময়মনসিংহ বিভাগ',
    keywords: ['mymensingh', 'ময়মনসিংহ', 'jamalpur', 'জামালপুর', 'netrokona', 'নেত্রকোণা', 'sherpur', 'শেরপুর'],
    theme: {
      letterBg: 'bg-purple-600 text-white border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.6)]',
      boxBorder: 'border-2 border-purple-500/80 shadow-[0_0_35px_rgba(168,85,247,0.25)]',
      boxBg: 'bg-gradient-to-b from-purple-950/80 via-purple-950/50 to-slate-950',
      headerBg: 'bg-purple-900/60 border-b border-purple-700/60',
      titleColor: 'text-purple-300 font-black',
      badgeBg: 'bg-purple-500/30 text-purple-200 border border-purple-400/50',
      accentDot: 'bg-purple-400 shadow-purple-400 shadow',
      tableHeadBg: 'bg-purple-950/90 text-purple-200 border-b border-purple-800/80',
      rowHover: 'divide-purple-800/40 hover:bg-purple-900/25',
      codeColor: 'text-purple-400'
    }
  },
  {
    id: 'rajshahi',
    letter: 'R',
    nameEn: 'Rajshahi',
    nameBn: 'রাজশাহী বিভাগ',
    keywords: ['rajshahi', 'রাজশাহী', 'bogura', 'bogra', 'বগুড়া', 'pabna', 'পাবনা', 'sirajganj', 'সিরাজগঞ্জ', 'naogaon', 'নওগাঁ', 'natore', 'নাটোর', 'chapainawabganj', 'চাঁপাইনবাবগঞ্জ', 'joypurhat', 'জয়পুরহাট'],
    theme: {
      letterBg: 'bg-orange-600 text-white border-2 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.6)]',
      boxBorder: 'border-2 border-orange-500/80 shadow-[0_0_35px_rgba(249,115,22,0.25)]',
      boxBg: 'bg-gradient-to-b from-orange-950/80 via-orange-950/50 to-slate-950',
      headerBg: 'bg-orange-900/60 border-b border-orange-700/60',
      titleColor: 'text-orange-300 font-black',
      badgeBg: 'bg-orange-500/30 text-orange-200 border border-orange-400/50',
      accentDot: 'bg-orange-400 shadow-orange-400 shadow',
      tableHeadBg: 'bg-orange-950/90 text-orange-200 border-b border-orange-800/80',
      rowHover: 'divide-orange-800/40 hover:bg-orange-900/25',
      codeColor: 'text-orange-400'
    }
  },
  {
    id: 'rangpur',
    letter: 'R',
    nameEn: 'Rangpur',
    nameBn: 'রংপুর বিভাগ',
    keywords: ['rangpur', 'রংপুর', 'dinajpur', 'দিনাজপুর', 'gaibandha', 'গাইবান্ধা', 'kurigram', 'কুড়িগ্রাম', 'lalmonirhat', 'লালমনিরহাট', 'nilphamari', 'নীলফামারী', 'panchagarh', 'পঞ্চগড়', 'thakurgaon', 'ঠাকুরগাঁও'],
    theme: {
      letterBg: 'bg-rose-600 text-white border-2 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]',
      boxBorder: 'border-2 border-rose-500/80 shadow-[0_0_35px_rgba(244,63,94,0.25)]',
      boxBg: 'bg-gradient-to-b from-rose-950/80 via-rose-950/50 to-slate-950',
      headerBg: 'bg-rose-900/60 border-b border-rose-700/60',
      titleColor: 'text-rose-300 font-black',
      badgeBg: 'bg-rose-500/30 text-rose-200 border border-rose-400/50',
      accentDot: 'bg-rose-400 shadow-rose-400 shadow',
      tableHeadBg: 'bg-rose-950/90 text-rose-200 border-b border-rose-800/80',
      rowHover: 'divide-rose-800/40 hover:bg-rose-900/25',
      codeColor: 'text-rose-400'
    }
  },
  {
    id: 'sylhet',
    letter: 'S',
    nameEn: 'Sylhet',
    nameBn: 'সিলেট বিভাগ',
    keywords: ['sylhet', 'সিলেট', 'moulvibazar', 'মৌলভীবাজার', 'habiganj', 'হবিগঞ্জ', 'sunamganj', 'সুনামগঞ্জ'],
    theme: {
      letterBg: 'bg-indigo-600 text-white border-2 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.6)]',
      boxBorder: 'border-2 border-indigo-500/80 shadow-[0_0_35px_rgba(99,102,241,0.25)]',
      boxBg: 'bg-gradient-to-b from-indigo-950/80 via-indigo-950/50 to-slate-950',
      headerBg: 'bg-indigo-900/60 border-b border-indigo-700/60',
      titleColor: 'text-indigo-300 font-black',
      badgeBg: 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/50',
      accentDot: 'bg-indigo-400 shadow-indigo-400 shadow',
      tableHeadBg: 'bg-indigo-950/90 text-indigo-200 border-b border-indigo-800/80',
      rowHover: 'divide-indigo-800/40 hover:bg-indigo-900/25',
      codeColor: 'text-indigo-400'
    }
  }
];

// Helper to determine division from order
function getOrderDivision(order) {
  const cityStr = (order.shipping_city || '').toLowerCase();
  const addrStr = (order.shipping_address || '').toLowerCase();

  // 1. First priority: Check shipping_city directly
  for (const div of DIVISION_CONFIGS) {
    for (const kw of div.keywords) {
      if (kw !== 'inside_dhaka' && cityStr.includes(kw.toLowerCase())) {
        return div;
      }
    }
  }

  // 2. Second priority: Check shipping_address
  for (const div of DIVISION_CONFIGS) {
    for (const kw of div.keywords) {
      if (kw !== 'inside_dhaka' && addrStr.includes(kw.toLowerCase())) {
        return div;
      }
    }
  }

  // 3. Third priority: Check delivery_zone only for inside_dhaka
  if ((order.delivery_zone || '').toLowerCase() === 'inside_dhaka') {
    const dhakaDiv = DIVISION_CONFIGS.find(d => d.id === 'dhaka');
    if (dhakaDiv) return dhakaDiv;
  }

  return {
    id: 'other',
    letter: 'O',
    nameEn: 'Other Locations',
    nameBn: 'অন্যান্য জেলা / আন-অ্যাসাইনড',
    theme: {
      letterBg: 'bg-slate-700 text-white border-2 border-slate-500 shadow-lg',
      boxBorder: 'border-2 border-slate-700 shadow-xl',
      boxBg: 'bg-slate-900',
      headerBg: 'bg-slate-800/80 border-b border-slate-700',
      titleColor: 'text-slate-300 font-black',
      badgeBg: 'bg-slate-800 text-slate-300 border border-slate-700',
      accentDot: 'bg-slate-400',
      tableHeadBg: 'bg-slate-850 text-slate-300 border-b border-slate-700',
      rowHover: 'divide-slate-800 hover:bg-slate-800/40',
      codeColor: 'text-slate-300'
    }
  };
}

export default function AdminOrders({ initialStatus = 'all', onOpenInvoice }) {
  const { token, hasPermission } = useAuth();
  const { socket } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [copiedTrx, setCopiedTrx] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [viewMode, setViewMode] = useState('division'); // 'division' | 'flat'
  const [confirmingId, setConfirmingId] = useState(null);
  const [advancingId, setAdvancingId] = useState(null);

  // Sync initialStatus when changed from dashboard
  useEffect(() => {
    if (initialStatus) {
      setStatusFilter(initialStatus);
    }
  }, [initialStatus]);

  // Courier Link Assignment Modal State
  const [editingCourierOrder, setEditingCourierOrder] = useState(null);
  const [courierForm, setCourierForm] = useState({
    status: 'Processing',
    courier_name: 'Steadfast Courier',
    consignment_id: '',
    courier_tracking_url: '',
    note: ''
  });
  const [updating, setUpdating] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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

  // Real-time synchronization with Dashboard & Store via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdated = (eventData) => {
      if (eventData && eventData.order) {
        setOrders(prev => {
          const exists = prev.some(o => o.id === eventData.orderId);
          if (!exists) return prev;
          if (statusFilter !== 'all' && statusFilter.toLowerCase() !== (eventData.status || '').toLowerCase()) {
            return prev.filter(o => o.id !== eventData.orderId);
          }
          return prev.map(o => o.id === eventData.orderId ? { ...o, ...eventData.order } : o);
        });
      } else {
        fetchOrders();
      }
    };

    const handleNewOrder = () => {
      fetchOrders();
    };

    socket.on('order_status_updated', handleStatusUpdated);
    socket.on('new_order', handleNewOrder);

    return () => {
      socket.off('order_status_updated', handleStatusUpdated);
      socket.off('new_order', handleNewOrder);
    };
  }, [socket, statusFilter]);

  // 1-Click Order Confirmation (Moves order from Pending to Confirmed)
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
          note: 'Order confirmed by Admin in Orders & Trace'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`অর্ডার #${order.order_code} সফলভাবে কনফার্ম করা হয়েছে!`);
        
        // Optimistic update
        setOrders(prev => {
          if (statusFilter === 'pending') {
            return prev.filter(o => o.id !== order.id);
          }
          return prev.map(o => o.id === order.id ? data.order : o);
        });
      } else {
        alert(data.message || 'অর্ডার কনফার্ম করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      console.error('Error confirming order:', err);
      alert('অর্ডার কনফার্ম করার সময় ত্রুটি ঘটেছে');
    } finally {
      setConfirmingId(null);
    }
  };

  // 1-Click Status Progression (Confirmed -> Processing, Shipped -> Delivered)
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
      const data = await res.json();
      if (data.success) {
        const msg = nextStatus === 'Processing'
          ? `অর্ডার #${order.order_code} প্রসেসিং-এ পাঠানো হয়েছে!`
          : nextStatus === 'Delivered'
          ? `অর্ডার #${order.order_code} সফলভাবে ডেলিভার্ড সম্পন্ন হয়েছে!`
          : `অর্ডার #${order.order_code} স্ট্যাটাস ${nextStatus} এ আপডেট হয়েছে!`;
        showToast(msg);

        setOrders(prev => {
          if (statusFilter !== 'all' && statusFilter.toLowerCase() !== nextStatus.toLowerCase()) {
            return prev.filter(o => o.id !== order.id);
          }
          return prev.map(o => o.id === order.id ? data.order : o);
        });
      } else {
        alert(data.message || 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      console.error('Error advancing status:', err);
      alert('স্ট্যাটাস আপডেট করার সময় ত্রুটি ঘটেছে');
    } finally {
      setAdvancingId(null);
    }
  };

  const handleOpenCourierModal = (order) => {
    setEditingCourierOrder(order);
    setCourierForm({
      status: order.status || 'Processing',
      courier_name: order.courier_name || 'Steadfast Courier',
      consignment_id: order.consignment_id || '',
      courier_tracking_url: order.courier_tracking_url || order.tracking_url || '',
      note: `Courier updated for #${order.order_code}`
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
        showToast(`অর্ডার #${editingCourierOrder.order_code} এর কুরিয়ার ট্র্যাকিং লিংক সফলভাবে সংরক্ষিত হয়েছে!`);
        setOrders(prev => {
          if (statusFilter !== 'all' && statusFilter.toLowerCase() !== (courierForm.status || '').toLowerCase()) {
            return prev.filter(o => o.id !== editingCourierOrder.id);
          }
          return prev.map(o => (o.id === editingCourierOrder.id ? data.order : o));
        });
        setEditingCourierOrder(null);
      } else {
        alert(data.message || 'কুরিয়ার লিংক সংরক্ষণ করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      console.error('Error saving courier link:', err);
      alert('কুরিয়ার লিংক সংরক্ষণ করতে ত্রুটি ঘটেছে');
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
        showToast(`স্ট্যাটাস পরিবর্তন করা হয়েছে: ${newStatus}`);
        setOrders(prev => {
          // If viewing specific status, and status changes away, remove it
          if (statusFilter !== 'all' && statusFilter.toLowerCase() !== newStatus.toLowerCase()) {
            return prev.filter(o => o.id !== orderId);
          }
          return prev.map(o => (o.id === orderId ? data.order : o));
        });
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

  // Dedicated Tab Navigation Configurations
  const tabConfigs = [
    { id: 'pending', labelBn: 'অপেক্ষমান অর্ডার', labelEn: 'Pending' },
    { id: 'confirmed', labelBn: 'কনফার্মড অর্ডার', labelEn: 'Confirmed' },
    { id: 'processing', labelBn: 'প্রসেসিং', labelEn: 'Processing' },
    { id: 'shipped', labelBn: 'কুরিয়ারে অন-ওয়ে', labelEn: 'Shipped' },
    { id: 'delivered', labelBn: 'ডেলিভার্ড', labelEn: 'Delivered' },
    { id: 'cancelled', labelBn: 'বাতিল', labelEn: 'Cancelled' },
    { id: 'all', labelBn: 'সকল অর্ডার', labelEn: 'All Orders' }
  ];

  const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  // Real-time filtered orders by search term (including product title, customer, phone, trx)
  const displayedOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const q = searchTerm.trim().toLowerCase();
    return orders.filter(o =>
      (o.order_code || '').toLowerCase().includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.customer_phone || '').toLowerCase().includes(q) ||
      (o.shipping_city || '').toLowerCase().includes(q) ||
      (o.transaction_id || '').toLowerCase().includes(q) ||
      (Array.isArray(o.items) && o.items.some(it => (it.title || '').toLowerCase().includes(q)))
    );
  }, [orders, searchTerm]);

  // Group orders by Division in Alphabetical Sequence
  const divisionGroupedOrders = useMemo(() => {
    const groups = {};
    
    // Initialize all 8 divisions
    DIVISION_CONFIGS.forEach(div => {
      groups[div.id] = { config: div, orders: [] };
    });
    groups['other'] = {
      config: {
        id: 'other',
        letter: 'O',
        nameEn: 'Other Locations',
        nameBn: 'অন্যান্য জেলা / আন-অ্যাসাইনড',
        theme: {
          letterBg: 'bg-slate-700 text-white border-2 border-slate-500 shadow-lg',
          boxBorder: 'border-2 border-slate-700 shadow-xl',
          boxBg: 'bg-slate-900',
          headerBg: 'bg-slate-800/80 border-b border-slate-700',
          titleColor: 'text-slate-300 font-black',
          badgeBg: 'bg-slate-800 text-slate-300 border border-slate-700',
          accentDot: 'bg-slate-400',
          tableHeadBg: 'bg-slate-850 text-slate-300 border-b border-slate-700',
          rowHover: 'divide-slate-800 hover:bg-slate-800/40',
          codeColor: 'text-slate-300'
        }
      },
      orders: []
    };

    // Distribute filtered orders into division buckets
    displayedOrders.forEach(order => {
      const divInfo = getOrderDivision(order);
      if (groups[divInfo.id]) {
        groups[divInfo.id].orders.push(order);
      } else {
        groups['other'].orders.push(order);
      }
    });

    return groups;
  }, [displayedOrders]);

  // Render a Single Order Row with division theme styling
  const renderOrderRow = (order, theme = null) => {
    const isPending = order.status?.toLowerCase() === 'pending';
    const codeColor = theme?.codeColor || 'text-amber-400';

    return (
      <tr key={order.id} className="hover:bg-white/5 transition-colors">
        
        {/* Code, Date & Time */}
        <td className="p-4 align-top whitespace-nowrap">
          <span className={`font-mono font-black block text-xs ${codeColor}`}>
            #{order.order_code}
          </span>
          <span className="text-[11px] text-slate-200 font-semibold block mt-0.5">
            {new Date(order.created_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">
            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </td>

        {/* Customer & Location */}
        <td className="p-4 align-top max-w-xs">
          <p className="font-bold text-white text-xs">{order.customer_name}</p>
          <p className="text-slate-300 font-mono text-[11px] mt-0.5">{order.customer_phone}</p>
          <p className="text-slate-300 text-[11px] mt-1 leading-snug">
            {order.shipping_address}, <strong className="text-white font-bold">{order.shipping_city}</strong>
          </p>
          {order.notes && (
            <p className="text-[10px] text-amber-300 italic mt-1">নোট: "{order.notes}"</p>
          )}
        </td>

        {/* Ordered Products & Quantity */}
        <td className="p-4 align-top min-w-[200px] max-w-xs">
          {Array.isArray(order.items) && order.items.length > 0 ? (
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {order.items.map((it, idx) => (
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
          ) : (
            <span className="text-[11px] text-slate-500 italic block py-1">—</span>
          )}
        </td>

        {/* Payment & TrxID */}
        <td className="p-4 align-top">
          <div className="space-y-1">
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              order.payment_method === 'bkash'
                ? 'bg-pink-950 text-pink-300 border border-pink-700'
                : order.payment_method === 'nagad'
                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                : order.payment_method === 'rocket'
                ? 'bg-purple-950 text-purple-300 border border-purple-700'
                : order.payment_method === 'upay'
                ? 'bg-sky-950 text-sky-300 border border-sky-700'
                : order.payment_method === 'cellfin'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : order.payment_method === 'bank'
                ? 'bg-blue-950 text-blue-300 border border-blue-700'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {order.payment_method}
            </span>

            {order.sender_number ? (
              <p className="text-[10px] text-slate-300 font-mono">
                From: <span className="text-white font-bold">{order.sender_number}</span>
              </p>
            ) : null}

            {order.transaction_id ? (
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="font-mono font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 text-[11px]">
                  {order.transaction_id}
                </span>
                <button
                  onClick={() => copyTrx(order.transaction_id)}
                  className="text-slate-300 hover:text-white p-1 cursor-pointer"
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

        {/* Courier Link & Consignment (Strict Gating: Only active in Processing) */}
        <td className="p-4 align-top max-w-xs">
          {order.status === 'Processing' ? (
            (order.courier_tracking_url || order.tracking_url) ? (
              <div className="space-y-1.5 bg-slate-900/80 p-2.5 rounded-xl border border-amber-500/40 shadow">
                <p className="text-[11px] font-bold text-amber-400 flex items-center">
                  <Truck className="w-3.5 h-3.5 mr-1" /> {order.courier_name || 'Courier'}
                </p>
                {order.consignment_id && (
                  <p className="text-[10px] font-mono text-slate-300">
                    ID: {order.consignment_id}
                  </p>
                )}
                <div className="flex items-center space-x-2">
                  <a
                    href={order.courier_tracking_url || order.tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-amber-300 hover:underline flex items-center"
                  >
                    <span>Live Courier Link</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                  {hasPermission('orders.courier_link') && (
                    <button
                      onClick={() => handleOpenCourierModal(order)}
                      className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      এডিট
                    </button>
                  )}
                </div>
              </div>
            ) : hasPermission('orders.courier_link') ? (
              <button
                onClick={() => handleOpenCourierModal(order)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black rounded-lg flex items-center space-x-1 cursor-pointer shadow transition-transform active:scale-95"
              >
                <Truck className="w-3 h-3 text-slate-950" />
                <span>+ কুরিয়ার লিংক দিন</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-500 italic block py-1">কুরিয়ার দেওয়ার অনুমতি নেই</span>
            )
          ) : (order.status === 'Shipped' || order.status === 'Delivered') ? (
            (order.courier_tracking_url || order.tracking_url) ? (
              <div className="space-y-1.5 bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/80">
                <p className="text-[11px] font-bold text-emerald-400 flex items-center">
                  <Truck className="w-3.5 h-3.5 mr-1" /> {order.courier_name || 'Courier'}
                </p>
                {order.consignment_id && (
                  <p className="text-[10px] font-mono text-slate-300">
                    ID: {order.consignment_id}
                  </p>
                )}
                <a
                  href={order.courier_tracking_url || order.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-amber-300 hover:underline flex items-center"
                >
                  <span>Live Courier Link</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            ) : (
              <span className="text-[11px] text-slate-500 italic block py-1">—</span>
            )
          ) : (
            <span className="text-[11px] text-slate-500 italic block py-1">
              প্রসেসিং হলে কুরিয়ার দেওয়া যাবে
            </span>
          )}
        </td>

        {/* Status & 1-Click Confirmation */}
        <td className="p-4 align-top">
          <div className="space-y-2">
            
            {/* 1-Click Order Confirmation for Pending */}
            {hasPermission('orders.status_update') && isPending && (
              <button
                type="button"
                disabled={confirmingId === order.id}
                onClick={() => handleConfirmOrder(order)}
                className="w-full px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/40 flex items-center justify-center space-x-1.5 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
                title="অর্ডার কনফার্ম করুন"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{confirmingId === order.id ? 'কনফার্ম হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}</span>
              </button>
            )}

            {/* 1-Click Advance to Processing for Confirmed */}
            {hasPermission('orders.status_update') && order.status === 'Confirmed' && (
              <button
                type="button"
                disabled={advancingId === order.id}
                onClick={() => handleAdvanceStatus(order, 'Processing', 'Sent to Processing & Packaging')}
                className="w-full px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/40 flex items-center justify-center space-x-1.5 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
                title="প্রসেসিং-এ পাঠান"
              >
                <span>{advancingId === order.id ? 'পাঠানো হচ্ছে...' : 'প্রসেসিং-এ পাঠান ➔'}</span>
              </button>
            )}

            {/* 1-Click Advance to Shipped for Processing */}
            {hasPermission('orders.status_update') && order.status === 'Processing' && (
              <button
                type="button"
                disabled={advancingId === order.id}
                onClick={() => handleAdvanceStatus(order, 'Shipped', 'Dispatched to Courier')}
                className="w-full px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-black rounded-xl shadow-lg shadow-sky-600/40 flex items-center justify-center space-x-1.5 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
                title="শিপড-এ পাঠান"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{advancingId === order.id ? 'পাঠানো হচ্ছে...' : 'শিপড-এ পাঠান ➔'}</span>
              </button>
            )}

            {/* 1-Click Complete Delivery for Shipped */}
            {hasPermission('orders.status_update') && order.status === 'Shipped' && (
              <button
                type="button"
                disabled={advancingId === order.id}
                onClick={() => handleAdvanceStatus(order, 'Delivered', 'Delivered to Customer')}
                className="w-full px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/40 flex items-center justify-center space-x-1.5 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
                title="ডেলিভারি সম্পন্ন করুন"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{advancingId === order.id ? 'আপডেট হচ্ছে...' : 'ডেলিভারি সম্পন্ন ✓'}</span>
              </button>
            )}

            {/* Status Dropdown */}
            <select
              value={order.status}
              disabled={!hasPermission('orders.status_update')}
              onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-bold border outline-none ${!hasPermission('orders.status_update') ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${
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
                  : 'bg-amber-950 text-amber-300 border-amber-700'
              }`}
            >
              {statuses.map(s => (
                <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
              ))}
            </select>
          </div>
        </td>

        {/* Actions */}
        <td className="p-4 align-top text-right">
          <div className="flex items-center justify-end space-x-2">
            {order.status === 'Processing' && (
              <button
                onClick={() => handleOpenCourierModal(order)}
                className="p-2 bg-slate-900/80 hover:bg-slate-800 text-amber-400 rounded-xl cursor-pointer border border-slate-700"
                title="Assign Courier Partner & Link"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onOpenInvoice(order)}
              className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1 border border-slate-700 cursor-pointer"
              title="Print / View Invoice"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>চালান</span>
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
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
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Fulfillment & Logistics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Orders & Courier Link Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            বিভাগ অনুযায়ী বর্ণানুক্রমিক অর্ডার ভিউ (পুরো বক্সে বিভাগের কালার থিম), কনফার্মেশন ও ট্র্যাকিং
          </p>
        </div>

        <div className="flex items-center space-x-3">
          
          {/* View Mode Switcher */}
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
            <button
              onClick={() => setViewMode('division')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'division'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="বিভাগ অনুযায়ী ভিউ (B, C, D... বর্ণানুক্রমিক)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>বিভাগ অনুযায়ী ভিউ</span>
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'flat'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="সাধারণ টেবিল ভিউ"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>সাধারণ টেবিল</span>
            </button>
          </div>

          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            রিফ্রেশ
          </button>
        </div>
      </div>

      {/* DEDICATED HIGH-VISIBILITY STATUS TABS */}
      <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-1.5">
        {tabConfigs.map(tab => {
          const isActive = statusFilter.toLowerCase() === tab.id.toLowerCase();
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.labelBn}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="অর্ডার কোড, পণ্যের নাম, গ্রাহক, ফোন, জেলা বা TrxID লিখে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto">
          {/* Payment Method Selector */}
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

          <span className="text-xs font-bold text-slate-400">
            মোট অর্ডার: <strong className="text-white">{orders.length}</strong>
          </span>
        </div>
      </div>

      {/* ORDERS CONTENT AREA */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-3 bg-slate-900 rounded-3xl border border-slate-800">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span>অর্ডার লোড হচ্ছে...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-slate-900 rounded-3xl border border-slate-800">
          <Package className="w-12 h-12 text-slate-700 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">কোন অর্ডার পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500">
            {statusFilter !== 'all' 
              ? `"${statusFilter}" ক্যাটাগরিতে বর্তমানে কোন অর্ডার নেই।`
              : 'নতুন অর্ডারের জন্য অপেক্ষা করুন।'}
          </p>
        </div>
      ) : viewMode === 'division' ? (
        
        /* -------------------------------------------------------------
           DIVISION GROUPED VIEW (PER USER SKETCH media_1789453015223.jpg)
           - Centered Letter Box atop each section: [ B ], [ C ], [ D ]...
           - ENTIRE BOX COLORED IN DIVISION'S DISTINCT COLOR THEME
           ------------------------------------------------------------- */
        <div className="space-y-12">
          {Object.keys(divisionGroupedOrders).map((divId) => {
            const group = divisionGroupedOrders[divId];
            const divOrders = group.orders;
            const config = group.config;

            // Only show divisions that have orders
            if (divOrders.length === 0) return null;

            return (
              <div key={config.id} className="space-y-3.5 animate-in fade-in">
                
                {/* 1. CENTERED LETTER BOX (Exactly per user drawing in 123.pdf sketch) */}
                <div className="flex justify-center">
                  <div className={`px-8 py-2 rounded-2xl font-black text-xl uppercase tracking-widest flex items-center justify-center transition-transform hover:scale-110 cursor-default ${config.theme.letterBg}`}>
                    {config.letter}
                  </div>
                </div>

                {/* 2. DIVISION CONTAINER BOX - FULL BOX COLORED WITH DIVISION'S THEME */}
                <div className={`rounded-3xl ${config.theme.boxBorder} ${config.theme.boxBg} overflow-hidden transition-all`}>
                  
                  {/* Division Header Banner */}
                  <div className={`p-4 sm:px-6 ${config.theme.headerBg} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                    <div className="flex items-center space-x-3">
                      <span className={`w-3.5 h-3.5 rounded-full ${config.theme.accentDot}`}></span>
                      <h3 className={`text-lg tracking-wide ${config.theme.titleColor}`}>
                        {config.nameEn} ({config.nameBn})
                      </h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-black ${config.theme.badgeBg}`}>
                        <strong className="font-mono font-black">{divOrders.length}</strong> টি অর্ডার
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-semibold flex items-center space-x-2">
                      <span>বিভাগীয় অর্ডার তালিকা</span>
                    </div>
                  </div>

                  {/* Division Orders Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className={config.theme.tableHeadBg}>
                        <tr>
                          <th className="p-4">Order Code & Date</th>
                          <th className="p-4">Customer & Location</th>
                          <th className="p-4">Products & Quantity</th>
                          <th className="p-4">Payment & TrxID</th>
                          <th className="p-4">Courier Link & Consignment</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${config.theme.rowHover}`}>
                        {divOrders.map(order => renderOrderRow(order, config.theme))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        
        /* -------------------------------------------------------------
           STANDARD FLAT TABLE VIEW
           ------------------------------------------------------------- */
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-4">Order Code & Date</th>
                  <th className="p-4">Customer & Location</th>
                  <th className="p-4">Products & Quantity</th>
                  <th className="p-4">Payment & TrxID</th>
                  <th className="p-4">Courier Link & Consignment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {displayedOrders.map(order => renderOrderRow(order))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourierDetails} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">কুরিয়ার কোম্পানির নাম *</label>
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
                  value={courierForm.status}
                  onChange={(e) => setCourierForm({ ...courierForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Processing">Processing (প্যাকেজিং চলছে)</option>
                  <option value="Shipped">Shipped (কুরিয়ারে হস্তান্তর করা হয়েছে)</option>
                  <option value="Delivered">Delivered (ডেলিভার্ড সম্পন্ন)</option>
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
                  disabled={updating}
                  className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  {updating ? 'সংরক্ষণ হচ্ছে...' : 'কুরিয়ার লিংক সংরক্ষণ ও প্রকাশ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
