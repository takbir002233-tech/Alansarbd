const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// CREATE ORDER
router.post('/', (req, res) => {
  try {
    const {
      user_id,
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      shipping_city,
      delivery_zone,
      items,
      payment_method,
      sender_number,
      transaction_id,
      notes,
      applied_voucher_code,
      discount_amount
    } = req.body;

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver name is required.' });
    }

    if (!customer_phone || !customer_phone.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver contact phone number is required.' });
    }

    if (!shipping_address || !shipping_address.trim()) {
      return res.status(400).json({ success: false, message: 'Detailed delivery address is required.' });
    }

    if (!shipping_city || !shipping_city.trim()) {
      return res.status(400).json({ success: false, message: 'Delivery city/district is required.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
    }

    if (!payment_method || !['bkash', 'nagad', 'rocket', 'cod', 'qard'].includes(payment_method)) {
      return res.status(400).json({ success: false, message: 'Valid payment method is required (bKash, Nagad, Rocket, COD, or Qard-e-Hasana).' });
    }

    if (['bkash', 'nagad', 'rocket'].includes(payment_method)) {
      if (!transaction_id || !transaction_id.trim()) {
        return res.status(400).json({ success: false, message: 'Transaction ID (TrxID) is required for mobile payments.' });
      }
      if (!sender_number || !sender_number.trim()) {
        return res.status(400).json({ success: false, message: 'Sender mobile number used for payment is required.' });
      }
    }

    const siteSettings = db.getSiteSettings();
    const isDhaka = (delivery_zone === 'inside_dhaka') || (shipping_city.toLowerCase().includes('dhaka'));
    const standardDeliveryFee = isDhaka ? (siteSettings.dhaka_delivery_fee || 60) : (siteSettings.outside_dhaka_delivery_fee || 120);

    let subtotal = 0;
    let hasFreeDeliveryProduct = false;

    const verifiedItems = items.map(item => {
      const prd = db.getProductById(item.id);
      const unitPrice = prd ? (prd.discount_price || prd.price) : Number(item.price);
      const qty = Number(item.quantity) || 1;
      const isFreeDel = prd ? !!prd.is_free_delivery : !!item.is_free_delivery;
      if (isFreeDel) hasFreeDeliveryProduct = true;

      subtotal += unitPrice * qty;
      return {
        id: item.id,
        title: prd ? prd.title : item.title,
        price: unitPrice,
        quantity: qty,
        is_free_delivery: isFreeDel,
        thumbnail: prd ? prd.thumbnail : item.thumbnail
      };
    });

    const discount = Number(discount_amount) || 0;
    const isThresholdFree = subtotal >= (siteSettings.free_delivery_threshold || 2000);
    const finalDeliveryFee = (hasFreeDeliveryProduct || isThresholdFree) ? 0 : standardDeliveryFee;
    const total_amount = Math.max(0, subtotal - discount) + finalDeliveryFee;

    const newOrder = db.createOrder({
      user_id: user_id || null,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_email: (customer_email || '').trim(),
      shipping_address: shipping_address.trim(),
      shipping_city: shipping_city.trim(),
      delivery_zone: isDhaka ? 'inside_dhaka' : 'outside_dhaka',
      delivery_fee: finalDeliveryFee,
      items: verifiedItems,
      subtotal,
      discount_amount: discount,
      applied_voucher_code: applied_voucher_code || '',
      total_amount,
      payment_method,
      sender_number: sender_number ? sender_number.trim() : '',
      transaction_id: transaction_id ? transaction_id.trim().toUpperCase() : '',
      qard_nid: (req.body.qard_nid || '').trim(),
      qard_deferred_amount: Number(req.body.qard_deferred_amount) || 0,
      notes: (notes || '').trim()
    });

    // If user is logged in, award loyalty points (1 point per 100 BDT)
    if (user_id) {
      const u = db.getUserById(user_id);
      if (u) {
        const earnedPoints = Math.floor(total_amount / 100);
        u.loyalty_points = (u.loyalty_points || 0) + earnedPoints;
      }
    }

    // Notify connected admins via socket
    if (req.app.get('io')) {
      req.app.get('io').emit('new_order', newOrder);
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully with AL ANSAR!',
      order: newOrder
    });
  } catch (err) {
    console.error('Error placing order:', err);
    return res.status(500).json({ success: false, message: 'Server error placing order.' });
  }
});

// GET AUTHENTICATED USER ORDERS
router.get('/my-orders', authenticateToken, (req, res) => {
  try {
    const orders = db.getOrdersByUserId(req.user.id);
    return res.json({ success: true, orders });
  } catch (err) {
    console.error('Error getting user orders:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching orders.' });
  }
});

// TRACK / GET SINGLE ORDER BY CODE OR ID
router.get('/:orderCodeOrId', (req, res) => {
  try {
    const { orderCodeOrId } = req.params;
    const order = db.getOrderById(orderCodeOrId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found with this code or ID.' });
    }
    return res.json({ success: true, order });
  } catch (err) {
    console.error('Error fetching order:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching order.' });
  }
});

// ADMIN: GET ALL ORDERS
router.get('/', requireAdmin, (req, res) => {
  try {
    let orders = db.getOrders();
    const { status, payment_method, search } = req.query;

    if (status && status !== 'all') {
      orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }

    if (payment_method && payment_method !== 'all') {
      orders = orders.filter(o => o.payment_method.toLowerCase() === payment_method.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      orders = orders.filter(o =>
        o.order_code.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q) ||
        (o.transaction_id && o.transaction_id.toLowerCase().includes(q)) ||
        (o.consignment_id && o.consignment_id.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching orders.' });
  }
});

// ADMIN: UPDATE ORDER STATUS & COURIER TRACKING LINK
router.put('/:id/status', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, courier_name, consignment_id, courier_tracking_url } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const courierDetails = {};
    if (courier_name !== undefined) courierDetails.courier_name = courier_name.trim();
    if (consignment_id !== undefined) courierDetails.consignment_id = consignment_id.trim();
    if (courier_tracking_url !== undefined) courierDetails.courier_tracking_url = courier_tracking_url.trim();

    const updatedOrder = db.updateOrderStatus(id, status, note, courierDetails);
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found to update.' });
    }

    // Broadcast status change
    if (req.app.get('io')) {
      req.app.get('io').emit('order_status_updated', {
        orderId: updatedOrder.id,
        orderCode: updatedOrder.order_code,
        status: updatedOrder.status,
        order: updatedOrder
      });
    }

    return res.json({
      success: true,
      message: `Order status changed to ${status}!`,
      order: updatedOrder
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    return res.status(500).json({ success: false, message: 'Server error updating order status.' });
  }
});

module.exports = router;
