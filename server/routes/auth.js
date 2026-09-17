const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const mailService = require('../services/mailService');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Phone regex for Bangladesh (e.g. 01712345678, 018..., 019..., 013..., 014..., 015..., 016...)
const BD_PHONE_REGEX = /^(?:\+88|88)?(01[3-9]\d{8})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// REGISTER
router.post('/register', (req, res) => {
  try {
    const { name, email, phone, password, address, city, postal_code } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address (e.g. user@gmail.com).' });
    }

    if (!phone || !BD_PHONE_REGEX.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).' });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, message: 'Delivery address is mandatory for quick checkout.' });
    }

    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, message: 'City / District is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check existing email
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/^(\+88|88)/, '');

    if (db.getUserByEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    if (db.getUserByPhone(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'An account with this phone number already exists.' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const newUser = db.createUser({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password_hash,
      address: address.trim(),
      city: city.trim(),
      postal_code: (postal_code || '').trim(),
      role: 'user'
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = { ...newUser };
    delete safeUser.password_hash;

    // Send customer welcome email
    mailService.sendWelcomeEmail(newUser)
      .catch(err => console.error('Customer welcome email error:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered!',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// LOGIN
router.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email/Phone and Password are required.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    let user = db.getUserByEmail(cleanId);
    if (!user) {
      user = db.getUserByPhone(cleanId.replace(/^(\+88|88)/, ''));
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email or phone number.' });
    }

    if (user.is_blocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by administration. Please contact support.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please try again.' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        is_staff: user.is_staff || false,
        permissions: user.permissions || []
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = { ...user };
    delete safeUser.password_hash;

    return res.json({
      success: true,
      message: 'Welcome back, ' + user.name + '!',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// GET CURRENT USER PROFILE
router.get('/me', authenticateToken, (req, res) => {
  const user = db.getUserById(req.user.id) || req.user;
  const safeUser = { ...user };
  delete safeUser.password_hash;

  // Check if user has pending deletion appeal
  const appeals = db.getAccountAppeals() || [];
  const pendingAppeal = appeals.find(a => 
    (a.user_id === user.id || (a.user_email && a.user_email === user.email) || (a.user_phone && a.user_phone === user.phone)) &&
    a.appeal_type === 'account_deletion' &&
    a.status === 'Under Review'
  );
  if (pendingAppeal) {
    safeUser.pending_deletion_appeal = pendingAppeal;
  }

  return res.json({ success: true, user: safeUser });
});

// UPDATE PROFILE
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, phone, email, address, city, postal_code } = req.body;
    const updates = {};

    if (name && name.trim()) updates.name = name.trim();
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const existingEmailUser = db.getUserByEmail(cleanEmail);
      if (existingEmailUser && existingEmailUser.id !== req.user.id) {
        return res.status(400).json({ success: false, message: 'এই ইমেইলটি ইতিমধ্যে অন্য একজন গ্রাহকের অ্যাকাউন্টে ব্যবহৃত হচ্ছে।' });
      }
      updates.email = cleanEmail;
    }
    if (phone && BD_PHONE_REGEX.test(phone.trim())) {
      const cleanPhone = phone.trim().replace(/^(\+88|88)/, '');
      const existingPhoneUser = db.getUserByPhone(cleanPhone);
      if (existingPhoneUser && existingPhoneUser.id !== req.user.id) {
        return res.status(400).json({ success: false, message: 'Phone number already in use by another account.' });
      }
      updates.phone = cleanPhone;
    }
    if (address && address.trim()) updates.address = address.trim();
    if (city && city.trim()) updates.city = city.trim();
    if (postal_code !== undefined) updates.postal_code = postal_code.trim();

    const updatedUser = db.updateUser(req.user.id, updates);
    const safeUser = { ...updatedUser };
    delete safeUser.password_hash;

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: safeUser
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

// CHANGE PASSWORD
router.put('/change-password', authenticateToken, (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const isMatch = bcrypt.compareSync(current_password, req.user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const password_hash = bcrypt.hashSync(new_password, 10);
    db.updateUser(req.user.id, { password_hash });

    return res.json({
      success: true,
      message: 'Password changed successfully!'
    });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ success: false, message: 'Server error changing password.' });
  }
});

// FORGOT PASSWORD REQUEST & SIMULATED RESET CODE
const resetCodes = new Map(); // email -> { code, expires }

router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = db.getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered user found with this email.' });
    }

    // Generate 6 digit reset OTP
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes.set(user.email.toLowerCase(), {
      code: resetOtp,
      expires: Date.now() + 15 * 60 * 1000 // 15 mins
    });

    return res.json({
      success: true,
      message: `Password reset verification code generated for ${user.email}.`,
      demo_otp: resetOtp // sent back for instant demo simulation without SMTP config
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, message: 'Server error processing request.' });
  }
});

// RESET PASSWORD WITH OTP
router.post('/reset-password', (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    if (!email || !otp || !new_password) {
      return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const stored = resetCodes.get(cleanEmail);

    if (!stored || stored.expires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Reset code expired or not requested. Please request a new one.' });
    }

    if (stored.code !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP verification code.' });
    }

    const user = db.getUserByEmail(cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const password_hash = bcrypt.hashSync(new_password, 10);
    db.updateUser(user.id, { password_hash });
    resetCodes.delete(cleanEmail);

    return res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Server error resetting password.' });
  }
});

// SELF DELETE ACCOUNT BY USER (Only allowed if no active VIP card or Korje Hasana)
router.delete('/me', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Administrator accounts cannot be deleted directly through user dashboard.' });
    }

    // Check if user has active VIP Card or Korje Hasana Credit
    const hasVip = user.loyalty_card_approved === true || user.loyalty_card_status === 'Approved';
    const hasQard = user.qard_status === 'Approved';

    if (hasVip || hasQard) {
      return res.status(400).json({
        success: false,
        requires_appeal: true,
        message: 'আপনার অ্যাকাউন্টে সক্রিয় ভিআইপি লয়ালটি কার্ড বা করযে হাসানা ক্রেডিট সক্রিয় রয়েছে। অ্যাকাউন্ট বন্ধ করতে অনুগ্রহ করে অ্যাডমিন বরাবরে আপিল আবেদন জমা দিন।'
      });
    }

    const userName = user.name;
    const userPhone = user.phone;
    const userEmail = user.email;

    const success = db.deleteUser(userId);
    if (!success) {
      return res.status(500).json({ success: false, message: 'Could not delete user account.' });
    }

    // In-app admin notification for Main Admin & Sub-admins (PC + Mobile)
    const notif = db.createAdminNotification({
      type: 'user_delete',
      title: '⚠️ অ্যাকাউন্ট স্থায়ীভাবে ডিলিট',
      message: `ব্যবহারকারী ${userName} (${userPhone || userEmail}) তার অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলেছেন।`,
      link_tab: 'users',
      data: { user_id: userId, name: userName, phone: userPhone, email: userEmail }
    });

    const io = req.app.get('io');
    if (io) {
      io.to('admin_channel').emit('admin_notification', notif);
      io.to('admin_channel').emit('user_deleted', { userId });
    }

    // Send admin email alert
    mailService.sendAdminAlert({
      type: 'user_delete',
      title: `অ্যাকাউন্ট ডিলিট: ${userName}`,
      message: `একজন গ্রাহক তার অ্যাকাউন্ট সফলভাবে ডিলিট করেছেন।`,
      details: {
        'গ্রাহকের নাম': userName,
        'মোবাইল নম্বর': userPhone || 'N/A',
        'ইমেইল': userEmail || 'N/A',
        'সময়': new Date().toLocaleString('bn-BD')
      },
      link: 'https://alansarbd.com/admin'
    }).catch(err => console.error('Delete account admin email error:', err.message));

    return res.json({
      success: true,
      message: 'আপনার অ্যাকাউন্টটি সফলভাবে চিরতরে মুছে ফেলা হয়েছে।'
    });
  } catch (err) {
    console.error('Self account deletion error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting account.' });
  }
});

