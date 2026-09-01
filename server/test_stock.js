async function testStockControl() {
  console.log('🚀 Running Stock Control & Stock Out Verification...\n');

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

    // 2. Fetch first product
    const prodsRes = await api('/products');
    assert(prodsRes.status === 200 && prodsRes.data.products.length > 0, '2. Fetch Product List');
    const testPrd = prodsRes.data.products[0];

    // 3. 1-Click Stock Out Toggle
    const toggleOutRes = await api(`/products/${testPrd.id}/toggle-stock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(toggleOutRes.status === 200 && toggleOutRes.data.product.stock === 0 && toggleOutRes.data.product.is_out_of_stock === true, '3. 1-Click Stock Out Toggle (stock = 0)');

    // 4. Fetch product details to confirm customer visibility
    const singlePrd = await api(`/products/${testPrd.id}`);
    assert(singlePrd.status === 200 && singlePrd.data.product.is_out_of_stock === true, '4. Customer Product Details reflects Out of Stock');

    // 5. 1-Click Restock Toggle
    const toggleInRes = await api(`/products/${testPrd.id}/toggle-stock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(toggleInRes.status === 200 && toggleInRes.data.product.stock > 0 && toggleInRes.data.product.is_out_of_stock === false, '5. 1-Click Restock Toggle (stock > 0)');

    // 6. Direct Stock Quantity Update
    const directStockRes = await api(`/products/${testPrd.id}/stock`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ stock: 50 })
    });
    assert(directStockRes.status === 200 && directStockRes.data.product.stock === 50, '6. Direct Stock Quantity Update (set stock to 50)');

    console.log(`\n======================================================`);
    console.log(`🎉 STOCK TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('Test error:', err);
  }
}

testStockControl();
