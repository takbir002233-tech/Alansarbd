const express = require('express');
const router = express.Router();
const db = require('../db');
const mailService = require('../services/mailService');
const { authenticateToken, requireAdmin, requirePermission } = require('../middleware/auth');

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
      notes,
      applied_voucher_code,
      promo_code,
      discount_amount
    } = req.body;

    const sender_number = req.body.sender_number || req.body.payment_details?.sender_number || req.body.senderNumber || '';
    const transaction_id = req.body.transaction_id || req.body.payment_details?.transaction_id || req.body.trxId || req.body.trx_id || '';
    const voucherCode = applied_voucher_code || promo_code || req.body.voucher_code || '';

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

    const validMethods = ['bkash', 'nagad', 'rocket', 'upay', 'cellfin', 'bank', 'cod', 'qard'];
    const pMethod = (payment_method || 'cod').toLowerCase();
    if (!validMethods.includes(pMethod)) {
      return res.status(400).json({ success: false, message: 'Valid payment method is required (bKash, Nagad, Rocket, Upay, Cellfin, Bank, COD, or Qard).' });
    }

    if (['bkash', 'nagad', 'rocket', 'upay', 'cellfin', 'bank'].includes(pMethod)) {
      if (!transaction_id || !transaction_id.trim()) {
        return res.status(400).json({ success: false, message: 'Transaction ID (TrxID) is required for digital payments.' });
      }
      if (!sender_number || !sender_number.trim()) {
        return res.status(400).json({ success: false, message: 'Sender mobile number or account is required.' });
      }
    }

    const siteSettings = db.getSiteSettings();
    const isDhaka = (delivery_zone === 'inside_dhaka') || (shipping_city.toLowerCase().includes('dhaka'));
    const standardDeliveryFee = isDhaka ? (siteSettings.dhaka_delivery_fee || 60) : (siteSettings.outside_dhaka_delivery_fee || 120);

    let subtotal = 0;
    let hasFreeDeliveryProduct = false;

    const verifiedItems = items.map(item => {
      const pId = item.id || item.product_id;
      const prd = db.getProductById(pId);
      const unitPrice = prd ? (prd.discount_price || prd.price) : Number(item.price || 0);
      const qty = Number(item.quantity) || 1;
      const isFreeDel = prd ? !!prd.is_free_delivery : !!item.is_free_delivery;
      if (isFreeDel) hasFreeDeliveryProduct = true;

      subtotal += unitPrice * qty;
      return {
        id: pId,
        product_id: pId,
        title: prd ? prd.title : (item.title || 'Product'),
        price: unitPrice,
        quantity: qty,
        is_free_delivery: isFreeDel,
        thumbnail: prd ? prd.thumbnail : (item.thumbnail || '')
      };
    });
    let finalUserId = user_id || null;
    if (!finalUserId && req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'al_ansar_super_shop_secret_key_2026');
        if (decoded && decoded.id) finalUserId = decoded.id;
      } catch (e) {}
    }
    if (!finalUserId && customer_phone) {
      const cleanP = customer_phone.trim().replace(/^(\+88|88)/, '');
      const u = db.getUserByPhone(cleanP);
      if (u) finalUserId = u.id;
    }

    // Check unpaid Qard debt status & auto repayment calculation
    const existingUser = finalUserId ? db.getUserById(finalUserId) : null;
    const hasUnpaidQard = Boolean(existingUser && existingUser.has_unpaid_qard && Number(existingUser.qard_unpaid_amount) > 0);

    const discount = Number(discount_amount) || 0;
    let qardRepayAmount = Number(req.body.qard_repayment_amount) || 0;
    if (hasUnpaidQard) {
      const repayPct = Number(siteSettings.qard_repay_percentage) > 0 ? Number(siteSettings.qard_repay_percentage) : 2;
      const netProductPrice = Math.max(0, subtotal - discount);
      const autoCalculatedRepay = Math.min(Number(existingUser.qard_unpaid_amount), Math.max(1, Math.round(netProductPrice * (repayPct / 100))));
      qardRepayAmount = Math.max(qardRepayAmount, autoCalculatedRepay);
    }

    const isThresholdFree = subtotal >= (siteSettings.free_delivery_threshold || 2000);
    const finalDeliveryFee = (hasFreeDeliveryProduct || isThresholdFree) ? 0 : standardDeliveryFee;
    const total_amount = Math.max(0, subtotal - discount) + finalDeliveryFee + qardRepayAmount;

    const qardAmount = Number(req.body.qard_amount || req.body.qard_deferred_amount || 0);
    if (pMethod === 'qard' || qardAmount > 0) {
      if (!existingUser || existingUser.qard_status !== 'Approved') {
        return res.status(400).json({
          success: false,
          message: 'করযে হাসানা সুবিধা গ্রহণের জন্য আপনার অ্যাকাউন্ট অ্যাডমিন দ্বারা অনুমোদিত হতে হবে।'
        });
      }
      if (hasUnpaidQard) {
        return res.status(400).json({
          success: false,
          message: `আপনার পূর্বের করযে হাসানা ঋণ বকেয়া রয়েছে (৳${existingUser.qard_unpaid_amount})। পূর্বের ঋণ সম্পূর্ণ পরিশোধ না করা পর্যন্ত নতুন করযে হাসানা নির্বাচন করা যাবে না। অনুগ্রহ করে সাধারণ পেমেন্টে অর্ডার সম্পন্ন করুন।`
        });
      }
      const userMaxPct = Number(existingUser.qard_max_percentage) > 0 ? Number(existingUser.qard_max_percentage) : (Number(siteSettings.qard_max_percentage) || 10);
      const reqPct = Number(req.body.qard_percentage) || 0;
      if (reqPct > userMaxPct) {
        return res.status(400).json({
          success: false,
          message: `আপনার অ্যাকাউন্টের জন্য করযে হাসানা সর্বোচ্চ ${userMaxPct}% পর্যন্ত অনুমোদিত।`
        });
      }
    }

    const pointsUsed = Number(req.body.points_used) || 0;
    if (pointsUsed > 0 && existingUser && Number(existingUser.loyalty_points_limit) > 0) {
      if (pointsUsed > Number(existingUser.loyalty_points_limit)) {
        return res.status(400).json({
          success: false,
          message: `আপনার অ্যাকাউন্টে প্রতি অর্ডারে সর্বোচ্চ ${existingUser.loyalty_points_limit} পয়েন্ট রিডিম করার সীমা নির্ধারিত রয়েছে।`
        });
      }
    }

    const orderCode = 'ANSAR-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder = db.createOrder({
      user_id: finalUserId,
      order_code: orderCode,
      order_number: orderCode,
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
      applied_voucher_code: voucherCode,
      total_amount,
      payment_method: pMethod,
      advance_delivery_fee_paid: Boolean(req.body.advance_delivery_fee_paid),
      delivery_fee_method: req.body.delivery_fee_method || '',
      remaining_cod_amount: Number(req.body.remaining_cod_amount) || Math.max(0, total_amount - finalDeliveryFee),
      sender_number: sender_number ? sender_number.trim() : '',
      transaction_id: transaction_id ? transaction_id.trim().toUpperCase() : '',
      qard_nid: (req.body.qard_nid || req.body.payment_details?.qard_nid || '').trim(),
      qard_amount: qardAmount,
      qard_percentage: Number(req.body.qard_percentage) || 0,
      qard_repayment_amount: qardRepayAmount,
      points_used: Number(req.body.points_used) || 0,
      points_discount: Number(req.body.points_discount) || 0,
      payable_now: Number(req.body.payable_now) !== undefined ? Number(req.body.payable_now) : Math.max(0, total_amount - qardAmount),
      notes: (notes || '').trim()
    });

    // In-app admin notification for Main Admin & Sub-admins (PC + Mobile)
    const customOrderPrefix = siteSettings?.custom_order_notif_msg || 'নতুন অর্ডার এসেছে';
    const notif = db.createAdminNotification({
      type: 'order',
      title: `🛒 ${customOrderPrefix}`,
      message: `অর্ডার #${newOrder.order_code} - ${newOrder.customer_name} (৳${Number(newOrder.total_amount).toLocaleString()})`,
      link_tab: 'orders',
      data: { order_id: newOrder.id, order_code: newOrder.order_code, total_amount: newOrder.total_amount }
    });

    // Notify connected admins via admin_channel (User does NOT receive this)
    if (req.app.get('io')) {
      req.app.get('io').to('admin_channel').emit('new_order', newOrder);
      req.app.get('io').to('admin_channel').emit('admin_notification', notif);
      if (finalUserId) {
        const freshUser = db.getUserById(finalUserId);
        if (freshUser) {
          req.app.get('io').emit('user_updated', { userId: finalUserId, user: freshUser });
        }
      }
    }

    // Send email alert to admin notification address
    const itemsSummary = verifiedItems.map(i => `${i.title} (${i.quantity}টি)`).join(', ');
    mailService.sendAdminAlert({
      type: 'order',
      title: `${customOrderPrefix} #${newOrder.order_code} (৳${Number(newOrder.total_amount).toLocaleString()})`,
      message: `${customOrderPrefix}: ${newOrder.customer_name} একটি নতুন অর্ডার সম্পন্ন করেছেন।`,
      details: {
        'অর্ডার নম্বর': '#' + newOrder.order_code,
        'গ্রাহকের নাম': newOrder.customer_name,
        'মোবাইল নম্বর': newOrder.customer_phone,
        'ইমেইল': newOrder.customer_email || 'দেওয়া হয়নি',
        'ডেলিভারি ঠিকানা': `${newOrder.shipping_address}, ${newOrder.shipping_city}`,
        'পেমেন্ট মেথড': newOrder.payment_method?.toUpperCase(),
        'মোট প্রদেয়': `৳${Number(newOrder.total_amount).toLocaleString()}`,
        'পণ্য তালিকা': itemsSummary
      },
      link: 'https://alansarbd.com/admin'
    }).catch(err => console.error('Order admin email error:', err.message));

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

