const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// APPLY VOUCHER CODE (Public customer endpoint)
router.post('/apply', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a voucher code.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const vouchers = db.getVouchers();
    const voucher = vouchers.find(v => v.code === cleanCode && v.is_active);

    if (!voucher) {
      return res.status(404).json({ success: false, message: `Voucher code "${cleanCode}" is invalid or expired.` });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (voucher.min_spend && orderSubtotal < voucher.min_spend) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ৳${voucher.min_spend.toLocaleString()} required to use voucher ${voucher.code}.`
      });
    }

    let discountAmount = 0;
    if (voucher.discount_type === 'percent') {
      discountAmount = Math.round((orderSubtotal * voucher.discount_value) / 100);
    } else {
      discountAmount = voucher.discount_value;
    }

    return res.json({
      success: true,
      message: `Voucher "${voucher.code}" applied! You saved ৳${discountAmount.toLocaleString()}`,
      voucher: {
        code: voucher.code,
        discount_type: voucher.discount_type,
        discount_value: voucher.discount_value,
        discount_amount: discountAmount
      }
    });
  } catch (err) {
    console.error('Error applying voucher:', err);
    return res.status(500).json({ success: false, message: 'Server error checking voucher.' });
  }
});

// GET ALL VOUCHERS (for admin table or active list)
router.get('/', (req, res) => {
  try {
    const vouchers = db.getVouchers();
    return res.json({ success: true, vouchers });
  } catch (err) {
    console.error('Error getting vouchers:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching vouchers.' });
  }
});

// ADMIN: CREATE VOUCHER
router.post('/', requireAdmin, (req, res) => {
  try {
    const { code, discount_type, discount_value, min_spend, is_active, description } = req.body;
    if (!code || !discount_value) {
      return res.status(400).json({ success: false, message: 'Voucher code and discount value are required.' });
    }

    const newVoucher = db.createVoucher({
      code,
      discount_type: discount_type || 'percent',
      discount_value,
      min_spend: min_spend || 0,
      is_active: is_active !== undefined ? is_active : true,
      description: description || ''
    });

    return res.status(201).json({
      success: true,
      message: `Voucher code ${newVoucher.code} created successfully!`,
      voucher: newVoucher
    });
  } catch (err) {
    console.error('Error creating voucher:', err);
    return res.status(500).json({ success: false, message: 'Server error creating voucher.' });
  }
});

// ADMIN: UPDATE VOUCHER
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = db.updateVoucher(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Voucher not found to update.' });
    }
    return res.json({
      success: true,
      message: 'Voucher updated successfully!',
      voucher: updated
    });
  } catch (err) {
    console.error('Error updating voucher:', err);
    return res.status(500).json({ success: false, message: 'Server error updating voucher.' });
  }
});

// ADMIN: DELETE VOUCHER
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteVoucher(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }
    return res.json({
      success: true,
      message: 'Voucher deleted successfully!'
    });
  } catch (err) {
    console.error('Error deleting voucher:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting voucher.' });
  }
});

module.exports = router;
