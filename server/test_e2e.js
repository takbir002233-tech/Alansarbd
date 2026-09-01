const http = require('http');

async function testSuite() {
  console.log('🚀 Starting Full AL ANSAR E-Commerce E2E Automated Verification Suite...\n');

  // Start the server in-process
  require('./server');
  // Wait 1 sec for server to listen on 5000
  await new Promise(r => setTimeout(r, 1000));

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
    // 1. Health check
    const health = await api('/health');
    assert(health.status === 200 && health.data.store.includes('AL ANSAR'), '1. AL ANSAR Server Health Check API');

    // 2. Products listing & auto discount calculation
    const prods = await api('/products?category=cat_perfumes');
    assert(prods.status === 200 && prods.data.products.length > 0, '2. Category Filtering (French Perfumes) API');
    const firstProd = prods.data.products[0];
    assert(firstProd.has_discount === true && firstProd.discount_percent > 0, '3. Auto Discount % Calculation on Products');

    // 4. Voucher Code API Verification
    const voucherTest = await api('/vouchers/apply', {
      method: 'POST',
      body: JSON.stringify({ code: 'ANSAR10', subtotal: 4000 })
    });
    assert(voucherTest.status === 200 && voucherTest.data.voucher.discount_amount === 400, '4. Voucher Code Application (ANSAR10 -> 10% Discount)');

    // 5. User Registration Validation
    const validEmail = 'ansar.patron.' + Date.now() + '@gmail.com';
    const validPhone = '017' + Math.floor(10000000 + Math.random() * 90000000);
    const validReg = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Sayed Al-Amin',
        email: validEmail,
        phone: validPhone,
        password: 'securePassword123',
        address: 'House 12, Road 4, Sector 7, Uttara',
        city: 'Dhaka',
        postal_code: '1230'
      })
    });
    assert(validReg.status === 201 && validReg.data.token, '5. Customer Registration with BD 11-digit Phone & Address');
    const userToken = validReg.data.token;
    const userId = validReg.data.user.id;

    // 6. Customer Checkout & Order Placement with bKash TrxID + Voucher
    const newOrder = await api('/orders', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        customer_name: 'Sayed Al-Amin',
        customer_phone: validPhone,
        customer_email: validEmail,
        shipping_address: 'House 12, Road 4, Sector 7, Uttara',
        shipping_city: 'Dhaka',
        delivery_zone: 'inside_dhaka',
        items: [
          {
            id: firstProd.id,
            title: firstProd.title,
            price: firstProd.discount_price || firstProd.price,
            quantity: 1,
            thumbnail: firstProd.thumbnail
          }
        ],
        payment_method: 'bkash',
        sender_number: validPhone,
        transaction_id: 'BK88220011',
        applied_voucher_code: 'ANSAR10',
        discount_amount: 360,
        notes: 'Please add luxury ribbon packaging'
      })
    });
    assert(newOrder.status === 201 && newOrder.data.order.transaction_id === 'BK88220011', '6. Order Placement with bKash Manual TrxID & Voucher');
    const orderCode = newOrder.data.order.order_code;
    const orderId = newOrder.data.order.id;

    // 7. Admin Login & Stats
    const adminLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: 'admin@alansar.com',
        password: 'admin123'
      })
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', '7. Super Admin Authentication for AL ANSAR');
    const adminToken = adminLogin.data.token;

    // 8. Admin assigns Steadfast Courier Tracking URL
    const courierAssign = await api(`/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'Shipped',
        courier_name: 'Steadfast Courier',
        consignment_id: 'SF-88301948',
        courier_tracking_url: 'https://steadfast.com.bd/t/SF88301948',
        note: 'Handed over to Steadfast Courier. Consignment: SF-88301948'
      })
    });
    assert(courierAssign.status === 200 && courierAssign.data.order.courier_tracking_url.includes('steadfast.com.bd'), '8. Admin Assigns External Courier Tracking Link (Steadfast/RedX)');

    // 9. Customer Order Tracking (verifies external courier tracking link is returned)
    const trackOrder = await api(`/orders/${orderCode}`);
    assert(trackOrder.status === 200 && trackOrder.data.order.courier_tracking_url === 'https://steadfast.com.bd/t/SF88301948', '9. Customer Order Lookup returns Direct Courier Live Web Link');

    // 10. Admin Voucher Management CRUD
    const newVoucher = await api('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        code: 'EID2026',
        discount_type: 'fixed',
        discount_value: 300,
        min_spend: 2500,
        is_active: true,
        description: '৳300 flat Eid discount'
      })
    });
    assert(newVoucher.status === 201 && newVoucher.data.voucher.code === 'EID2026', '10. Admin Creates Dynamic Voucher Code (EID2026)');

    // 11. Admin Product Creation & Priority Pinning
    const newProduct = await api('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: 'AL ANSAR Imperial Ambergris & White Musk EDP (100ml)',
        category_id: 'cat_perfumes',
        price: 5200,
        discount_price: 4200,
        stock: 10,
        thumbnail: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
        description: 'Precious royal ambergris with white musk and vanilla.',
        is_featured: true,
        priority_order: 1
      })
    });
    assert(newProduct.status === 201 && newProduct.data.product.discount_percent === 19, '11. Admin Creates Product with Live Auto-Discount Computation');

    // 12. Admin Reorders / Pins Product Priority Up-Down
    const reorder = await api(`/products/${newProduct.data.product.id}/reorder`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ direction: 'down' })
    });
    assert(reorder.status === 200, '12. Admin Pins / Reorders Product Priority Up-Down');

    // 13. Admin Customer Ban / Block Security
    const banUser = await api(`/admin/users/${userId}/toggle-block`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(banUser.status === 200 && banUser.data.user.is_blocked === true, '13. Admin Suspends Abusive User');

    // Verify blocked user cannot log in
    const blockedLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: validEmail,
        password: 'securePassword123'
      })
    });
    assert(blockedLogin.status === 403, '14. Suspended User Login Blocked by Security Middleware');

    // Unblock user
    const unblockUser = await api(`/admin/users/${userId}/toggle-block`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(unblockUser.status === 200 && unblockUser.data.user.is_blocked === false, '15. Admin Unblocks / Restores User');

    // 16. Live Chat & Intelligent Bot Automation
    const chatMsg = await api(`/chat/conv_${userId}/send`, {
      method: 'POST',
      body: JSON.stringify({
        text: 'Assalamu Alaikum! How do I pay with bKash and what are the delivery charges?',
        userId,
        userName: 'Sayed Al-Amin'
      })
    });
    assert(chatMsg.status === 200 && chatMsg.data.botReply, '16. Live Chat Intelligent Bot Instant FAQ Reply');

    // Admin replies
    const adminReply = await api(`/chat/admin/conv_${userId}/reply`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        text: 'Wa Alaikum Assalam! Your order has been dispatched with Steadfast Courier.'
      })
    });
    assert(adminReply.status === 200 && adminReply.data.adminMessage.sender === 'admin', '17. Admin Live Support Desk Reply');

    console.log(`\n======================================================`);
    console.log(`🎉 AL ANSAR E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);

    setTimeout(() => {
      process.exit(failed === 0 ? 0 : 1);
    }, 500);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

testSuite();