// SUBMIT ACCOUNT DELETION APPEAL (For VIP Card or Korje Hasana holders)
router.post('/delete-appeal', authenticateToken, (req, res) => {
  try {
    const user = db.getUserById(req.user.id) || req.user;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'অ্যাকাউন্ট বাতিলের কারণ বা বিস্তারিত ব্যাখ্যা লিখুন।' });
    }

    // Check for existing pending deletion appeal
    const existingAppeals = db.getAccountAppeals() || [];
    const pendingExisting = existingAppeals.find(a => 
      (a.user_id === user.id || (a.user_email && a.user_email === user.email) || (a.user_phone && a.user_phone === user.phone)) &&
      a.appeal_type === 'account_deletion' &&
      a.status === 'Under Review'
    );

    if (pendingExisting) {
      return res.status(400).json({
        success: false,
        message: 'আপনার একটি অ্যাকাউন্ট বাতিলের আপিল ইতিমধ্যে অ্যাডমিন প্যানেলে পর্যালোচনায় রয়েছে।'
      });
    }

    const hasVip = user.loyalty_card_approved === true || user.loyalty_card_status === 'Approved';
    const hasQard = user.qard_status === 'Approved';

    const appeal = db.createAccountAppeal({
      appeal_type: 'account_deletion',
      user_id: user.id,
      user_email: user.email || '',
      user_phone: user.phone || '',
      user_name: user.name || '',
      reason: reason.trim(),
      has_vip: hasVip,
      has_qard: hasQard,
      loyalty_card_number: user.loyalty_card_number || null,
      loyalty_points: user.loyalty_points || 0,
      qard_limit: user.qard_credit_limit || 0,
      status: 'Under Review'
    });

    // In-app admin notification for Main Admin & Sub-admins (PC + Mobile)
    const notif = db.createAdminNotification({
      type: 'appeal',
      title: '🛡️ অ্যাকাউন্ট বাতিলের আপিল আবেদন',
      message: `${user.name} (${user.phone || user.email}) অ্যাকাউন্ট স্থায়ীভাবে বন্ধ করতে আপিল জমা দিয়েছেন।`,
      link_tab: 'users',
      data: { appeal_id: appeal.id, name: user.name, phone: user.phone }
    });

    const io = req.app.get('io');
    if (io) {
      io.to('admin_channel').emit('admin_notification', notif);
      io.to('admin_channel').emit('new_account_appeal', appeal);
    }

    // Send admin email alert
    mailService.sendAdminAlert({
      type: 'appeal',
      title: `অ্যাকাউন্ট বাতিলের আপিল: ${user.name}`,
      message: `একজন গ্রাহক তার সক্রিয় একাউন্ট মুছে ফেলার জন্য বিশেষ আপিল করেছেন।`,
      details: {
        'গ্রাহকের নাম': user.name,
        'মোবাইল নম্বর': user.phone,
        'ইমেইল': user.email || 'N/A',
        'ভিআইপি স্ট্যাটাস': hasVip ? 'সক্রিয় VIP' : 'না',
        'করযে হাসানা স্ট্যাটাস': hasQard ? 'সক্রিয় ঋণ সুবিধা' : 'না',
        'আপিলের কারণ': reason.trim()
      },
      link: 'https://alansarbd.com/admin'
    }).catch(err => console.error('Delete appeal admin email error:', err.message));

    return res.status(201).json({
      success: true,
      message: 'আপনার অ্যাকাউন্ট বাতিলের আপিল সফলভাবে অ্যাডমিন প্যানেলে জমা হয়েছে। অ্যাডমিন পর্যালোচনা করে চূড়ান্ত সিদ্ধান্ত গ্রহণ করবে।',
      appeal
    });
  } catch (err) {
    console.error('Error submitting delete appeal:', err);
    return res.status(500).json({ success: false, message: 'আবেদন পাঠাতে সমস্যা হয়েছে।' });
  }
});

module.exports = router;

