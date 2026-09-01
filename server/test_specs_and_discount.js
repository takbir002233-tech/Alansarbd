async function testSpecsAndDiscount() {
  console.log('🚀 Running Specs Points & Auto-Discount Verification...\n');

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

    // 2. Create product with full customized points / specs
    const createPrd = await api('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: 'AL ANSAR Royal Cambodian Oud VIP Hamper',
        price: 5500,
        discount_price: 4400,
        category_id: 'cat_gift_boxes',
        stock: 20,
        thumbnail: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
        specs: {
          'Brand': 'AL ANSAR Luxury Collection',
          'Box Material': 'Polished Mahogany Wood with Brass Latch',
          'Includes': '3x 12ml Crystal Attar Bottles + Premium Tasbih + Gift Box',
          'Longevity': '14 - 18 Hours'
        }
      })
    });

    assert(
      createPrd.status === 201 && 
      createPrd.data.product.discount_percent === 20 && 
      createPrd.data.product.savings_amount === 1100 &&
      createPrd.data.product.specs['Box Material'] === 'Polished Mahogany Wood with Brass Latch',
      '2. Product Created with Dynamic Specs & 20% Auto Discount'
    );

    const testId = createPrd.data.product.id;

    // 3. Fetch single product to verify storefront display format
    const getPrd = await api(`/products/${testId}`);
    assert(
      getPrd.status === 200 && 
      getPrd.data.product.specs['Includes'].includes('Crystal Attar'),
      '3. Storefront Product Details receives all dynamic specification points'
    );

    // 4. Clean up test product
    const delPrd = await api(`/products/${testId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(delPrd.status === 200, '4. Test Product Cleanup');

    console.log(`\n======================================================`);
    console.log(`🎉 SPECS & DISCOUNT TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('Test error:', err);
  }
}

testSpecsAndDiscount();
