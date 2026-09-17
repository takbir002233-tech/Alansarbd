const express = require('express');
const router = express.Router();
const db = require('../db');
const mailService = require('../services/mailService');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// GET /api/refunds/policy - Public policy and process details
router.get('/policy', (req, res) => {
  try {
    const settings = db.getSiteSettings();
    return res.json({
      success: true,
      policy: {
        title: settings.refund_policy_title || 'রিফান্ড ও রিটার্ন নীতিমালা ও নির্দেশিকা',
        badge: settings.refund_policy_badge || 'সহজ ও ১০০% নিরাপদ রিটার্ন সেবা',
        terms: settings.refund_policy_terms || '',
        process_steps: settings.refund_process_steps || '',
        window_days: Number(settings.refund_window_days) || 7,
        support_phone: settings.refund_support_phone || settings.store_phone || '01711000000',
        support_email: settings.refund_support_email || settings.store_email || 'support@alansarbd.com'
      }
    });
  } catch (err) {
    console.error('Error fetching refund policy:', err);
    return res.status(500).json({ success: false, message: 'রিফান্ড পলিসি লোড করতে সমস্যা হয়েছে।' });
  }
});

// GET /api/refunds/my - Customer's own refund requests
router.get('/my', authenticateToken, (req, res) => {
  try {
    const refunds = db.getRefundRequestsByUserId(req.user.id);
    return res.json({ success: true, refunds });
  } catch (err) {
    console.error('Error fetching customer refunds:', err);
    return res.status(500).json({ success: false, message: 'রিফান্ড আবেদন তালিকা লোড করা যায়নি।' });
  }
});

