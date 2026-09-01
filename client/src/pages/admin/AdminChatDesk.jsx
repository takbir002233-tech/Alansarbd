import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { 
  MessageSquare, 
  Send, 
  User, 
  ShieldCheck, 
  Bot, 
  Search, 
  Clock, 
  Phone, 
  Mail,
  Headphones
} from 'lucide-react';

export default function AdminChatDesk() {
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
        if (!activeConvId && data.conversations.length > 0) {
          setActiveConvId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching admin chats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [token]);

  // Listen to Socket.io incoming messages across all customer conversations
  useEffect(() => {
    if (!socket) return;

    const handleMessage = ({ convId, message, conversation }) => {
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === convId);
        if (idx > -1) {
          const updated = [...prev];
          const conv = { ...updated[idx] };
          if (!conv.messages.some(m => m.id === message.id)) {
            conv.messages = [...conv.messages, message];
          }
          conv.last_updated = message.timestamp;
          updated[idx] = conv;
          return updated.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
        } else if (conversation) {
          return [conversation, ...prev];
        }
        return prev;
      });
    };

    socket.on('chat_message_received', handleMessage);

    return () => {
      socket.off('chat_message_received', handleMessage);
    };
  }, [socket]);

  const activeConversation = conversations.find(c => c.id === activeConvId);

  // Scroll to bottom when conversation changes or messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConvId || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/chat/admin/${activeConvId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: replyText.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setReplyText('');
        // Local update if socket delayed
        setConversations(prev =>
          prev.map(c => {
            if (c.id === activeConvId) {
              return {
                ...c,
                messages: [...c.messages, data.adminMessage],
                unread_admin_count: 0
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error('Error replying as admin:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in h-[calc(100vh-6rem)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 flex-shrink-0">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Customer Support</span>
          <h1 className="text-2xl font-black text-white mt-1">Live Chat Support Desk</h1>
          <p className="text-xs text-slate-400">Respond directly to online shoppers and review AI automated replies in real-time</p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-Time WebSocket Sync Online</span>
        </div>
      </div>

      {/* Main Split Chat Workspace */}
      <div className="flex-1 min-h-0 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Conversation List (4 cols) */}
        <div className="md:col-span-4 border-r border-slate-800 flex flex-col min-h-0 bg-slate-900/60">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Customer Conversations ({conversations.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {loading ? (
              <p className="text-xs text-slate-500 p-4 text-center">Loading chat threads...</p>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 text-center">No customer conversations yet.</p>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === activeConvId;
                const lastMsg = conv.messages?.[conv.messages.length - 1];

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {conv.user_name?.charAt(0) || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold truncate text-white">
                          {conv.user_name || 'Guest User'}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate mt-1">
                        {lastMsg ? lastMsg.text : 'New thread'}
                      </p>

                      {conv.user_phone && (
                        <span className="text-[10px] text-indigo-400 font-mono block mt-0.5">
                          {conv.user_phone}
                        </span>
                      )}
                    </div>

                    {conv.unread_admin_count > 0 && (
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Conversation Panel (8 cols) */}
        <div className="md:col-span-8 flex flex-col min-h-0 bg-slate-950/40">
          {activeConversation ? (
            <>
              {/* Top Details Bar */}
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      {activeConversation.user_name || 'Guest User'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {activeConversation.user_phone || 'No phone'} • {activeConversation.user_email || 'No email'}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-400 font-mono">
                  Room: {activeConversation.id}
                </span>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeConversation.messages?.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const isBot = msg.sender === 'bot';
                  const isAdmin = msg.sender === 'admin';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-end ml-auto' : 'items-start mr-auto'} max-w-[80%]`}
                    >
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-1 px-1">
                        {isBot && (
                          <span className="flex items-center font-bold text-slate-300">
                            <Bot className="w-3 h-3 mr-0.5 text-blue-400" /> Nexus Assistant (Auto Bot)
                          </span>
                        )}
                        {isAdmin && (
                          <span className="flex items-center font-bold text-indigo-400">
                            <ShieldCheck className="w-3 h-3 mr-0.5" /> Support Admin
                          </span>
                        )}
                        {isUser && (
                          <span className="font-bold text-white">
                            {activeConversation.user_name || 'Customer'}
                          </span>
                        )}
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                          isAdmin
                            ? 'bg-blue-600 text-white rounded-tr-xs shadow-md shadow-blue-500/20'
                            : isBot
                            ? 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-xs'
                            : 'bg-slate-800 text-white border border-slate-700 rounded-tl-xs shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Admin Reply Form */}
              <form onSubmit={handleSendReply} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center space-x-3 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Type official reply to customer in real-time..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-800 text-xs rounded-2xl border border-slate-700 text-white focus:outline-none focus:border-blue-500 placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Select a conversation from the left to start live chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
