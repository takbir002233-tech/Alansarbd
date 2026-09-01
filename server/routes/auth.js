const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
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
      { id: user.id, email: user.email, role: user.role },
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
  const safeUser = { ...req.user };
  delete safeUser.password_hash;
  return res.json({ success: true, user: safeUser });
});

// UPDATE PROFILE
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, phone, address, city, postal_code } = req.body;
    const updates = {};

    if (name && name.trim()) updates.name = name.trim();
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

module.exports = router;
