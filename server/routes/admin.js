const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// DASHBOARD ANALYTICS & STATS
router.get('/stats', requireAdmin, (req, res) => {
  try {
    const orders = db.getOrders();
    const products = db.getProducts();
    const users = db.getUsers();

    // Calculate revenue from non-cancelled orders
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const confirmedOrders = orders.filter(o => o.status === 'Confirmed').length;
    const processingOrders = orders.filter(o => o.status === 'Processing').length;
    const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

    const lowStockProducts = products.filter(p => p.stock <= 5);

    // Group sales by recent days for chart
    const recentOrders = orders.slice(0, 7);

    return res.json({
      success: true,
      stats: {
        total_revenue: totalRevenue,
        total_orders: orders.length,
        pending_orders: pendingOrders,
        confirmed_orders: confirmedOrders,
        processing_orders: processingOrders,
        shipped_orders: shippedOrders,
        delivered_orders: deliveredOrders,
        cancelled_orders: cancelledOrders,
        total_products: products.length,
        low_stock_count: lowStockProducts.length,
        total_users: users.length,
        blocked_users_count: users.filter(u => u.is_blocked).length,
        qard_applications_count: (db.getQardApplications() || []).length,
        account_appeals_count: (db.getAccountAppeals() || []).length
      },
      low_stock_products: lowStockProducts,
      recent_orders: recentOrders
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching statistics.' });
  }
});

// GET ALL USERS (with order stats per user)
router.get('/users', requireAdmin, (req, res) => {
  try {
    const users = db.getUsers();
    const orders = db.getOrders();

    const usersWithStats = users.map(user => {
      const userOrders = orders.filter(o => o.user_id === user.id);
      const totalSpent = userOrders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      const safe = { ...user };
      delete safe.password_hash;
      return {
        ...safe,
        orders_count: userOrders.length,
        total_spent: totalSpent
      };
    });

    return res.json({
      success: true,
      users: usersWithStats
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching users.' });
  }
});

// BAN / BLOCK / UNBLOCK USER TOGGLE
router.put('/users/:id/toggle-block', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const user = db.getUserById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Administrator accounts cannot be banned.' });
    }

    const updated = db.updateUser(id, { is_blocked: !user.is_blocked });
    const safeUser = { ...updated };
    delete safeUser.password_hash;

    return res.json({
      success: true,
      message: `User ${safeUser.name} has been ${safeUser.is_blocked ? 'SUSPENDED/BANNED' : 'ACTIVATED/UNBLOCKED'}.`,
      user: safeUser
    });
  } catch (err) {
    console.error('Error toggling block state:', err);
    return res.status(500).json({ success: false, message: 'Server error changing block state.' });
  }
});

// ADMIN: EDIT USER INFORMATION
router.put('/users/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, city, role, loyalty_points, qard_credit_limit, qard_status } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (phone) updates.phone = phone.trim();
    if (address) updates.address = address.trim();
    if (city) updates.city = city.trim();
    if (role && ['user', 'admin'].includes(role)) updates.role = role;
    if (loyalty_points !== undefined) updates.loyalty_points = Number(loyalty_points);
    if (qard_credit_limit !== undefined) {
      updates.qard_credit_limit = Number(qard_credit_limit);
      updates.qard_available_credit = Number(qard_credit_limit);
    }
    if (qard_status) updates.qard_status = qard_status;

    const updated = db.updateUser(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const safeUser = { ...updated };
    delete safeUser.password_hash;

    return res.json({
      success: true,
      message: 'User details updated successfully!',
      user: safeUser
    });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ success: false, message: 'Server error updating user.' });
  }
});

// QARD-E-HASANA APPLICATIONS (Submit & Review)
router.get('/qard-applications', requireAdmin, (req, res) => {
  try {
    const apps = db.getQardApplications();
    return res.json({ success: true, applications: apps });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch Qard applications.' });
  }
});

router.post('/qard-applications', (req, res) => {
  try {
    const { name, phone, email, nid_number, address, monthly_income, requested_limit, notes, user_id } = req.body;
    if (!name || !phone || !nid_number) {
      return res.status(400).json({ success: false, message: 'নাম, মোবাইল নম্বর ও জাতীয় পরিচয়পত্র (NID) নম্বর আবশ্যক।' });
    }

    const newApp = db.createQardApplication({
      user_id: user_id || null,
      name: name.trim(),
      phone: phone.trim(),
      email: (email || '').trim(),
      nid_number: nid_number.trim(),
      address: (address || '').trim(),
      monthly_income: Number(monthly_income) || 0,
      requested_limit: Number(requested_limit) || 5000,
      notes: (notes || '').trim()
    });

    return res.status(201).json({
      success: true,
      message: 'আপনার করযে হাসানা আবেদনটি সফলভাবে জমা হয়েছে! অ্যাডমিন টিম যাচাই করে অনুমোদন করবে।',
      application: newApp
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to submit Qard application.' });
  }
});

router.put('/qard-applications/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const updated = db.updateQardApplicationStatus(id, status, notes);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    return res.json({ success: true, message: `Application status updated to ${status}!`, application: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update application.' });
  }
});

// ACCOUNT SUSPENSION APPEALS (Submit & Review)
router.get('/account-appeals', requireAdmin, (req, res) => {
  try {
    const appeals = db.getAccountAppeals();
    return res.json({ success: true, appeals });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch account appeals.' });
  }
});

router.post('/account-appeals', (req, res) => {
  try {
    const { user_email, user_phone, user_name, reason } = req.body;
    if (!user_email && !user_phone) {
      return res.status(400).json({ success: false, message: 'ইমেইল অথবা মোবাইল নম্বর প্রদান করা আবশ্যক।' });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'রিভিউ আবেদনের কারণ বা ব্যাখ্যা লিখুন।' });
    }

    const appeal = db.createAccountAppeal({
      user_email: (user_email || '').trim(),
      user_phone: (user_phone || '').trim(),
      user_name: (user_name || '').trim(),
      reason: reason.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'আপনার অ্যাকাউন্ট রিভিউ আবেদনটি গ্রহণ করা হয়েছে। অ্যাডমিন পর্যালোচনা করে দ্রুত ব্যবস্থা গ্রহণ করবে।',
      appeal
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to submit appeal.' });
  }
});

router.put('/account-appeals/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_reply } = req.body;
    const updated = db.updateAccountAppealStatus(id, status, admin_reply);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Appeal not found.' });
    }
    return res.json({ success: true, message: `Appeal marked as ${status}! User unblocked if resolved.`, appeal: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update appeal.' });
  }
});

// GET SITE SETTINGS (Public & Admin)
router.get('/settings', (req, res) => {
  try {
    const settings = db.getSiteSettings();
    return res.json({ success: true, settings });
  } catch (err) {
    console.error('Error getting site settings:', err);
    return res.status(500).json({ success: false, message: 'Server error getting settings.' });
  }
});

// UPDATE SITE SETTINGS
router.put('/settings', requireAdmin, (req, res) => {
  try {
    const newSettings = req.body;
    const updated = db.updateSiteSettings(newSettings);
    return res.json({
      success: true,
      message: 'Store settings and payment configuration updated!',
      settings: updated
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    return res.status(500).json({ success: false, message: 'Server error updating settings.' });
  }
});

module.exports = router;
