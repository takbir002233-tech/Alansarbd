import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAdmin } = useAuth();
  const [liveNotifications, setLiveNotifications] = useState([]);

  useEffect(() => {
    // Connect to backend server
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected:', newSocket.id);
      setIsConnected(true);

      if (isAdmin) {
        newSocket.emit('join_admin_channel');
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Real-time new order notification handler (Frontend floating toast disabled per user request)
    newSocket.on('new_order', (order) => {
      console.log('🔔 New order received via socket:', order?.order_code);
      // Floating notification toast turned off so user does not see popup on screen
    });

    // Real-time status update for customer
    newSocket.on('order_status_updated', (data) => {
      console.log('📦 Order status updated:', data);
      setLiveNotifications(prev => [
        {
          id: Date.now(),
          type: 'status',
          title: `Order Status Updated (#${data.orderCode})`,
          message: `Your order is now: ${data.status.toUpperCase()}`,
          time: new Date().toLocaleTimeString()
        },
        ...prev
      ]);
    });

    // Real-time Qard-e-Hasana status update
    newSocket.on('qard_status_updated', (data) => {
      console.log('🌸 Qard status updated event received:', data);
      const isDeclined = data.status === 'Declined' || data.status === 'Rejected';
      const isApproved = data.status === 'Approved';
      
      setUser(prev => {
        if (!prev) return prev;
        const matches = prev.id === data.user_id || (prev.phone && data.phone && prev.phone.includes(data.phone.replace(/^(\+88|88)/, '')));
        if (!matches) return prev;
        return {
          ...prev,
          qard_status: isDeclined ? 'Declined' : isApproved ? 'Approved' : data.status,
          qard_decline_reason: isDeclined ? (data.notes || 'আবেদনটি বাতিল করা হয়েছে') : null
        };
      });

      if (user && (user.id === data.user_id || (user.phone && data.phone && user.phone.includes(data.phone.replace(/^(\+88|88)/, ''))))) {
        setLiveNotifications(prev => [
          {
            id: Date.now(),
            type: isApproved ? 'success' : 'alert',
            title: isApproved ? '🌸 করযে হাসানা অনুমোদিত হয়েছে!' : '❌ করযে হাসানা আবেদন প্রত্যাখ্যাত (Declined)',
            message: isApproved
              ? 'আপনার করযে হাসানা ক্রেডিট লিমিট সফলভাবে সক্রিয় করা হয়েছে।'
              : `আপনার করযে হাসানা আবেদনটি বাতিল করা হয়েছে। কারণ: ${data.notes || 'যাচাইকরণে অসঙ্গতি'}`,
            time: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
        if (refreshUser) refreshUser();
      }
    });

    // Real-time VIP Loyalty Card status update
    newSocket.on('loyalty_status_updated', (data) => {
      console.log('💎 Loyalty status updated event received:', data);
      const isDeclined = data.status === 'Declined' || data.status === 'Rejected';
      const isApproved = data.status === 'Approved';

      setUser(prev => {
        if (!prev) return prev;
        const matches = prev.id === data.user_id || (prev.phone && data.phone && prev.phone.includes(data.phone.replace(/^(\+88|88)/, '')));
        if (!matches) return prev;
        return {
          ...prev,
          loyalty_card_status: isDeclined ? 'Declined' : isApproved ? 'Approved' : data.status,
          loyalty_card_approved: isApproved,
          loyalty_decline_reason: isDeclined ? (data.notes || 'আবেদনটি বাতিল করা হয়েছে') : null
        };
      });

      if (user && (user.id === data.user_id || (user.phone && data.phone && user.phone.includes(data.phone.replace(/^(\+88|88)/, ''))))) {
        setLiveNotifications(prev => [
          {
            id: Date.now(),
            type: isApproved ? 'success' : 'alert',
            title: isApproved ? '💎 ভিআইপি মেম্বারশিপ অনুমোদিত!' : '❌ ভিআইপি মেম্বারশিপ আবেদন প্রত্যাখ্যাত (Declined)',
            message: isApproved
              ? 'আপনার ভার্চুয়াল ভিআইপি প্রিভিলেজ কার্ড সক্রিয় করা হয়েছে।'
              : `আপনার ভিআইপি আবেদনটি বাতিল করা হয়েছে। কারণ: ${data.notes || 'যাচাইকরণে অসঙ্গতি'}`,
            time: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
        if (refreshUser) refreshUser();
      }
    });

    // Real-time user object sync
    newSocket.on('user_updated', (data) => {
      if (user && data.userId === user.id && data.user) {
        setUser(data.user);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAdmin, user]);

  const clearNotification = (id) => {
    setLiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        liveNotifications,
        clearNotification
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
