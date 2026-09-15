const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'nexus_super_secret_jwt_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
    }

    // Verify user exists and is not blocked
    const existingUser = db.getUserById(user.id);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (existingUser.is_blocked) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by administration.' });
    }

    req.user = existingUser;
    next();
  });
}

function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    const isMainAdmin = req.user.role === 'admin' && !req.user.is_staff;
    const isStaffAdmin = req.user.is_staff === true;
    if (!isMainAdmin && !isStaffAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
    }
    next();
  });
}

function requireSuperAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'admin' || req.user.is_staff) {
      return res.status(403).json({ success: false, message: 'Access denied: Super Administrator privileges required.' });
    }
    next();
  });
}

function requirePermission(permKey) {
  return (req, res, next) => {
    authenticateToken(req, res, () => {
      // Super admin has unrestricted bypass
      if (req.user.role === 'admin' && !req.user.is_staff) {
        return next();
      }

      // If user is staff, check permission
      if (req.user.is_staff && Array.isArray(req.user.permissions)) {
        if (req.user.permissions.includes(permKey) || req.user.permissions.includes('*')) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: `অননুমোদিত অ্যাক্সেস: এই কাজটি সম্পন্ন করার জন্য প্রয়োজনীয় অনুমতি (${permKey}) আপনার অ্যাকাউন্টে নেই।`
      });
    });
  };
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireAdmin,
  requireSuperAdmin,
  requirePermission
};
