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

    // Real-time new order notification for admins
    newSocket.on('new_order', (order) => {
      console.log('🔔 New order received:', order);
      setLiveNotifications(prev => [
        {
          id: Date.now(),
          type: 'order',
          title: `New Order Placed! (#${order.order_code})`,
          message: `${order.customer_name} placed an order of ৳${order.total_amount.toLocaleString()} via ${order.payment_method.toUpperCase()}`,
          time: new Date().toLocaleTimeString()
        },
        ...prev
      ]);
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

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAdmin]);

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