// POST /api/refunds - Submit a new refund request
router.post('/', authenticateToken, (req, res) => {
  try {
    const { 
      order_id, 
      items, 
      reason, 
      detailed_reason, 
      evidence_images, 
      preferred_method, 
      payout_account, 
      bank_details 
    } = req.body;

    if (!order_id) {
      return res.status(400).json({ success: false, message: 'অর্ডার আইডি প্রদান করা আবশ্যক।' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'অন্তত একটি পণ্য নির্বাচন করুন।' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'রিফান্ডের সুনির্দিষ্ট কারণ উল্লেখ করুন।' });
    }

    if (!preferred_method) {
      return res.status(400).json({ success: false, message: 'টাকা ফেরত পাওয়ার মাধ্যম (বিকাশ/নগদ/রকেট/ব্যাংক) নির্বাচন করুন।' });
    }

    if (preferred_method !== 'bank' && (!payout_account || !payout_account.trim())) {
      return res.status(400).json({ success: false, message: 'টাকা ফেরত নেওয়ার মোবাইল ব্যাংকিং নম্বর দিন।' });
    }

    if (preferred_method === 'bank' && (!bank_details || !bank_details.account_number)) {
      return res.status(400).json({ success: false, message: 'সঠিক ব্যাংক একাউন্ট তথ্য প্রদান করুন।' });
    }

    // Verify order exists and belongs to current user
    const order = db.getOrderById(order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'অর্ডারটি খুঁজে পাওয়া যায়নি।' });
    }

    if (order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'আপনি শুধুমাত্র আপনার নিজের অর্ডারের রিফান্ড চাইতে পারেন।' });
    }

    // Check for duplicate pending/approved/processing refund request on this order
    const existingRefunds = db.getRefundRequestsByUserId(req.user.id);
    const activeRefund = existingRefunds.find(r => 
      r.order_id === order_id && 
      ['Pending', 'Approved', 'Processing'].includes(r.status)
    );

    if (activeRefund) {
      return res.status(400).json({
        success: false,
        message: `এই অর্ডারের জন্য ইতোমধ্যে একটি রিফান্ড আবেদন (${activeRefund.id}) প্রক্রিয়াধীন রয়েছে।`
      });
    }

    // Calculate total refundable amount
    let totalRefundAmount = 0;
    const validatedItems = items.map(item => {
      const price = Number(item.price) || 0;
      const qty = Math.max(1, Number(item.quantity) || 1);
      totalRefundAmount += price * qty;
      return {
        product_id: item.product_id || '',
        title: item.title || 'পণ্য',
        price: price,
        quantity: qty,
        image: item.image || item.thumbnail || ''
      };
    });

    const user = db.getUserById(req.user.id) || req.user;

    const newRefund = db.createRefundRequest({
      order_id: order.id,
      order_code: order.order_code || order.id,
      order_date: order.created_at,
      user_id: user.id,
      user_name: user.name || 'গ্রাহক',
      user_phone: user.phone || '',
      user_email: user.email || '',
      items: validatedItems,
      total_refund_amount: totalRefundAmount,
      reason: reason.trim(),
      detailed_reason: (detailed_reason || '').trim(),
      evidence_images: Array.isArray(evidence_images) ? evidence_images : (evidence_images ? [evidence_images] : []),
      preferred_method,
      payout_account: (payout_account || '').trim(),
      bank_details: bank_details || null,
      status: 'Pending',
      admin_notes: '',
      rejection_reason: '',
      refund_trx_id: ''
    });

    // Mark order with refund requested status flag
    try {
      db.updateOrderStatus(order.id, order.status, {
        has_refund_request: true,
        last_refund_id: newRefund.id,
        refund_status: 'Pending'
      });
    } catch (e) {}

    // In-app admin notification for Main Admin & Sub-admins (PC + Mobile)
    const notif = db.createAdminNotification({
      type: 'refund',
      title: '↩️ নতুন রিফান্ড আবেদন',
      message: `অর্ডার #${newRefund.order_code} - ৳${Number(newRefund.total_refund_amount).toLocaleString()} রিফান্ড চাওয়া হয়েছে (${newRefund.user_name})`,
      link_tab: 'refunds',
      data: { refund_id: newRefund.id, order_code: newRefund.order_code, amount: newRefund.total_refund_amount }
    });

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to('admin_channel').emit('admin_notification', notif);
      io.emit('new_refund_request', newRefund);
    }

    // Send admin email alert
    mailService.sendAdminAlert({
      type: 'refund',
      title: `নতুন রিফান্ড আবেদন (অর্ডার #${newRefund.order_code})`,
      message: `${newRefund.user_name} অর্ডার #${newRefund.order_code}-এর জন্য ৳${Number(newRefund.total_refund_amount).toLocaleString()} রিফান্ড আবেদন করেছেন।`,
      details: {
        'অর্ডার নম্বর': '#' + newRefund.order_code,
        'গ্রাহকের নাম': newRefund.user_name,
        'মোবাইল নম্বর': newRefund.user_phone,
        'ইমেইল': newRefund.user_email || 'দেওয়া হয়নি',
        'রিফান্ড পরিমাণ': `৳${Number(newRefund.total_refund_amount).toLocaleString()}`,
        'পেমেন্ট মেথড': (newRefund.preferred_method || 'bKash').toUpperCase(),
        'প্রাপক নম্বর/অ্যাকাউন্ট': newRefund.payout_account,
        'রিফান্ডের কারণ': newRefund.reason
      },
      link: 'https://alansarbd.com/admin'
    }).catch(err => console.error('Refund admin email error:', err.message));

    return res.status(201).json({
      success: true,
      message: 'আপনার রিফান্ড আবেদনটি সফলভাবে জমা হয়েছে! আমাদের টিম দ্রুত পর্যালোচনা করবে।',
      refund: newRefund
    });
  } catch (err) {
    console.error('Error creating refund request:', err);
    return res.status(500).json({ success: false, message: 'রিফান্ড আবেদন জমা দিতে ব্যর্থ হয়েছে।' });
  }
});

// GET /api/refunds/admin - Admin view all refund requests
router.get('/admin', requirePermission('refunds.manage'), (req, res) => {
  try {
    let refunds = db.getRefundRequests();
    const { status, search } = req.query;

    if (status && status !== 'all') {
      refunds = refunds.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      refunds = refunds.filter(r => 
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.order_code && r.order_code.toLowerCase().includes(q)) ||
        (r.user_name && r.user_name.toLowerCase().includes(q)) ||
        (r.user_phone && r.user_phone.includes(q)) ||
        (r.payout_account && r.payout_account.includes(q)) ||
        (r.reason && r.reason.toLowerCase().includes(q))
      );
    }

    return res.json({ success: true, refunds });
  } catch (err) {
    console.error('Error fetching admin refunds:', err);
    return res.status(500).json({ success: false, message: 'রিফান্ড তালিকা লোড করতে ব্যর্থ হয়েছে।' });
  }
});

