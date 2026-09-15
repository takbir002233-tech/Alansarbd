const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAdmin, requireSuperAdmin, requirePermission } = require('../middleware/auth');

// DASHBOARD ANALYTICS & STATS
router.get('/stats', requireAdmin, (req, res) => {
  try {
    const orders = db.getOrders();
    const products = db.getProducts();
    const users = db.getUsers();

    // Check if staff or admin has permission to view financial revenue
    const canViewRevenue = req.user.role === 'admin' && (!req.user.is_staff || (Array.isArray(req.user.permissions) && (req.user.permissions.includes('dashboard.revenue') || req.user.permissions.includes('*'))));

    // Calculate revenue from non-cancelled orders by time range
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const yearStart = new Date(now.getFullYear(), 0, 1).getTime();

    const revenueToday = validOrders
      .filter(o => new Date(o.created_at).getTime() >= todayStart)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const revenueWeek = validOrders
      .filter(o => new Date(o.created_at).getTime() >= weekStart)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const revenueMonth = validOrders
      .filter(o => new Date(o.created_at).getTime() >= monthStart)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const revenueYear = validOrders
      .filter(o => new Date(o.created_at).getTime() >= yearStart)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const revenueAll = totalRevenue;

    const ordersToday = orders.filter(o => new Date(o.created_at).getTime() >= todayStart).length;
    const ordersWeek = orders.filter(o => new Date(o.created_at).getTime() >= weekStart).length;
    const ordersMonth = orders.filter(o => new Date(o.created_at).getTime() >= monthStart).length;
    const ordersYear = orders.filter(o => new Date(o.created_at).getTime() >= yearStart).length;
    const ordersAll = orders.length;

    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const confirmedOrders = orders.filter(o => o.status === 'Confirmed').length;
    const processingOrders = orders.filter(o => o.status === 'Processing').length;
    const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

    const lowStockProducts = products.filter(p => p.stock <= 10);

    // Group sales by recent days for chart (up to 30 recent orders)
    const recentOrders = orders.slice(0, 30).map(o => canViewRevenue ? o : { ...o, total_amount: 0 });

    return res.json({
      success: true,
      stats: {
        has_revenue_access: canViewRevenue,
        total_revenue: canViewRevenue ? totalRevenue : null,
        revenue_by_period: canViewRevenue ? {
          today: revenueToday,
          week: revenueWeek,
          month: revenueMonth,
          year: revenueYear,
          all: revenueAll
        } : { today: null, week: null, month: null, year: null, all: null },
        total_orders: orders.length,
        orders_by_period: {
          today: ordersToday,
          week: ordersWeek,
          month: ordersMonth,
          year: ordersYear,
          all: ordersAll
        },
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
      const userOrders = orders.filter(o => o.user_id === user.id || (o.customer_phone && user.phone && o.customer_phone === user.phone));
      const totalSpent = userOrders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const cancelledOrders = userOrders.filter(o => (o.status || '').toLowerCase() === 'cancelled');
      const deliveredOrders = userOrders.filter(o => (o.status || '').toLowerCase() === 'delivered');

      const safe = { ...user };
      delete safe.password_hash;
      return {
        ...safe,
        orders_count: userOrders.length,
        cancelled_orders_count: cancelledOrders.length,
        delivered_orders_count: deliveredOrders.length,
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
router.put('/users/:id/toggle-block', requirePermission('customers.block'), (req, res) => {
  try {
    const { id } = req.params;
    const user = db.getUserById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (user.role === 'admin' && !user.is_staff) {
      return res.status(400).json({ success: false, message: 'সুপার অ্যাডমিনের অ্যাকাউন্ট সাসপেন্ড করা যাবে না।' });
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
router.put('/users/:id', requirePermission('customers.edit_limit'), (req, res) => {
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
    if (req.body.loyalty_card_approved !== undefined) updates.loyalty_card_approved = Boolean(req.body.loyalty_card_approved);
    if (req.body.loyalty_card_status) updates.loyalty_card_status = req.body.loyalty_card_status;
    if (req.body.loyalty_tier) updates.loyalty_tier = req.body.loyalty_tier;
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

// GET SINGLE USER PROFILE DETAILS & ORDERS
router.get('/users/:id/details', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const user = db.getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const allOrders = db.getOrders();
    const userOrders = allOrders
      .filter(o => o.user_id === user.id || (o.customer_phone && user.phone && o.customer_phone === user.phone))
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const totalOrders = userOrders.length;
    const cancelledOrders = userOrders.filter(o => (o.status || '').toLowerCase() === 'cancelled');
    const deliveredOrders = userOrders.filter(o => (o.status || '').toLowerCase() === 'delivered');
    const activeOrders = userOrders.filter(o => !['delivered', 'cancelled'].includes((o.status || '').toLowerCase()));
    const totalSpent = userOrders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const safeUser = { ...user };
    delete safeUser.password_hash;

    return res.json({
      success: true,
      user: safeUser,
      stats: {
        total_orders: totalOrders,
        cancelled_orders: cancelledOrders.length,
        delivered_orders: deliveredOrders.length,
        active_orders: activeOrders.length,
        total_spent: totalSpent
      },
      orders: userOrders
    });
  } catch (err) {
    console.error('Error fetching user details:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching user details.' });
  }
});

// DELETE USER ACCOUNT BY ADMIN
router.delete('/users/:id', requirePermission('customers.delete'), (req, res) => {
  try {
    const { id } = req.params;
    const user = db.getUserById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin' && !user.is_staff) {
      return res.status(400).json({ success: false, message: 'Administrator accounts cannot be deleted.' });
    }

    const success = db.deleteUser(id);
    if (!success) {
      return res.status(500).json({ success: false, message: 'Could not delete user account.' });
    }

    return res.json({
      success: true,
      message: `User account "${user.name}" has been permanently deleted.`
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting user.' });
  }
});


// QARD-E-HASANA APPLICATIONS (Submit & Review)
router.get('/qard-applications', requirePermission('customers.qard_applications'), (req, res) => {
  try {
    const apps = db.getQardApplications();
    return res.json({ success: true, applications: apps });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch Qard applications.' });
  }
});

router.post('/qard-applications', (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      nid_number, 
      address, 
      monthly_income, 
      requested_limit, 
      notes, 
      user_id,
      payment_method,
      payment_amount,
      transaction_id,
      sender_number,
      sender_bank_name
    } = req.body;
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
      notes: (notes || '').trim(),
      payment_method: (payment_method || 'mfs').trim(),
      payment_amount: Number(payment_amount) || 0,
      transaction_id: (transaction_id || '').trim().toUpperCase(),
      sender_number: (sender_number || '').trim(),
      sender_bank_name: (sender_bank_name || '').trim()
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

router.put('/qard-applications/:id', requirePermission('customers.qard_applications'), (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const result = db.updateQardApplicationStatus(id, status, notes);
    if (!result || !result.app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    const { app: updated, user } = result;

    const io = req.app.get('io');
    if (io) {
      io.emit('qard_status_updated', {
        id: updated.id,
        user_id: updated.user_id,
        phone: updated.phone,
        status: updated.status,
        notes: updated.admin_notes
      });
      if (user) {
        const safeUser = { ...user };
        delete safeUser.password_hash;
        io.emit('user_updated', { userId: user.id, user: safeUser });
      }
    }

    return res.json({ success: true, message: `Application status updated to ${status}!`, application: updated, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update application.' });
  }
});

// LOYALTY CARD APPLICATIONS (Submit & Review)
router.get('/loyalty-applications', requirePermission('customers.loyalty_applications'), (req, res) => {
  try {
    const apps = db.getLoyaltyApplications();
    return res.json({ success: true, applications: apps });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch loyalty applications.' });
  }
});

router.post('/loyalty-applications', (req, res) => {
  try {
    const { name, phone, email, address, city, nid_number, user_id } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'নাম ও মোবাইল নম্বর আবশ্যক।' });
    }

    const newApp = db.createLoyaltyApplication({
      user_id: user_id || null,
      name: name.trim(),
      phone: phone.trim(),
      email: (email || '').trim(),
      address: (address || '').trim(),
      city: (city || 'Dhaka').trim(),
      nid_number: (nid_number || '').trim()
    });

    return res.status(201).json({
      success: true,
      message: 'আপনার লয়ালটি মেম্বারশিপ আবেদনটি সফলভাবে জমা হয়েছে! অ্যাডমিন টিম যাচাই করে অনুমোদন করবে।',
      application: newApp
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to submit loyalty application.' });
  }
});

router.put('/loyalty-applications/:id', requirePermission('customers.loyalty_applications'), (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const result = db.updateLoyaltyApplicationStatus(id, status, notes);
    if (!result || !result.app) {
      return res.status(404).json({ success: false, message: 'Loyalty application not found.' });
    }
    const { app: updated, user } = result;

    const io = req.app.get('io');
    if (io) {
      io.emit('loyalty_status_updated', {
        id: updated.id,
        user_id: updated.user_id,
        phone: updated.phone,
        status: updated.status,
        notes: updated.admin_notes
      });
      if (user) {
        const safeUser = { ...user };
        delete safeUser.password_hash;
        io.emit('user_updated', { userId: user.id, user: safeUser });
      }
    }

    return res.json({ success: true, message: `Loyalty application status updated to ${status}!`, application: updated, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update loyalty application.' });
  }
});

// ACCOUNT SUSPENSION APPEALS (Submit & Review)
router.get('/account-appeals', requirePermission('customers.appeals'), (req, res) => {
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

router.put('/account-appeals/:id', requirePermission('customers.appeals'), (req, res) => {
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
router.put('/settings', requirePermission('settings.manage'), (req, res) => {
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

// ==========================================
// SUB-ADMIN / MODERATOR (STAFF) MANAGEMENT
// (Only Accessible by Main Super Admin)
// ==========================================

// GET all staff members
router.get('/staff', requireSuperAdmin, (req, res) => {
  try {
    const staff = db.getStaffUsers();
    return res.json({ success: true, staff });
  } catch (err) {
    console.error('Error fetching staff users:', err);
    return res.status(500).json({ success: false, message: 'স্টাফ তালিকা লোড করতে সমস্যা হয়েছে।' });
  }
});

// CREATE new sub-admin / staff
router.post('/staff', requireSuperAdmin, async (req, res) => {
  try {
    const { name, phone, email, password, custom_role, permissions } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'স্টাফের নাম প্রদান করুন।' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: '১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।' });
    }

    const cleanPhone = phone.trim();
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)।' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
    }

    // Check if phone or email is already registered
    const existingPhone = db.getUserByPhone(cleanPhone);
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে।' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail) {
      const existingEmail = db.getUserByEmail(cleanEmail);
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে।' });
      }
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newStaff = db.createStaffUser({
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail || `${cleanPhone}@staff.halal.local`,
      password_hash,
      custom_role: (custom_role || 'মডারেটর').trim(),
      permissions: Array.isArray(permissions) ? permissions : []
    });

    const safeStaff = { ...newStaff };
    delete safeStaff.password_hash;

    return res.status(201).json({
      success: true,
      message: `নতুন স্টাফ "${safeStaff.name}" (${safeStaff.custom_role}) সফলভাবে তৈরি করা হয়েছে!`,
      staff: safeStaff
    });
  } catch (err) {
    console.error('Error creating staff user:', err);
    return res.status(500).json({ success: false, message: 'স্টাফ অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে।' });
  }
});

// UPDATE sub-admin / staff
router.put('/staff/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, password, custom_role, permissions, is_blocked } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (custom_role) updates.custom_role = custom_role;
    if (Array.isArray(permissions)) updates.permissions = permissions;
    if (is_blocked !== undefined) updates.is_blocked = is_blocked;

    if (phone) {
      const cleanPhone = phone.trim();
      if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
        return res.status(400).json({ success: false, message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।' });
      }
      const existing = db.getUserByPhone(cleanPhone);
      if (existing && existing.id !== id) {
        return res.status(400).json({ success: false, message: 'এই মোবাইল নম্বর দিয়ে অন্য একজন ব্যবহারকারী রয়েছে।' });
      }
      updates.phone = cleanPhone;
    }

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const existing = db.getUserByEmail(cleanEmail);
      if (existing && existing.id !== id) {
        return res.status(400).json({ success: false, message: 'এই ইমেইল দিয়ে অন্য একজন ব্যবহারকারী রয়েছে।' });
      }
      updates.email = cleanEmail;
    }

    if (password && password.trim().length >= 6) {
      updates.password_hash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = db.updateStaffUser(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'স্টাফ অ্যাকাউন্টটি পাওয়া যায়নি।' });
    }

    const safeStaff = { ...updated };
    delete safeStaff.password_hash;

    return res.json({
      success: true,
      message: 'স্টাফের তথ্য ও পারমিশন সফলভাবে আপডেট হয়েছে!',
      staff: safeStaff
    });
  } catch (err) {
    console.error('Error updating staff user:', err);
    return res.status(500).json({ success: false, message: 'স্টাফের তথ্য আপডেট করতে ব্যর্থ হয়েছে।' });
  }
});

// DELETE sub-admin / staff
router.delete('/staff/:id', requireSuperAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteStaffUser(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'স্টাফ অ্যাকাউন্টটি পাওয়া যায়নি।' });
    }
    return res.json({
      success: true,
      message: 'স্টাফ অ্যাকাউন্টটি সফলভাবে মুছে ফেলা হয়েছে।'
    });
  } catch (err) {
    console.error('Error deleting staff user:', err);
    return res.status(500).json({ success: false, message: 'স্টাফ অ্যাকাউন্ট মুছে ফেলতে ব্যর্থ হয়েছে।' });
  }
});

module.exports = router;
