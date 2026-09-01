const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET ALL CATEGORIES
router.get('/', (req, res) => {
  try {
    const categories = db.getCategories();
    return res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching categories.' });
  }
});

// GET SINGLE CATEGORY BY ID OR SLUG
router.get('/:idOrSlug', (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const cat = db.getCategoryById(idOrSlug);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    return res.json({ success: true, category: cat });
  } catch (err) {
    console.error('Error fetching category:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching category.' });
  }
});

// ADMIN: CREATE CATEGORY
router.post('/', requireAdmin, (req, res) => {
  try {
    const { name, icon, image, priority_order, subcategories } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const newCategory = db.createCategory({
      name: name.trim(),
      icon: icon || 'Sparkles',
      image: image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
      priority_order: priority_order ? Number(priority_order) : undefined,
      subcategories: Array.isArray(subcategories) ? subcategories : []
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully!',
      category: newCategory
    });
  } catch (err) {
    console.error('Error creating category:', err);
    return res.status(500).json({ success: false, message: 'Server error creating category.' });
  }
});

// ADMIN: UPDATE CATEGORY
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.priority_order !== undefined) {
      updates.priority_order = Number(updates.priority_order);
    }

    const updated = db.updateCategory(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.json({
      success: true,
      message: 'Category updated successfully!',
      category: updated
    });
  } catch (err) {
    console.error('Error updating category:', err);
    return res.status(500).json({ success: false, message: 'Server error updating category.' });
  }
});

// ADMIN: DELETE CATEGORY
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found to delete.' });
    }

    return res.json({
      success: true,
      message: 'Category deleted successfully!'
    });
  } catch (err) {
    console.error('Error deleting category:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting category.' });
  }
});

// ADMIN: REORDER CATEGORY (Move Up / Down)
router.post('/:id/reorder', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;

    if (!direction || !['up', 'down'].includes(direction)) {
      return res.status(400).json({ success: false, message: 'Direction must be "up" or "down".' });
    }

    const reordered = db.reorderCategory(id, direction);
    if (!reordered) {
      return res.status(404).json({ success: false, message: 'Category not found or cannot move further.' });
    }

    return res.json({
      success: true,
      message: `Category moved ${direction} successfully!`,
      categories: reordered
    });
  } catch (err) {
    console.error('Error reordering category:', err);
    return res.status(500).json({ success: false, message: 'Server error reordering category.' });
  }
});

// ADMIN: ADD SUBCATEGORY
router.post('/:id/subcategories', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Subcategory name is required.' });
    }

    const newSub = db.addSubcategory(id, name.trim());
    if (!newSub) {
      return res.status(404).json({ success: false, message: 'Parent category not found.' });
    }

    return res.status(201).json({
      success: true,
      message: 'Subcategory added successfully!',
      subcategory: newSub,
      category: db.getCategoryById(id)
    });
  } catch (err) {
    console.error('Error adding subcategory:', err);
    return res.status(500).json({ success: false, message: 'Server error adding subcategory.' });
  }
});

// ADMIN: DELETE SUBCATEGORY
router.delete('/:id/subcategories/:subId', requireAdmin, (req, res) => {
  try {
    const { id, subId } = req.params;
    const deleted = db.deleteSubcategory(id, subId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category or subcategory not found.' });
    }

    return res.json({
      success: true,
      message: 'Subcategory deleted successfully!',
      category: db.getCategoryById(id)
    });
  } catch (err) {
    console.error('Error deleting subcategory:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting subcategory.' });
  }
});

module.exports = router;
