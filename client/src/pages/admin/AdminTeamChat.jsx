import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { 
  Users, 
  Send, 
  Pin, 
  Trash2, 
  ShieldCheck, 
  Crown, 
  Sparkles, 
  Clock, 
  MessageSquare, 
  Search, 
  Phone, 
  Mail, 
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  BellRing
} from 'lucide-react';

export default function AdminTeamChat() {
  const { user, token, isSuperAdmin } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchMember, setSearchMember] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [memberSidebarOpen, setMemberSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Bengali digits converter
  const toBn = (n) => String(n ?? '').replace(/[0-9]/g, d => ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'][+d]);

  // Format timestamp to Bengali friendly string
  const formatTime = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return '';
    }
  };

  const formatDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
    } catch (e) {
      return '';
    }
  };

  // Fetch initial group messages and team members
  const fetchData = async () => {
    try {
      const authToken = token || localStorage.getItem('nexus_token');
      if (!authToken) return;

      const [resMsgs, resMembers] = await Promise.all([
        fetch('/api/chat/admin-group/messages', {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        fetch('/api/chat/admin-group/members', {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ]);

      const dataMsgs = await resMsgs.json();
      const dataMembers = await resMembers.json();

      if (dataMsgs.success) {
        setMessages(dataMsgs.messages || []);
      }
      if (dataMembers.success) {
        setMembers(dataMembers.members || []);
      }
    } catch (err) {
      console.error('Error fetching admin group chat data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  // Real-time Socket Listener for Admin Group Channel
  useEffect(() => {
    if (!socket) return;

    // Join admin channel explicitly
    socket.emit('join_admin_channel');

    const handleNewMessage = (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(() => scrollToBottom(true), 100);
    };

    const handleDeleteMessage = ({ id }) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    };

    const handlePinnedMessage = ({ id, is_pinned }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_pinned } : m))
      );
    };

    socket.on('admin_group_message', handleNewMessage);
    socket.on('admin_group_message_deleted', handleDeleteMessage);
    socket.on('admin_group_message_pinned', handlePinnedMessage);

    return () => {
      socket.off('admin_group_message', handleNewMessage);
      socket.off('admin_group_message_deleted', handleDeleteMessage);
      socket.off('admin_group_message_pinned', handlePinnedMessage);
    };
  }, [socket]);

  // Send Message
  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || sending) return;

    setSending(true);
    try {
      const authToken = token || localStorage.getItem('nexus_token');
      const res = await fetch('/api/chat/admin-group/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ text: textToSend })
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
        setInputText('');
        setTimeout(() => scrollToBottom(true), 80);
      }
    } catch (err) {
      console.error('Error sending team message:', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Delete Message
  const handleDelete = async (msgId) => {
    if (!window.confirm('আপনি কি এই মেসেজটি মুছে ফেলতে চান?')) return;
    try {
      const authToken = token || localStorage.getItem('nexus_token');
      const res = await fetch(`/api/chat/admin-group/messages/${msgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (msgId) => {
    try {
      const authToken = token || localStorage.getItem('nexus_token');
      const res = await fetch(`/api/chat/admin-group/messages/${msgId}/pin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, is_pinned: data.message.is_pinned } : m))
        );
      }
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  // Send Quick Template
  const handleQuickPrompt = (promptText) => {
    setInputText(promptText);
    inputRef.current?.focus();
  };

  // Filtered members list
  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.custom_role?.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.phone?.includes(searchMember)
  );

  // Find currently pinned message
  const pinnedMessage = messages.find(m => m.is_pinned);

  // Helper for role badge colors
  const getRoleBadge = (roleStr, isStaff) => {
    if (!isStaff) {
      return {
        label: '👑 Super Admin',
        color: 'bg-gradient-to-r from-amber-500/20 to-amber-600/30 text-amber-300 border border-amber-500/40'
      };
    }
    const lower = (roleStr || '').toLowerCase();
    if (lower.includes('মডারেটর') || lower.includes('moderator')) {
      return {
        label: `🛡️ ${roleStr}`,
        color: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
      };
    }
    if (lower.includes('ইনভেন্টরি') || lower.includes('inventory')) {
      return {
        label: `📦 ${roleStr}`,
        color: 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
      };
    }
    if (lower.includes('সাপোর্ট') || lower.includes('support')) {
      return {
        label: `🎧 ${roleStr}`,
        color: 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
      };
    }
    return {
      label: `⚙️ ${roleStr || 'স্টাফ অ্যাডমিন'}`,
      color: 'bg-slate-700/60 text-slate-300 border border-slate-600'
    };
  };

  return (
    <div className="space-y-4 font-sans text-slate-100">
      
      {/* Top Header Card */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Users className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                অ্যাডমিন টিম লাইভ গ্রুপ চ্যাট
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>লাইভ সক্রিয়</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              সকল অ্যাডমিন, মডারেটর ও ম্যানেজমেন্টের অভ্যন্তরীণ তাৎক্ষণিক আলোচনা রুম ({toBn(members.length)} জন অ্যাডমিন যুক্ত)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-end md:self-auto">
          <button
            onClick={() => setMemberSidebarOpen(!memberSidebarOpen)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
            title="টিম মেম্বার লিস্ট দেখুন বা লুকান"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{memberSidebarOpen ? 'টিম লিস্ট লুকান' : 'টিম লিস্ট দেখুন'} ({toBn(members.length)})</span>
          </button>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[72vh] min-h-[580px]">
        
        {/* LEFT COLUMN: Admin Team Members Directory */}
        {memberSidebarOpen && (
          <div className="lg:col-span-4 xl:col-span-3 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl flex flex-col overflow-hidden h-full">
            {/* Header & Search */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white tracking-wide uppercase">
                    টিম মেম্বারস ({toBn(filteredMembers.length)})
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  সকল অ্যাডমিন
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="অ্যাডমিন বা পদবি খুঁজুন..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Member List Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-800/40">
              {filteredMembers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  কোনো মেম্বার পাওয়া যায়নি।
                </div>
              ) : (
                filteredMembers.map((m) => {
                  const isCurrent = m.id === user?.id;
                  const badge = getRoleBadge(m.custom_role, m.is_staff);
                  return (
                    <div
                      key={m.id}
                      className={`pt-2 first:pt-0 p-2.5 rounded-2xl transition-all ${
                        isCurrent ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Avatar with Online Dot */}
                        <div className="relative flex-shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center text-xs font-black text-amber-400">
                            {m.name ? m.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white truncate">
                              {m.name} {isCurrent && <span className="text-amber-400 text-[10px]">(আপনি)</span>}
                            </span>
                          </div>

                          <div className="mt-1">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center space-x-2 text-[10px] text-slate-400">
                            {m.phone && (
                              <span className="flex items-center space-x-1">
                                <Phone className="w-2.5 h-2.5 text-slate-500" />
                                <span>{m.phone}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Notice */}
            <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 text-center">
              <p className="text-[10px] text-slate-400 flex items-center justify-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>নিরাপদ এনক্রিপ্টেড অভ্যন্তরীণ চ্যানেল</span>
              </p>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Chat Feed, Messages & Input */}
        <div className={`${memberSidebarOpen ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'} bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl flex flex-col overflow-hidden h-full`}>
          
          {/* Top Bar inside Chat */}
          <div className="px-5 py-3.5 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">টিম ডিসকাশন বোর্ড</span>
              <span className="text-[10px] text-slate-400 font-mono">({toBn(messages.length)} টি মেসেজ)</span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-semibold text-emerald-400">Socket.io লাইভ কানেক্টেড</span>
            </div>
          </div>

          {/* Pinned Message Alert if exists */}
          {pinnedMessage && (
            <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-l-4 border-amber-500 rounded-xl flex items-start justify-between gap-3 animate-in fade-in">
              <div className="flex items-start space-x-2.5">
                <Pin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">জরুরি পিন করা নোটিশ:</span>
                    <span className="text-[10px] text-slate-400">({pinnedMessage.sender_name})</span>
                  </div>
                  <p className="text-xs text-slate-200 mt-0.5 leading-relaxed font-medium">
                    {pinnedMessage.text}
                  </p>
                </div>
              </div>

              {(isSuperAdmin || pinnedMessage.sender_id === user?.id) && (
                <button
                  onClick={() => handleTogglePin(pinnedMessage.id)}
                  className="text-[10px] text-slate-400 hover:text-rose-400 transition cursor-pointer p-1"
                  title="আনপিন করুন"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-500 space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span className="text-xs">মেসেজ লোড হচ্ছে...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-8 space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-300">এখনও কোনো টিম মেসেজ নেই</p>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  নিচের বক্সে মেসেজ লিখে সরাসরি সহকর্মী অ্যাডমিনদের সাথে আলোচনা শুরু করুন।
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMine = msg.sender_id === user?.id;
                const badge = getRoleBadge(msg.sender_role, msg.sender_role !== 'Super Admin');
                const canDelete = isMine || isSuperAdmin;

                return (
                  <div
                    key={msg.id || index}
                    className={`flex flex-col group ${isMine ? 'items-end' : 'items-start'} transition-all`}
                  >
                    {/* Sender Header */}
                    <div className="flex items-center space-x-2 mb-1 px-1">
                      {!isMine && (
                        <span className="text-[11px] font-bold text-amber-300">
                          {msg.sender_name}
                        </span>
                      )}
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatTime(msg.timestamp)}
                      </span>
                      {msg.is_pinned && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded flex items-center space-x-0.5">
                          <Pin className="w-2.5 h-2.5" />
                          <span>পিন্ড</span>
                        </span>
                      )}
                    </div>

                    {/* Chat Bubble with Action Controls */}
                    <div className="relative max-w-[85%] sm:max-w-[75%] flex items-center space-x-1.5">
                      
                      {/* Left Controls for My Messages */}
                      {isMine && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 pr-1">
                          <button
                            onClick={() => handleTogglePin(msg.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 text-xs cursor-pointer"
                            title={msg.is_pinned ? 'আনপিন করুন' : 'নোটিশ পিন করুন'}
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(msg.id)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs cursor-pointer"
                              title="মেসেজ মুছুন"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Bubble Content */}
                      <div
                        className={`rounded-2xl p-3 sm:px-4 sm:py-2.5 text-xs leading-relaxed shadow-md ${
                          isMine
                            ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 font-medium rounded-tr-xs'
                            : 'bg-slate-800/95 border border-slate-700/80 text-slate-100 rounded-tl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>

                      {/* Right Controls for Others Messages (Super Admin Pin/Delete) */}
                      {!isMine && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 pl-1">
                          <button
                            onClick={() => handleTogglePin(msg.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 text-xs cursor-pointer"
                            title={msg.is_pinned ? 'আনপিন করুন' : 'নোটিশ পিন করুন'}
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(msg.id)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs cursor-pointer"
                              title="মেসেজ মুছুন"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-slate-500 font-bold uppercase flex-shrink-0">
              দ্রুত বার্তা:
            </span>
            {[
              '🚨 জরুরি ডেলিভারি ইস্যু আছে',
              '📦 স্টক ঘাটতি চেক করুন',
              '💳 পেমেন্ট TrxID ভেরিফাই হয়েছে',
              '💬 কাস্টমার চ্যাটে সাহায্য লাগবে',
              '👍 আজকের সব অর্ডার প্রসেস সম্পন্ন'
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(chip)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 transition-all flex-shrink-0 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Bottom Message Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 bg-slate-950/70 border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="সকল অ্যাডমিনদের উদ্দেশ্যে মেসেজ লিখুন... (Enter চাপুন)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 flex-shrink-0"
            >
              <span>পাঠান</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
