import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  ShieldCheck, 
  User, 
  Sparkles, 
  ChevronRight,
  Headphones,
  RotateCcw
} from 'lucide-react';

export default function LiveChatWidget() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Generate or retrieve persistent conversation ID for guest/user
  const [convId] = useState(() => {
    const saved = localStorage.getItem('nexus_chat_conv_id');
    if (saved) return saved;
    const newId = 'conv_' + (user?.id || 'guest_' + Math.random().toString(36).substr(2, 7));
    localStorage.setItem('nexus_chat_conv_id', newId);
    return newId;
  });

  // Fetch chat history
  useEffect(() => {
    async function fetchChat() {
      try {
        const res = await fetch(`/api/chat/${convId}`);
        const data = await res.json();
        if (data.success && data.conversation) {
          setMessages(data.conversation.messages || []);
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    }
    fetchChat();
  }, [convId]);

  // Listen to Socket.io real-time chat messages
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_chat_room', convId);

    const handleMessage = ({ convId: incomingConvId, message }) => {
      if (incomingConvId === convId) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
        if (!isOpen && message.sender !== 'user') {
          setUnreadCount(prev => prev + 1);
        }
      }
    };

    socket.on('chat_message_received', handleMessage);

    return () => {
      socket.off('chat_message_received', handleMessage);
    };
  }, [socket, convId, isOpen]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend, wantsBot = true) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/chat/${convId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          userId: user?.id || null,
          userName: user?.name || 'Guest Customer',
          userPhone: user?.phone || '',
          userEmail: user?.email || '',
          wantsBotReply: wantsBot
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.userMessage) {
          setMessages(prev => {
            const list = prev.some(m => m.id === data.userMessage.id) ? prev : [...prev, data.userMessage];
            if (data.botReply && !list.some(m => m.id === data.botReply.id)) {
              list.push(data.botReply);
            }
            return list;
          });
        }
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (questionText) => {
    handleSendMessage(questionText, true);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="relative group p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 flex items-center justify-center ring-4 ring-white"
          title="Open Live Chat & Instant AI Support"
        >
          <MessageSquare className="w-6 h-6" />
          
          {/* Pulsing online indicator */}
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>

          {unreadCount > 0 && (
            <span className="absolute -top-2 -left-2 bg-rose-500 text-white text-[11px] font-black rounded-full px-2 py-0.5 shadow-md">
              {unreadCount}
            </span>
          )}

          {/* Tooltip hint */}
          <span className="hidden group-hover:flex absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl whitespace-nowrap shadow-xl">
            💬 Need help? Live Chat & Bot
          </span>
        </button>
      )}

      {/* Expanded Live Chat Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Headphones className="w-5 h-5 text-blue-300" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center space-x-1.5">
                  <span>Nexus Smart Support</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[11px] text-emerald-400 font-medium flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1 animate-pulse" />
                  Live AI Bot & Human Admin Online
                </p>
              </div>
            </div>

            <button
              onClick={toggleChat}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick FAQ Suggestion Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200/80 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 text-xs">
            <button
              onClick={() => handleQuickQuestion('bKash and Nagad payment numbers and instructions')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-slate-200 rounded-full text-slate-700 font-medium transition-colors flex-shrink-0 flex items-center shadow-2xs"
            >
              💳 Payment TrxID Info
            </button>
            <button
              onClick={() => handleQuickQuestion('What are the delivery charges and delivery times?')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-slate-200 rounded-full text-slate-700 font-medium transition-colors flex-shrink-0 flex items-center shadow-2xs"
            >
              🚚 Delivery & Charges
            </button>
            <button
              onClick={() => handleQuickQuestion('How do I track my order status?')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-slate-200 rounded-full text-slate-700 font-medium transition-colors flex-shrink-0 flex items-center shadow-2xs"
            >
              📦 Order Tracking
            </button>
            <button
              onClick={() => handleQuickQuestion('What is your warranty and 7 day return policy?')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-slate-200 rounded-full text-slate-700 font-medium transition-colors flex-shrink-0 flex items-center shadow-2xs"
            >
              🛡️ Return Policy
            </button>
            <button
              onClick={() => handleQuickQuestion('I want to speak with a human support admin')}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full font-bold transition-colors flex-shrink-0 flex items-center shadow-2xs"
            >
              👨‍💼 Talk to Admin
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isBot = msg.sender === 'bot';
              const isAdmin = msg.sender === 'admin';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] ${
                    isUser ? 'ml-auto' : 'mr-auto'
                  }`}
                >
                  {/* Sender Name & Badge */}
                  <div className="flex items-center space-x-1 mb-1 px-1 text-[10px] text-slate-400">
                    {isBot && (
                      <span className="flex items-center font-bold text-slate-600">
                        <Bot className="w-3 h-3 mr-0.5 text-blue-500" /> Nexus Assistant (Auto)
                      </span>
                    )}
                    {isAdmin && (
                      <span className="flex items-center font-bold text-indigo-600">
                        <ShieldCheck className="w-3 h-3 mr-0.5 text-indigo-600" /> Support Desk Admin
                      </span>
                    )}
                    {isUser && (
                      <span className="font-semibold text-slate-500">
                        {user?.name ? user.name.split(' ')[0] : 'You'}
                      </span>
                    )}
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs shadow-md shadow-blue-500/10'
                        : isAdmin
                        ? 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-tl-xs shadow-md'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText, true);
            }}
            className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask anything or leave a note..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-100 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-2xl shadow-md transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
