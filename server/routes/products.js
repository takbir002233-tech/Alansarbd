const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Helper to attach auto-calculated discount percent & savings to product object
function enrichProduct(p) {
  const hasDiscount = p.discount_price && Number(p.discount_price) < Number(p.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(p.price) - Number(p.discount_price)) / Number(p.price)) * 100)
    : 0;
  const savingsAmount = hasDiscount ? (Number(p.price) - Number(p.discount_price)) : 0;
  const stockNum = Number(p.stock) !== undefined ? Number(p.stock) : 0;
  const isOutOfStock = stockNum <= 0;

  return {
    ...p,
    stock: stockNum,
    is_out_of_stock: isOutOfStock,
    has_discount: hasDiscount,
    discount_percent: discountPercent,
    savings_amount: savingsAmount,
    is_free_delivery: !!p.is_free_delivery
  };
}

// GET ALL PRODUCTS (with search, category, free_delivery, sort, price range)
router.get('/', (req, res) => {
  try {
    let products = db.getProducts();
    const { category, subcategory, search, sort, min_price, max_price, featured, in_stock, free_delivery } = req.query;

    if (category && category !== 'all') {
      products = products.filter(p => p.category_id === category || p.slug === category);
    }

    if (subcategory && subcategory !== 'all') {
      products = products.filter(p => p.subcategory_id === subcategory);
    }

    if (free_delivery === 'true') {
      products = products.filter(p => p.is_free_delivery === true);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const allCats = db.getCategories();
      const matchingCategoryIds = allCats
        .filter(c => (c.name && c.name.toLowerCase().includes(q)) || (c.slug && c.slug.toLowerCase().includes(q)))
        .map(c => c.id);

      products = products.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
        (p.category_id && matchingCategoryIds.includes(p.category_id))
      );
    }

    if (min_price) {
      products = products.filter(p => (p.discount_price || p.price) >= Number(min_price));
    }

    if (max_price) {
      products = products.filter(p => (p.discount_price || p.price) <= Number(max_price));
    }

    if (featured === 'true') {
      products = products.filter(p => p.is_featured);
    }

    if (in_stock === 'true') {
      products = products.filter(p => (p.stock || 0) > 0);
    }

    if (sort) {
      if (sort === 'price_asc') {
        products.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
      } else if (sort === 'price_desc') {
        products.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
      } else if (sort === 'newest') {
        products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (sort === 'rating') {
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
    }

    const enriched = products.map(enrichProduct);

    return res.json({
      success: true,
      count: enriched.length,
      products: enriched
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching products.' });
  }
});

// GET SINGLE PRODUCT BY ID OR SLUG
router.get('/:idOrSlug', (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product = db.getProductById(idOrSlug);
    if (!product) {
      product = db.getProductBySlug(idOrSlug);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const related = db.getProducts()
      .filter(p => p.category_id === product.category_id && p.id !== product.id)
      .slice(0, 4)
      .map(enrichProduct);

    return res.json({
      success: true,
      product: enrichProduct(product),
      related
    });
  } catch (err) {
    console.error('Error fetching product details:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching product.' });
  }
});

// ADMIN: 1-CLICK STOCK IN / OUT TOGGLE
router.post('/:id/toggle-stock', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const product = db.getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const currentStock = Number(product.stock) || 0;
    const newStock = currentStock > 0 ? 0 : 15; // Toggle between 0 and 15
    const updated = db.updateProduct(id, { stock: newStock });

    return res.json({
      success: true,
      message: newStock === 0 ? 'Product marked as Out of Stock!' : 'Product restocked with 15 units!',
      product: enrichProduct(updated)
    });
  } catch (err) {
    console.error('Error toggling product stock:', err);
    return res.status(500).json({ success: false, message: 'Server error toggling stock.' });
  }
});

// ADMIN: DIRECT STOCK QUANTITY UPDATE
router.put('/:id/stock', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || isNaN(Number(stock))) {
      return res.status(400).json({ success: false, message: 'Valid stock quantity is required.' });
    }

    const updated = db.updateProduct(id, { stock: Math.max(0, Number(stock)) });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({
      success: true,
      message: `Stock updated to ${updated.stock} units!`,
      product: enrichProduct(updated)
    });
  } catch (err) {
    console.error('Error updating stock quantity:', err);
    return res.status(500).json({ success: false, message: 'Server error updating stock.' });
  }
});

// ADMIN: CREATE PRODUCT
router.post('/', requireAdmin, (req, res) => {
  try {
    const { title, description, category_id, subcategory_id, price, discount_price, stock, thumbnail, images, specs, tags, is_featured, is_free_delivery, priority_order } = req.body;

    if (!title || !price || !category_id) {
      return res.status(400).json({ success: false, message: 'Title, category, and regular price are required.' });
    }

    const newProduct = db.createProduct({
      title: title.trim(),
      description: description || '',
      category_id,
      subcategory_id: subcategory_id || null,
      price: Number(price),
      discount_price: discount_price ? Number(discount_price) : null,
      stock: stock !== undefined ? Number(stock) : 15,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      images: Array.isArray(images) && images.length ? images : [thumbnail || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'],
      specs: specs || {},
      tags: Array.isArray(tags) ? tags : ['AL ANSAR', 'Luxury'],
      is_featured: !!is_featured,
      is_free_delivery: !!is_free_delivery,
      priority_order: priority_order ? Number(priority_order) : 99
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully for AL ANSAR!',
      product: enrichProduct(newProduct)
    });
  } catch (err) {
    console.error('Error creating product:', err);
    return res.status(500).json({ success: false, message: 'Server error creating product.' });
  }
});

// ADMIN: UPDATE PRODUCT
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.price) updates.price = Number(updates.price);
    if (updates.discount_price !== undefined) {
      updates.discount_price = updates.discount_price ? Number(updates.discount_price) : null;
    }
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    if (updates.priority_order !== undefined) updates.priority_order = Number(updates.priority_order);
    if (updates.is_free_delivery !== undefined) updates.is_free_delivery = !!updates.is_free_delivery;

    const updated = db.updateProduct(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found to update.' });
    }

    return res.json({
      success: true,
      message: 'Product updated successfully!',
      product: enrichProduct(updated)
    });
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({ success: false, message: 'Server error updating product.' });
  }
});

// ADMIN: REORDER PRODUCT (Move Up / Down)
router.post('/:id/reorder', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;

    if (!direction || !['up', 'down'].includes(direction)) {
      return res.status(400).json({ success: false, message: 'Direction must be "up" or "down".' });
    }

    const reordered = db.reorderProduct(id, direction);
    if (!reordered) {
      return res.status(404).json({ success: false, message: 'Product not found or cannot move further.' });
    }

    return res.json({
      success: true,
      message: `Product moved ${direction} successfully!`,
      products: reordered.map(enrichProduct)
    });
  } catch (err) {
    console.error('Error reordering product:', err);
    return res.status(500).json({ success: false, message: 'Server error reordering product.' });
  }
});

// ADMIN: DELETE PRODUCT
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found to delete.' });
    }

    return res.json({
      success: true,
      message: 'Product deleted successfully!'
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting product.' });
  }
});

module.exports = router;
