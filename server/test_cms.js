async function testRunningServer() {
  console.log('🚀 Running E2E Automated Verification for AL ANSAR Updates...\n');

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
    // 1. Health check & store name
    const health = await api('/health');
    assert(health.status === 200 && health.data.store.includes('AL ANSAR'), '1. Server Health Check API');

    // 2. Free delivery filtering
    const freeDelProds = await api('/products?free_delivery=true');
    assert(freeDelProds.status === 200 && freeDelProds.data.products.length > 0, '2. Free Delivery Items Filter API');
    assert(freeDelProds.data.products.every(p => p.is_free_delivery === true), '3. All Filtered Products Have is_free_delivery = true');

    // 4. Site Settings CMS verification
    const adminLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'admin@alansar.com', password: 'admin123' })
    });
    assert(adminLogin.status === 200, '4. Admin Authentication');
    const adminToken = adminLogin.data.token;

    const cmsUpdate = await api('/admin/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        hero_title: 'Updated Royal Scents & Exclusive Luxury Gifts',
        trust_1_title: '100% PURE FRAGRANCE OILS'
      })
    });
    assert(cmsUpdate.status === 200 && cmsUpdate.data.settings.hero_title.includes('Updated Royal Scents'), '5. Admin Full CMS Settings Update (Hero Title & Trust Badges)');

    // 6. Free Delivery Order Calculation (0 BDT delivery fee)
    const freeProd = freeDelProds.data.products[0];
    const orderWithFreeDel = await api('/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: 'Test Customer',
        customer_phone: '01711223344',
        shipping_address: 'Mirpur-10, Dhaka',
        shipping_city: 'Dhaka',
        delivery_zone: 'inside_dhaka',
        items: [{
          id: freeProd.id,
          title: freeProd.title,
          price: freeProd.discount_price || freeProd.price,
          quantity: 1,
          is_free_delivery: true,
          thumbnail: freeProd.thumbnail
        }],
        payment_method: 'cod'
      })
    });
    assert(orderWithFreeDel.status === 201 && orderWithFreeDel.data.order.delivery_fee === 0, '6. Order with Free Delivery Item has ৳0 Delivery Fee');

    console.log(`\n======================================================`);
    console.log(`🎉 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('Test error:', err);
  }
}

testRunningServer();
