import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('al_ansar_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [siteSettings, setSiteSettings] = useState({
    store_name: 'AL ANSAR SUPER SHOP',
    store_name_bn: 'আল আনসার সুপার শপ',
    store_tagline: 'ঘরের বাজার, প্রিমিয়াম বেকারি, খাঁটি আতর, পারফিউম ও রাজকীয় উপহার সামগ্রী',
    dhaka_delivery_fee: 60,
    outside_dhaka_delivery_fee: 120,
    free_delivery_threshold: 2000,
    logo_url: '/logo.jpg',
    bkash_number: '01711-223344 (ব্যক্তিগত / Send Money)',
    nagad_number: '01811-223344 (ব্যক্তিগত / Send Money)',
    rocket_number: '01911-223344 (ব্যক্তিগত / Send Money)',
    showroom_address: 'আল আনসার ফ্ল্যাগশিপ শোরুম, লেভেল ৪, সেক্টর ৩, উত্তরা, ঢাকা-১২৩০',
    whatsapp_number: '+880 1711-223344'
  });

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSiteSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  // Fetch live site settings on mount
  useEffect(() => {
    refreshSettings();
  }, []);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('al_ansar_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, variant = null) => {
    setCartItems(prevItems => {
      const existingIdx = prevItems.findIndex(
        item => item.id === product.id && JSON.stringify(item.variant) === JSON.stringify(variant)
      );

      const price = product.discount_price || product.price;

      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: product.id,
            title: product.title,
            slug: product.slug,
            price: price,
            regular_price: product.price,
            thumbnail: product.thumbnail || (product.images && product.images[0]),
            stock: product.stock,
            is_free_delivery: !!product.is_free_delivery,
            quantity: quantity,
            variant: variant
          }
        ];
      }
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, quantity, variant = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.id === productId && JSON.stringify(item.variant) === JSON.stringify(variant)) {
          return { ...item, quantity: Math.min(quantity, item.stock || 99) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, variant = null) => {
    setCartItems(prev =>
      prev.filter(item => !(item.id === productId && JSON.stringify(item.variant) === JSON.stringify(variant)))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedPromo(null);
    setPromoCode('');
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Check if any product in cart has 0 delivery charge
  const hasFreeDeliveryItem = cartItems.some(item => item.is_free_delivery === true);

  // Dynamic voucher application via backend API
  const applyPromo = async (code) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return { success: false, message: 'Please enter a voucher code.' };

    try {
      const res = await fetch('/api/vouchers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode, subtotal })
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, message: data.message };
      }

      setAppliedPromo(data.voucher);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: 'Failed to apply voucher code.' };
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
  };

  const discountAmount = appliedPromo
    ? appliedPromo.discount_type === 'percent'
      ? Math.round((subtotal * appliedPromo.discount_value) / 100)
      : appliedPromo.discount_value
    : 0;

  const getDeliveryFee = (zone) => {
    if (hasFreeDeliveryItem || subtotal >= (siteSettings.free_delivery_threshold || 2000)) {
      return 0; // Free delivery flag or threshold
    }
    return zone === 'outside_dhaka'
      ? (siteSettings.outside_dhaka_delivery_fee || 120)
      : (siteSettings.dhaka_delivery_fee || 60);
  };

  const getTotalAmount = (zone) => {
    const delivery = getDeliveryFee(zone);
    return Math.max(0, subtotal - discountAmount) + delivery;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        totalItemCount,
        hasFreeDeliveryItem,
        appliedPromo,
        promoCode,
        setPromoCode,
        applyPromo,
        removePromo,
        discountAmount,
        siteSettings,
        setSiteSettings,
        refreshSettings,
        getDeliveryFee,
        getTotalAmount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
