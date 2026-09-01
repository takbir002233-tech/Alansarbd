import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, Package, CheckCircle2, X } from 'lucide-react';

export default function NotificationToasts() {
  const { liveNotifications, clearNotification } = useSocket();

  if (!liveNotifications || liveNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {liveNotifications.map(item => (
        <div
          key={item.id}
          className="pointer-events-auto bg-slate-900/95 text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex items-start space-x-3 transform transition-all duration-300 animate-slide-in backdrop-blur-md"
        >
          <div className={`p-2 rounded-lg ${item.type === 'order' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
            {item.type === 'order' ? <Package className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
              <span className="text-xs text-slate-400 ml-2">{item.time}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.message}</p>
          </div>
          <button
            onClick={() => clearNotification(item.id)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
