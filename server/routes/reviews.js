const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/reviews - Get all verified & customer reviews
router.get('/', (req, res) => {
  try {
    const reviews = db.getReviews();
    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'রিভিউ লোড করতে সমস্যা হয়েছে।' });
  }
});

// POST /api/reviews - Submit a new review
router.post('/', (req, res) => {
  try {
    const { user_name, rating, comment, product_title, user_id } = req.body;

    if (!user_name || !user_name.trim()) {
      return res.status(400).json({ success: false, message: 'নাম প্রদান করা বাধ্যতামূলক।' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'মন্তব্য প্রদান করা বাধ্যতামূলক।' });
    }

    const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));

    const newReview = db.createReview({
      user_name: user_name.trim(),
      user_id: user_id || null,
      rating: numericRating,
      comment: comment.trim(),
      product_title: product_title ? product_title.trim() : 'আল আনসার সুপার শপ সার্ভিস ও প্রোডাক্ট',
      is_verified: true
    });

    res.status(201).json({
      success: true,
      message: 'আপনার মূল্যবান রিভিউ সফলভাবে জমা হয়েছে! ধন্যবাদ।',
      review: newReview
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, message: 'রিভিউ জমা করতে ব্যর্থ হয়েছে।' });
  }
});

module.exports = router;