// GET AUTHENTICATED USER QARD-E-HASANA LEDGER & STATEMENT
router.get('/my-qard-ledger', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' });
    }

    const userOrders = db.getOrdersByUserId(userId) || [];
    const qardTransactions = [];

    // 1. Borrowed & order-based installments
    userOrders.forEach(ord => {
      if (Number(ord.qard_amount) > 0) {
        qardTransactions.push({
          id: 'qard_borrow_' + ord.id,
          type: 'borrowed',
          amount: Number(ord.qard_amount),
          title: `অর্ডার #${ord.order_code || ord.order_number} এ করযে হাসানা (১০% ধার)`,
          method: 'করযে হাসানা',
          date: ord.created_at,
          order_code: ord.order_code || ord.order_number
        });
      }
      if (Number(ord.qard_repayment_amount) > 0) {
        qardTransactions.push({
          id: 'qard_repay_ord_' + ord.id,
          type: 'repayment',
          amount: Number(ord.qard_repayment_amount),
          title: `অর্ডার #${ord.order_code || ord.order_number} এ কিস্তি পরিশোধ`,
          method: 'অর্ডার কিস্তি',
          date: ord.created_at,
          order_code: ord.order_code || ord.order_number
        });
      }
    });

    // 2. Direct repayments from user.qard_history
    if (Array.isArray(user.qard_history)) {
      user.qard_history.forEach(qh => {
        if (!qardTransactions.some(existing => existing.id === qh.id)) {
          qardTransactions.push({
            id: qh.id,
            type: 'repayment',
            amount: Number(qh.amount || 0),
            title: `সরাসরি ঋণ পরিশোধ (${qh.payment_method || 'MFS'})`,
            method: qh.payment_method || 'direct',
            sender_number: qh.sender_number || '',
            transaction_id: qh.transaction_id || '',
            notes: qh.notes || '',
            date: qh.created_at || user.qard_last_repayment_at
          });
        }
      });
    }

    qardTransactions.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    const totalQardBorrowed = qardTransactions
      .filter(t => t.type === 'borrowed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const directRepaidSum = qardTransactions
      .filter(t => t.type === 'repayment')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalQardRepaid = Math.max(directRepaidSum, Number(user.qard_total_repaid) || 0);

    let daysRemaining = null;
    let isOverdue = false;
    if (user.qard_due_date) {
      const due = new Date(user.qard_due_date);
      const now = new Date();
      daysRemaining = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      isOverdue = daysRemaining < 0;
    }

    const creditLimit = Number(user.qard_credit_limit || user.qard_limit || 5000);
    const unpaidDebt = Number(user.qard_unpaid_amount || 0);
    const availableCredit = Math.max(0, creditLimit - unpaidDebt);

    const qardLedger = {
      status: user.qard_status || 'None',
      credit_limit: creditLimit,
      available_credit: availableCredit,
      total_borrowed: totalQardBorrowed || unpaidDebt,
      total_repaid: totalQardRepaid,
      unpaid_debt: unpaidDebt,
      has_unpaid_qard: Boolean(user.has_unpaid_qard && unpaidDebt > 0),
      due_date: user.qard_due_date,
      days_remaining: daysRemaining,
      is_overdue: isOverdue,
      transactions: qardTransactions
    };

    return res.json({ success: true, ledger: qardLedger });
  } catch (err) {
    console.error('Error fetching user qard ledger:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching qard ledger.' });
  }
});