// GET /api/refunds/admin/:id - Admin view single refund request
router.get('/admin/:id', requirePermission('refunds.manage'), (req, res) => {
  try {
    const refund = db.getRefundRequestById(req.params.id);
    if (!refund) {
      return res.status(404).json({ success: false, message: 'রিফান্ড আবেদনটি পাওয়া যায়নি।' });
    }
    const order = db.getOrderById(refund.order_id);
    return res.json({ success: true, refund, order });
  } catch (err) {
    console.error('Error fetching refund details:', err);
    return res.status(500).json({ success: false, message: 'রিফান্ড বিবরণ লোড করতে সমস্যা হয়েছে।' });
  }
});

// PUT /api/refunds/admin/:id/status - Admin update status
router.put('/admin/:id/status', requirePermission('refunds.manage'), (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, refund_trx_id, rejection_reason } = req.body;

    const validStatuses = ['Pending', 'Approved', 'Processing', 'Completed', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'অবৈধ স্ট্যাটাস প্রদান করা হয়েছে।' });
    }

    const updates = {};
    if (admin_notes !== undefined) updates.admin_notes = admin_notes.trim();
    if (refund_trx_id !== undefined) updates.refund_trx_id = refund_trx_id.trim();
    if (rejection_reason !== undefined) updates.rejection_reason = rejection_reason.trim();
    updates.processed_by = req.user.name || req.user.email || 'Admin';

    const updatedRefund = db.updateRefundRequestStatus(id, status, updates);
    if (!updatedRefund) {
      return res.status(404).json({ success: false, message: 'রিফান্ড আবেদনটি পাওয়া যায়নি।' });
    }

    // Sync status back to the order
    try {
      const order = db.getOrderById(updatedRefund.order_id);
      if (order) {
        db.updateOrderStatus(order.id, order.status, {
          refund_status: status,
          refund_trx_id: updatedRefund.refund_trx_id || order.refund_trx_id
        });
      }
    } catch (e) {}

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('refund_status_updated', updatedRefund);
    }

    // Customer email upon approval
    if (status === 'Approved' || status === 'Completed') {
      mailService.sendRefundApprovedEmail(updatedRefund)
        .catch(err => console.error('Refund approval email error:', err.message));
    }

    return res.json({
      success: true,
      message: `রিফান্ড স্ট্যাটাস সফলভাবে '${status}' করা হয়েছে।`,
      refund: updatedRefund
    });
  } catch (err) {
    console.error('Error updating refund status:', err);
    return res.status(500).json({ success: false, message: 'রিফান্ড স্ট্যাটাস আপডেট করা সম্ভব হয়নি।' });
  }
});

// PUT /api/refunds/admin/policy - Admin update policy settings
router.put('/admin/policy', requirePermission('refunds.manage'), (req, res) => {
  try {
    const {
      refund_policy_title,
      refund_policy_badge,
      refund_policy_terms,
      refund_process_steps,
      refund_window_days,
      refund_support_phone,
      refund_support_email
    } = req.body;

    const newSettings = {};
    if (refund_policy_title !== undefined) newSettings.refund_policy_title = refund_policy_title.trim();
    if (refund_policy_badge !== undefined) newSettings.refund_policy_badge = refund_policy_badge.trim();
    if (refund_policy_terms !== undefined) newSettings.refund_policy_terms = refund_policy_terms.trim();
    if (refund_process_steps !== undefined) newSettings.refund_process_steps = refund_process_steps.trim();
    if (refund_window_days !== undefined) newSettings.refund_window_days = Math.max(1, Number(refund_window_days) || 7);
    if (refund_support_phone !== undefined) newSettings.refund_support_phone = refund_support_phone.trim();
    if (refund_support_email !== undefined) newSettings.refund_support_email = refund_support_email.trim();

    const updated = db.updateSiteSettings(newSettings);

    const io = req.app.get('io');
    if (io) {
      io.emit('site_settings_updated', updated);
    }

    return res.json({
      success: true,
      message: 'রিফান্ড নীতিমালা ও প্রসেস সেটিংস সফলভাবে সংরক্ষিত হয়েছে!',
      settings: updated
    });
  } catch (err) {
    console.error('Error updating refund policy:', err);
    return res.status(500).json({ success: false, message: 'রিফান্ড পলিসি সংরক্ষণ করতে সমস্যা হয়েছে।' });
  }
});

module.exports = router;
