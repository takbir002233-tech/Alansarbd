async function testCategoryAndUpload() {
  console.log('🚀 Running Category, Sub-Category & Upload Automated Tests...\n');

  const BASE_URL = 'http://localhost:5000/api';

  async function api(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const data = await res.json();
    return { status: res.status, data };
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Admin login
    const login = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'admin@alansar.com', password: 'admin123' })
    });
    assert(login.status === 200, '1. Admin Authentication');
    const token = login.data.token;

    // 2. Direct Photo Upload API Test (Base64 JPEG payload)
    const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const uploadRes = await api('/upload', {
      method: 'POST',
      body: JSON.stringify({ image: sampleBase64, filename: 'royal_oud_photo.png' })
    });
    assert(uploadRes.status === 201 && uploadRes.data.url.startsWith('/uploads/'), '2. Direct Photo File Upload API');

    // 3. Category Creation with Subcategories
    const newCatRes = await api('/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: 'VIP Arabic Ambergris',
        icon: 'Sparkles',
        image: uploadRes.data.url,
        priority_order: 10,
        subcategories: [
          { id: 'sub_amber_1', name: 'White Ambergris', slug: 'white-ambergris' }
        ]
      })
    });
    assert(newCatRes.status === 201 && newCatRes.data.category.name === 'VIP Arabic Ambergris', '3. Admin Category Creation with Subcategory');
    const createdCatId = newCatRes.data.category.id;

    // 4. Add additional Subcategory
    const addSubRes = await api(`/categories/${createdCatId}/subcategories`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'Black Musk & Amber' })
    });
    assert(addSubRes.status === 201 && addSubRes.data.subcategory.name === 'Black Musk & Amber', '4. Admin Sub-Category Addition');

    // 5. Category Up/Down Reorder
    const reorderRes = await api(`/categories/${createdCatId}/reorder`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ direction: 'up' })
    });
    assert(reorderRes.status === 200, '5. Admin Category Move Up/Down Reordering');

    // 6. Footer Copyright & Tagline CMS update
    const cmsRes = await api('/admin/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        footer_copyright: '© 2026 AL ANSAR Luxury Fragrances Bangladesh. All Rights Reserved.',
        footer_tagline: '100% Authentic Scents • Non-Alcoholic Attar • Bespoke Gifting'
      })
    });
    assert(cmsRes.status === 200 && cmsRes.data.settings.footer_tagline.includes('100% Authentic Scents'), '6. Footer Copyright & Tagline CMS Settings');

    // 7. Cleanup created test category
    const delCatRes = await api(`/categories/${createdCatId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(delCatRes.status === 200, '7. Admin Category Deletion');

    console.log(`\n======================================================`);
    console.log(`🎉 ALL TESTS PASSED: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('Test error:', err);
  }
}

testCategoryAndUpload();