// USER REPAY QARD DEBT DIRECTLY FROM DASHBOARD
router.post('/repay-qard', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, payment_method, sender_number, transaction_id, notes } = req.body;
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'সঠিক পরিশোধের পরিমাণ প্রদান করুন।' });
    }
    if (!sender_number || !sender_number.trim()) {
      return res.status(400).json({ success: false, message: 'প্রেরক মোবাইল নম্বর আবশ্যক।' });
    }
    if (!transaction_id || !transaction_id.trim()) {
      return res.status(400).json({ success: false, message: 'ট্রানজেকশন আইডি (TrxID) আবশ্যক।' });
    }

    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' });
    }

    const updatedUser = db.repayUserQard(userId, numAmount, notes || 'গ্রাহক ড্যাশবোর্ড থেকে ঋণ পরিশোধ', {
      payment_method: payment_method || 'bKash',
      sender_number: sender_number.trim(),
      transaction_id: transaction_id.trim(),
      notes: notes || ''
    });

    const safeUser = { ...updatedUser };
    delete safeUser.password_hash;

    const io = req.app.get('io');
    if (io) {
      io.emit('user_updated', { userId: updatedUser.id, user: safeUser });
      io.to('admin_channel').emit('admin_notification', {
        id: 'notif_qard_repay_' + Date.now(),
        type: 'qard_repayment',
        title: '🌸 করযে হাসানা ঋণ পরিশোধ',
        message: `${user.name} ৳${numAmount.toLocaleString()} ঋণ পরিশোধ করেছেন (${payment_method || 'MFS'}, TrxID: ${transaction_id.trim()})`,
        created_at: new Date().toISOString()
      });
    }

    return res.json({
      success: true,
      message: 'করযে হাসানা ঋণ সফলভাবে পরিশোধ করা হয়েছে!',
      user: safeUser
    });
  } catch (err) {
    console.error('Error in customer repay-qard:', err);
    return res.status(500).json({ success: false, message: 'ঋণ পরিশোধ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' });
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
router.get('/', requirePermission('orders.view'), (req, res) => {
  try {
    let orders = db.getOrders() || [];
    const { status, payment_method, search } = req.query;

    if (status && status !== 'all') {
      orders = orders.filter(o => (o.status || '').toLowerCase() === status.toLowerCase());
    }

    if (payment_method && payment_method !== 'all') {
      orders = orders.filter(o => (o.payment_method || '').toLowerCase() === payment_method.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      orders = orders.filter(o =>
        (o.order_code || o.order_number || '').toLowerCase().includes(q) ||
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.customer_phone || '').toLowerCase().includes(q) ||
        (o.transaction_id && o.transaction_id.toLowerCase().includes(q)) ||
        (o.consignment_id && o.consignment_id.toLowerCase().includes(q)) ||
        (Array.isArray(o.items) && o.items.some(it => (it.title || '').toLowerCase().includes(q)))
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

    const existingOrder = db.getOrderById(id);
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: 'Order not found to update.' });
    }

    // Granular permission check for staff
    if (req.user.is_staff) {
      const perms = Array.isArray(req.user.permissions) ? req.user.permissions : [];
      const hasWildcard = perms.includes('*');
      const hasStatusPerm = hasWildcard || perms.includes('orders.status_update');
      const hasCourierPerm = hasWildcard || perms.includes('orders.courier_link');

      const isChangingStatus = status && status !== existingOrder.status;
      const isUpdatingCourier = courier_name !== undefined || consignment_id !== undefined || courier_tracking_url !== undefined;

      if (isChangingStatus && !hasStatusPerm) {
        return res.status(403).json({ success: false, message: 'অর্ডার স্ট্যাটাস পরিবর্তনের অনুমতি আপনার নেই।' });
      }
      if (isUpdatingCourier && !hasCourierPerm) {
        return res.status(403).json({ success: false, message: 'কুরিয়ার ট্র্যাকিং ও লিংক পরিবর্তনের অনুমতি আপনার নেই।' });
      }
      if (!isChangingStatus && !isUpdatingCourier && !hasStatusPerm && !hasCourierPerm) {
        return res.status(403).json({ success: false, message: 'অর্ডার পরিবর্তন করার অনুমতি আপনার নেই।' });
      }
    }

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const courierDetails = {};
    if (courier_name !== undefined) courierDetails.courier_name = (courier_name || '').trim();
    if (consignment_id !== undefined) {
      const cleanId = (consignment_id || '').trim();
      courierDetails.consignment_id = cleanId;
      courierDetails.tracking_code = cleanId;
    }
    if (courier_tracking_url !== undefined) {
      const cleanUrl = (courier_tracking_url || '').trim();
      courierDetails.courier_tracking_url = cleanUrl;
      courierDetails.tracking_url = cleanUrl;
    }

    const updates = {
      ...(note ? { note: note.trim() } : {}),
      ...courierDetails
    };

    const targetStatus = status || existingOrder.status;
    const updatedOrder = db.updateOrderStatus(id, targetStatus, updates);
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
